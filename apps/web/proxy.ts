import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "./lib/auth/constants";
import { DEFAULT_LOCALE } from "./lib/i18n/config";
import { LOCALE_COOKIE, resolveLocaleRedirect } from "./lib/i18n/negotiate";
import { splitLocalePrefix } from "./lib/i18n/paths";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/accept-invite"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isApiRoute = pathname.startsWith("/api");
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path));

  if (isAdminRoute && !isPublicAdminPath) {
    const hasSession = request.cookies.has(SESSION_COOKIE);
    if (!hasSession) {
      const loginUrl = new URL("/admin/login", request.url);
      const response = NextResponse.redirect(loginUrl, 307);
      response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
      return response;
    }
  }

  if (!isAdminRoute && !isApiRoute) {
    if (pathname === `/${DEFAULT_LOCALE}` || pathname.startsWith(`/${DEFAULT_LOCALE}/`)) {
      const target = request.nextUrl.clone();
      target.pathname = pathname.slice(DEFAULT_LOCALE.length + 1) || "/";
      return NextResponse.redirect(target, 308);
    }

    const redirectPath = resolveLocaleRedirect({
      method: request.method,
      pathname,
      search: request.nextUrl.search,
      cookie: request.cookies.get(LOCALE_COOKIE)?.value,
      country: request.headers.get("x-vercel-ip-country"),
      userAgent: request.headers.get("user-agent"),
    });
    if (redirectPath) {
      const response = NextResponse.redirect(new URL(redirectPath, request.url), 307);
      response.headers.set("Cache-Control", "private, no-store");
      response.headers.set("Vary", "Cookie");
      return response;
    }

    const { locale } = splitLocalePrefix(pathname);

    if (locale === DEFAULT_LOCALE) {
      const target = request.nextUrl.clone();
      target.pathname = pathname === "/" ? `/${DEFAULT_LOCALE}` : `/${DEFAULT_LOCALE}${pathname}`;
      return NextResponse.rewrite(target);
    }

    return NextResponse.next();
  }

  const response = NextResponse.next();
  if (isAdminRoute || isApiRoute) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*", "/((?!_next|api|admin|opengraph-image|.*\\..*).*)"],
};
