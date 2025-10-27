"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import SockJS from "sockjs-client";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { useSession } from "next-auth/react";

interface WebSocketContextType {
  stompClient: Client | null;
  isConnected: boolean;
  subscribe: (
    topic: string,
    callback: (message: IMessage) => void
  ) => StompSubscription | null;
  unsubscribe: (subscription: StompSubscription) => void;
  publish: (destination: string, body: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const token = session?.accessToken || "";
  const currentUserId = session?.user?.id || "";

  const stompClientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionsRef = useRef<Map<string, StompSubscription>>(new Map());

  // Initialize WebSocket connection when user is authenticated
  useEffect(() => {
    // Only connect if we have both token and userId
    if (!token || !currentUserId) {
      console.log("WebSocket: Waiting for authentication...");
      return;
    }

    console.log("WebSocket: Initializing connection...");

    // Store reference for cleanup at the beginning of effect
    const subscriptions = subscriptionsRef.current;

    const socket = new SockJS("https://api.docuhub.me/ws-chat");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 3000,
      onConnect: () => {
        console.log("✅ WebSocket: Connected successfully");
        setIsConnected(true);
      },
      onDisconnect: () => {
        console.log("❌ WebSocket: Disconnected");
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error("WebSocket STOMP Error:", frame);
        setIsConnected(false);
      },
      debug: (str) => {
        if (process.env.NODE_ENV === "development") {
          console.log("WebSocket Debug:", str);
        }
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    // Cleanup on unmount or when auth changes
    return () => {
      console.log("WebSocket: Cleaning up connection...");

      // Unsubscribe from all topics
      subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      subscriptions.clear();

      // Deactivate client
      if (stompClient.active) {
        stompClient.deactivate();
      }
      setIsConnected(false);
    };
  }, [token, currentUserId]);

  // Subscribe to a topic
  const subscribe = (
    topic: string,
    callback: (message: IMessage) => void
  ): StompSubscription | null => {
    if (!stompClientRef.current || !isConnected) {
      console.warn(`WebSocket: Cannot subscribe to ${topic} - not connected`);
      return null;
    }

    console.log(`WebSocket: Subscribing to ${topic}`);
    const subscription = stompClientRef.current.subscribe(topic, callback);
    subscriptionsRef.current.set(topic, subscription);
    return subscription;
  };

  // Unsubscribe from a topic
  const unsubscribe = (subscription: StompSubscription) => {
    subscription.unsubscribe();
    // Remove from our tracking map
    subscriptionsRef.current.forEach((sub, topic) => {
      if (sub === subscription) {
        subscriptionsRef.current.delete(topic);
      }
    });
  };

  // Publish a message
  const publish = (destination: string, body: string) => {
    if (!stompClientRef.current || !isConnected) {
      console.warn("WebSocket: Cannot publish - not connected");
      return;
    }

    stompClientRef.current.publish({
      destination,
      body,
    });
  };

  const value: WebSocketContextType = {
    stompClient: stompClientRef.current,
    isConnected,
    subscribe,
    unsubscribe,
    publish,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
