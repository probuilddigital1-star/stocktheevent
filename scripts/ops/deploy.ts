/**
 * deploy.ts - runs `wrangler pages deploy` without exposing the zone-scoped
 * ops token to it.
 *
 * CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID are set in this environment for
 * scripts/ops/cloudflare.ts and are scoped to zone-level permissions only
 * (WAF, bot management, zone settings, cache purge). wrangler prefers
 * CLOUDFLARE_API_TOKEN over the stored `wrangler login` session when the
 * variable is present, so leaving it set makes wrangler try to deploy with a
 * token that was never meant to have Pages/account permissions, and it fails
 * to authenticate. Deploys are meant to use the logged-in wrangler session
 * instead, so this strips the ops credentials from the child process's
 * environment before running wrangler.
 *
 * Branch: production deploys pass no --branch argument and use main. A
 * preview deploy passes --branch <name>; passing --branch main explicitly is
 * refused, so a preview script can never overwrite production.
 *
 * Never reads, prints, or writes the value of any secret.
 */

import { spawnSync } from 'child_process';

const args = process.argv.slice(2);
const branchFlagIndex = args.indexOf('--branch');

let branch = 'main';
if (branchFlagIndex !== -1) {
  const value = args[branchFlagIndex + 1];
  if (!value) {
    console.error('--branch requires a branch name');
    process.exit(1);
  }
  if (value === 'main') {
    console.error(
      'Refusing --branch main: production deploys use `npm run deploy`, which needs no branch argument.',
    );
    process.exit(1);
  }
  branch = value;
}

console.log(
  `Deploying with the wrangler login session (ops token hidden), branch: ${branch}${branch === 'main' ? ' (production)' : ' (preview)'}`,
);

const env = { ...process.env };
delete env.CLOUDFLARE_API_TOKEN;
delete env.CLOUDFLARE_ACCOUNT_ID;

const result = spawnSync(
  'npx',
  ['wrangler', 'pages', 'deploy', 'dist', '--project-name', 'stocktheevent', '--branch', branch],
  {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env,
  },
);

process.exit(result.status ?? 1);
