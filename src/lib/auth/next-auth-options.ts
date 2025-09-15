import { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { refreshTokenRequest } from "./oidc";


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
    async jwt({ token, account }) {
      // Initial sign-in
      if (account) {
        return {
          ...token,
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          expires_at: Math.floor(Date.now() / 1000 + (typeof account.expires_in === "number" ? account.expires_in : 3600)),
        };
      }

      // Refresh if expired
      if (token.expires_at && Date.now() / 1000 > token.expires_at - 60) {
        try {
          const refreshed = await refreshTokenRequest(token.refresh_token);
          return {
            ...token,
            access_token: refreshed.access_token,
            refresh_token: refreshed.refresh_token ?? token.refresh_token,
            expires_at: Math.floor(Date.now() / 1000 + (refreshed.expires_in || 3600)),
          };
        } catch {
          return { ...token, error: "RefreshAccessTokenError" };
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.access_token = token.access_token;
      session.refresh_token = token.refresh_token;
      session.error = token.error;
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      // Optional: Call Keycloak logout
      if (token.refresh_token) {
        await fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.KEYCLOAK_CLIENT_ID!,
            client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
            refresh_token: token.refresh_token,
          }),
        }).catch(console.error);
      }
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};


  // Simplified types
declare module "next-auth" {
  interface Session {
    access_token: string;
    refresh_token: string;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    error?: string;
  }
}







