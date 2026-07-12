import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "./lib/auth/constants";

// Cheap, edge-safe existence check only — no DB round trip here. The real,
// DB-backed session/role verification happens in requireAdmin() at the
// layout/page level (lib/auth/require-admin.ts), which runs in the Node
// runtime where @portfolio/db's pg-backed client works. This is the fast
// first line of defense-in-depth: an invalid or expired cookie still gets
// caught deeper in, but a *missing* cookie never even reaches a page.
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

  const response = NextResponse.next();
  if (isAdminRoute || isApiRoute) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
