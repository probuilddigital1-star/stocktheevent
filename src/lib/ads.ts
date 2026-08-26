/**
 * ads.ts - loads the AdSense script exactly once. Guarded by a DOM check
 * rather than a module-level flag, since BaseLayout and ConsentBanner each
 * get their own script bundle and could otherwise both try to load it.
 */

export function loadAdSenseScript(client: string): void {
  if (typeof document === 'undefined') return;
  if (document.querySelector('script[data-adsbygoogle]')) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
  script.crossOrigin = 'anonymous';
  script.setAttribute('data-adsbygoogle', 'true');
  document.head.appendChild(script);
}
