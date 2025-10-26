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
    [key: string]: {
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

        // Debug: Log the entire profile to see what roles are available
        if (process.env.NODE_ENV === "development") {
          console.log(
            "🔍 Keycloak Profile (ID Token):",
            JSON.stringify(keycloakProfile, null, 2)
          );
          console.log(
            "🔍 Realm Access Roles:",
            keycloakProfile?.realm_access?.roles
          );
          console.log("🔍 Resource Access:", keycloakProfile?.resource_access);
        }

        // IMPORTANT: Extract roles from the ACCESS token, not the ID token
        // The ID token (profile) may not contain roles, but the access token does
        let allRoles: string[] = [];

        try {
          // Decode the access token to get roles
          if (account.access_token) {
            const base64Url = account.access_token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split("")
                .map(
                  (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                )
                .join("")
            );
            const accessTokenPayload = JSON.parse(jsonPayload);

            if (process.env.NODE_ENV === "development") {
              console.log(
                "🔍 Access Token Payload:",
                JSON.stringify(accessTokenPayload, null, 2)
              );
            }

            // Extract roles from access token
            const realmRoles = accessTokenPayload?.realm_access?.roles ?? [];
            const clientId = process.env.KEYCLOAK_CLIENT_ID || "account";
            const clientRoles =
              accessTokenPayload?.resource_access?.[clientId]?.roles ?? [];
            const accountRoles =
              accessTokenPayload?.resource_access?.account?.roles ?? [];

            allRoles = [
              ...new Set([...realmRoles, ...clientRoles, ...accountRoles]),
            ];
          } else {
            // Fallback: Try to get from profile (ID token) if access token parsing fails
            const realmRoles = keycloakProfile?.realm_access?.roles ?? [];
            const clientId = process.env.KEYCLOAK_CLIENT_ID || "account";
            const clientRoles =
              keycloakProfile?.resource_access?.[clientId]?.roles ?? [];
            const accountRoles =
              keycloakProfile?.resource_access?.account?.roles ?? [];

            allRoles = [
              ...new Set([...realmRoles, ...clientRoles, ...accountRoles]),
            ];
          }
        } catch {
          // Fallback to profile if access token decoding fails
          const realmRoles = keycloakProfile?.realm_access?.roles ?? [];
          const clientId = process.env.KEYCLOAK_CLIENT_ID || "account";
          const clientRoles =
            keycloakProfile?.resource_access?.[clientId]?.roles ?? [];
          const accountRoles =
            keycloakProfile?.resource_access?.account?.roles ?? [];

          allRoles = [
            ...new Set([...realmRoles, ...clientRoles, ...accountRoles]),
          ];
        }

        if (process.env.NODE_ENV === "development") {
          console.log("✅ Extracted Roles from Access Token:", allRoles);
        }

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
          roles: allRoles,
          user: {
            id: keycloakProfile?.sub ?? null,
            username: keycloakProfile?.name ?? null,
            email: keycloakProfile?.email ?? null,
            roles: allRoles,
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

        // Re-extract roles from the new access token
        let updatedRoles = token.roles as string[] | undefined;
        try {
          if (refreshedTokens.access_token) {
            const base64Url = refreshedTokens.access_token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split("")
                .map(
                  (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                )
                .join("")
            );
            const accessTokenPayload = JSON.parse(jsonPayload);

            const realmRoles = accessTokenPayload?.realm_access?.roles ?? [];
            const clientId = process.env.KEYCLOAK_CLIENT_ID || "account";
            const clientRoles =
              accessTokenPayload?.resource_access?.[clientId]?.roles ?? [];
            const accountRoles =
              accessTokenPayload?.resource_access?.account?.roles ?? [];

            updatedRoles = [
              ...new Set([...realmRoles, ...clientRoles, ...accountRoles]),
            ];

            if (process.env.NODE_ENV === "development") {
              console.log("🔄 Updated roles after refresh:", updatedRoles);
            }
          }
        } catch {
          // If role extraction fails, keep existing roles
          console.log(
            "⚠️ Failed to extract roles from refreshed token, keeping existing roles"
          );
        }

        // Preserve existing token data including roles and user info
        return {
          ...token,
          accessToken: refreshedTokens.access_token,
          refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
          expiresAt: Math.floor(Date.now() / 1000 + refreshedTokens.expires_in),
          error: undefined,
          // Use updated roles if available, otherwise preserve existing
          roles: updatedRoles,
          user: {
            ...(token.user as {
              id: string | null;
              username: string | null;
              email: string | null;
              roles: string[];
            }),
            roles: updatedRoles ?? [],
          },
        };
      } catch {
        console.log("❌ Token refresh failed");
        return {
          ...token,
          error: "RefreshAccessTokenError",
        };
      }
    },
    async session({ session, token }) {
      // DEBUG: Log everything
      console.log("🔥 SESSION CALLBACK RUNNING!");
      console.log("🔥 token.roles:", token.roles);
      console.log("🔥 token.user:", token.user);
      console.log("🔥 Full token:", JSON.stringify(token, null, 2));

      if (token.error) {
        session.error = token.error;
      }

      // Ensure roles are always available, even after token refresh
      const roles = (token.roles as string[]) ?? [];
      const tokenUser = token.user as
        | {
            id: string | null;
            username: string | null;
            email: string | null;
            roles: string[];
          }
        | undefined;

      console.log("🔥 Extracted roles for session:", roles);

      session.user = {
        id: tokenUser?.id ?? (token.sub as string) ?? null,
        username: tokenUser?.username ?? (token.name as string) ?? null,
        email: tokenUser?.email ?? (token.email as string) ?? null,
        roles: roles,
      };
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.accessTokenExpires = token.expiresAt as number;
      session.roles = roles; // Also add roles at session level

      console.log("🔥 Final session.user.roles:", session.user.roles);
      console.log("🔥 Final session.roles:", session.roles);

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
    accessTokenExpires: number;
    roles?: string[];
    error?: string;
    user: {
      id: string | null;
      username: string | null;
      email: string | null;
      roles: string[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    roles?: string[];
    error?: string;
    user?: {
      id: string | null;
      username: string | null;
      email: string | null;
      roles: string[];
    };
  }
}
