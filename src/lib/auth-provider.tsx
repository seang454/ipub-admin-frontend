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
      // Check session every 15 minutes (900 seconds)
      // Reduced from 5 minutes to minimize unnecessary requests
      refetchInterval={15 * 60}
      // Disable refetch on window focus to prevent excessive requests
      // Session will still be checked every 15 minutes automatically
      refetchOnWindowFocus={false}
      // Don't refetch when offline
      refetchWhenOffline={false}
    >
      <SessionMonitor>{children}</SessionMonitor>
    </SessionProvider>
  );
}
