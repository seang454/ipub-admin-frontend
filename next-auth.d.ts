import NextAuth from "next-auth";
declare module "next-auth" {
  interface Session {
    user: {
      id: string | null;
      username: string | null;
      email: string | null;
      roles: string[];
    };
    accessTokenExpires: number;
    accessToken: string;
    refreshToken: string;
    error?: string;
  }
  interface User {
    id: string | null;
    username: string | null;
    roles: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    error?: string;
    user?: {
      // Add this
      id: string | null;
      username: string | null;
      email: string | null;
      roles: string[];
    };
  }
}
