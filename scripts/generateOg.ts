/**
 * generateOg.ts - renders a 1200x630 Bar-book-styled share image for every
 * indexable calculator page, plus the site default. Run after
 * generateData.ts and generateFoodData.ts (their JSON output feeds the
 * drink/food cards).
 *
 * satori builds an SVG from a React-less element tree (plain
 * { type, props: { style, children } } objects, built with the h() helper
 * below); @resvg/resvg-js rasterizes that SVG to PNG. satori needs static
 * TTF/OTF fonts, loaded once from scripts/fonts/ and reused for every
 * render, and its layout engine is flexbox-only - every element with
 * children must set display: 'flex' explicitly.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

import { items } from '../src/data/items';
import { foodItems } from '../src/data/foodItems';
import { events } from '../src/data/events';
import { guestCounts } from '../src/data/guestCounts';
import { isIndexable } from '../src/data/indexing';
import { seasonalEvents } from '../src/data/seasonalEvents';
import { drinkShare } from '../src/data/eventSplits';
import { BASE_DRINKS_PER_HOUR, BUFFER_PERCENTAGE, DRINKING_PERCENTAGE, consumptionMultiplier } from '../src/data/model';
import type { CalculatorPage, FoodCalculatorPage } from '../src/lib/types';
import type { ExtendedEventType } from '../src/data/events';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public');
const OG_DIR = path.join(PUBLIC_DIR, 'og');
const FONTS_DIR = path.join(__dirname, 'fonts');
const CALCULATORS_DIR = path.join(__dirname, '../src/content/calculators');
const FOOD_CALCULATORS_DIR = path.join(__dirname, '../src/content/food-calculators');

/** This file's own mtime. Included in every freshness check below, so
 * editing the rendering logic invalidates every previously-cached image,
 * not just edits to the underlying data. */
const SCRIPT_MTIME = fs.statSync(__filename).mtimeMs;

// =============================================================================
// Element tree helper (no react dependency)
// =============================================================================

interface SatoriNode {
  type: string;
  props: {
    style?: Record<string, string | number>;
    children?: SatoriNode | string | (SatoriNode | string)[];
    [key: string]: unknown;
  };
}

function h(
  type: string,
  props: Record<string, unknown> = {},
  ...children: (SatoriNode | string | null | false)[]
): SatoriNode {
  const flatChildren = children.filter((c): c is SatoriNode | string => c !== null && c !== false);
  return {
    type,
    props: {
      ...props,
      children: flatChildren.length === 1 ? flatChildren[0] : flatChildren,
    },
  };
}

// =============================================================================
// Fonts
// =============================================================================

const FONTS = [
  { name: 'Archivo', data: fs.readFileSync(path.join(FONTS_DIR, 'Archivo-Regular.ttf')), weight: 400 as const, style: 'normal' as const },
  { name: 'Archivo', data: fs.readFileSync(path.join(FONTS_DIR, 'Archivo-SemiBold.ttf')), weight: 600 as const, style: 'normal' as const },
  { name: 'Libre Caslon Text', data: fs.readFileSync(path.join(FONTS_DIR, 'LibreCaslonText-Regular.ttf')), weight: 400 as const, style: 'normal' as const },
];

// =============================================================================
// Card frame (Bar book style: paper background, thin ink rule, small
// wordmark footer)
// =============================================================================

const PAPER = '#F5F6F3';
const INK = '#1B1F1D';
const INK_2 = '#4B524E';
const RULE = '#C7CDC8';
const FONT_DISPLAY = 'Libre Caslon Text';
const FONT_TEXT = 'Archivo';

function cardFrame(...children: SatoriNode[]): SatoriNode {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '1200px',
        height: '630px',
        backgroundColor: PAPER,
        padding: '64px',
        fontFamily: FONT_TEXT,
      },
    },
    ...children,
  );
}

function cardFooter(): SatoriNode {
  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column' } },
    h('div', { style: { display: 'flex', height: '1px', backgroundColor: INK, marginBottom: '24px' } }),
    h(
      'div',
      {
        style: {
          display: 'flex',
          fontFamily: FONT_DISPLAY,
          fontSize: '24px',
          color: INK_2,
          letterSpacing: '0.02em',
        },
      },
      'Stock the Event',
    ),
  );
}

function bigNumberCard(opts: { big: string; unit: string; context: string }): SatoriNode {
  return cardFrame(
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' } },
      h(
        'div',
        {
          style: {
            display: 'flex',
            fontFamily: FONT_TEXT,
            fontWeight: 600,
            fontSize: '220px',
            lineHeight: 1,
            color: INK,
            fontVariantNumeric: 'tabular-nums',
          },
        },
        opts.big,
      ),
      h(
        'div',
        { style: { display: 'flex', fontFamily: FONT_DISPLAY, fontSize: '44px', color: INK, marginTop: '8px' } },
        opts.unit,
      ),
      h(
        'div',
        { style: { display: 'flex', fontFamily: FONT_TEXT, fontSize: '28px', color: INK_2, marginTop: '16px' } },
        opts.context,
      ),
    ),
    cardFooter(),
  );
}

interface LedgerRow {
  label: string;
  value: string;
}

function ledgerCard(opts: { headline?: string; caption: string; rows: LedgerRow[]; context: string }): SatoriNode {
  return cardFrame(
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' } },
      ...(opts.headline
        ? [
            h(
              'div',
              { style: { display: 'flex', fontFamily: FONT_DISPLAY, fontSize: '68px', color: INK, marginBottom: '20px' } },
              opts.headline,
            ),
          ]
        : []),
      h(
        'div',
        {
          style: {
            display: 'flex',
            fontFamily: FONT_TEXT,
            fontWeight: 600,
            fontSize: '20px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: INK_2,
            marginBottom: '16px',
          },
        },
        opts.caption,
      ),
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column' } },
        ...opts.rows.map((row) =>
          h(
            'div',
            {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: `1px solid ${RULE}`,
                width: '760px',
              },
            },
            h('div', { style: { display: 'flex', fontFamily: FONT_TEXT, fontSize: '30px', color: INK } }, row.label),
            h(
              'div',
              { style: { display: 'flex', fontFamily: FONT_TEXT, fontWeight: 600, fontSize: '30px', color: INK, fontVariantNumeric: 'tabular-nums' } },
              row.value,
            ),
          ),
        ),
      ),
      h(
        'div',
        { style: { display: 'flex', fontFamily: FONT_TEXT, fontSize: '28px', color: INK_2, marginTop: '20px' } },
        opts.context,
      ),
    ),
    cardFooter(),
  );
}

function defaultCard(): SatoriNode {
  return cardFrame(
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' } },
      h('div', { style: { display: 'flex', fontFamily: FONT_DISPLAY, fontSize: '110px', color: INK } }, 'Stock the Event'),
      h(
        'div',
        { style: { display: 'flex', fontFamily: FONT_TEXT, fontSize: '30px', color: INK_2, marginTop: '20px' } },
        'Party quantity calculators',
      ),
    ),
    h('div', { style: { display: 'flex', height: '1px', backgroundColor: INK, marginTop: 'auto' } }),
  );
}

// =============================================================================
// Render pipeline: satori (element tree -> SVG) -> resvg (SVG -> PNG)
// =============================================================================

const MAX_BYTES = 150 * 1024;

async function renderPng(tree: SatoriNode, widthPx: number): Promise<Buffer> {
  const svg = await satori(tree as any, { width: 1200, height: 630, fonts: FONTS });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: widthPx } });
  return resvg.render().asPng();
}

async function renderCardCapped(tree: SatoriNode): Promise<Buffer> {
  const buffer = await renderPng(tree, 1200);
  if (buffer.length <= MAX_BYTES) return buffer;
  // The flat, gradient-free card design should never hit this in practice.
  // Fall back to a smaller raster (still a valid og:image, just not the
  // full 1200x630) rather than shipping an oversized file.
  return renderPng(tree, 900);
}

function isFresh(outputPath: string, dataPaths: string[]): boolean {
  if (!fs.existsSync(outputPath)) return false;
  const outMtime = fs.statSync(outputPath).mtimeMs;
  if (outMtime <= SCRIPT_MTIME) return false;
  for (const dataPath of dataPaths) {
    if (!fs.existsSync(dataPath)) continue;
    if (outMtime <= fs.statSync(dataPath).mtimeMs) return false;
  }
  return true;
}

interface WriteResult {
  status: 'written' | 'skipped';
  bytes: number;
}

async function writeCard(outputPath: string, dataPaths: string[], build: () => SatoriNode): Promise<WriteResult> {
  if (isFresh(outputPath, dataPaths)) {
    return { status: 'skipped', bytes: fs.statSync(outputPath).size };
  }
  const buffer = await renderCardCapped(build());
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
  return { status: 'written', bytes: buffer.length };
}

// =============================================================================
// Drink and food cards: big number + unit line + "for a N-guest event" line
// =============================================================================

const INDEXABLE_GUEST_COUNTS_LIST = guestCounts.filter((gc) => isIndexable(gc.value));

// Freshness is checked against these source modules, not against the
// per-page JSON in src/content/calculators - generateData.ts rewrites
// every JSON file unconditionally on every npm run generate, even when its
// content is unchanged, which would otherwise invalidate every drink card
// on every single build.
const DRINK_DATA_FILES = [
  path.join(__dirname, '../src/data/items.ts'),
  path.join(__dirname, '../src/data/events.ts'),
  path.join(__dirname, '../src/data/guestCounts.ts'),
  path.join(__dirname, '../src/data/eventSplits.ts'),
  path.join(__dirname, '../src/data/model.ts'),
];

const FOOD_DATA_FILES = [
  path.join(__dirname, '../src/data/foodItems.ts'),
  path.join(__dirname, '../src/data/events.ts'),
  path.join(__dirname, '../src/data/guestCounts.ts'),
  path.join(__dirname, '../src/data/model.ts'),
];

async function generateDrinkCards(): Promise<WriteResult[]> {
  const results: WriteResult[] = [];

  for (const item of items) {
    for (const event of events) {
      for (const guestCount of INDEXABLE_GUEST_COUNTS_LIST) {
        const slug = `${item.id}-for-${event.slug}-${guestCount.value}-guests`;
        const dataPath = path.join(CALCULATORS_DIR, `${slug}.json`);
        if (!fs.existsSync(dataPath)) continue;
        const page: CalculatorPage = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        const outputPath = path.join(OG_DIR, `${slug}.png`);
        results.push(
          await writeCard(outputPath, DRINK_DATA_FILES, () =>
            bigNumberCard({
              big: String(page.calculation.fullBar.unitsNeeded),
              unit: `${page.calculation.fullBar.unitsDisplay} of ${page.item.name.toLowerCase()}`,
              context: `for a ${page.guestCount.value}-guest ${page.event.lowerName}`,
            }),
          ),
        );
      }
    }
  }

  return results;
}

async function generateFoodCards(): Promise<WriteResult[]> {
  const results: WriteResult[] = [];

  for (const item of foodItems) {
    for (const event of events) {
      for (const guestCount of INDEXABLE_GUEST_COUNTS_LIST) {
        const slug = `${item.id}-for-${event.slug}-${guestCount.value}-guests`;
        const dataPath = path.join(FOOD_CALCULATORS_DIR, `${slug}.json`);
        if (!fs.existsSync(dataPath)) continue;
        const page: FoodCalculatorPage = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        const outputPath = path.join(OG_DIR, `${slug}.png`);
        results.push(
          await writeCard(outputPath, FOOD_DATA_FILES, () =>
            bigNumberCard({
              big: String(page.calculation.unitsNeeded),
              unit: `${page.calculation.unitsDisplay} of ${page.item.name.toLowerCase()}`,
              context: `for a ${page.guestCount.value}-guest ${page.event.lowerName}`,
            }),
          ),
        );
      }
    }
  }

  return results;
}

// =============================================================================
// Bar-setup and occasion cards: shared 4-drink ledger
// =============================================================================

/** Mirrors src/pages/bar-setup/[...slug].astro's fullBarResults computation. */
function computeFullBar(event: ExtendedEventType, guestValue: number): { item: (typeof items)[number]; unitsNeeded: number }[] {
  const guestData = guestCounts.find((g) => g.value === guestValue)!;
  const drinkingPct = DRINKING_PERCENTAGE[guestData.tier];
  const actualDrinkers = guestValue * drinkingPct;
  const consumptionMult = consumptionMultiplier(event.defaultDuration);

  return items.map((item) => {
    const modifier = event.modifiers[item.id] || 1.0;
    const totalServings = Math.round(actualDrinkers * BASE_DRINKS_PER_HOUR * consumptionMult * modifier);
    const share = drinkShare(event.id, item.id);
    const servings = Math.round(totalServings * share);
    const unitsNeeded = Math.ceil((servings / item.servingsPerUnit) * (1 + BUFFER_PERCENTAGE));
    return { item, unitsNeeded };
  });
}

function ledgerRows(fullBar: { item: (typeof items)[number]; unitsNeeded: number }[]): LedgerRow[] {
  return fullBar.map((r) => ({
    label: r.item.name,
    value: `${r.unitsNeeded} ${r.unitsNeeded === 1 ? r.item.unitSingular : r.item.unit}`,
  }));
}

const BAR_SETUP_DATA_FILES = [
  path.join(__dirname, '../src/data/events.ts'),
  path.join(__dirname, '../src/data/guestCounts.ts'),
  path.join(__dirname, '../src/data/model.ts'),
  path.join(__dirname, '../src/data/eventSplits.ts'),
  path.join(__dirname, '../src/data/items.ts'),
];

async function generateBarSetupCards(): Promise<WriteResult[]> {
  const results: WriteResult[] = [];

  for (const event of events) {
    for (const guestCount of INDEXABLE_GUEST_COUNTS_LIST) {
      const slug = `${event.slug}-${guestCount.value}-guests`;
      const fullBar = computeFullBar(event, guestCount.value);
      const outputPath = path.join(OG_DIR, `${slug}.png`);
      results.push(
        await writeCard(outputPath, BAR_SETUP_DATA_FILES, () =>
          ledgerCard({
            caption: 'Full bar',
            rows: ledgerRows(fullBar),
            context: `for a ${guestCount.value}-guest ${event.lowerName}`,
          }),
        ),
      );
    }
  }

  return results;
}

const OCCASION_DATA_FILES = [path.join(__dirname, '../src/data/seasonalEvents.ts'), ...BAR_SETUP_DATA_FILES];

async function generateOccasionCards(): Promise<WriteResult[]> {
  const results: WriteResult[] = [];

  for (const seasonalEvent of seasonalEvents) {
    const baseEvent = events.find((e) => e.id === seasonalEvent.eventType);
    if (!baseEvent) continue;
    const fullBar = computeFullBar(baseEvent, 100);
    const outputPath = path.join(OG_DIR, `${seasonalEvent.slug}.png`);
    results.push(
      await writeCard(outputPath, OCCASION_DATA_FILES, () =>
        ledgerCard({
          headline: seasonalEvent.shortName,
          caption: 'Full bar',
          rows: ledgerRows(fullBar),
          context: 'for 100 guests',
        }),
      ),
    );
  }

  return results;
}

// =============================================================================
// Default card
// =============================================================================

async function generateDefaultCard(): Promise<WriteResult> {
  const outputPath = path.join(PUBLIC_DIR, 'og-default.png');
  return writeCard(outputPath, [], defaultCard);
}

// =============================================================================
// Main
// =============================================================================

async function main(): Promise<void> {
  fs.mkdirSync(OG_DIR, { recursive: true });

  const results: WriteResult[] = [];
  results.push(await generateDefaultCard());
  results.push(...(await generateDrinkCards()));
  results.push(...(await generateFoodCards()));
  results.push(...(await generateBarSetupCards()));
  results.push(...(await generateOccasionCards()));

  const written = results.filter((r) => r.status === 'written').length;
  const largest = Math.max(...results.map((r) => r.bytes));
  console.log(`\nShare images: ${results.length} total, ${written} written, ${results.length - written} skipped (up to date).`);
  console.log(`Largest file: ${largest} bytes.`);
}

// The resvg-js native addon can leave a handle open that keeps the event
// loop alive after main() resolves, so exit explicitly rather than letting
// the process hang after finishing.
main().then(() => process.exit(0));
