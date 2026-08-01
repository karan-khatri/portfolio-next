/**
 * Section-anchor nav links (e.g. "#about") only resolve on the page that
 * actually has that section — which today is always the homepage.
 * Prefixing with "/" turns it into a real navigation back to home followed
 * by the browser's normal hash-scroll, so it also works from project/blog/
 * standalone pages instead of silently doing nothing there.
 */
export function resolveNavHref(href: string): string {
  return href.startsWith("#") ? `/${href}` : href;
}
