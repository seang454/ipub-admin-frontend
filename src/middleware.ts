import { getToken, JWT } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  const token: JWT | null = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Only log in development mode
  if (process.env.NODE_ENV === "development") {
    console.log("token :>> ", token);
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);

  // Check if token exists and is valid
  // Give a 5-minute grace period for token refresh
  const REFRESH_GRACE_PERIOD = 5 * 60; // 5 minutes in seconds
  const isValid =
    !!token?.accessToken &&
    (!token?.expiresAt ||
      nowInSeconds < token.expiresAt + REFRESH_GRACE_PERIOD);

  // Check if user has admin role (case-insensitive)
  const roles = token?.roles as string[] | undefined;
  const isAdmin =
    roles?.some(
      (role) =>
        role.toLowerCase() === "admin" || role.toLowerCase() === "administrator"
    ) ?? false;

  const authRoute =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/signup");

  // Admin protected routes - all routes in (admin) folder
  const adminProtectedRoute =
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/users") ||
    req.nextUrl.pathname.startsWith("/students") ||
    req.nextUrl.pathname.startsWith("/advisers") ||
    req.nextUrl.pathname.startsWith("/papers") ||
    req.nextUrl.pathname.startsWith("/papersDetail") ||
    req.nextUrl.pathname.startsWith("/proposals") ||
    req.nextUrl.pathname.startsWith("/notification") ||
    req.nextUrl.pathname.startsWith("/generate");

  // If user is authenticated and tries to access auth routes, redirect to dashboard
  if (authRoute && isValid && isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If user is not authenticated and tries to access protected routes
  if (!isValid && adminProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If user is authenticated but NOT an admin and tries to access admin routes
  if (isValid && !isAdmin && adminProtectedRoute) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/users/:path*",
    "/students/:path*",
    "/advisers/:path*",
    "/papers/:path*",
    "/papersDetail/:path*",
    "/proposals/:path*",
    "/notification/:path*",
    "/generate/:path*",
    "/login",
    "/signup",
  ],
};
