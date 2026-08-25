import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// A pure unit test: no page fixture. The homepage's "Your bar" table must
// carry the default state (all four drinks, wedding, 100 guests, 5 hours) in
// the built HTML before any JavaScript runs, so it reads dist/ directly.
test.describe('Homepage bar totals are built in, not JS-only', () => {
  test('built index.html renders 447 in the #bar-total row', () => {
    const filePath = path.join(process.cwd(), 'dist', 'index.html');
    if (!fs.existsSync(filePath)) {
      throw new Error(`Built page not found: ${filePath}. Run "npm run build" first.`);
    }
    const html = fs.readFileSync(filePath, 'utf-8');
    const match = html.match(/id="bar-total"[^>]*>\s*447\s*</);
    expect(match, 'Expected the #bar-total span to render 447 at build time').not.toBeNull();
  });
});
