import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isPublicPage =
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/verify-2fa" ||
    pathname === "/terms" ||
    pathname === "/privacy";
  const isAuthApi = pathname.startsWith("/api/auth");
  const isAcceptTermsPage = pathname === "/accept-terms";

  if (isAuthApi) {
    return NextResponse.next();
  }

  if (!token && !isAuthPage && !isPublicPage) {
    if (isAcceptTermsPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Terms gate for authenticated users
  if (token && !isPublicPage && !isAuthPage && !isAcceptTermsPage) {
    if (!token.termsAcceptedAt) {
      return NextResponse.redirect(new URL("/accept-terms", request.url));
    }
  }

  // If user already accepted terms and visits /accept-terms, redirect to dashboard
  if (token && isAcceptTermsPage && token.termsAcceptedAt) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
