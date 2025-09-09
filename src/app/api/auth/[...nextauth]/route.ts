import NextAuth, { AuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

export const authOptions: AuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
      authorization: {
        params: {
          prompt: "login",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token!;
        token.refreshToken = account.refresh_token!;

        const payload = JSON.parse(
          Buffer.from(account.access_token!.split(".")[1], "base64").toString()
        );

        token.user = {
          id: payload.sub || null,
          username: payload.preferred_username || null,
          email: payload.email || null,
          roles: [
            ...(payload.realm_access?.roles || []),
            ...(payload.resource_access?.[process.env.KEYCLOAK_CLIENT_ID!]
              ?.roles || []),
          ],
        };
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user as {
        id: string | null;
        username: string | null;
        email: string | null;
        roles: string[];
      };
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.accessTokenExpires = token.exp as number;
      return session;
    },
  },
  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
