import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * A hub cell must show the same number as the page it links to. These read the
 * built HTML in dist/ rather than a live page, so they check what actually
 * ships. Run `npm run build` first.
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

/** The first cell in a hub table row, and the href it points at. */
function firstCellOfRow(html: string, rowLabel: string): { value: string; href: string } {
  // Row label is a <th scope="row">, optionally wrapping a link, followed by cells.
  const rowRe = new RegExp(
    `<th scope="row"[^>]*>(?:\\s*<a[^>]*>)?\\s*${rowLabel}\\s*(?:</a>)?\\s*</th>([\\s\\S]*?)</tr>`,
  );
  const row = html.match(rowRe);
  if (!row) throw new Error(`No hub table row labelled "${rowLabel}" in the built page.`);

  const cell = row[1].match(/<td[^>]*>\s*<a href="([^"]+)"[^>]*>\s*([^<]+?)\s*<\/a>/);
  if (!cell) throw new Error(`No linked cell found in the "${rowLabel}" row.`);
  return { href: cell[1], value: cell[2].trim() };
}

/** The headline quantity on a drink or food calculator page. */
function headline(html: string): string {
  const m = html.match(/class="[^"]*answer-number[^"]*"[^>]*>\s*([\d,]+)\s*</);
  if (!m) throw new Error('No .answer-number headline found on the linked page.');
  return m[1].trim();
}

test.describe('Hub tables agree with the pages they link to', () => {
  test('drink hub cell matches the drink page headline', () => {
    const hub = readBuilt('calculators/wine');
    const { value, href } = firstCellOfRow(hub, 'Wedding');

    const linked = readBuilt(href.replace(/^\/|\/$/g, ''));
    const shown = headline(linked);

    expect(value.startsWith(shown), `hub cell "${value}" vs page headline "${shown}" (${href})`).toBe(true);
  });

  test('event hub cell matches the drink page headline', () => {
    const hub = readBuilt('calculators/wedding');
    const { value, href } = firstCellOfRow(hub, 'Wine');

    const linked = readBuilt(href.replace(/^\/|\/$/g, ''));
    const shown = headline(linked);

    expect(value.startsWith(shown), `hub cell "${value}" vs page headline "${shown}" (${href})`).toBe(true);
  });

  test('food hub cell matches the food page headline', () => {
    const hub = readBuilt('food/pizza');
    const { value, href } = firstCellOfRow(hub, 'Wedding');

    const linked = readBuilt(href.replace(/^\/|\/$/g, ''));
    const shown = headline(linked);

    expect(value.startsWith(shown), `hub cell "${value}" vs page headline "${shown}" (${href})`).toBe(true);
  });

  test('no hub table lists a noindexed guest count', () => {
    // Guest columns come from INDEXABLE_GUEST_COUNTS. If a noindexed count ever
    // leaks into a hub it would link to a page excluded from the sitemap.
    const noindexed = [10, 15, 20, 30, 40, 125, 250, 300];
    for (const hubPath of ['calculators/wine', 'calculators/wedding', 'food/pizza', 'bar-setup']) {
      const html = readBuilt(hubPath);
      const tableSection = html.match(/<table class="hub-table"[\s\S]*?<\/table>/g)?.join('') ?? '';
      for (const count of noindexed) {
        expect(
          tableSection.includes(`-${count}-guests/`),
          `${hubPath} links to a noindexed ${count}-guest page`,
        ).toBe(false);
      }
    }
  });
});
