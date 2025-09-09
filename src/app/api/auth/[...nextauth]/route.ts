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
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      console.log("JWT Callback - account:", !!account);
      console.log("JWT Callback - token:", !!token);
      
      if (account && account.access_token) {
        console.log("Setting new token from account");
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token || "";

        try {
          const payload = JSON.parse(
            Buffer.from(account.access_token.split(".")[1], "base64").toString()
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
          
          console.log("User extracted from token:", token.user);
        } catch (error) {
          console.error("Error parsing JWT:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback - token:", !!token);
      
      if (token.user) {
        session.user = token.user as {
          id: string | null;
          username: string | null;
          email: string | null;
          roles: string[];
        };
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
        session.accessTokenExpires = token.exp as number;
      }
      
      console.log("Session created with user:", !!session.user);
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
