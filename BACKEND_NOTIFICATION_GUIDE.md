# Backend Notification Integration Guide

## 🎯 Quick Reference for Backend Developers

This guide explains how to send notifications from the backend to the admin notification page.

---

## 📡 WebSocket Configuration

### Connection Details:

- **WebSocket URL:** `https://api.docuhub.me/ws-chat`
- **Protocol:** STOMP over SockJS
- **Authentication:** JWT Bearer token in connection headers

---

## 🎯 Publishing Topics

### Option 1: Send to Specific Admin (Recommended)

```
Topic: /topic/user.{adminUserId}
```

**Use when:** You know the specific admin who should receive the notification

**Example:**

```java
// Java/Spring Boot
messagingTemplate.convertAndSend(
    "/topic/user." + adminUserId,
    notificationMessage
);
```

### Option 2: Broadcast to All Admins

```
Topic: /topic/admin-notifications
```

**Use when:** All admins should see the notification (e.g., new student registration)

**Example:**

```java
// Java/Spring Boot
messagingTemplate.convertAndSend(
    "/topic/admin-notifications",
    notificationMessage
);
```

---

## 📦 Message Format

The frontend expects this JSON structure:

```json
{
  "id": "unique-notification-id", // Optional: Auto-generated if not provided
  "senderId": "student-user-uuid", // Required: The student/sender's UUID
  "receiverId": "admin-user-uuid", // Required: The admin's UUID
  "message": "Student verification request", // Required: Message text
  "createdAt": "2025-10-27T10:30:00.000Z", // Required: ISO 8601 timestamp
  "isRead": false // Optional: Defaults to false
}
```

### Field Descriptions:

| Field        | Type    | Required     | Description                                      |
| ------------ | ------- | ------------ | ------------------------------------------------ |
| `id`         | String  | Optional     | Unique identifier. Frontend generates if missing |
| `senderId`   | String  | **Required** | UUID of the student/sender                       |
| `receiverId` | String  | **Required** | UUID of the admin receiving the notification     |
| `message`    | String  | **Required** | Notification message text                        |
| `createdAt`  | String  | **Required** | ISO 8601 timestamp                               |
| `isRead`     | Boolean | Optional     | Read status (defaults to false)                  |

---

## 💡 Common Use Cases

### 1. Student Verification Request

When a student submits a verification request:

```java
@Service
public class NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void notifyAdminOfStudentVerification(String studentId) {
        NotificationMessage message = new NotificationMessage(
            UUID.randomUUID().toString(),
            studentId,                    // senderId
            "admin-uuid-here",           // receiverId (or get from DB)
            "New student verification request",
            Instant.now().toString(),
            false
        );

        // Send to specific admin
        messagingTemplate.convertAndSend(
            "/topic/user." + "admin-uuid-here",
            message
        );

        // OR broadcast to all admins
        messagingTemplate.convertAndSend(
            "/topic/admin-notifications",
            message
        );
    }
}
```

### 2. Paper Submission Notification

```java
public void notifyAdminOfPaperSubmission(String studentId, String paperTitle) {
    NotificationMessage message = new NotificationMessage(
        UUID.randomUUID().toString(),
        studentId,
        adminId,
        "New paper submitted: " + paperTitle,
        Instant.now().toString(),
        false
    );

    messagingTemplate.convertAndSend(
        "/topic/admin-notifications",
        message
    );
}
```

### 3. Document Upload Notification

```java
public void notifyAdminOfDocumentUpload(String studentId, String docType) {
    NotificationMessage message = new NotificationMessage(
        UUID.randomUUID().toString(),
        studentId,
        adminId,
        "Student uploaded " + docType,
        Instant.now().toString(),
        false
    );

    messagingTemplate.convertAndSend(
        "/topic/user." + adminId,
        message
    );
}
```

---

## 🔧 Spring Boot Configuration Example

### 1. WebSocket Configuration

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-chat")
                .setAllowedOrigins("*")  // Configure CORS appropriately
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
    }
}
```

### 2. Notification Message DTO

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationMessage {
    private String id;
    private String senderId;
    private String receiverId;
    private String message;
    private String createdAt;
    private Boolean isRead;
}
```

### 3. Service Example

```java
@Service
public class StudentNotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserRepository userRepository;

    public void notifyAdmins(String studentId, String notificationMessage) {
        // Get all admin users
        List<User> admins = userRepository.findByRole("ADMIN");

        for (User admin : admins) {
            NotificationMessage message = new NotificationMessage(
                UUID.randomUUID().toString(),
                studentId,
                admin.getUuid(),
                notificationMessage,
                Instant.now().toString(),
                false
            );

            // Send to each admin's personal topic
            messagingTemplate.convertAndSend(
                "/topic/user." + admin.getUuid(),
                message
            );
        }

        // Also broadcast to all admins
        NotificationMessage broadcastMessage = new NotificationMessage(
            UUID.randomUUID().toString(),
            studentId,
            "ALL_ADMINS",
            notificationMessage,
            Instant.now().toString(),
            false
        );

        messagingTemplate.convertAndSend(
            "/topic/admin-notifications",
            broadcastMessage
        );
    }
}
```

---

## 🧪 Testing

### Test Notification Endpoint

Create a test endpoint to verify the integration:

```java
@RestController
@RequestMapping("/api/test")
public class TestNotificationController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/notification")
    public ResponseEntity<String> sendTestNotification(
            @RequestParam String adminId,
            @RequestParam String message) {

        NotificationMessage notification = new NotificationMessage(
            UUID.randomUUID().toString(),
            "test-sender",
            adminId,
            message,
            Instant.now().toString(),
            false
        );

        messagingTemplate.convertAndSend(
            "/topic/user." + adminId,
            notification
        );

        return ResponseEntity.ok("Notification sent to admin: " + adminId);
    }
}
```

**Test with cURL:**

```bash
curl -X POST "http://localhost:8080/api/test/notification?adminId=abc-123&message=Test%20notification"
```

---

## 🔍 Debugging

### Check if Message is Sent

Add logging:

```java
@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    public void sendNotification(String topic, NotificationMessage message) {
        logger.info("📤 Sending notification to topic: {}", topic);
        logger.info("📦 Message: {}", message);

        messagingTemplate.convertAndSend(topic, message);

        logger.info("✅ Notification sent successfully");
    }
}
```

### Common Issues

1. **Message not received:**

   - Verify topic name matches exactly (case-sensitive)
   - Check admin UUID is correct
   - Ensure WebSocket connection is active
   - Check CORS configuration

2. **Connection refused:**

   - Verify WebSocket endpoint is registered
   - Check Spring Boot WebSocket configuration
   - Ensure SockJS is enabled

3. **Authentication errors:**
   - Verify JWT token is valid
   - Check token expiration
   - Ensure proper security configuration

---

## 📊 Message Flow Diagram

```
Backend (Spring Boot)                Frontend (Next.js)
─────────────────────                ─────────────────
        │                                    │
        │  1. Student submits request        │
        │                                    │
        │  2. Create notification            │
        ├──────────────────────────────────► │
        │  Topic: /topic/user.{adminId}      │
        │  OR /topic/admin-notifications     │
        │                                    │
        │                            3. Subscribe to topic
        │                            4. Receive message
        │                            5. Display notification
        │                                    │
        │  6. Mark as read (optional)       │
        │ ◄──────────────────────────────────┤
        │  Destination: /app/update-read     │
```

---

## ✅ Integration Checklist

Before deploying:

- [ ] WebSocket configuration is set up
- [ ] Topic names match frontend expectations
- [ ] Message format includes all required fields
- [ ] Timestamps use ISO 8601 format
- [ ] Admin UUIDs are correctly retrieved
- [ ] CORS is configured to allow frontend origin
- [ ] Logging is in place for debugging
- [ ] Test endpoint is working
- [ ] Error handling is implemented

---

## 🆘 Support

If you encounter issues:

1. Check Spring Boot console for errors
2. Enable WebSocket debug logging
3. Test with the frontend debug panel
4. Verify message format matches exactly
5. Check network tab in browser DevTools

---

## 📝 Additional Notes

- Messages are **not persisted** by the WebSocket - they only reach currently connected clients
- For offline users, implement a fallback notification system (email, push, etc.)
- Consider implementing a notification history API endpoint
- The frontend automatically fetches pending students on page load as a fallback
