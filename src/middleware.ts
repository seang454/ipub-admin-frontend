import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log("Middleware - Token:", !!token);
  console.log("Middleware - Path:", req.nextUrl.pathname);

  // Allow access to login page and auth routes
  if (
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  if (!token) {
    console.log("No token found, redirecting to login");
    const signInUrl = new URL("/login", req.url);
    signInUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Check role-based access for protected routes
  if (
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/users") ||
    req.nextUrl.pathname.startsWith("/students") ||
    req.nextUrl.pathname.startsWith("/advisers") ||
    req.nextUrl.pathname.startsWith("/papers") ||
    req.nextUrl.pathname.startsWith("/proposals")
  ) {
    const allowedRoles = ["ADMIN"];
    const roles = token?.user?.roles || [];
    const hasRole = roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      console.log("User doesn't have required role, redirecting to home");
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
