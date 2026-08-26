/**
 * consent.ts - a loose, client-side signal for "does this visitor look like
 * they're in the EU or UK," plus the localStorage-backed remembered choice.
 * This is a heuristic for showing a consent banner, not a legal geolocation
 * check: it is fine to occasionally show the banner to a visitor outside the
 * EU/UK, but it should never fail to show it to one who plausibly is inside.
 */

export type ConsentChoice = 'accepted' | 'essential';

const STORAGE_KEY = 'ste-consent';

// Language tags EU member states + the UK commonly use as their primary
// browser language. 'en' alone is excluded (too broad - most of the world).
const EU_UK_LANGUAGE_PREFIXES = [
  'en-gb',
  'de',
  'fr',
  'it',
  'es',
  'pt',
  'nl',
  'pl',
  'sv',
  'da',
  'fi',
  'el',
  'cs',
  'hu',
  'ro',
  'bg',
  'hr',
  'sk',
  'sl',
  'et',
  'lv',
  'lt',
  'ga',
  'mt',
];

export function isRegulatedRegion(): boolean {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (timeZone.startsWith('Europe/')) return true;
  } catch {
    // Intl unsupported; fall through to language.
  }
  try {
    const language = (navigator.language || '').toLowerCase();
    return EU_UK_LANGUAGE_PREFIXES.some((prefix) => language === prefix || language.startsWith(`${prefix}-`));
  } catch {
    return false;
  }
}

export function getConsent(): ConsentChoice | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'accepted' || value === 'essential' ? value : null;
  } catch {
    return null;
  }
}

export function setConsent(choice: ConsentChoice): void {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // If storage is unavailable, the banner simply reappears next visit.
  }
}
