/**
 * redirects.ts - the redirect rules for the old per-guest-count URLs.
 *
 * Shared by scripts/generateRedirects.ts (which writes them to
 * public/_redirects) and scripts/checkSite.ts (which verifies the built
 * output against them). See generateRedirects.ts for why these shapes.
 */
import { guestCounts } from '../data/guestCounts';

/** Three splat rules per guest count: with slash, without slash, share image. */
export function redirectRules(): string[] {
  const rules: string[] = [];
  for (const { value } of guestCounts) {
    rules.push(`/*-${value}-guests/ /:splat/ 301`);
    rules.push(`/*-${value}-guests /:splat/ 301`);
    rules.push(`/og/*-${value}-guests.png /og/:splat.png 301`);
  }
  return rules;
}
