# Adviser Assignment API Integration Guide

## 📋 Overview

This guide explains how to use the Adviser Assignment API endpoints in your frontend application. All endpoints now require authentication tokens.

---

## 🔧 File Location

**API Slice:** `src/lib/api/assignMentor.ts`

---

## 📡 Available Endpoints

### **Mutations (POST Requests)**

1. ✅ **Assign Adviser to Paper**
2. ✅ **Reassign Adviser**
3. ✅ **Reject Paper by Admin**
4. ✅ **Review Paper by Adviser**

### **Queries (GET Requests)**

5. ✅ **Get Assignments by Adviser UUID**
6. ✅ **Get All Assignments by Author**
7. ✅ **Get Assignments by Author (Specific Adviser)**
8. ✅ **Get Assignments for Current Adviser (Paginated)**

---

## 🎯 Type Definitions

### Request Types

```typescript
// Assign Adviser
type Assignment = {
  paperUuid: string;
  adviserUuid: string;
  deadline: string; // ISO 8601 format: "2025-12-31T23:59:59Z"
  adminUuid?: string;
};

// Reassign Adviser
type AssignmentUpdate = {
  paperUuid: string;
  newAdviserUuid: string;
  adminUuid: string;
  deadline: string;
  reason?: string;
};

// Reject Paper
type RejectPaperRequest = {
  paperUuid: string;
  adminUuid: string;
  reason: string;
};

// Adviser Review
type AdviserReviewRequest = {
  assignmentUuid: string;
  adviserUuid: string;
  comment: string;
  status: "APPROVED" | "REJECTED" | "NEEDS_REVISION";
};
```

### Response Types

```typescript
// Assignment Details
type AssignmentDetails = {
  uuid: string;
  paperUuid: string;
  adviserUuid: string;
  adminUuid: string;
  deadline: string;
  status: "ASSIGNED" | "PENDING" | "COMPLETED" | "REVIEWED" | "REJECTED";
  assignedDate: string;
  updateDate: string | null;
};

// Advisor Assignment Response
type AdvisorAssignmentResponse = {
  uuid: string;
  paperUuid: string;
  paperTitle?: string;
  adviserUuid: string;
  adviserName?: string;
  adminUuid: string;
  deadline: string;
  status: string;
  assignedDate: string;
  updateDate: string | null;
  comment?: string;
};

// Paginated Response
type PaginatedAssignmentsResponse = {
  content: AdvisorAssignmentResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
```

---

## 📝 Usage Examples

### 1. Assign Adviser to Paper

```typescript
import { useAssignAdviserMutation } from "@/lib/api/assignMentor";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

function AssignAdviserComponent() {
  const { data: session } = useSession();
  const [assignAdviser, { isLoading }] = useAssignAdviserMutation();

  const handleAssign = async (paperUuid: string, adviserUuid: string) => {
    try {
      const result = await assignAdviser({
        token: session?.accessToken || "",
        assignMent: {
          paperUuid,
          adviserUuid,
          deadline: "2025-12-31T23:59:59Z",
          adminUuid: session?.user?.id,
        },
      }).unwrap();

      toast.success("Adviser assigned successfully!");
      console.log("Assignment created:", result);
    } catch (error) {
      toast.error("Failed to assign adviser");
      console.error("Error:", error);
    }
  };

  return (
    <button
      onClick={() => handleAssign("paper-uuid-123", "adviser-uuid-456")}
      disabled={isLoading}
    >
      {isLoading ? "Assigning..." : "Assign Adviser"}
    </button>
  );
}
```

---

### 2. Reassign Adviser

```typescript
import { useReAssignAdviserMutation } from "@/lib/api/assignMentor";

function ReassignAdviserComponent() {
  const { data: session } = useSession();
  const [reassignAdviser, { isLoading }] = useReAssignAdviserMutation();

  const handleReassign = async () => {
    try {
      const result = await reassignAdviser({
        token: session?.accessToken || "",
        assignMent: {
          paperUuid: "paper-uuid-123",
          newAdviserUuid: "new-adviser-uuid-789",
          adminUuid: session?.user?.id || "",
          deadline: "2025-12-31T23:59:59Z",
          reason: "Original adviser is unavailable",
        },
      }).unwrap();

      toast.success("Adviser reassigned successfully!");
    } catch (error) {
      toast.error("Failed to reassign adviser");
    }
  };

  return (
    <button onClick={handleReassign} disabled={isLoading}>
      {isLoading ? "Reassigning..." : "Reassign Adviser"}
    </button>
  );
}
```

---

### 3. Reject Paper by Admin

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

    try {
      await rejectPaper({
        token: session?.accessToken || "",
        rejectRequest: {
          paperUuid,
          adminUuid: session?.user?.id || "",
          reason: reason.trim(),
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
        placeholder="Reason for rejection..."
      />
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

### 4. Review Paper by Adviser

```typescript
import { useReviewPaperByAdviserMutation } from "@/lib/api/assignMentor";

function AdviserReviewComponent() {
  const { data: session } = useSession();
  const [reviewPaper, { isLoading }] = useReviewPaperByAdviserMutation();
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<
    "APPROVED" | "REJECTED" | "NEEDS_REVISION"
  >("APPROVED");

  const handleReview = async (assignmentUuid: string) => {
    try {
      await reviewPaper({
        token: session?.accessToken || "",
        reviewRequest: {
          assignmentUuid,
          adviserUuid: session?.user?.id || "",
          comment,
          status,
        },
      }).unwrap();

      toast.success(`Paper ${status.toLowerCase()} successfully!`);
    } catch (error) {
      toast.error("Failed to submit review");
    }
  };

  return (
    <div>
      <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
        <option value="APPROVED">Approve</option>
        <option value="REJECTED">Reject</option>
        <option value="NEEDS_REVISION">Needs Revision</option>
      </select>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Your review comment..."
      />
      <button
        onClick={() => handleReview("assignment-uuid-123")}
        disabled={isLoading}
      >
        Submit Review
      </button>
    </div>
  );
}
```

---

### 5. Get Assignments by Adviser UUID

```typescript
import { useGetAssignmentsByAdviserQuery } from "@/lib/api/assignMentor";

function AdviserAssignmentsComponent({ adviserUuid }: { adviserUuid: string }) {
  const { data: session } = useSession();

  const {
    data: assignments,
    isLoading,
    error,
  } = useGetAssignmentsByAdviserQuery(
    {
      token: session?.accessToken || "",
      adviserUuid,
    },
    {
      skip: !session?.accessToken, // Skip query if no token
    }
  );

  if (isLoading) return <div>Loading assignments...</div>;
  if (error) return <div>Error loading assignments</div>;

  return (
    <div>
      <h2>Assignments for Adviser</h2>
      {assignments?.map((assignment) => (
        <div key={assignment.uuid}>
          <h3>{assignment.paperTitle}</h3>
          <p>Status: {assignment.status}</p>
          <p>Deadline: {new Date(assignment.deadline).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
```

---

### 6. Get All Assignments by Author

```typescript
import { useGetAllAssignmentsByAuthorQuery } from "@/lib/api/assignMentor";

function MyAssignmentsComponent() {
  const { data: session } = useSession();

  const { data: assignments, isLoading } = useGetAllAssignmentsByAuthorQuery(
    {
      token: session?.accessToken || "",
    },
    {
      skip: !session?.accessToken,
    }
  );

  return (
    <div>
      <h2>My Submitted Papers</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {assignments?.map((assignment) => (
            <li key={assignment.uuid}>
              {assignment.paperTitle} - {assignment.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

### 7. Get Assignments by Author (Specific Adviser)

```typescript
import { useGetAssignmentsByAuthorQuery } from "@/lib/api/assignMentor";

function AuthorAssignmentsComponent({ adviserUuid }: { adviserUuid: string }) {
  const { data: session } = useSession();

  const { data: assignments } = useGetAssignmentsByAuthorQuery({
    token: session?.accessToken || "",
    adviserUuid,
  });

  return (
    <div>
      <h2>Papers Assigned to This Adviser</h2>
      {assignments?.map((assignment) => (
        <div key={assignment.uuid}>
          <p>{assignment.paperTitle}</p>
        </div>
      ))}
    </div>
  );
}
```

---

### 8. Get Assignments for Current Adviser (Paginated)

```typescript
import { useGetAssignmentsForCurrentAdviserQuery } from "@/lib/api/assignMentor";
import { useState } from "react";

function AdviserDashboardComponent() {
  const { data: session } = useSession();
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const { data: paginatedData, isLoading } =
    useGetAssignmentsForCurrentAdviserQuery({
      token: session?.accessToken || "",
      page,
      size: pageSize,
    });

  return (
    <div>
      <h2>My Adviser Assignments</h2>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div>
            {paginatedData?.content.map((assignment) => (
              <div key={assignment.uuid} className="border p-4 mb-2">
                <h3>{assignment.paperTitle}</h3>
                <p>Status: {assignment.status}</p>
                <p>
                  Deadline: {new Date(assignment.deadline).toLocaleDateString()}
                </p>
                {assignment.comment && <p>Comment: {assignment.comment}</p>}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </button>

            <span>
              Page {page + 1} of {paginatedData?.totalPages || 1}
            </span>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= (paginatedData?.totalPages || 1) - 1}
            >
              Next
            </button>
          </div>

          <p className="text-sm text-gray-600 mt-2">
            Showing {paginatedData?.content.length || 0} of{" "}
            {paginatedData?.totalElements || 0} assignments
          </p>
        </>
      )}
    </div>
  );
}
```

---

## 🔐 Authentication

All endpoints require a valid JWT token from the user's session:

```typescript
import { useSession } from "next-auth/react";

function MyComponent() {
  const { data: session } = useSession();
  const token = session?.accessToken || "";

  // Use token in API calls
}
```

---

## 🎯 Integration with Redux Store

Make sure the API is registered in your Redux store:

```typescript
// src/lib/store.ts
import { AssignmentApi } from "@/lib/api/assignMentor";

export const store = configureStore({
  reducer: {
    [AssignmentApi.reducerPath]: AssignmentApi.reducer,
    // ... other reducers
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(AssignmentApi.middleware),
});
```

---

## 🔄 Cache Management

The API uses RTK Query's automatic cache invalidation:

- **Tag:** `"AssignAdviser"`
- **Mutations** invalidate the cache
- **Queries** provide the cache tags

When you perform any mutation (assign, reassign, reject, review), all queries will automatically refetch to get the latest data.

---

## ⚡ Loading States

All hooks provide loading states:

```typescript
const [assignAdviser, { isLoading, isError, isSuccess }] = useAssignAdviserMutation();

// For queries
const { data, isLoading, isFetching, error } = useGetAssignmentsByAdviserQuery(...);
```

---

## 🐛 Error Handling

```typescript
try {
  await assignAdviser({ ... }).unwrap();
  // Success
} catch (error) {
  // Error handling
  if (error.status === 401) {
    // Unauthorized
  } else if (error.status === 404) {
    // Not found
  }
}
```

---

## 📊 Complete Example: Assign Adviser with Full Features

```typescript
"use client";
import { useAssignAdviserMutation } from "@/lib/api/assignMentor";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { useState } from "react";

export default function AssignAdviserForm({
  paperUuid,
}: {
  paperUuid: string;
}) {
  const { data: session } = useSession();
  const [assignAdviser, { isLoading }] = useAssignAdviserMutation();

  const [selectedAdviser, setSelectedAdviser] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAdviser || !deadline) {
      toast.warning("Please fill in all fields");
      return;
    }

    try {
      const result = await assignAdviser({
        token: session?.accessToken || "",
        assignMent: {
          paperUuid,
          adviserUuid: selectedAdviser,
          deadline: new Date(deadline).toISOString(),
          adminUuid: session?.user?.id,
        },
      }).unwrap();

      toast.success("Adviser assigned successfully!");

      // Reset form
      setSelectedAdviser("");
      setDeadline("");

      console.log("Assignment created:", result);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to assign adviser");
      console.error("Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Select Adviser</label>
        <select
          value={selectedAdviser}
          onChange={(e) => setSelectedAdviser(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
          disabled={isLoading}
        >
          <option value="">Choose an adviser...</option>
          {/* Map your advisers here */}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Deadline</label>
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
      >
        {isLoading ? "Assigning..." : "Assign Adviser"}
      </button>
    </form>
  );
}
```

---

## ✅ Summary

All 8 API endpoints are now available with:

- ✅ Token authentication
- ✅ TypeScript types
- ✅ RTK Query hooks
- ✅ Automatic caching
- ✅ Loading states
- ✅ Error handling

You can now integrate these endpoints into your admin dashboard, adviser portal, and student views! 🎉
