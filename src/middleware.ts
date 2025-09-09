import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { signIn } from "next-auth/react";
import { redirect } from "next/dist/server/api-utils";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const signInUrl = new URL("/login", req.url);
    signInUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(signInUrl);
  }
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    const allowedRoles = ["ADMIN"];
    const roles = token?.user?.roles || [];
    const hasRole = roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  const allowedRoles = ["ADMIN"];
  const roles = token?.user?.roles || [];
  const hasRole = roles.some((role) => allowedRoles.includes(role));
  if (!hasRole) {
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|unauthorized|login).*)",
  ],
};
