# WebSocket Initialization Guide

## Overview

The WebSocket connection for real-time notifications has been refactored to connect automatically when the application starts, rather than only when the user navigates to the notification page.

## Changes Made

### 1. Created WebSocket Context (`src/components/contexts/websocket-context.tsx`)

- **New global WebSocket provider** that initializes the connection when the app starts
- **Automatically connects** when user authentication is available (token + userId)
- **Manages connection lifecycle**: connects, reconnects, and disconnects appropriately
- **Provides reusable hooks** for subscribing/unsubscribing to WebSocket topics
- **Connection state tracking** with `isConnected` flag

#### Key Features:

```typescript
- useWebSocket() hook exposes:
  - stompClient: The STOMP client instance
  - isConnected: Connection status
  - subscribe(topic, callback): Subscribe to a topic
  - unsubscribe(subscription): Unsubscribe from a topic
  - publish(destination, body): Send messages
```

### 2. Updated Providers (`src/app/providers.tsx`)

- Added `WebSocketProvider` to the provider hierarchy
- WebSocket provider wraps `NotificationProvider` to ensure it's available throughout the app
- Connection is established as soon as the user is authenticated

**Provider Order:**

```
ReduxProvider
  → I18nextProvider
    → AuthProvider
      → WebSocketProvider  ← New!
        → NotificationProvider
          → App Content
```

### 3. Refactored Notification Page (`src/app/(admin)/notification/page.tsx`)

- **Removed** local WebSocket connection logic
- **Now uses** the global WebSocket connection via `useWebSocket()` hook
- **Subscribes** to notification topics when the page mounts
- **Unsubscribes** when the page unmounts (connection stays alive)
- Simplified code and improved maintainability

## Benefits

### ✅ Before vs After

**Before:**

- WebSocket connected **only** when visiting notification page
- New connection created **every time** you visit the page
- Connection lost when leaving the page
- Missed notifications while on other pages

**After:**

- WebSocket connects **immediately** when you log in
- **Single persistent** connection throughout the session
- Connection stays alive across all pages
- **Real-time notifications** work everywhere in the app

## How It Works

### Connection Flow:

1. User logs in → Authentication token and user ID available
2. `WebSocketProvider` detects authentication
3. WebSocket connection established automatically
4. Connection remains open throughout the session
5. Any component can subscribe to WebSocket topics using `useWebSocket()`

### Usage Example:

```typescript
import { useWebSocket } from "@/components/contexts/websocket-context";

function MyComponent() {
  const { subscribe, unsubscribe, isConnected, publish } = useWebSocket();

  useEffect(() => {
    if (!isConnected) return;

    // Subscribe to a topic
    const subscription = subscribe("/topic/my-topic", (message) => {
      const data = JSON.parse(message.body);
      console.log("Received:", data);
    });

    // Cleanup
    return () => {
      if (subscription) {
        unsubscribe(subscription);
      }
    };
  }, [isConnected, subscribe, unsubscribe]);

  // Send a message
  const sendMessage = () => {
    publish("/app/my-endpoint", JSON.stringify({ data: "hello" }));
  };

  return <div>{isConnected ? "Connected" : "Disconnected"}</div>;
}
```

## WebSocket Configuration

**Endpoint:** `https://api.docuhub.me/ws-chat`

**Topics Currently Subscribed (in notification page):**

- `/topic/user.{userId}` - User-specific notifications
- `/topic/admin-notifications` - Admin broadcast notifications

**Authentication:**

- Uses Bearer token from NextAuth session
- Automatically reconnects if connection drops (3-second delay)

## Debugging

### Console Messages:

- `"WebSocket: Waiting for authentication..."` - Waiting for user to log in
- `"✅ WebSocket: Connected successfully"` - Connection established
- `"❌ WebSocket: Disconnected"` - Connection lost
- `"WebSocket: Cleaning up connection..."` - Cleanup on logout/unmount

### Development Mode:

Debug logs are enabled in development mode to help track WebSocket activity.

## UI Connection Indicator

A **very subtle** status indicator shows the WebSocket connection state:

### Location:

- **Admin Panel**: Small green dot in the sidebar header (next to theme toggle)
- **User Pages**: Small green dot in the navbar (next to action buttons)

### Behavior:

- **Green dot** = Connected (shows briefly for 2s then disappears)
- **Red pulsing dot** = Disconnected/Reconnecting (stays visible)
- **Tooltip on hover**: Shows connection status

The indicator is intentionally **unnoticeable** when connected - it only becomes prominent if there's a connection issue, so users aren't distracted during normal usage.

### Components:

- `src/components/websocket/ConnectionStatus.tsx` - Status indicator components
  - `WebSocketConnectionStatus` - Full notification with text (bottom-right corner)
  - `WebSocketStatusDot` - Minimal dot indicator (used in sidebars/navbars)

## Notes

1. **Connection is automatic** - No manual initialization needed
2. **Reuses single connection** - More efficient than multiple connections
3. **Proper cleanup** - Unsubscribes and disconnects when user logs out
4. **Type-safe** - Full TypeScript support with proper types
5. **React-friendly** - Uses context and hooks for easy integration
6. **Subtle UI feedback** - Users know when real-time features are active without distraction

## Future Enhancements

Potential improvements:

- Add connection retry with exponential backoff
- Implement notification queue for offline messages
- Support for multiple WebSocket endpoints
- Heartbeat/ping-pong for connection health monitoring
- Toast notification for critical connection failures
