/**
 * cloudflare.ts - idempotent Cloudflare zone housekeeping via the REST API.
 *
 * Reads CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID from the environment.
 * Never echoes either value. Uses plain fetch against
 * https://api.cloudflare.com/client/v4, no SDK.
 *
 * Usage: tsx scripts/ops/cloudflare.ts <settings|bots|waf|purge|status>
 *
 * Endpoints used (verified against developers.cloudflare.com before writing):
 * - GET/PATCH /zones/{zone_id}/settings/{setting_id}   (browser_cache_ttl, crawl_hints)
 * - GET/PUT   /zones/{zone_id}/bot_management           (fight_mode)
 * - GET/PUT   /zones/{zone_id}/rulesets/phases/http_request_firewall_custom/entrypoint
 * - POST      /zones/{zone_id}/purge_cache              ({ purge_everything: true })
 *
 * Crawler Hints has no documented, stable API endpoint as of this writing
 * (Cloudflare's own docs only show dashboard steps for it). This script
 * attempts the generic zone-settings pattern used by every other on/off
 * setting (settings/crawl_hints) and falls back to a clear "enable it in
 * the dashboard" message if that endpoint is not available for this zone.
 */

const API_BASE = 'https://api.cloudflare.com/client/v4';
const WAF_PHASE = 'http_request_firewall_custom';
const WAF_RULE_DESCRIPTION = 'challenge-non-served-countries';
const WAF_RULE_EXPRESSION = '(ip.src.country in {"CN" "SG"})';
const WAF_RULE_ACTION = 'managed_challenge';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

const TOKEN = requireEnv('CLOUDFLARE_API_TOKEN');
const ZONE_ID = requireEnv('CLOUDFLARE_ZONE_ID');

interface CfResponse {
  ok: boolean;
  status: number;
  json: any;
}

async function cf(path: string, init: RequestInit = {}): Promise<CfResponse> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // no JSON body
  }
  return { ok: res.ok, status: res.status, json };
}

function permissionHint(action: string, scope: string): void {
  console.error(`403 Forbidden: ${action}. The API token is missing the "${scope}" permission.`);
}

async function getZoneSetting(id: string, scope: string): Promise<{ value: unknown } | null> {
  const { ok, status, json } = await cf(`/zones/${ZONE_ID}/settings/${id}`);
  if (!ok) {
    if (status === 403) {
      permissionHint(`GET zone setting "${id}"`, scope);
    } else if (status === 404 || status === 400) {
      console.error(`Zone setting "${id}" is not available via the API for this zone/plan (status ${status}).`);
    } else {
      console.error(`Failed to read zone setting "${id}": HTTP ${status} ${JSON.stringify(json?.errors ?? '')}`);
    }
    return null;
  }
  return json.result;
}

async function setZoneSetting(id: string, value: unknown, scope: string): Promise<{ value: unknown } | null> {
  const { ok, status, json } = await cf(`/zones/${ZONE_ID}/settings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ value }),
  });
  if (!ok) {
    if (status === 403) {
      permissionHint(`PATCH zone setting "${id}"`, scope);
    } else {
      console.error(`Failed to set zone setting "${id}": HTTP ${status} ${JSON.stringify(json?.errors ?? '')}`);
    }
    return null;
  }
  return json.result;
}

async function getWafRule(): Promise<{ rules: any[]; found: any | null; status: number }> {
  const { ok, status, json } = await cf(`/zones/${ZONE_ID}/rulesets/phases/${WAF_PHASE}/entrypoint`);
  if (!ok) {
    if (status === 403) {
      permissionHint('GET WAF custom ruleset entrypoint', 'Zone WAF Edit');
    } else if (status !== 404) {
      console.error(`Failed to read WAF entrypoint ruleset: HTTP ${status} ${JSON.stringify(json?.errors ?? '')}`);
    }
    return { rules: [], found: null, status };
  }
  const rules: any[] = json.result?.rules ?? [];
  const found = rules.find((r) => r.description === WAF_RULE_DESCRIPTION) ?? null;
  return { rules, found, status };
}

async function getBotManagement(): Promise<any | null> {
  const { ok, status, json } = await cf(`/zones/${ZONE_ID}/bot_management`);
  if (!ok) {
    if (status === 403) {
      permissionHint('GET bot_management', 'Zone Bot Management Edit');
    } else {
      console.error(`Failed to read bot management config: HTTP ${status} ${JSON.stringify(json?.errors ?? '')}`);
    }
    return null;
  }
  return json.result;
}

async function cmdSettings(): Promise<void> {
  console.log('--- Browser Cache TTL (respect existing headers) ---');
  const before = await getZoneSetting('browser_cache_ttl', 'Zone Settings Edit');
  console.log('before:', before ? before.value : 'unavailable');
  if (before && before.value !== 0) {
    await setZoneSetting('browser_cache_ttl', 0, 'Zone Settings Edit');
  } else if (before) {
    console.log('already 0 (respect existing headers); no change needed');
  }
  const after = await getZoneSetting('browser_cache_ttl', 'Zone Settings Edit');
  console.log('after:', after ? after.value : 'unavailable');

  console.log('\n--- Crawler Hints ---');
  const chBefore = await getZoneSetting('crawl_hints', 'Zone Settings Edit');
  if (chBefore === null) {
    console.log('Crawler Hints has no documented API endpoint as of this writing.');
    console.log('Enable it manually: dashboard > Caching > Configuration > Crawler Hints.');
  } else {
    console.log('before:', chBefore.value);
    if (chBefore.value !== 'on') {
      await setZoneSetting('crawl_hints', 'on', 'Zone Settings Edit');
    } else {
      console.log('already on; no change needed');
    }
    const chAfter = await getZoneSetting('crawl_hints', 'Zone Settings Edit');
    console.log('after:', chAfter ? chAfter.value : 'unavailable');
  }
}

async function cmdBots(): Promise<void> {
  console.log('--- Bot Fight Mode ---');
  const current = await getBotManagement();
  if (!current) return;
  console.log('before: fight_mode =', current.fight_mode);
  if (current.fight_mode === true) {
    console.log('already on; no change needed');
  } else {
    const { ok, status, json } = await cf(`/zones/${ZONE_ID}/bot_management`, {
      method: 'PUT',
      body: JSON.stringify({ ...current, fight_mode: true }),
    });
    if (!ok) {
      if (status === 403) permissionHint('PUT bot_management', 'Zone Bot Management Edit');
      else console.error(`Failed to enable Bot Fight Mode: HTTP ${status} ${JSON.stringify(json?.errors ?? '')}`);
      return;
    }
  }
  const after = await getBotManagement();
  console.log('after: fight_mode =', after ? after.fight_mode : 'unavailable');
}

async function cmdWaf(): Promise<void> {
  console.log(`--- WAF custom rule: ${WAF_RULE_DESCRIPTION} ---`);
  const { rules, found, status } = await getWafRule();
  if (status === 403) return;

  console.log('before:', found ? { expression: found.expression, action: found.action } : 'rule does not exist');

  const alreadyCorrect = found && found.expression === WAF_RULE_EXPRESSION && found.action === WAF_RULE_ACTION;
  if (alreadyCorrect) {
    console.log('already correct; no change needed');
  } else {
    const desiredRule = { description: WAF_RULE_DESCRIPTION, expression: WAF_RULE_EXPRESSION, action: WAF_RULE_ACTION };
    const newRules = [...rules];
    const existingIndex = rules.findIndex((r) => r.description === WAF_RULE_DESCRIPTION);
    if (existingIndex >= 0) newRules[existingIndex] = { ...found, ...desiredRule };
    else newRules.push(desiredRule);

    const { ok, status: putStatus, json } = await cf(`/zones/${ZONE_ID}/rulesets/phases/${WAF_PHASE}/entrypoint`, {
      method: 'PUT',
      body: JSON.stringify({ rules: newRules }),
    });
    if (!ok) {
      if (putStatus === 403) permissionHint('PUT WAF custom ruleset entrypoint', 'Zone WAF Edit');
      else console.error(`Failed to update WAF rule: HTTP ${putStatus} ${JSON.stringify(json?.errors ?? '')}`);
      return;
    }
  }

  const { found: afterRule } = await getWafRule();
  console.log('after:', afterRule ? { expression: afterRule.expression, action: afterRule.action } : 'still missing');
}

async function cmdPurge(): Promise<void> {
  console.log('--- Purge everything ---');
  const { ok, status, json } = await cf(`/zones/${ZONE_ID}/purge_cache`, {
    method: 'POST',
    body: JSON.stringify({ purge_everything: true }),
  });
  if (!ok) {
    if (status === 403) permissionHint('POST purge_cache', 'Zone Cache Purge');
    else console.error(`Purge failed: HTTP ${status} ${JSON.stringify(json?.errors ?? '')}`);
    return;
  }
  console.log('purge_everything requested:', JSON.stringify(json.result));
}

async function cmdStatus(): Promise<void> {
  console.log('--- Cloudflare zone status ---');

  const bct = await getZoneSetting('browser_cache_ttl', 'Zone Settings Read');
  console.log('browser_cache_ttl:', bct ? bct.value : 'unavailable');

  const ch = await getZoneSetting('crawl_hints', 'Zone Settings Read');
  console.log('crawl_hints:', ch ? ch.value : 'unavailable (no documented API for this setting)');

  const bot = await getBotManagement();
  console.log('bot_fight_mode:', bot ? bot.fight_mode : 'unavailable');

  const { found, status } = await getWafRule();
  if (status === 403) {
    console.log(`waf rule "${WAF_RULE_DESCRIPTION}": unavailable (missing permission)`);
  } else {
    console.log(
      `waf rule "${WAF_RULE_DESCRIPTION}":`,
      found ? JSON.stringify({ expression: found.expression, action: found.action }) : 'not present',
    );
  }
}

const SUBCOMMANDS: Record<string, () => Promise<void>> = {
  settings: cmdSettings,
  bots: cmdBots,
  waf: cmdWaf,
  purge: cmdPurge,
  status: cmdStatus,
};

async function main(): Promise<void> {
  const sub = process.argv[2];
  const fn = sub ? SUBCOMMANDS[sub] : undefined;
  if (!fn) {
    console.error(`Usage: tsx scripts/ops/cloudflare.ts <${Object.keys(SUBCOMMANDS).join('|')}>`);
    process.exit(1);
  }
  await fn();
}

main().catch((err) => {
  console.error('Unexpected error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
