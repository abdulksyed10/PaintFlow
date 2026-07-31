import { NextRequest, NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-session";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = token ? await verifyAdminSessionToken(token) : null;

  if (pathname === "/admin-login") {
    if (session) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/admin-login", request.url);
      loginUrl.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin", "/admin-login"],
};
