# Reject Student Verification Feature

## 🎯 Overview

This feature allows admins to reject student verification requests with a custom reason that will be sent to the student.

---

## ✅ What Was Added

### 1. **Backend API Integration** (`src/lib/api/paperAdminSlice.ts`)

Added the `useRejectToStudentMutation` hook for rejecting student verifications.

**Endpoint:**

```
POST /api/v1/admin/student/reject-student-detail
```

**Request Body:**

```json
{
  "userUuid": "33222d00-eb79-4549-b475-414788594579",
  "reason": "Your submitted profile information is incomplete. Please update your personal details and resubmit."
}
```

**Headers:**

```
Authorization: Bearer {token}
```

---

### 2. **Notification Page Updates** (`src/app/(admin)/notification/page.tsx`)

#### Added Components:

- ✅ Reject button next to "Verify Student" button
- ✅ Modal dialog for entering rejection reason
- ✅ Form validation for rejection reason
- ✅ Loading state during rejection
- ✅ Success/Error toast notifications
- ✅ Auto-removal of rejected notification from list

#### New Icons:

- `XCircle` - For reject button
- `AlertCircle` - For modal header

---

## 🎨 User Interface

### Notification Card Actions

Each student verification notification now has three action buttons:

1. **Mark as Read** (Blue) - Marks the notification as read
2. **Verify Student** (Green) - Approves the student verification
3. **Reject** (Red) - Opens the rejection modal ⭐ NEW

### Rejection Modal

**Features:**

- ✅ Professional modal design with red accent colors
- ✅ Student name display in header
- ✅ Large textarea for detailed rejection reason
- ✅ Character validation (reason required)
- ✅ Loading spinner during submission
- ✅ Disabled state while processing
- ✅ Cancel and Submit buttons
- ✅ Close button (X) in header

**Modal Structure:**

```
┌─────────────────────────────────────┐
│ 🔴 Reject Student Verification   ✕  │
│     [Student Name]                   │
├─────────────────────────────────────┤
│                                      │
│ Reason for Rejection *               │
│ ┌──────────────────────────────────┐│
│ │ [Large text area for reason]     ││
│ │                                  ││
│ │                                  ││
│ └──────────────────────────────────┘│
│ This reason will be sent to the      │
│ student.                             │
├─────────────────────────────────────┤
│              [Cancel] [Reject Student]│
└─────────────────────────────────────┘
```

---

## 🔧 How to Use

### As an Admin:

1. **Navigate to Notification Page** (`/notification`)
2. **Find a student verification notification**
3. **Click the "Reject" button** (red button with X icon)
4. **Enter rejection reason** in the modal
   - Reason is required (button disabled if empty)
   - Provide detailed, helpful feedback for the student
5. **Click "Reject Student"** to submit
   - Loading spinner shows during processing
   - Modal closes automatically on success
   - Notification removed from list
   - Success toast appears

### Example Rejection Reasons:

```
✅ Good Examples:
- "Your student ID card image is unclear. Please upload a higher quality photo."
- "Your profile information is incomplete. Please add your year of study and major."
- "The university name doesn't match our records. Please verify and resubmit."

❌ Bad Examples:
- "Rejected"
- "No"
- "Invalid"
```

---

## 📋 Technical Details

### State Management

```typescript
const [rejectModalOpen, setRejectModalOpen] = useState(false);
const [selectedStudent, setSelectedStudent] = useState<{
  userUuid: string;
  name?: string;
} | null>(null);
const [rejectReason, setRejectReason] = useState("");
```

### API Call

```typescript
const [rejectStudent, { isLoading: isRejecting }] =
  useRejectToStudentMutation();

await rejectStudent({
  body: {
    userUuid: selectedStudent.userUuid,
    reason: rejectReason.trim(),
  },
  token: session?.accessToken || "",
}).unwrap();
```

### Handler Functions

1. **`handleOpenRejectModal`** - Opens modal with student info
2. **`handleCloseRejectModal`** - Closes modal and resets state
3. **`handleRejectStudent`** - Submits rejection to backend

---

## 🎯 Features

### ✅ Validation

- Reason field is required
- Whitespace-only reasons are rejected
- Warning toast shown if no reason provided

### ✅ User Feedback

- Success toast: "Student verification rejected!"
- Error toast: "Error rejecting student!"
- Warning toast: "Please provide a reason for rejection"

### ✅ Auto-cleanup

- Notification automatically removed from list after rejection
- Pending students list refetched
- Modal state reset

### ✅ Loading States

- Button shows spinner and "Rejecting..." text
- All interactive elements disabled during submission
- Prevents double-submission

### ✅ Error Handling

- Try-catch block for API errors
- Error logged to console for debugging
- User-friendly error toast displayed

---

## 🔍 Integration with Existing Features

### Works With:

- ✅ Real-time notification system
- ✅ WebSocket updates
- ✅ Notification filtering (all/unread)
- ✅ Search functionality
- ✅ Pagination
- ✅ Mark as read
- ✅ Verify student
- ✅ Delete notification

### Side Effects:

1. **Removes notification** from current view
2. **Refetches pending students** list
3. **Updates notification count**
4. **Maintains filter/search state**

---

## 🎨 Styling

### Color Scheme:

- **Reject Button:** Red text (`text-red-600`) with hover effect
- **Modal Header:** Red accent with alert icon
- **Submit Button:** Red background (`bg-red-600`)
- **Focus Ring:** Red (`focus:ring-red-500`)

### Responsive Design:

- ✅ Mobile-friendly modal
- ✅ Scrollable content for long reasons
- ✅ Max width constraint (`max-w-md`)
- ✅ Full-screen overlay on mobile

### Accessibility:

- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Disabled states
- ✅ Label associations
- ✅ Screen reader friendly

---

## 🧪 Testing Checklist

Before using in production:

- [ ] Open notification page
- [ ] Click "Reject" button on a student verification
- [ ] Modal opens with correct student info
- [ ] Try to submit without reason (should show warning)
- [ ] Enter a reason and submit
- [ ] Verify loading state appears
- [ ] Verify success toast shows
- [ ] Verify notification is removed from list
- [ ] Check that pending students list updates
- [ ] Test "Cancel" button closes modal
- [ ] Test "X" button closes modal
- [ ] Test ESC key closes modal (if implemented)

---

## 📊 API Response

### Success Response:

```
Status: 200 OK
Content-Type: text/plain

"Student rejection processed successfully"
```

### Error Response:

```
Status: 4xx/5xx
Error message displayed in toast
```

---

## 🔐 Security & Permissions

### Required:

- ✅ Valid JWT token
- ✅ Admin role
- ✅ Active session

### Protected:

- ✅ Student UUID validation
- ✅ Token expiration handling
- ✅ CSRF protection (if enabled)

---

## 📝 Example Usage Flow

```
1. Student submits verification request
   ↓
2. Admin receives notification
   ↓
3. Admin reviews student card and info
   ↓
4. Admin finds issue (e.g., blurry photo)
   ↓
5. Admin clicks "Reject" button
   ↓
6. Modal opens
   ↓
7. Admin enters detailed reason:
   "Your student ID card photo is too blurry
    to verify. Please upload a clearer image."
   ↓
8. Admin clicks "Reject Student"
   ↓
9. System processes rejection
   ↓
10. Student receives rejection with reason
    ↓
11. Notification removed from admin's list
    ↓
12. Student can resubmit with corrections
```

---

## 🎯 Best Practices

### For Admins:

1. **Be Specific:** Clearly state what's wrong
2. **Be Helpful:** Explain how to fix the issue
3. **Be Professional:** Use respectful language
4. **Be Clear:** Avoid technical jargon

### For Developers:

1. **Validate Input:** Always trim and check reason
2. **Handle Errors:** Provide clear error messages
3. **Update State:** Remove notification after rejection
4. **Log Errors:** Console.error for debugging
5. **Test Edge Cases:** Empty reasons, network errors, etc.

---

## 🆕 What's Next?

Potential Enhancements:

1. **Rejection Templates:** Pre-written common rejection reasons
2. **Rejection History:** Track all rejections for auditing
3. **Email Notification:** Send rejection reason via email
4. **Appeal System:** Allow students to appeal rejections
5. **Bulk Reject:** Reject multiple students at once
6. **Auto-suggestions:** AI-powered reason suggestions

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Verify token is valid
3. Check network tab for API response
4. Ensure student UUID is correct
5. Verify backend endpoint is working

---

## ✨ Summary

The reject student feature provides a complete workflow for admins to:

- ✅ Reject student verification requests
- ✅ Provide detailed feedback to students
- ✅ Maintain a clean notification list
- ✅ Track rejection reasons

This improves the student verification process by giving students clear feedback on why their verification was rejected and what they need to fix.
