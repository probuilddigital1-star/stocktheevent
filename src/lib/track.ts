/**
 * track.ts - the single entry point every component uses to send a PostHog
 * event. No-ops when PostHog never loaded (PUBLIC_POSTHOG_KEY unset, the
 * script failed to load, or an ad blocker stripped it), so calling this is
 * always safe and never throws or logs.
 */

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, props?: Record<string, unknown>) => void;
      register: (props: Record<string, unknown>) => void;
      set_config: (config: Record<string, unknown>) => void;
    };
    adsbygoogle?: unknown[];
    /**
     * The same track() below, mirrored onto window by BaseLayout's script.
     * Astro's define:vars scripts cannot use ES `import`, so the page
     * scripts that need tracking and also use define:vars (InteractiveCalculator,
     * [slug].astro, food/[slug].astro, ShoppingChecklist.astro) call
     * window.track?.(...) instead of importing this module directly.
     */
    track?: (event: string, props?: Record<string, unknown>) => void;
  }
}

export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const posthog = window.posthog;
  if (!posthog || typeof posthog.capture !== 'function') return;
  try {
    posthog.capture(event, props);
  } catch {
    // Analytics must never break the page.
  }
}
