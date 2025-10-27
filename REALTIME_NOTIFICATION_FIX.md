# Real-time Notification Fix Guide

## 🔧 What Was Fixed

The issue with not receiving real-time notifications from the sender has been addressed with the following improvements:

### 1. **Enhanced WebSocket Subscription Logic**

- Added better error handling and validation in the `subscribe` function
- Added checks for client initialization, connection status, and active state
- Added detailed logging with emojis for easy debugging

**File:** `src/components/contexts/websocket-context.tsx`

```typescript
// Now checks:
- ✅ Client initialization
- ✅ Connection status
- ✅ Client active state
- ✅ Try-catch error handling
```

### 2. **Improved Notification Page Subscriptions**

- Separated notification handlers for better debugging
- Added comprehensive logging for each step
- Added null checks and proper cleanup

**File:** `src/app/(admin)/notification/page.tsx`

```typescript
// Subscribed Topics:
- /topic/user.{currentUserId}     // User-specific notifications
- /topic/admin-notifications       // Admin-wide notifications
```

### 3. **Enhanced Publish Function**

- Added validation before publishing
- Added detailed logging for sent messages
- Added error handling

### 4. **Debug Panel**

- Added visual connection status indicator
- Added debug panel with subscription information
- Added test button to verify WebSocket functionality

---

## 🐛 How to Debug

### Step 1: Open the Notification Page

Navigate to `/notification` and look at the top right corner.

### Step 2: Check Connection Status

You should see a status indicator:

- 🟢 **Green (Connected)** - WebSocket is connected
- 🔴 **Red (Disconnected)** - WebSocket is not connected

### Step 3: Open Debug Panel

Click the ⚙️ Settings icon to toggle the debug panel. Check:

```
✅ WebSocket Status: Connected
✅ User ID: [your-user-id]
✅ User Subscription: Active
✅ Admin Subscription: Active
```

### Step 4: Check Browser Console

Open your browser's Developer Tools (F12) and look for these logs:

#### On Page Load:

```
✅ WebSocket: Connected successfully
🔔 Notification: Starting subscriptions...
🔌 Attempting to subscribe to: /topic/user.{userId}
✅ Successfully subscribed to: /topic/user.{userId}
🔌 Attempting to subscribe to: /topic/admin-notifications
✅ Successfully subscribed to: /topic/admin-notifications
```

#### When Notification is Received:

```
📩 Received user notification: {senderId: "...", message: "..."}
✅ Converted notification: {id: "...", title: "..."}
```

#### When Notification is Sent (from sender):

```
📤 WebSocket: Publishing to /topic/admin-notifications
📦 WebSocket: Message body: {...}
✅ WebSocket: Message published successfully
```

---

## 🔍 Common Issues & Solutions

### Issue 1: WebSocket Shows "Disconnected"

**Possible Causes:**

- Authentication token is missing or expired
- Backend WebSocket server is down
- Network connectivity issues

**Solution:**

```bash
1. Log out and log back in to refresh the token
2. Check if https://api.docuhub.me/ws-chat is accessible
3. Check browser console for connection errors
```

### Issue 2: Subscriptions Show "Not subscribed"

**Possible Causes:**

- WebSocket connected but subscription failed
- Race condition (subscribed before connection ready)

**Solution:**

1. Refresh the page
2. Check console logs for subscription errors
3. The page should auto-retry when connection is restored

### Issue 3: No Messages Received

**Backend Checklist:**
The sender (backend) must:

1. ✅ Be connected to the same WebSocket server: `wss://api.docuhub.me/ws-chat`
2. ✅ Publish to the correct topic:
   - `/topic/user.{adminUserId}` for specific admin
   - `/topic/admin-notifications` for all admins
3. ✅ Send the correct message format:
   ```json
   {
     "id": "unique-id",
     "senderId": "student-user-id",
     "receiverId": "admin-user-id",
     "message": "Notification message",
     "createdAt": "2025-10-27T10:30:00.000Z",
     "isRead": false
   }
   ```

**Frontend Checklist:**

1. ✅ Debug panel shows "Connected"
2. ✅ Both subscriptions are "Active"
3. ✅ User ID is not empty
4. ✅ Console shows subscription success messages

### Issue 4: Messages Received but Not Displayed

**Check:**

1. Console shows "📩 Received notification"
2. Message parsing is successful
3. No duplicate detection removing the message
4. Notification state is updating

**Solution:**
Check console for any errors in the `handleUserNotification` or `handleAdminNotification` functions.

---

## 🧪 Testing the Connection

### Test from Frontend:

1. Open debug panel
2. Click "Send Test Message" button
3. Check console for:
   ```
   🧪 Sending test message: {...}
   📤 WebSocket: Publishing to /app/test-notification
   ✅ WebSocket: Message published successfully
   ```

### Test from Backend:

Ask your backend developer to send a test notification:

```java
// Example Spring Boot / Java
messagingTemplate.convertAndSend(
    "/topic/user." + adminUserId,
    new NotificationMessage(
        "test-id",
        "sender-id",
        adminUserId,
        "Test notification",
        Instant.now().toString(),
        false
    )
);
```

```javascript
// Example Node.js with STOMP
stompClient.send(
  `/topic/user.${adminUserId}`,
  {},
  JSON.stringify({
    id: "test-id",
    senderId: "sender-id",
    receiverId: adminUserId,
    message: "Test notification",
    createdAt: new Date().toISOString(),
    isRead: false,
  })
);
```

---

## 📋 Expected Console Output (Working State)

When everything is working correctly, you should see:

```
# On App Load:
WebSocket: Initializing connection...
✅ WebSocket: Connected successfully

# On Notification Page Load:
🔔 Notification: Starting subscriptions...
🔌 Attempting to subscribe to: /topic/user.abc-123-def
✅ WebSocket: Subscribing to /topic/user.abc-123-def
✅ Successfully subscribed to: /topic/user.abc-123-def
🔌 Attempting to subscribe to: /topic/admin-notifications
✅ WebSocket: Subscribing to /topic/admin-notifications
✅ Successfully subscribed to: /topic/admin-notifications

# When Notification is Received:
📩 Received user notification: {senderId: "student-123", message: "..."}
✅ Converted notification: {id: "notif-123", title: "Student Verification Request"}

# When Marking as Read:
📤 WebSocket: Publishing to /app/update-read
📦 WebSocket: Message body: {"senderUuid":"student-123","receiverUuid":"admin-123"}
✅ WebSocket: Message published successfully
```

---

## 🔐 Security Notes

1. **Authentication Required:** WebSocket connection requires a valid JWT token
2. **User-Specific Topics:** Each admin only receives notifications for their user ID
3. **Admin-Wide Topics:** All admins subscribed to `/topic/admin-notifications` will receive the same notifications

---

## 📞 Need More Help?

If notifications still don't work after following this guide:

1. **Check Backend Logs:** Ensure the backend is publishing messages
2. **Network Tab:** Check WebSocket frames in DevTools Network tab
3. **Backend Configuration:** Verify STOMP/WebSocket configuration matches frontend
4. **CORS Settings:** Ensure WebSocket connections are allowed from your domain

---

## 🎯 Summary of Topics

| Topic                        | Purpose                     | Who Subscribes                    |
| ---------------------------- | --------------------------- | --------------------------------- |
| `/topic/user.{userId}`       | User-specific notifications | Individual admin by their user ID |
| `/topic/admin-notifications` | Broadcast to all admins     | All logged-in admins              |
| `/app/update-read`           | Mark notification as read   | Backend endpoint                  |

---

## ✅ Verification Checklist

- [ ] WebSocket shows "Connected" in debug panel
- [ ] User ID is displayed and not empty
- [ ] Both subscriptions show "Active"
- [ ] Console shows subscription success messages
- [ ] Pending students are loaded (indicates API works)
- [ ] Test button sends message successfully
- [ ] Backend is publishing to correct topics
- [ ] Message format matches expected structure
