import { test, expect } from '@playwright/test';
import { nextSeasonalEvent } from '../src/data/seasonalEvents';

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

  test('returns an event whose peak months include the 15th, except when that month has none left', () => {
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december',
    ];
    // July 4 is over by the 15th and no other event peaks in July, so July
    // falls back to the next upcoming event (see the edge-date test below).
    for (let month = 0; month < 12; month++) {
      if (monthNames[month] === 'july') continue;
      const picked = nextSeasonalEvent(new Date(2026, month, 15));
      expect(
        picked.peakMonths,
        `${monthNames[month]} fell through to the nearest-upcoming fallback`,
      ).toContain(monthNames[month]);
    }
  });

  test('never returns a past event on a month-end or between-event date', () => {
    const cases: Array<[string, string]> = [
      ['2026-09-08T12:00:00', 'halloween-party-calculator'], // day after Labor Day
      ['2026-09-30T12:00:00', 'halloween-party-calculator'],
      ['2026-10-12T12:00:00', 'halloween-party-calculator'],
      ['2026-10-31T12:00:00', 'halloween-party-calculator'], // day of
      ['2026-11-01T12:00:00', 'thanksgiving-calculator'], // first day after Halloween
      ['2026-11-27T12:00:00', 'christmas-party-calculator'], // day after Thanksgiving
      ['2026-12-26T12:00:00', 'new-years-eve-party-calculator'], // day after Christmas
      ['2026-12-31T12:00:00', 'new-years-eve-party-calculator'],
      ['2027-01-01T12:00:00', 'super-bowl-party-calculator'], // wraps into next year
      ['2026-07-06T12:00:00', 'labor-day-party-calculator'], // no July event left
    ];
    for (const [when, slug] of cases) {
      expect(nextSeasonalEvent(new Date(when)).slug, when).toBe(slug);
    }
  });

  test('picks the soonest event when several share a month', () => {
    // February peaks for Super Bowl, March Madness and St Patrick's Day. After
    // the Super Bowl has passed, the soonest remaining date wins and the choice
    // does not change between builds on the same day.
    const first = nextSeasonalEvent(new Date(2026, 1, 10));
    const second = nextSeasonalEvent(new Date(2026, 1, 28));
    expect(first.slug).toBe('st-patricks-day-party-calculator');
    expect(first.slug).toBe(second.slug);
    expect(nextSeasonalEvent(new Date(2026, 1, 1)).slug).toBe('super-bowl-party-calculator');
  });
});
