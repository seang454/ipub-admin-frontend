# Assignment API - Quick Reference Guide

## 🚀 All Available Endpoints from `assignMentor.ts`

### **Mutations (Write Operations)**

#### 1. **Assign Adviser to Paper**

```typescript
import { useAssignAdviserMutation } from "@/lib/api/assignMentor";

const [assignAdviser, { isLoading }] = useAssignAdviserMutation();

await assignAdviser({
  token: accessToken,
  assignMent: {
    paperUuid: "paper-uuid-123",
    adviserUuid: "adviser-uuid-456",
    deadline: "2025-12-31", // YYYY-MM-DD
  },
}).unwrap();
```

#### 2. **Reassign Adviser**

```typescript
import { useReAssignAdviserMutation } from "@/lib/api/assignMentor";

const [reassignAdviser, { isLoading }] = useReAssignAdviserMutation();

await reassignAdviser({
  token: accessToken,
  assignMent: {
    paperUuid: "paper-uuid-123",
    newAdviserUuid: "new-adviser-uuid-789",
    adminUuid: session?.user?.id || "",
    deadline: "2025-12-31", // YYYY-MM-DD
    reason: "Original adviser unavailable", // Optional
  },
}).unwrap();
```

#### 3. **Reject Paper**

```typescript
import { useRejectPaperMutation } from "@/lib/api/assignMentor";

const [rejectPaper, { isLoading }] = useRejectPaperMutation();

await rejectPaper({
  token: accessToken,
  rejectRequest: {
    paperUuid: "paper-uuid-123",
    reason: "Does not meet quality standards", // Required, max 500 chars
  },
}).unwrap();
```

#### 4. **Review Paper by Adviser**

```typescript
import { useReviewPaperByAdviserMutation } from "@/lib/api/assignMentor";

const [reviewPaper, { isLoading }] = useReviewPaperByAdviserMutation();

await reviewPaper({
  token: accessToken,
  reviewRequest: {
    assignmentUuid: "assignment-uuid-123",
    adviserUuid: "adviser-uuid-456",
    comment: "This paper shows excellent research methodology.",
    status: "APPROVED", // or "REJECTED" or "NEEDS_REVISION"
  },
}).unwrap();
```

---

### **Queries (Read Operations)**

#### 5. **Get Assignments by Adviser UUID**

```typescript
import { useGetAssignmentsByAdviserQuery } from "@/lib/api/assignMentor";

const { data, isLoading, error } = useGetAssignmentsByAdviserQuery({
  token: accessToken,
  adviserUuid: "adviser-uuid-456",
});

// data: AdvisorAssignmentResponse[]
```

#### 6. **Get All Assignments by Current Author**

```typescript
import { useGetAllAssignmentsByAuthorQuery } from "@/lib/api/assignMentor";

const { data, isLoading, error } = useGetAllAssignmentsByAuthorQuery({
  token: accessToken,
});

// data: AdvisorAssignmentResponse[]
// Returns all assignments created by the current logged-in admin
```

#### 7. **Get Assignments by Specific Author (Adviser)**

```typescript
import { useGetAssignmentsByAuthorQuery } from "@/lib/api/assignMentor";

const { data, isLoading, error } = useGetAssignmentsByAuthorQuery({
  token: accessToken,
  adviserUuid: "adviser-uuid-456",
});

// data: AdvisorAssignmentResponse[]
```

#### 8. **Get Assignments for Current Adviser (Paginated)**

```typescript
import { useGetAssignmentsForCurrentAdviserQuery } from "@/lib/api/assignMentor";

const { data, isLoading, error } = useGetAssignmentsForCurrentAdviserQuery({
  token: accessToken,
  page: 0,
  size: 10,
});

// data: PaginatedAssignmentsResponse
// {
//   content: AdvisorAssignmentResponse[],
//   page: number,
//   size: number,
//   totalElements: number,
//   totalPages: number,
// }
```

---

## 📋 Type Definitions

### **Assignment (for creating new assignment)**

```typescript
type Assignment = {
  paperUuid: string;
  adviserUuid: string;
  deadline: string; // YYYY-MM-DD
  adminUuid?: string; // Optional
};
```

### **AssignmentDetails (response from assign/reassign)**

```typescript
type AssignmentDetails = {
  uuid: string;
  paperUuid: string;
  adviserUuid: string;
  adminUuid: string;
  deadline: string; // YYYY-MM-DD
  status: string; // "ASSIGNED" | "PENDING" | "COMPLETED" | "REVIEWED" | "REJECTED"
  assignedDate: string; // YYYY-MM-DD
  updateDate: string; // YYYY-MM-DD
};
```

### **AssignmentUpdate (for reassigning)**

```typescript
type AssignmentUpdate = {
  paperUuid: string;
  newAdviserUuid: string;
  adminUuid: string;
  deadline: string; // YYYY-MM-DD
  reason?: string; // Optional, max 500 chars
};
```

### **RejectPaperRequest**

```typescript
type RejectPaperRequest = {
  paperUuid: string;
  reason: string; // Required, max 500 chars
};
```

### **AdviserReviewRequest**

```typescript
type AdviserReviewRequest = {
  assignmentUuid: string;
  adviserUuid: string;
  comment: string;
  status: "APPROVED" | "REJECTED" | "NEEDS_REVISION";
};
```

### **AdvisorAssignmentResponse**

```typescript
type AdvisorAssignmentResponse = {
  uuid: string;
  paperUuid: string;
  adviserUuid: string;
  adminUuid: string;
  deadline: string; // YYYY-MM-DD
  status: string;
  assignedDate: string; // YYYY-MM-DD
  updateDate: string; // YYYY-MM-DD
};
```

### **PaginatedAssignmentsResponse**

```typescript
type PaginatedAssignmentsResponse = {
  content: AdvisorAssignmentResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
```

---

## 🎯 Common Use Cases

### **Use Case 1: Display Adviser's Assignments**

```typescript
function AdviserDashboard({ adviserUuid }: { adviserUuid: string }) {
  const { data: session } = useSession();

  const { data: assignments, isLoading } = useGetAssignmentsByAdviserQuery({
    token: session?.accessToken || "",
    adviserUuid,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>My Assignments ({assignments?.length || 0})</h2>
      {assignments?.map((assignment) => (
        <div key={assignment.uuid}>
          <p>Paper: {assignment.paperUuid}</p>
          <p>Status: {assignment.status}</p>
          <p>Deadline: {new Date(assignment.deadline).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
```

### **Use Case 2: Admin Dashboard with All Assignments**

```typescript
function AdminDashboard() {
  const { data: session } = useSession();

  const { data: allAssignments } = useGetAllAssignmentsByAuthorQuery({
    token: session?.accessToken || "",
  });

  const assignedCount =
    allAssignments?.filter((a) => a.status === "ASSIGNED").length || 0;

  const completedCount =
    allAssignments?.filter((a) => a.status === "COMPLETED").length || 0;

  return (
    <div>
      <h2>Assignment Overview</h2>
      <p>Total Assignments: {allAssignments?.length || 0}</p>
      <p>Active: {assignedCount}</p>
      <p>Completed: {completedCount}</p>
    </div>
  );
}
```

### **Use Case 3: Adviser Review Paper**

```typescript
function ReviewPaperComponent({ assignmentUuid, adviserUuid }: Props) {
  const { data: session } = useSession();
  const [reviewPaper, { isLoading }] = useReviewPaperByAdviserMutation();
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<
    "APPROVED" | "REJECTED" | "NEEDS_REVISION"
  >("APPROVED");

  const handleSubmitReview = async () => {
    try {
      await reviewPaper({
        token: session?.accessToken || "",
        reviewRequest: {
          assignmentUuid,
          adviserUuid,
          comment,
          status,
        },
      }).unwrap();

      toast.success("Review submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit review");
    }
  };

  return (
    <div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Enter your review comments..."
      />

      <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
        <option value="APPROVED">Approve</option>
        <option value="REJECTED">Reject</option>
        <option value="NEEDS_REVISION">Needs Revision</option>
      </select>

      <button onClick={handleSubmitReview} disabled={isLoading}>
        {isLoading ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
}
```

### **Use Case 4: Paginated Adviser Assignments**

```typescript
function AdviserAssignmentsPage() {
  const { data: session } = useSession();
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const { data, isLoading } = useGetAssignmentsForCurrentAdviserQuery({
    token: session?.accessToken || "",
    page,
    size,
  });

  return (
    <div>
      <h2>My Assignments</h2>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          {data?.content.map((assignment) => (
            <div key={assignment.uuid}>
              <p>Paper: {assignment.paperUuid}</p>
              <p>Status: {assignment.status}</p>
            </div>
          ))}

          <div>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </button>

            <span>
              Page {page + 1} of {data?.totalPages}
            </span>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page + 1 >= (data?.totalPages || 0)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

---

## 🔄 RTK Query Cache Management

All endpoints automatically:

- ✅ Cache responses
- ✅ Invalidate cache on mutations
- ✅ Refetch when tags are invalidated
- ✅ Deduplicate identical requests

### **Tag Management**

```typescript
// All mutations invalidate "AssignAdviser" tag
invalidatesTags: ["AssignAdviser"];

// All queries provide "AssignAdviser" tag
providesTags: ["AssignAdviser"];

// When you mutate, all queries auto-refresh!
```

---

## 📊 Endpoint Summary Table

| Endpoint                          | Type     | Purpose                            | Pagination |
| --------------------------------- | -------- | ---------------------------------- | ---------- |
| `assignAdviser`                   | Mutation | Assign adviser to paper            | No         |
| `reAssignAdviser`                 | Mutation | Change paper's adviser             | No         |
| `rejectPaper`                     | Mutation | Reject a paper                     | No         |
| `reviewPaperByAdviser`            | Mutation | Adviser submits review             | No         |
| `getAssignmentsByAdviser`         | Query    | Get adviser's assignments          | No         |
| `getAllAssignmentsByAuthor`       | Query    | Get admin's assignments            | No         |
| `getAssignmentsByAuthor`          | Query    | Get specific adviser's assignments | No         |
| `getAssignmentsForCurrentAdviser` | Query    | Get current adviser's assignments  | Yes        |

---

## ✅ Status Values

```typescript
type AssignmentStatus =
  | "ASSIGNED" // Adviser assigned, awaiting review
  | "PENDING" // Assignment pending confirmation
  | "COMPLETED" // Review completed
  | "REVIEWED" // Adviser reviewed
  | "REJECTED"; // Paper rejected
```

---

## 🎯 Best Practices

1. **Always pass token:**

   ```typescript
   const { data: session } = useSession();
   token: session?.accessToken || "";
   ```

2. **Skip query when no token:**

   ```typescript
   {
     skip: !accessToken;
   }
   ```

3. **Handle errors properly:**

   ```typescript
   try {
     await mutation().unwrap();
   } catch (error: unknown) {
     const msg = (error as { data?: { message?: string } })?.data?.message;
     toast.error(msg || "Operation failed");
   }
   ```

4. **Use loading states:**
   ```typescript
   const [mutate, { isLoading }] = useMutation();
   <button disabled={isLoading}>{isLoading ? "Loading..." : "Submit"}</button>;
   ```

---

## 🚀 All 8 Endpoints Are Now Integrated!

You now have full access to:

- ✅ Assign advisers
- ✅ Reassign advisers
- ✅ Reject papers
- ✅ Review papers
- ✅ Get assignments by adviser
- ✅ Get all assignments
- ✅ Get assignments by author
- ✅ Get paginated assignments

Happy coding! 🎉
