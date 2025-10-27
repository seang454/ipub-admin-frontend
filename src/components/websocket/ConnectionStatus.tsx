"use client";

import { useWebSocket } from "@/components/contexts/websocket-context";
import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function WebSocketConnectionStatus() {
  const { isConnected } = useWebSocket();
  const [showIndicator, setShowIndicator] = useState(false);

  // Only show indicator briefly when status changes, or keep visible if disconnected
  useEffect(() => {
    if (isConnected) {
      // Show connected indicator briefly (2 seconds), then fade out
      setShowIndicator(true);
      const timer = setTimeout(() => {
        setShowIndicator(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      // Keep disconnected indicator visible
      setShowIndicator(true);
    }
  }, [isConnected]);

  // Don't render anything if we shouldn't show the indicator
  if (!showIndicator) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
        isConnected
          ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
          : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 animate-pulse"
      }`}
    >
      {isConnected ? (
        <>
          <Wifi className="w-3 h-3" />
          <span>Live</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Reconnecting...</span>
        </>
      )}
    </div>
  );
}

// Alternative: Even more subtle - just a status dot
export function WebSocketStatusDot() {
  const { isConnected } = useWebSocket();

  return (
    <div
      className="relative flex items-center"
      title={isConnected ? "Real-time connection active" : "Reconnecting..."}
    >
      <div
        className={`w-2 h-2 rounded-full transition-all duration-300 ${
          isConnected ? "bg-green-500" : "bg-red-500 animate-pulse"
        }`}
      >
        {isConnected && (
          <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
        )}
      </div>
    </div>
  );
}
