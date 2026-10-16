import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * A hub cell must show the same number as the page it links to, at the guest
 * count it names. Each cell links to /page/?guests=N, and the page's ledger has
 * a row for N, so the cell must equal that ledger row. These read the built
 * HTML in dist/ rather than a live page, so they check what actually ships.
 * Run `npm run build` first.
 */

const DIST = path.join(process.cwd(), 'dist');

function readBuilt(urlPath: string): string {
  const file = path.join(DIST, urlPath, 'index.html');
  if (!fs.existsSync(file)) {
    throw new Error(
      `Built page not found: ${file}. Run "npm run build" before this suite so the hub parity checks have something to read.`,
    );
  }
  return fs.readFileSync(file, 'utf8');
}

interface HubCellRef {
  /** Path of the linked page, without query or slashes at the ends. */
  pagePath: string;
  guests: number;
  /** What the hub cell shows, for example "41 bottles". */
  value: string;
}

/** Every linked cell in the hub tables on a built page. */
function hubCells(html: string): HubCellRef[] {
  const cells: HubCellRef[] = [];
  const re = /<td class="hub-num"[^>]*>\s*<a href="([^"?]+)\?guests=(\d+)"[^>]*>\s*([^<]+?)\s*<\/a>/g;
  for (const m of html.matchAll(re)) {
    cells.push({ pagePath: m[1].replace(/^\/|\/$/g, ''), guests: Number(m[2]), value: m[3].trim() });
  }
  return cells;
}

/** The cells of one ledger row on a built calculator page, as displayed. */
function ledgerRow(html: string, guests: number): string[] {
  const row = html.match(new RegExp(`<tr[^>]*data-guests="${guests}"[^>]*>([\\s\\S]*?)</tr>`));
  if (!row) throw new Error(`No ledger row for ${guests} guests.`);
  return [...row[1].matchAll(/<td class="num qr-value[^"]*"[^>]*>\s*<span class="qr-num"[^>]*>([^<]*)<\/span>/g)].map(
    (m) => m[1].trim(),
  );
}

/** The headline quantity on a drink or food calculator page. */
function headline(html: string): string {
  const m = html.match(/class="[^"]*answer-number[^"]*"[^>]*>\s*([\d,]+)\s*</);
  if (!m) throw new Error('No .answer-number headline found on the linked page.');
  return m[1].trim();
}

/** The guest count the page opens at, from its context line. */
function defaultGuests(html: string): number {
  const m = html.match(/class="[^"]*answer-context[^"]*"[^>]*>\s*(\d+) guests/);
  if (!m) throw new Error('No guest count in the .answer-context line.');
  return Number(m[1]);
}

test.describe('Hub tables agree with the pages they link to', () => {
  for (const hubPath of ['calculators/wine', 'calculators/wedding', 'food/pizza']) {
    test(`every cell on ${hubPath} equals its page's ledger row`, () => {
      const cells = hubCells(readBuilt(hubPath));
      expect(cells.length).toBeGreaterThan(0);

      for (const cell of cells) {
        const page = readBuilt(cell.pagePath);
        const shown = ledgerRow(page, cell.guests)[0];
        expect(
          cell.value.startsWith(shown),
          `${hubPath}: cell "${cell.value}" vs ${cell.pagePath} ledger at ${cell.guests} guests "${shown}"`,
        ).toBe(true);
      }
    });
  }

  test('every cell on the full bar hub equals its bar-setup ledger row', () => {
    const cells = hubCells(readBuilt('bar-setup'));
    expect(cells.length).toBeGreaterThan(0);

    for (const cell of cells) {
      const page = readBuilt(cell.pagePath);
      const row = ledgerRow(page, cell.guests);
      const servings = row[row.length - 1];
      expect(cell.value, `bar-setup hub vs ${cell.pagePath} at ${cell.guests} guests`).toBe(`${servings} drinks`);
    }
  });

  test("a page's headline equals its ledger row at the page's default guest count", () => {
    for (const pagePath of ['wine-for-wedding', 'beer-for-super-bowl-party', 'food/pizza-for-birthday-party', 'food/wings-for-thanksgiving']) {
      const html = readBuilt(pagePath);
      const shown = headline(html);
      const row = ledgerRow(html, defaultGuests(html));
      expect(row[0], `${pagePath}: headline ${shown} vs ledger ${row[0]}`).toBe(shown);
    }
  });

  test('hub cells link to the clean page with a guests query, never a per-count page', () => {
    for (const hubPath of ['calculators/wine', 'calculators/wedding', 'food/pizza', 'bar-setup']) {
      const html = readBuilt(hubPath);
      const tableSection = html.match(/<table class="hub-table"[\s\S]*?<\/table>/g)?.join('') ?? '';
      expect(/-\d+-guests/.test(tableSection), `${hubPath} links to an old per-guest-count URL`).toBe(false);
    }
  });
});
