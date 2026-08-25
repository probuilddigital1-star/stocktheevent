import { test, expect } from '@playwright/test';
import { nextSeasonalEvent, seasonalEvents } from '../src/data/seasonalEvents';

// Pure unit tests: no page fixture, no dev server needed.
test.describe('nextSeasonalEvent', () => {
  test('picks the Super Bowl in January', () => {
    // January is a peak month for exactly one event.
    const picked = nextSeasonalEvent(new Date('2026-01-15T12:00:00'));
    expect(picked.slug).toBe('super-bowl-party-calculator');
  });

  test('picks the 4th of July in July', () => {
    // July is a peak month for exactly one event.
    const picked = nextSeasonalEvent(new Date('2026-07-04T12:00:00'));
    expect(picked.slug).toBe('fourth-of-july-party-calculator');
  });

  test('returns an event whose peak months include the build month, for every month', () => {
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december',
    ];
    // Every month is currently covered by at least one event, so the nearest
    // upcoming fallback should never be needed. If a peak month is ever
    // dropped this test says so rather than the nav quietly drifting.
    for (let month = 0; month < 12; month++) {
      const picked = nextSeasonalEvent(new Date(2026, month, 15));
      expect(
        picked.peakMonths,
        `${monthNames[month]} fell through to the nearest-upcoming fallback`,
      ).toContain(monthNames[month]);
    }
  });

  test('is deterministic when several events share a month', () => {
    // February peaks for Super Bowl, March Madness and St Patrick's Day. The
    // earliest in the array wins, so a rebuild does not shuffle the nav.
    const first = nextSeasonalEvent(new Date(2026, 1, 10));
    const second = nextSeasonalEvent(new Date(2026, 1, 28));
    expect(first.slug).toBe(second.slug);

    const februaryEvents = seasonalEvents.filter((e) => e.peakMonths.includes('february'));
    expect(februaryEvents.length).toBeGreaterThan(1);
    expect(first.slug).toBe(februaryEvents[0].slug);
  });
});
