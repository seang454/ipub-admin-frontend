# Multiple Advisers Support

## 🎯 Overview

The proposal table now **fully supports papers with multiple advisers**! The system can handle:

- Papers with **NO advisers** (Not Assigned)
- Papers with **ONE adviser** (Single Assignment)
- Papers with **MULTIPLE advisers** (Multiple Assignments)

---

## ✨ Key Features

### **1. Automatic Detection**

The system automatically detects how many advisers are assigned to each paper and adjusts the UI accordingly.

### **2. Dynamic Display**

- **Single Adviser**: Shows name in blue text
- **Multiple Advisers**: Shows badges for each adviser
- **Labels**: Automatically pluralizes "Adviser" → "Advisers"

### **3. Smart Button Text**

- **No advisers**: "Assign Advisor"
- **One adviser**: "Reassign"
- **Multiple advisers**: "Manage Advisers"

### **4. All Currently Assigned Advisers Disabled**

When managing advisers, ALL currently assigned advisers are grayed out and disabled.

---

## 📊 Visual Examples

### **Example 1: Paper with NO Advisers**

```
┌────────────────────────────────────────┐
│ 📄 Research on Machine Learning        │
│ ───────────────────────────────────────│
│ Submitted: 10/27/2024                  │
│ Categories: AI, ML                     │
│ Downloads: 42                          │
│                                        │
│ (No adviser info)                      │
│                                        │
│ Badge: [⚠️ Not Assigned]              │
│ Button: [Assign Advisor]               │
└────────────────────────────────────────┘
```

---

### **Example 2: Paper with ONE Adviser**

```
┌────────────────────────────────────────┐
│ 📄 Research on Machine Learning        │
│ ───────────────────────────────────────│
│ Submitted: 10/27/2024                  │
│ Categories: AI, ML                     │
│ Downloads: 42                          │
│                                        │
│ Adviser: Dr. John Smith      ← Blue text
│ Status: ASSIGNED                       │
│ Deadline: 12/31/2025                  │
│                                        │
│ Badge: [✅ Assigned]                   │
│ Buttons: [Reassign] [Reject]           │
└────────────────────────────────────────┘
```

---

### **Example 3: Paper with MULTIPLE Advisers**

```
┌────────────────────────────────────────┐
│ 📄 Research on Machine Learning        │
│ ───────────────────────────────────────│
│ Submitted: 10/27/2024                  │
│ Categories: AI, ML                     │
│ Downloads: 42                          │
│                                        │
│ Advisers:                    ← Plural!
│ [Dr. John Smith] [Dr. Jane Doe]  ← Badges!
│ [Dr. Bob Wilson]                       │
│                                        │
│ Status: [ASSIGNED] [PENDING] [ASSIGNED]│
│ Deadlines: 12/31/2025, 11/30/2025,    │
│            01/15/2026                  │
│                                        │
│ Badge: [✅ Assigned]                   │
│ Buttons: [Manage Advisers] [Reject]    │
└────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### **New Helper Functions**

```typescript
// Get ALL assignments for a paper
const getAllAssignmentsForPaper = (
  paperUuid: string
): AdvisorAssignmentResponse[] => {
  return (
    assignmentsData?.filter(
      (assignment) => assignment.paperUuid === paperUuid
    ) || []
  );
};

// Get all adviser UUIDs for a paper
const getAdviserUuidsForPaper = (paperUuid: string): string[] => {
  return getAllAssignmentsForPaper(paperUuid).map((a) => a.adviserUuid);
};

// Check if paper has any advisers
const isPaperAssigned = (paperUuid: string): boolean => {
  const assignments = getAllAssignmentsForPaper(paperUuid);
  return assignments.length > 0;
};
```

---

### **Display Logic for Advisers**

```typescript
const assignments = getAllAssignmentsForPaper(proposal.uuid);

if (assignments.length === 0) {
  // Show nothing
  return null;
}

if (assignments.length === 1) {
  // Show single adviser name in blue
  return (
    <span className="text-blue-600 dark:text-blue-400 font-semibold">
      {getAdviserName(assignments[0].adviserUuid)}
    </span>
  );
}

// Show multiple advisers as badges
return (
  <div className="flex flex-wrap gap-1">
    {assignments.map((assignment) => (
      <Badge key={assignment.uuid}>
        {getAdviserName(assignment.adviserUuid)}
      </Badge>
    ))}
  </div>
);
```

---

### **Button Text Logic**

```typescript
// In the proposal list
{
  isPaperAssigned(proposal.uuid) ? (
    <Button>
      {
        getAllAssignmentsForPaper(proposal.uuid).length > 1
          ? "Manage Advisers" // Multiple advisers
          : "Reassign" // Single adviser
      }
    </Button>
  ) : (
    <Button>Assign Advisor</Button> // No advisers
  );
}
```

---

### **Modal Title Logic**

```typescript
<DialogTitle>
  {isReassigning
    ? assigningPaper && getAllAssignmentsForPaper(assigningPaper.uuid).length > 1
      ? "Manage Advisers"        // Multiple advisers
      : "Reassign Adviser"       // Single adviser
    : "Assign Adviser"           // New assignment
  }
</DialogTitle>

<p>
  {isReassigning
    ? assigningPaper && getAllAssignmentsForPaper(assigningPaper.uuid).length > 1
      ? "Assign additional adviser or replace existing ones for:"
      : "Select a new adviser for:"
    : "Select an adviser for:"
  }
  <span>{assigningPaper?.title}</span>
</p>
```

---

### **Disable ALL Current Advisers**

```typescript
// Get ALL adviser UUIDs for this paper
const currentAdviserUuids = assigningPaper
  ? getAdviserUuidsForPaper(assigningPaper.uuid)
  : [];

// Check if THIS adviser is in the list
const isCurrentlyAssigned =
  isReassigning && currentAdviserUuids.includes(advisor.uuid);

// Disable if currently assigned
<Button disabled={isCurrentlyAssigned}>
  {isCurrentlyAssigned ? "Current Adviser" : "Assign"}
</Button>;
```

---

## 🎨 UI States

### **Status Badges**

| Number of Advisers | Display               |
| ------------------ | --------------------- |
| 0                  | "Not Assigned" (Gray) |
| 1+                 | "Assigned" (Green)    |

### **Adviser Display**

| Number of Advisers | Display Style                           |
| ------------------ | --------------------------------------- |
| 0                  | _(Nothing shown)_                       |
| 1                  | Blue text: "Dr. John Smith"             |
| 2+                 | Badges: [Dr. John Smith] [Dr. Jane Doe] |

### **Button Text**

| Number of Advisers | Button Text       |
| ------------------ | ----------------- |
| 0                  | "Assign Advisor"  |
| 1                  | "Reassign"        |
| 2+                 | "Manage Advisers" |

### **Modal Title**

| Number of Advisers | Modal Title        |
| ------------------ | ------------------ |
| 0 (assigning)      | "Assign Adviser"   |
| 1 (reassigning)    | "Reassign Adviser" |
| 2+ (reassigning)   | "Manage Advisers"  |

---

## 🔄 User Workflows

### **Scenario 1: Assign First Adviser**

```
1. Paper has NO advisers
2. Click "Assign Advisor"
3. Modal: "Assign Adviser"
4. Select adviser and set deadline
5. Click "Assign"
6. ✅ Paper now shows ONE adviser
7. Button changes to "Reassign"
```

---

### **Scenario 2: Assign Second Adviser (Multiple Advisers)**

```
1. Paper has ONE adviser (Dr. John Smith)
2. Click "Reassign"
3. Modal: "Reassign Adviser"
4. Dr. John Smith is grayed out
5. Select Dr. Jane Doe (different adviser)
6. Click "Reassign"
7. ✅ Paper now shows TWO advisers as badges
8. Button changes to "Manage Advisers"
```

---

### **Scenario 3: Manage Multiple Advisers**

```
1. Paper has THREE advisers
2. Display shows:
   Advisers: [Dr. Smith] [Dr. Doe] [Dr. Wilson]
3. Click "Manage Advisers"
4. Modal: "Manage Advisers"
5. Shows current advisers:
   Current Advisers: [Dr. Smith] [Dr. Doe] [Dr. Wilson]
6. All three are grayed out in the list
7. Can select Dr. Brown (new adviser)
8. Click "Assign" to add 4th adviser
```

---

## 📋 Current Adviser Display in Modal

When managing advisers, the modal header shows ALL current advisers:

```tsx
{
  isReassigning && assigningPaper && (
    <div className="mt-2 text-sm">
      <span className="font-medium">
        Current Adviser
        {getAllAssignmentsForPaper(assigningPaper.uuid).length > 1 ? "s" : ""}:
      </span>
      <div className="flex flex-wrap gap-1 mt-1">
        {getAllAssignmentsForPaper(assigningPaper.uuid).map((assignment) => (
          <Badge key={assignment.uuid}>
            {getAdviserName(assignment.adviserUuid)}
          </Badge>
        ))}
      </div>
    </div>
  );
}
```

**Example Output:**

```
Current Advisers:
[Dr. John Smith] [Dr. Jane Doe] [Dr. Bob Wilson]
```

---

## 🎯 Benefits

### **1. Complete Support**

- Papers can have 0, 1, or many advisers
- UI adapts automatically
- No hard limits on number of advisers

### **2. Clear Visual Feedback**

- Easy to see all advisers at a glance
- Badges for multiple advisers
- Different button text for clarity

### **3. Error Prevention**

- ALL current advisers are disabled
- Can't accidentally reassign same adviser
- Clear indication of who is already assigned

### **4. Flexible Management**

- Can add multiple advisers
- Can replace existing advisers
- Can manage complex adviser relationships

---

## 📊 Data Structure

### **Multiple Assignments Example**

```typescript
// Paper UUID: "paper-abc-123"

// Assignments data:
[
  {
    uuid: "assignment-001",
    paperUuid: "paper-abc-123", // ← Same paper
    adviserUuid: "adviser-xyz", // ← Different adviser
    status: "ASSIGNED",
    deadline: "2025-12-31",
  },
  {
    uuid: "assignment-002",
    paperUuid: "paper-abc-123", // ← Same paper
    adviserUuid: "adviser-789", // ← Different adviser
    status: "PENDING",
    deadline: "2025-11-30",
  },
  {
    uuid: "assignment-003",
    paperUuid: "paper-abc-123", // ← Same paper
    adviserUuid: "adviser-456", // ← Different adviser
    status: "ASSIGNED",
    deadline: "2026-01-15",
  },
];

// Result:
getAllAssignmentsForPaper("paper-abc-123"); // Returns 3 assignments
isPaperAssigned("paper-abc-123"); // Returns true
getAdviserUuidsForPaper("paper-abc-123"); // Returns ["adviser-xyz", "adviser-789", "adviser-456"]
```

---

## ✅ Features Summary

| Feature               | Status | Details                                 |
| --------------------- | ------ | --------------------------------------- |
| Multiple Assignments  | ✅     | Papers can have 0, 1, or many advisers  |
| Dynamic Display       | ✅     | Single name vs. multiple badges         |
| Smart Button Text     | ✅     | Changes based on number of advisers     |
| Disable All Current   | ✅     | All assigned advisers are disabled      |
| Show Current Advisers | ✅     | Modal header lists all current advisers |
| Plural Labels         | ✅     | "Adviser" vs. "Advisers" automatically  |
| Status per Adviser    | ✅     | Shows status for each assignment        |
| Deadline per Adviser  | ✅     | Shows all deadlines                     |
| Dark Mode Support     | ✅     | All badges work in dark mode            |

---

## 🚀 Everything is Working!

Your system now **fully supports multiple advisers per paper**:

1. ✅ Detects number of advisers automatically
2. ✅ Displays appropriately (text vs. badges)
3. ✅ Shows correct button text
4. ✅ Disables ALL current advisers when managing
5. ✅ Lists current advisers in modal header
6. ✅ Handles pluralization correctly
7. ✅ Shows all statuses and deadlines
8. ✅ Works in both light and dark modes

Perfect for complex research papers with multiple supervisors! 🎓
