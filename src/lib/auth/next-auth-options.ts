/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        return {
          ...token,
          accessToken: account.access_token ?? token.accessToken,
          refreshToken: account.refresh_token ?? token.refreshToken,
          expiresAt: Math.floor(
            Date.now() / 1000 +
              (typeof account.expires_in === "number"
                ? account.expires_in
                : 3600)
          ),
          roles:
            (profile as any)?.realm_access?.roles ??
            (profile as any)?.resource_access?.account?.roles ??
            [],
          user: {
            id: profile?.sub ?? null,
            username: profile?.name ?? null,
            email: profile?.email ?? null,
            roles: (profile as any)?.realm_access?.roles ?? [],
          },
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (token.error) {
        session.error = token.error;
      }

      session.user = token.user as {
        id: string | null;
        username: string | null;
        email: string | null;
        roles: string[];
      };
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.accessTokenExpires = token.expiresAt as number;

      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (token.refreshToken) {
        await fetch(
          `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: process.env.KEYCLOAK_CLIENT_ID!,
              client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
              refresh_token: token.refreshToken!,
            }),
          }
        ).catch(console.error);
      }
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// ---------- Type Augmentation ----------
declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken: string;
    roles?: string[];
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    roles?: string[];
    error?: string;
  }
}
