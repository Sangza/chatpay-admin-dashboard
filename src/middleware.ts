import { NextRequest, NextResponse } from "next/server";

const TOKEN_COOKIE = "chatpay_admin_token";

export function middleware(req: NextRequest) {
  const hasToken = req.cookies.has(TOKEN_COOKIE);
  const isLoginPage = req.nextUrl.pathname === "/login";

  if (!hasToken && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (hasToken && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard/merchants", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
