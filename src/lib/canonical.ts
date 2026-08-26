/**
 * canonical.ts - derives a page's canonical URL from its resolved URL,
 * appending a trailing slash unless the path is already the root, already
 * slashed, or points at a file (has a "." in its last segment, e.g. an
 * asset or a sitemap XML file).
 *
 * Shared by BaseLayout (every normal page) and the standalone /embed/ page,
 * which bypasses BaseLayout, so canonical URLs are always derived the same
 * way rather than hand-written per page.
 */
export function withTrailingSlash(url: URL): string {
  const lastSegment = url.pathname.split('/').pop() ?? '';
  if (url.pathname === '/' || url.pathname.endsWith('/') || lastSegment.includes('.')) {
    return url.href;
  }
  return `${url.href}/`;
}
