import { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { refreshTokenRequest } from "./oidc";

// Define Keycloak profile type
interface KeycloakProfile {
  sub?: string;
  name?: string;
  email?: string;
  realm_access?: {
    roles?: string[];
  };
  resource_access?: {
    account?: {
      roles?: string[];
    };
  };
}

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
      // Initial sign in - save tokens from provider
      if (account && profile) {
        const keycloakProfile = profile as KeycloakProfile;
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
            keycloakProfile?.realm_access?.roles ??
            keycloakProfile?.resource_access?.account?.roles ??
            [],
          user: {
            id: keycloakProfile?.sub ?? null,
            username: keycloakProfile?.name ?? null,
            email: keycloakProfile?.email ?? null,
            roles: keycloakProfile?.realm_access?.roles ?? [],
          },
        };
      }

      // Token is still valid - return as is
      const currentTime = Math.floor(Date.now() / 1000);
      if (token.expiresAt && currentTime < token.expiresAt) {
        return token;
      }

      // Token has expired - try to refresh it
      try {
        console.log("🔄 Access token expired, refreshing...");
        const refreshedTokens = await refreshTokenRequest(
          token.refreshToken as string
        );

        console.log("✅ Token refreshed successfully");
        return {
          ...token,
          accessToken: refreshedTokens.access_token,
          refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
          expiresAt: Math.floor(Date.now() / 1000 + refreshedTokens.expires_in),
          error: undefined,
        };
      } catch (error) {
        return {
          ...token,
          error: "RefreshAccessTokenError",
        };
      }
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
        ).catch(() => {});
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
