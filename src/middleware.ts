import { NextRequest, NextResponse } from "next/server";
import { getToken, JWT } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
  const token: JWT | null = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = !!token?.access_token && (!token.expires_at || Date.now() / 1000 < token.expires_at);

  const authRoute = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup");
  const protectedRoute = req.nextUrl.pathname.startsWith("/dashboard");

  if (authRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!isLoggedIn && protectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/user-profile/:path*"],
};
