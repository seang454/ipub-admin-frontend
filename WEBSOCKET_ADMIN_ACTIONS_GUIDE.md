# WebSocket Admin Actions Guide

## 📋 Overview

This guide documents the **complete WebSocket notification system** for admin actions. When admins perform certain actions (verify student, assign adviser, reject paper, etc.), WebSocket notifications are **automatically sent to all connected clients**, and those clients **automatically update their UI in real-time** without manual refresh.

### ✅ What's Implemented

1. **Publishing Events**: When an admin performs an action, a WebSocket event is published
2. **Listening for Events**: All connected admins listen for these events
3. **Auto-Refresh**: UI automatically updates when events are received (no manual refresh needed)
4. **Smart Filtering**: Admins don't receive notifications for their own actions
5. **Toast Notifications**: Visual feedback when other admins make changes

---

## 🚀 Available WebSocket Events

All events are published to the `/app/admin-action` destination and can be subscribed to via the `/topic/admin-notifications` topic.

### Event Structure

All events follow this common structure:

```typescript
{
  senderId: string; // UUID of the admin who performed the action
  receiverId: string; // "all-admins" for broadcast notifications
  message: string; // Human-readable message describing the action
  createdAt: string; // ISO 8601 timestamp
  action: string; // Action type (see below)
  // Additional fields specific to each action...
}
```

---

## 📡 Event Types

### 1. **STUDENT_VERIFIED**

Triggered when an admin verifies/approves a student.

**Published from:** `src/app/(admin)/notification/page.tsx` - `handleVerifyStudent()`

**Event Data:**

```typescript
{
  senderId: string;
  receiverId: "all-admins";
  message: "A student has been verified and approved";
  createdAt: string;
  action: "STUDENT_VERIFIED";
  userUuid: string; // UUID of the verified student
}
```

**Example Usage:**

```typescript
// Subscribe to notifications
subscribe("/topic/admin-notifications", (message) => {
  const data = JSON.parse(message.body);

  if (data.action === "STUDENT_VERIFIED") {
    console.log(`Student ${data.userUuid} was verified!`);
    // Refetch pending students list
    refetchPendingStudents();
  }
});
```

---

### 2. **STUDENT_REJECTED**

Triggered when an admin rejects a student verification request.

**Published from:** `src/app/(admin)/notification/page.tsx` - `handleRejectStudent()`

**Event Data:**

```typescript
{
  senderId: string;
  receiverId: "all-admins";
  message: string; // Includes rejection reason
  createdAt: string;
  action: "STUDENT_REJECTED";
  userUuid: string; // UUID of the rejected student
  reason: string; // Reason for rejection
}
```

**Example Usage:**

```typescript
if (data.action === "STUDENT_REJECTED") {
  console.log(`Student ${data.userUuid} was rejected: ${data.reason}`);
  // Refetch pending students list
  refetchPendingStudents();
}
```

---

### 3. **ADVISER_ASSIGNED**

Triggered when an adviser is assigned to a paper for the first time.

**Published from:** `src/components/proposals/proposal-table.tsx` - `handleAssignAdvisor()`

**Event Data:**

```typescript
{
  senderId: string;
  receiverId: "all-admins";
  message: string; // e.g., "Adviser John Doe has been assigned to paper: Title"
  createdAt: string;
  action: "ADVISER_ASSIGNED";
  paperUuid: string; // UUID of the paper
  paperTitle: string; // Title of the paper
  adviserUuid: string; // UUID of the assigned adviser
  adviserName: string; // Full name of the adviser
  deadline: string; // Review deadline (YYYY-MM-DD)
}
```

**Example Usage:**

```typescript
if (data.action === "ADVISER_ASSIGNED") {
  console.log(`Adviser ${data.adviserName} assigned to "${data.paperTitle}"`);
  // Refetch papers and assignments
  refetchPapers();
  refetchAssignments();
}
```

---

### 4. **ADVISER_ADDED**

Triggered when an additional adviser is added to a paper that already has adviser(s) assigned.

**Published from:** `src/components/proposals/proposal-table.tsx` - `handleAssignAdvisor()` (when managing multiple advisers)

**Event Data:**

```typescript
{
  senderId: string;
  receiverId: "all-admins";
  message: string; // e.g., "Additional adviser Jane Smith has been assigned to paper: Title"
  createdAt: string;
  action: "ADVISER_ADDED";
  paperUuid: string;
  paperTitle: string;
  adviserUuid: string;
  adviserName: string;
  deadline: string;
}
```

**Example Usage:**

```typescript
if (data.action === "ADVISER_ADDED") {
  console.log(
    `Additional adviser ${data.adviserName} added to "${data.paperTitle}"`
  );
  // Refetch assignments to show the new adviser
  refetchAssignments();
}
```

---

### 5. **ADVISER_REASSIGNED**

Triggered when an adviser is reassigned (replaced) for a paper.

**Published from:** `src/components/proposals/proposal-table.tsx` - `handleAssignAdvisor()` (when reassigning)

**Event Data:**

```typescript
{
  senderId: string;
  receiverId: "all-admins";
  message: string; // e.g., "Adviser has been reassigned for paper: Title"
  createdAt: string;
  action: "ADVISER_REASSIGNED";
  paperUuid: string;
  paperTitle: string;
  adviserUuid: string; // UUID of the new adviser
  adviserName: string; // Name of the new adviser
  deadline: string;
}
```

**Example Usage:**

```typescript
if (data.action === "ADVISER_REASSIGNED") {
  console.log(`Paper "${data.paperTitle}" reassigned to ${data.adviserName}`);
  // Refetch assignments to show the updated adviser
  refetchAssignments();
}
```

---

### 6. **PAPER_REJECTED**

Triggered when an admin rejects a paper.

**Published from:** `src/components/proposals/proposal-table.tsx` - `handleRejectPaper()`

**Event Data:**

```typescript
{
  senderId: string;
  receiverId: "all-admins";
  message: string; // Includes paper title and rejection reason
  createdAt: string;
  action: "PAPER_REJECTED";
  paperUuid: string;
  paperTitle: string;
  reason: string; // Reason for rejection
}
```

**Example Usage:**

```typescript
if (data.action === "PAPER_REJECTED") {
  console.log(`Paper "${data.paperTitle}" was rejected: ${data.reason}`);
  // Refetch papers and assignments
  refetchPapers();
  refetchAssignments();
}
```

---

## ✨ Real-Time Features

### Notification Page

**What happens in real-time:**

- When Admin A verifies a student → Admin B's notification list automatically updates
- When Admin A rejects a student → Admin B sees the student removed from their list
- Toast notifications show what other admins are doing
- No manual refresh needed!

### Proposal Table

**What happens in real-time:**

- When Admin A assigns an adviser → Admin B sees the paper status update immediately
- When Admin A rejects a paper → Admin B sees the paper removed from their list
- All adviser assignments sync across all admin sessions
- No manual refresh needed!

---

## 🎯 Implementation Examples

### Example 1: How It Works in Notification Page (Already Implemented!)

The notification page automatically:

1. **Publishes** when you verify/reject a student
2. **Listens** for when other admins verify/reject students
3. **Auto-updates** the pending students list
4. **Shows toast** to inform you of changes

```typescript
// This is already working in src/app/(admin)/notification/page.tsx

// When you verify a student:
handleVerifyStudent() {
  // 1. Call API
  await approvedStudent(...);

  // 2. Publish WebSocket event
  if (isConnected) {
    publish("/app/admin-action", JSON.stringify({
      action: "STUDENT_VERIFIED",
      userUuid: studentUuid,
      // ... other data
    }));
  }
}

// When another admin verifies a student:
handleAdminActionNotification(msg) {
  const payload = JSON.parse(msg.body);

  if (payload.action === "STUDENT_VERIFIED") {
    // 3. Show toast notification
    toast.info(payload.message);

    // 4. Remove from your list automatically
    setNotifications(prev =>
      prev.filter(n => n.data?.userUuid !== payload.userUuid)
    );

    // 5. Refetch latest data
    refetch();
  }
}
```

### Example 2: How It Works in Proposal Table (Already Implemented!)

The proposal table automatically:

1. **Publishes** when you assign/reassign/reject
2. **Listens** for when other admins make changes
3. **Auto-updates** paper and assignment data
4. **Shows toast** to inform you of changes

```typescript
// This is already working in src/components/proposals/proposal-table.tsx

// When you assign an adviser:
handleAssignAdvisor() {
  // 1. Call API
  await assignAdviser(...);

  // 2. Publish WebSocket event
  if (isConnected) {
    publish("/app/admin-action", JSON.stringify({
      action: "ADVISER_ASSIGNED",
      paperUuid: paper.uuid,
      adviserName: adviser.name,
      // ... other data
    }));
  }
}

// When another admin assigns an adviser:
handleAdminActionNotification(msg) {
  const payload = JSON.parse(msg.body);

  if (payload.action === "ADVISER_ASSIGNED") {
    // 3. Show toast notification
    toast.info(payload.message);

    // 4. Refetch assignments automatically
    await refetchAssignments();
  }
}
```

---

### Example 3: Basic Subscription in a New Component

```typescript
"use client";
import { useEffect } from "react";
import { useWebSocket } from "@/components/contexts/websocket-context";

export default function MyAdminDashboard() {
  const { subscribe, unsubscribe, isConnected } = useWebSocket();
  const subscriptionRef = useRef<StompSubscription | null>(null);

  useEffect(() => {
    if (!isConnected) return;

    // Subscribe to admin notifications
    const handleNotification = (message: IMessage) => {
      const data = JSON.parse(message.body);

      // Handle different action types
      switch (data.action) {
        case "STUDENT_VERIFIED":
          // Refresh student data
          refetchStudents();
          break;

        case "ADVISER_ASSIGNED":
        case "ADVISER_ADDED":
        case "ADVISER_REASSIGNED":
          // Refresh paper assignments
          refetchAssignments();
          break;

        case "PAPER_REJECTED":
          // Refresh papers list
          refetchPapers();
          break;
      }
    };

    subscriptionRef.current = subscribe(
      "/topic/admin-notifications",
      handleNotification
    );

    return () => {
      if (subscriptionRef.current) {
        unsubscribe(subscriptionRef.current);
      }
    };
  }, [isConnected, subscribe, unsubscribe]);

  return <div>Dashboard Content</div>;
}
```

---

### Example 4: Listening for Specific Actions (Custom Component)

```typescript
const handleNotification = (message: IMessage) => {
  const data = JSON.parse(message.body);

  // Only react to paper-related events
  if (
    [
      "ADVISER_ASSIGNED",
      "ADVISER_ADDED",
      "ADVISER_REASSIGNED",
      "PAPER_REJECTED",
    ].includes(data.action)
  ) {
    toast.info(data.message);
    refetchPapers();
    refetchAssignments();
  }
};
```

---

### Example 5: Auto-Refresh with Debouncing (Custom Component)

```typescript
import { useEffect, useRef } from "react";
import { debounce } from "lodash";

export default function ProposalsPage() {
  const { subscribe, unsubscribe, isConnected } = useWebSocket();

  // Debounce refetch to avoid multiple rapid calls
  const debouncedRefetch = useRef(
    debounce(() => {
      refetchPapers();
      refetchAssignments();
    }, 1000)
  ).current;

  useEffect(() => {
    if (!isConnected) return;

    const handleNotification = (message: IMessage) => {
      const data = JSON.parse(message.body);

      // Show notification to user
      toast.info(data.message, {
        position: "top-right",
        autoClose: 3000,
      });

      // Trigger debounced refetch
      debouncedRefetch();
    };

    const sub = subscribe("/topic/admin-notifications", handleNotification);

    return () => {
      if (sub) unsubscribe(sub);
    };
  }, [isConnected]);

  return <div>Content</div>;
}
```

---

## 🔍 Debugging WebSocket Notifications

### Check Console Logs

All WebSocket publish operations log detailed information:

```
📤 Publishing student verification notification: {...}
📤 Publishing adviser assignment notification: {...}
📤 Publishing paper rejection notification: {...}
```

### Verify Connection Status

Check the WebSocket connection status in your component:

```typescript
const { isConnected } = useWebSocket();

console.log("WebSocket connected:", isConnected);
```

### Test with Debug Panel

The notification page includes a debug panel (click the ⚙️ settings icon) that shows:

- WebSocket connection status
- Active subscriptions
- Current user ID
- Test message button

---

## 📊 Event Flow Diagram

```
┌──────────────────┐
│  Admin Action    │
│ (Verify, Assign, │
│  Reject, etc.)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  API Call        │
│ (Success)        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Publish Event   │
│  to WebSocket    │
│ /app/admin-action│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Backend Broker  │
│  Distributes to  │
│  /topic/admin-   │
│  notifications   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  All Subscribed  │
│  Clients Receive │
│  Notification    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Client Refetches│
│  Updated Data    │
└──────────────────┘
```

---

## ✅ Best Practices (Already Implemented)

1. **Always Check Connection Status** ✅

   ```typescript
   if (isConnected) {
     publish("/app/admin-action", JSON.stringify(data));
   }
   ```

2. **Use Meaningful Messages** ✅

   - Include action details in the message
   - Use human-readable format
   - Include relevant context (paper title, student name, etc.)

3. **Include All Relevant Data** ✅

   - Always include UUIDs for entities
   - Include action type
   - Add timestamps
   - Provide context-specific fields

4. **Handle Errors Gracefully** ✅

   - Don't let WebSocket failures break the main flow
   - Log errors for debugging
   - Continue with local state updates

5. **Avoid Notification Loops** ✅

   ```typescript
   // Skip your own notifications
   if (payload.senderId === currentUserId) {
     console.log("⏭️ Skipping own action notification");
     return;
   }
   ```

6. **Show User Feedback** ✅
   ```typescript
   // Toast notification for visual feedback
   toast.info(payload.message, {
     position: "top-right",
     autoClose: 3000,
     theme: "colored",
   });
   ```

---

## 🛠️ Troubleshooting

### Issue: Notifications Not Received

**Solutions:**

1. Check WebSocket connection status
2. Verify subscription to correct topic
3. Check backend STOMP configuration
4. Look for console errors
5. Verify authentication token

### Issue: Multiple Refetches

**Solutions:**

1. Implement debouncing
2. Use a flag to prevent duplicate refetches
3. Unsubscribe on component unmount

### Issue: Old Data Displayed

**Solutions:**

1. Ensure `refetch()` is called after notification
2. Check cache invalidation tags in RTK Query
3. Verify API response is correct

---

## 📝 Summary

| Action           | Event Type           | Published From    | Listened By       | Effect                           |
| ---------------- | -------------------- | ----------------- | ----------------- | -------------------------------- |
| Verify Student   | `STUDENT_VERIFIED`   | Notification Page | Notification Page | Auto-removes from pending list   |
| Reject Student   | `STUDENT_REJECTED`   | Notification Page | Notification Page | Auto-removes from pending list   |
| Assign Adviser   | `ADVISER_ASSIGNED`   | Proposal Table    | Proposal Table    | Auto-updates paper assignments   |
| Add Adviser      | `ADVISER_ADDED`      | Proposal Table    | Proposal Table    | Auto-adds to paper's advisers    |
| Reassign Adviser | `ADVISER_REASSIGNED` | Proposal Table    | Proposal Table    | Auto-updates paper's adviser     |
| Reject Paper     | `PAPER_REJECTED`     | Proposal Table    | Proposal Table    | Auto-removes from proposals list |

---

## 🔗 Related Files

- **WebSocket Context:** `src/components/contexts/websocket-context.tsx`
- **Notification Page:** `src/app/(admin)/notification/page.tsx`
- **Proposal Table:** `src/components/proposals/proposal-table.tsx`
- **Provider Setup:** `src/app/providers.tsx`

---

## 🎓 Additional Resources

- [WebSocket Initialization Guide](./WEBSOCKET_INITIALIZATION.md)
- [Real-time Notification Fix Guide](./REALTIME_NOTIFICATION_FIX.md)
- [Backend Notification Guide](./BACKEND_NOTIFICATION_GUIDE.md)
