import { getToken, JWT } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  const token: JWT | null = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log("token :>> ", token);

  const nowInSeconds = Math.floor(Date.now() / 1000);

  // Use standard `exp` claim if available
  const isValid = !!token?.accessToken && (!token?.expiresAt || nowInSeconds < token.expiresAt);

  const authRoute =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/signup");

  const protectedRoute = req.nextUrl.pathname.startsWith("/dashboard");

  if (authRoute && isValid) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!isValid && protectedRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/user-profile/:path*"],
};
