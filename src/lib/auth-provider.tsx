"use client";

import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

interface AuthProviderProps {
  children: ReactNode;
  session?: Session;
}

// Component to monitor session and handle refresh errors
function SessionMonitor({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    // If session has a refresh error, force sign out
    if (session?.error === "RefreshAccessTokenError") {
      signOut({ callbackUrl: "/login" });
    }
  }, [session]);

  return <>{children}</>;
}

export default function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider
      session={session}
      // Check session every 5 minutes (300 seconds)
      // This will trigger the JWT callback to check and refresh the token
      refetchInterval={5 * 60}
      // Refetch session when window gains focus
      refetchOnWindowFocus={true}
    >
      <SessionMonitor>{children}</SessionMonitor>
    </SessionProvider>
  );
}
