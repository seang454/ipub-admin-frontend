# 🔔 Real-Time Notification Debugging Guide

## Overview

This guide helps diagnose why WebSocket notifications aren't being received in real-time.

---

## ✅ What Was Fixed

### 1. **WebSocket Context Improvements**

- ✅ Added duplicate subscription prevention
- ✅ Enhanced logging for received messages
- ✅ Better connection state tracking
- ✅ Active subscriptions tracking

### 2. **Notification Page Improvements**

- ✅ Added 100ms delay before subscribing to ensure WebSocket is stable
- ✅ Toast notifications when messages are received
- ✅ Better error handling and logging
- ✅ Clear subscription state on disconnect
- ✅ Detailed logging for debugging

---

## 🔍 How to Debug

### **Step 1: Check WebSocket Connection**

Open the notification page at `/notification` and:

1. **Check Connection Status** in the UI:
   - Look for the connection indicator (green = connected, red = disconnected)
2. **Open Debug Panel**:

   - Click the ⚙️ (Settings) icon in the notification header
   - Check the debug information:
     - WebSocket Status: Should be "✅ Connected"
     - User ID: Should show your user UUID
     - User Subscription: Should be "✅ Active"
     - Admin Subscription: Should be "✅ Active"

3. **Check Browser Console** (F12):
   Look for these messages:
   ```
   ✅ WebSocket: Connected successfully
   🔌 WebSocket: Connection established for user: {your-user-id}
   ✅ WebSocket: Successfully subscribed to /topic/user.{your-user-id}
   ✅ WebSocket: Successfully subscribed to /topic/admin-notifications
   ```

### **Step 2: Test the Connection**

In the Debug Panel, click **"Send Test Message"** button:

- This will attempt to send a test notification
- Check console for response
- If successful, you'll see a toast notification

### **Step 3: Check Backend Configuration**

The **sender (backend)** must:

#### **A. Use Correct WebSocket Endpoint**

```
wss://api.docuhub.me/ws-chat
```

#### **B. Publish to Correct Topics**

For **user-specific notifications**:

```java
// Backend should publish to:
String userTopic = "/topic/user." + receiverUserId;
messagingTemplate.convertAndSend(userTopic, notification);
```

For **admin notifications** (all admins):

```java
// Backend should publish to:
String adminTopic = "/topic/admin-notifications";
messagingTemplate.convertAndSend(adminTopic, notification);
```

#### **C. Use Correct Message Format**

The message payload should be JSON with this structure:

```json
{
  "id": "notification-uuid",
  "senderId": "sender-user-uuid",
  "receiverId": "receiver-user-uuid",
  "message": "Notification message text",
  "createdAt": "2025-01-28T10:30:00Z",
  "isRead": false
}
```

**Important Fields:**

- `senderId`: UUID of the user sending the notification
- `receiverId`: UUID of the user receiving the notification
- `createdAt`: ISO 8601 timestamp
- `message`: The notification text

---

## 📊 Expected Console Output

### **When Everything Works:**

```
🔔 Notification: WebSocket connected! Starting subscriptions...
👤 Current User ID: abc123-def456-...
🔌 Attempting to subscribe to: /topic/user.abc123-def456-...
✅ WebSocket: Successfully subscribed to /topic/user.abc123-def456-...
🔌 Attempting to subscribe to: /topic/admin-notifications
✅ WebSocket: Successfully subscribed to /topic/admin-notifications
📊 Subscription Summary:
   User Topic (/topic/user.abc123-def456-...): ✅ Active
   Admin Topic (/topic/admin-notifications): ✅ Active

// When a message is received:
📨 RAW message received on user topic: {body: "...", headers: {...}}
📩 Parsed user notification: {senderId: "...", message: "...", ...}
✅ Converted notification: {id: "...", title: "...", ...}
```

---

## 🐛 Common Issues & Solutions

### **Issue 1: "WebSocket not connected"**

**Symptoms:**

```
⏳ Notification: WebSocket not connected. Waiting...
```

**Solutions:**

- Check if authentication is working (user is logged in)
- Verify `NEXT_PUBLIC_API_BASE_URL` is correct in `.env`
- Check if backend WebSocket server is running
- Verify CORS configuration on backend

---

### **Issue 2: "Failed to subscribe to topic"**

**Symptoms:**

```
❌ Failed to subscribe to: /topic/user.{userId}
```

**Solutions:**

- Check if WebSocket is fully connected before subscribing
- Verify topic format matches backend configuration
- Check authentication token is valid
- Review backend STOMP configuration

---

### **Issue 3: "Messages not received"**

**Symptoms:**

- WebSocket connected ✅
- Subscriptions active ✅
- But no messages appear when sent

**Solutions:**

#### **A. Verify Backend is Publishing to Correct Topic**

Check backend code:

```java
// CORRECT ✅
String topic = "/topic/user." + receiverUuid;
messagingTemplate.convertAndSend(topic, notification);

// WRONG ❌
String topic = "/user/" + receiverUuid;
String topic = "/topic/notifications/" + receiverUuid;
```

#### **B. Check Message Format**

Ensure backend sends proper JSON:

```java
// CORRECT ✅
NotificationMessage notification = NotificationMessage.builder()
    .senderId(senderUuid)
    .receiverId(receiverUuid)
    .message("Your notification message")
    .createdAt(LocalDateTime.now().toString())
    .build();

// WRONG ❌ - Missing required fields
String simpleMessage = "New notification";
```

#### **C. Verify Backend WebSocket Config**

Backend should have:

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");  // Must include "/topic"
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-chat")  // Must match frontend
                .setAllowedOrigins("*")
                .withSockJS();
    }
}
```

---

### **Issue 4: "Messages received but not displayed"**

**Symptoms:**

- Console shows: `📨 RAW message received`
- But notification doesn't appear in UI

**Solutions:**

- Check for JavaScript errors in console
- Verify message format matches `NotificationMessage` interface
- Check if `senderId` matches a valid user
- Ensure `createdAt` is a valid ISO 8601 timestamp

---

## 🧪 Backend Testing Guide

### **Test 1: Send Test Notification from Backend**

Create a test endpoint:

```java
@RestController
@RequestMapping("/api/test")
public class TestNotificationController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/send-notification/{userId}")
    public ResponseEntity<?> sendTestNotification(@PathVariable String userId) {
        NotificationMessage notification = NotificationMessage.builder()
            .id(UUID.randomUUID().toString())
            .senderId("test-sender")
            .receiverId(userId)
            .message("Test notification from backend")
            .createdAt(LocalDateTime.now().toString())
            .isRead(false)
            .build();

        // Send to user-specific topic
        String userTopic = "/topic/user." + userId;
        messagingTemplate.convertAndSend(userTopic, notification);

        // Also send to admin topic
        String adminTopic = "/topic/admin-notifications";
        messagingTemplate.convertAndSend(adminTopic, notification);

        return ResponseEntity.ok("Notification sent to: " + userTopic);
    }
}
```

**Test it:**

```bash
curl -X POST http://localhost:8080/api/test/send-notification/{your-user-uuid}
```

---

## 📝 Checklist for Sender (Backend Developer)

- [ ] Backend WebSocket server is running
- [ ] WebSocket endpoint is `/ws-chat`
- [ ] STOMP broker enables `/topic` prefix
- [ ] Publishing to correct topic: `/topic/user.{userId}` or `/topic/admin-notifications`
- [ ] Message format includes all required fields
- [ ] `createdAt` is in ISO 8601 format
- [ ] `senderId` is a valid user UUID
- [ ] CORS is configured to allow frontend origin
- [ ] Authentication is properly configured

---

## 📝 Checklist for Receiver (Frontend Developer)

- [x] WebSocket context is initialized
- [x] User is authenticated (has valid token and user ID)
- [x] Subscribed to correct topics
- [x] Message handlers are defined
- [x] Error handling is in place
- [x] Console logging is enabled for debugging

---

## 🔧 Quick Fix Commands

### **Clear Browser Cache & Restart**

```bash
# In browser console:
localStorage.clear()
sessionStorage.clear()
# Then refresh page (Ctrl+Shift+R)
```

### **Check Network Tab**

1. Open DevTools (F12)
2. Go to Network tab
3. Filter: `WS` (WebSocket)
4. Look for `ws-chat` connection
5. Check frames tab to see messages

---

## 📞 Need More Help?

If issues persist:

1. **Enable Debug Mode:**

   - Check `showDebug` state in notification page
   - Review all console logs

2. **Check Backend Logs:**

   - Look for WebSocket connection logs
   - Verify message publishing logs
   - Check for any errors

3. **Test with Postman/SockJS Client:**
   - Use a WebSocket testing tool
   - Connect to `wss://api.docuhub.me/ws-chat`
   - Subscribe to topics manually
   - Send test messages

---

## 🎯 Success Criteria

Real-time notifications work when:

1. ✅ WebSocket shows "Connected" in UI
2. ✅ Both subscriptions are "Active" in debug panel
3. ✅ Console shows subscription success messages
4. ✅ When backend sends a message, you see:
   - `📨 RAW message received` in console
   - Toast notification appears
   - New notification appears in list
5. ✅ No errors in console

---

## 📚 Related Files

- `src/components/contexts/websocket-context.tsx` - WebSocket connection management
- `src/app/(admin)/notification/page.tsx` - Notification page with subscriptions
- Backend: WebSocket configuration, message publishing

---

**Last Updated:** 2025-01-28
**Status:** ✅ Enhanced with better debugging and logging
