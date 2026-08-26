/**
 * analytics.ts - the one place PostHog gets initialized. BaseLayout calls
 * this with no options for every normal page; the standalone /embed/ page
 * (which bypasses BaseLayout) calls it with an extra registered property
 * and forced memory-only persistence, since it runs as a third-party
 * iframe on other people's sites where cookies/localStorage are
 * partitioned or blocked by most browsers anyway.
 */
import { isRegulatedRegion, getConsent } from './consent';

export interface InitAnalyticsOptions {
  /** Extra properties registered alongside { site: 'stocktheevent' }. */
  extraProps?: Record<string, unknown>;
  /** Force memory-only persistence regardless of region. */
  forceMemoryPersistence?: boolean;
}

export function initAnalytics(options: InitAnalyticsOptions = {}): void {
  const POSTHOG_KEY = import.meta.env.PUBLIC_POSTHOG_KEY;
  const POSTHOG_HOST = import.meta.env.PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
  if (!POSTHOG_KEY) return;

  // Cookieless until a visitor in a regulated region explicitly accepts;
  // outside the EU/UK, PostHog runs with its normal persistence.
  const needsConsentGate = isRegulatedRegion() && getConsent() !== 'accepted';
  const persistence = options.forceMemoryPersistence || needsConsentGate ? 'memory' : 'localStorage+cookie';

  import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        autocapture: false,
        disable_session_recording: true,
        // This init runs after a dynamic import resolves, well past
        // posthog-js's own window-load detection, so its automatic
        // $pageview never fires. Captured explicitly below instead, once
        // the site property is registered, so it carries site too.
        capture_pageview: false,
        capture_pageleave: true,
        persistence,
      });
      posthog.register({ site: 'stocktheevent', ...options.extraProps });
      posthog.capture('$pageview');
      window.posthog = posthog;
    })
    .catch(() => {
      // Blocked (ad blocker, offline, etc). track() stays a no-op.
    });
}
