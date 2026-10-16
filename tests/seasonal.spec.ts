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

  test('returns an event whose peak months include the build month, for every month', () => {
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december',
    ];
    // On the 1st of each month nothing has happened yet, so every month is
    // covered by an event that peaks in it. If a peak month is ever dropped
    // this test says so rather than the nav quietly drifting.
    for (let month = 0; month < 12; month++) {
      const picked = nextSeasonalEvent(new Date(2026, month, 1));
      expect(
        picked.peakMonths,
        `${monthNames[month]} fell through to the nearest-upcoming fallback`,
      ).toContain(monthNames[month]);
    }
  });

  test('falls back to the next upcoming event when the month has none left', () => {
    // July 4 is the only July event and it is over by Jul 10. The next dated
    // event is Labor Day (Sep 7, 2026), which peaks in August and September,
    // not July, so this exercises the fallback branch directly.
    const picked = nextSeasonalEvent(new Date(2026, 6, 10));
    expect(picked.slug).toBe('labor-day-party-calculator');
    expect(picked.peakMonths).not.toContain('july');
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
