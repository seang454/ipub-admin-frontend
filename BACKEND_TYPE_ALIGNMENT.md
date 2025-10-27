# Backend Type Alignment - Adviser Assignment API

## 🔧 Updated Types

The frontend types have been updated to match the exact backend DTOs from your Spring Boot application.

---

## 📦 Type Changes Summary

### ✅ **1. ReassignAdviserRequest**

**Backend DTO:**

```java
record ReassignAdviserRequest(
    @NotBlank String paperUuid,
    @NotBlank String newAdviserUuid,
    @NotBlank String adminUuid,
    @NotNull @FutureOrPresent LocalDate deadline,
    @Size(max = 500) String reason  // optional
)
```

**Frontend Type:**

```typescript
type AssignmentUpdate = {
  paperUuid: string;
  newAdviserUuid: string;
  adminUuid: string;
  deadline: string; // LocalDate from backend, send as "YYYY-MM-DD"
  reason?: string; // Optional, max 500 characters
};
```

**Usage:**

```typescript
const reassignData: AssignmentUpdate = {
  paperUuid: "abc-123",
  newAdviserUuid: "def-456",
  adminUuid: "admin-789",
  deadline: "2025-12-31", // ✅ Format: YYYY-MM-DD
  reason: "Original adviser is on leave", // Optional
};
```

---

### ✅ **2. RejectPaperRequest** ⚠️ IMPORTANT

**Backend DTO:**

```java
record RejectPaperRequest(
    @NotBlank String paperUuid,
    @NotBlank @Size(max = 500) String reason
)
```

**Frontend Type:**

```typescript
type RejectPaperRequest = {
  paperUuid: string;
  reason: string; // Required, max 500 characters
};
```

**⚠️ BREAKING CHANGE:** The backend does NOT have `adminUuid` field!

**Updated Usage:**

```typescript
// ❌ OLD - INCORRECT
await rejectPaper({
  token: session?.accessToken || "",
  rejectRequest: {
    paperUuid: "abc-123",
    adminUuid: "admin-789", // ❌ This field doesn't exist in backend!
    reason: "Plagiarism detected",
  },
});

// ✅ NEW - CORRECT
await rejectPaper({
  token: session?.accessToken || "",
  rejectRequest: {
    paperUuid: "abc-123",
    reason: "Plagiarism detected",
  },
});
```

---

### ✅ **3. AdviserAssignmentResponse**

**Backend DTO:**

```java
record AdviserAssignmentResponse(
    String uuid,
    String paperUuid,
    String adviserUuid,
    String adminUuid,
    LocalDate deadline,
    String status,
    LocalDate assignedDate,
    LocalDate updateDate
)
```

**Frontend Type:**

```typescript
type AdvisorAssignmentResponse = {
  uuid: string;
  paperUuid: string;
  adviserUuid: string;
  adminUuid: string;
  deadline: string; // LocalDate: "YYYY-MM-DD"
  status: string;
  assignedDate: string; // LocalDate: "YYYY-MM-DD"
  updateDate: string; // LocalDate: "YYYY-MM-DD"
};
```

**⚠️ REMOVED FIELDS:** The backend doesn't include:

- ❌ `paperTitle`
- ❌ `adviserName`
- ❌ `comment`

If you need these fields, they must be fetched separately or added to the backend DTO.

---

## 📅 Date Format Guide

**Backend:** Uses `LocalDate` (Java)
**Frontend:** Use `string` in format `"YYYY-MM-DD"`

### Converting from Date Input

```typescript
// From datetime-local input
const dateTimeValue = "2025-12-31T14:30";
const dateOnly = dateTimeValue.split("T")[0]; // "2025-12-31" ✅

// From Date object
const dateObj = new Date();
const formattedDate = dateObj.toISOString().split("T")[0]; // "2025-10-27" ✅

// From date input
const dateInputValue = "2025-12-31"; // Already in correct format ✅
```

### Displaying Dates

```typescript
const assignment: AdvisorAssignmentResponse = {
  // ... other fields
  deadline: "2025-12-31",
  assignedDate: "2025-10-27",
  updateDate: "2025-10-28",
};

// Display formatted
<p>Deadline: {new Date(assignment.deadline).toLocaleDateString()}</p>;
// Output: "12/31/2025" (locale dependent)

// Custom format
const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};
<p>Deadline: {formatDate(assignment.deadline)}</p>;
// Output: "31/12/2025"
```

---

## 🔄 Updated Usage Examples

### 1. Reject Paper (UPDATED)

```typescript
import { useRejectPaperMutation } from "@/lib/api/assignMentor";

function RejectPaperComponent() {
  const { data: session } = useSession();
  const [rejectPaper, { isLoading }] = useRejectPaperMutation();
  const [reason, setReason] = useState("");

  const handleReject = async (paperUuid: string) => {
    if (!reason.trim()) {
      toast.warning("Please provide a reason for rejection");
      return;
    }

    if (reason.length > 500) {
      toast.warning("Reason must not exceed 500 characters");
      return;
    }

    try {
      await rejectPaper({
        token: session?.accessToken || "",
        rejectRequest: {
          paperUuid,
          reason: reason.trim(), // ✅ No adminUuid needed
        },
      }).unwrap();

      toast.success("Paper rejected successfully!");
      setReason("");
    } catch (error) {
      toast.error("Failed to reject paper");
    }
  };

  return (
    <div>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for rejection (max 500 characters)..."
        maxLength={500}
      />
      <p className="text-sm text-gray-500">{reason.length}/500 characters</p>
      <button
        onClick={() => handleReject("paper-uuid-123")}
        disabled={isLoading}
      >
        {isLoading ? "Rejecting..." : "Reject Paper"}
      </button>
    </div>
  );
}
```

---

### 2. Reassign Adviser with Date Picker

```typescript
import { useReAssignAdviserMutation } from "@/lib/api/assignMentor";

function ReassignAdviserComponent() {
  const { data: session } = useSession();
  const [reassignAdviser, { isLoading }] = useReAssignAdviserMutation();
  const [deadline, setDeadline] = useState("");
  const [reason, setReason] = useState("");

  const handleReassign = async () => {
    if (!deadline) {
      toast.warning("Please select a deadline");
      return;
    }

    // Validate deadline is today or future
    const selectedDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.warning("Deadline must be today or in the future");
      return;
    }

    try {
      await reassignAdviser({
        token: session?.accessToken || "",
        assignMent: {
          paperUuid: "paper-uuid-123",
          newAdviserUuid: "new-adviser-uuid-789",
          adminUuid: session?.user?.id || "",
          deadline: deadline, // ✅ Already in YYYY-MM-DD format
          reason: reason.trim() || undefined,
        },
      }).unwrap();

      toast.success("Adviser reassigned successfully!");
    } catch (error) {
      toast.error("Failed to reassign adviser");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label>Deadline</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          min={new Date().toISOString().split("T")[0]} // Prevent past dates
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label>Reason (optional, max 500 chars)</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why is this adviser being reassigned?"
          maxLength={500}
          className="w-full border rounded px-3 py-2"
        />
        <p className="text-sm text-gray-500">{reason.length}/500</p>
      </div>

      <button onClick={handleReassign} disabled={isLoading}>
        {isLoading ? "Reassigning..." : "Reassign Adviser"}
      </button>
    </div>
  );
}
```

---

### 3. Display Assignment with Proper Dates

```typescript
import { useGetAssignmentsByAdviserQuery } from "@/lib/api/assignMentor";

function AdviserAssignmentsComponent({ adviserUuid }: { adviserUuid: string }) {
  const { data: session } = useSession();

  const { data: assignments, isLoading } = useGetAssignmentsByAdviserQuery({
    token: session?.accessToken || "",
    adviserUuid,
  });

  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateStr).toLocaleDateString("en-US", options);
  };

  const isOverdue = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deadline < today;
  };

  return (
    <div>
      <h2>Assignments for Adviser</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {assignments?.map((assignment) => (
            <div key={assignment.uuid} className="border p-4 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">Paper: {assignment.paperUuid}</p>
                  <p className="text-sm text-gray-600">
                    Status: {assignment.status}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm ${
                      isOverdue(assignment.deadline)
                        ? "text-red-600 font-semibold"
                        : "text-gray-600"
                    }`}
                  >
                    Deadline: {formatDate(assignment.deadline)}
                    {isOverdue(assignment.deadline) && " (Overdue)"}
                  </p>
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-500">
                <p>Assigned: {formatDate(assignment.assignedDate)}</p>
                <p>Last Updated: {formatDate(assignment.updateDate)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## ⚠️ Migration Checklist

If you have existing code using the old types, update:

- [ ] Remove `adminUuid` from reject paper requests
- [ ] Remove references to `paperTitle`, `adviserName`, `comment` in `AdvisorAssignmentResponse`
- [ ] Update `updateDate` to handle string instead of `string | null`
- [ ] Ensure date formats are `"YYYY-MM-DD"` for all date fields
- [ ] Add validation for 500 character limit on reason fields
- [ ] Add validation for future/present dates on deadlines

---

## 📊 Validation Summary

| Field            | Type               | Validation                | Max Length |
| ---------------- | ------------------ | ------------------------- | ---------- |
| `paperUuid`      | string             | Required, Not Blank       | -          |
| `adviserUuid`    | string             | Required, Not Blank       | -          |
| `adminUuid`      | string             | Required, Not Blank       | -          |
| `deadline`       | string (LocalDate) | Required, Today or Future | -          |
| `reason`         | string             | Optional                  | 500 chars  |
| `newAdviserUuid` | string             | Required, Not Blank       | -          |

---

## ✅ Benefits of Type Alignment

1. **Type Safety** - Prevents runtime errors from mismatched fields
2. **No Backend Surprises** - Frontend types match backend exactly
3. **Better Developer Experience** - TypeScript autocomplete works correctly
4. **Easier Debugging** - Clear what data is expected
5. **Documentation** - Types serve as living documentation

---

## 🔧 Utility Functions

### Date Helpers

```typescript
// utils/dateHelpers.ts

/**
 * Convert Date object to LocalDate format (YYYY-MM-DD)
 */
export const toLocalDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

/**
 * Get today's date in LocalDate format
 */
export const getTodayLocalDate = (): string => {
  return toLocalDate(new Date());
};

/**
 * Check if date is in the past
 */
export const isPastDate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Format LocalDate for display
 */
export const formatLocalDate = (
  dateStr: string,
  locale: string = "en-US"
): string => {
  return new Date(dateStr).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Validate deadline is today or future
 */
export const isValidDeadline = (dateStr: string): boolean => {
  return !isPastDate(dateStr);
};
```

### Usage:

```typescript
import {
  toLocalDate,
  isValidDeadline,
  formatLocalDate,
} from "@/utils/dateHelpers";

// Converting from input
const deadline = toLocalDate(new Date("2025-12-31"));
console.log(deadline); // "2025-12-31"

// Validating
if (!isValidDeadline(deadline)) {
  toast.error("Deadline must be today or in the future");
}

// Displaying
const display = formatLocalDate("2025-12-31");
console.log(display); // "December 31, 2025"
```

---

## 🎯 Summary

All types in `src/lib/api/assignMentor.ts` now match the backend DTOs exactly:

- ✅ Date fields use `string` in `"YYYY-MM-DD"` format
- ✅ `RejectPaperRequest` has no `adminUuid`
- ✅ `reason` fields are optional with 500 char limit
- ✅ `deadline` must be today or future
- ✅ `updateDate` is always present (not nullable)

Your API calls will now work perfectly with your Spring Boot backend! 🚀
