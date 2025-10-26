"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

/**
 * Custom hook to automatically refresh the session before token expires
 * This ensures seamless user experience without interruption
 */
export function useTokenRefresh() {
  const { data: session, update } = useSession();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!session?.accessTokenExpires) {
      return;
    }

    // Calculate time until token expires (in milliseconds)
    const expiresAt = session.accessTokenExpires * 1000; // Convert to ms
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;

    // Refresh 1 minute before expiration (or immediately if already expired)
    const refreshTime = timeUntilExpiry - 60 * 1000;

    console.log("🔄 Token refresh scheduled:", {
      expiresAt: new Date(expiresAt).toLocaleString(),
      timeUntilExpiry: Math.floor(timeUntilExpiry / 1000) + "s",
      refreshIn: Math.floor(refreshTime / 1000) + "s",
    });

    // Clear any existing interval
    if (refreshIntervalRef.current) {
      clearTimeout(refreshIntervalRef.current);
    }

    // Schedule refresh
    if (refreshTime > 0) {
      refreshIntervalRef.current = setTimeout(async () => {
        console.log("🔄 Refreshing token...");
        try {
          await update(); // This triggers NextAuth to refresh the token
          console.log("✅ Token refreshed successfully");
        } catch {
          console.log("❌ Failed to refresh token");
        }
      }, refreshTime);
    } else {
      // Token already expired or will expire very soon, refresh immediately
      console.log(
        "🔄 Token expired or expiring soon, refreshing immediately..."
      );
      update().then(() => {
        console.log("✅ Token refreshed successfully");
      });
    }

    // Cleanup on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearTimeout(refreshIntervalRef.current);
      }
    };
  }, [session?.accessTokenExpires, update]);
}
