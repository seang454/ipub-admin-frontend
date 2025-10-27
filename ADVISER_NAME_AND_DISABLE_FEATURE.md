# Adviser Name Display & Disable Current Adviser Feature

## 🎯 Overview

Two new features have been added to improve the adviser assignment workflow:

1. **Display Adviser Name** - Shows the assigned adviser's full name on the paper
2. **Disable Current Adviser** - Prevents reassigning the same adviser when reassigning

---

## ✨ Feature 1: Display Adviser Name on Paper

### **What's New**

Each paper now displays the full name of the assigned adviser, not just the adviser UUID.

### **Visual Display**

```tsx
<p>
  <span className="font-medium text-dynamic2">Adviser:</span>{" "}
  <span className="text-blue-600 dark:text-blue-400 font-semibold">
    Dr. John Smith
  </span>
</p>
<p>
  <span className="font-medium text-dynamic2">Status:</span>{" "}
  <Badge variant="outline">ASSIGNED</Badge>
</p>
<p>
  <span className="font-medium text-dynamic2">Deadline:</span>{" "}
  12/31/2025
</p>
```

### **Before vs After**

**Before:**

```
Submitted: 10/15/2024
Categories: Computer Science, AI
Downloads: 42
Assigned Status: ASSIGNED
Deadline: 12/31/2025
```

**After:**

```
Submitted: 10/15/2024
Categories: Computer Science, AI
Downloads: 42
Adviser: Dr. John Smith          👈 NEW!
Status: ASSIGNED
Deadline: 12/31/2025
```

### **Technical Implementation**

#### **Helper Function**

```typescript
// Helper function to get adviser name by UUID
const getAdviserName = (adviserUuid: string): string => {
  const adviser = (advisersData?.content || []).find(
    (adv: User) => adv.uuid === adviserUuid
  );
  return adviser?.fullName || "Unknown Adviser";
};
```

#### **Usage in Component**

```typescript
{
  (() => {
    const assignment = getAssignmentForPaper(proposal.uuid);
    return assignment ? (
      <>
        <p>
          <span className="font-medium text-dynamic2">Adviser:</span>{" "}
          <span className="text-blue-600 dark:text-blue-400 font-semibold">
            {getAdviserName(assignment.adviserUuid)}
          </span>
        </p>
        <p>
          <span className="font-medium text-dynamic2">Status:</span>{" "}
          <Badge variant="outline">{assignment.status}</Badge>
        </p>
        <p>
          <span className="font-medium text-dynamic2">Deadline:</span>{" "}
          {new Date(assignment.deadline).toLocaleDateString()}
        </p>
      </>
    ) : null;
  })();
}
```

### **Styling Details**

| Element      | Light Mode | Dark Mode |
| ------------ | ---------- | --------- |
| Label        | Gray text  | Gray text |
| Adviser Name | Blue-600   | Blue-400  |
| Font Weight  | Semibold   | Semibold  |

---

## ✨ Feature 2: Disable Current Adviser When Reassigning

### **What's New**

When reassigning a paper, the currently assigned adviser is:

- **Disabled** - Cannot be selected again
- **Marked with badge** - Shows "Current" badge
- **Visually distinct** - Grayed out with lower opacity
- **Different button text** - Shows "Current Adviser" instead of "Reassign"

### **Visual Changes**

#### **In Adviser List (Reassigning)**

**Current Adviser Card:**

```tsx
<Card className="opacity-60 bg-slate-100 dark:bg-slate-800">
  <CardContent>
    <Avatar>...</Avatar>
    <div>
      <div className="flex items-center gap-2">
        <h4>Dr. John Smith</h4>
        <Badge className="bg-blue-100 text-blue-700">Current</Badge>
      </div>
      <Email>john.smith@university.edu</Email>
    </div>
    <Button disabled>Current Adviser</Button>
  </CardContent>
</Card>
```

**Other Adviser Card:**

```tsx
<Card className="hover:shadow-md hover:bg-card/80">
  <CardContent>
    <Avatar>...</Avatar>
    <div>
      <h4>Dr. Jane Doe</h4>
      <Email>jane.doe@university.edu</Email>
    </div>
    <Button>Reassign</Button>
  </CardContent>
</Card>
```

### **Technical Implementation**

```typescript
paginatedAdvisors.map((advisor: User) => {
  // Check if this adviser is currently assigned to this paper
  const currentAssignment = assigningPaper
    ? getAssignmentForPaper(assigningPaper.uuid)
    : null;
  const isCurrentlyAssigned =
    isReassigning && currentAssignment?.adviserUuid === advisor.uuid;

  return (
    <Card
      key={advisor.uuid}
      className={`border rounded-xl bg-card border-border shadow-sm transition-all duration-200 ${
        isCurrentlyAssigned
          ? "opacity-60 bg-slate-100 dark:bg-slate-800"
          : "hover:shadow-md hover:bg-card/80 backdrop-blur-sm"
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-center gap-5">
          <Avatar>...</Avatar>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <h4>{advisor.fullName}</h4>
              {isCurrentlyAssigned && (
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  Current
                </Badge>
              )}
            </div>
            <Email>{advisor.email}</Email>
          </div>

          <Button
            onClick={() => handleAssignAdvisor(advisor)}
            disabled={
              isAssigning ||
              isReassigningAdviser ||
              !deadline ||
              isCurrentlyAssigned
            }
            className="bg-secondary text-dynamic2"
          >
            {isCurrentlyAssigned
              ? "Current Adviser"
              : isAssigning || isReassigningAdviser
              ? isReassigning
                ? "Reassigning..."
                : "Assigning..."
              : isReassigning
              ? "Reassign"
              : "Assign"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
```

### **Visual States**

| State                         | Card Style            | Badge            | Button Text       | Button State |
| ----------------------------- | --------------------- | ---------------- | ----------------- | ------------ |
| Current Adviser (Reassigning) | Gray, 60% opacity     | "Current" (Blue) | "Current Adviser" | Disabled     |
| Other Advisers (Reassigning)  | Normal, hover effects | None             | "Reassign"        | Enabled      |
| All Advisers (New Assignment) | Normal, hover effects | None             | "Assign"          | Enabled      |

---

## 🎨 Dark Mode Support

### **Adviser Name**

```css
/* Light Mode */
text-blue-600

/* Dark Mode */
dark:text-blue-400
```

### **Current Adviser Card**

```css
/* Light Mode */
bg-slate-100

/* Dark Mode */
dark:bg-slate-800
```

### **Current Badge**

```css
/* Light Mode */
bg-blue-100 text-blue-700

/* Dark Mode */
dark:bg-blue-900 dark:text-blue-300
```

---

## 🔄 User Flow Examples

### **Scenario 1: Viewing Assigned Paper**

```
Admin views proposal list
└─> Sees paper with "Assigned" badge
    └─> Sees adviser information:
        ├─ Adviser: Dr. John Smith       ✅ NEW!
        ├─ Status: ASSIGNED
        └─ Deadline: 12/31/2025
```

### **Scenario 2: Reassigning an Adviser**

```
Admin clicks "Reassign" button
└─> Modal opens with adviser list
    ├─ Dr. John Smith (Current)          👈 Grayed out
    │  └─ Button: "Current Adviser" (Disabled)
    ├─ Dr. Jane Doe
    │  └─ Button: "Reassign" (Enabled)
    └─ Dr. Robert Brown
       └─ Button: "Reassign" (Enabled)
```

### **Scenario 3: Assigning First Time**

```
Admin clicks "Assign Advisor" button
└─> Modal opens with adviser list
    ├─ Dr. John Smith
    │  └─ Button: "Assign" (Enabled)
    ├─ Dr. Jane Doe
    │  └─ Button: "Assign" (Enabled)
    └─> NO advisers are disabled or marked
```

---

## 🎯 Benefits

### **1. Better Visibility**

- Admins can see who is assigned without memorizing UUIDs
- Quick identification of adviser assignments
- Improved paper overview

### **2. Prevent Errors**

- Cannot accidentally reassign the same adviser
- Clear visual indication of current assignment
- Reduces confusion during reassignment

### **3. Improved UX**

- Clear feedback about current state
- Disabled button prevents accidental clicks
- Badge makes it obvious who is currently assigned

### **4. Professional Appearance**

- Human-readable names instead of technical IDs
- Color-coded information (blue for adviser name)
- Consistent with modern UI patterns

---

## 📊 Implementation Summary

### **New Helper Function**

- `getAdviserName(adviserUuid: string): string`
- Looks up adviser by UUID in advisers data
- Returns full name or "Unknown Adviser" fallback

### **Enhanced Display**

- Adviser name shown in blue (both light/dark mode)
- Three-line format: Adviser → Status → Deadline
- Clear visual hierarchy with proper spacing

### **Smart Disabling Logic**

- Only applies when `isReassigning === true`
- Compares `advisor.uuid` with `currentAssignment.adviserUuid`
- Adds visual indicators (opacity, background, badge)
- Updates button text to "Current Adviser"

---

## ✅ Validation & Edge Cases

### **Missing Adviser Data**

```typescript
return adviser?.fullName || "Unknown Adviser";
```

If adviser is not found, displays "Unknown Adviser"

### **No Assignment**

```typescript
return assignment ? (
  // Display adviser info
) : null;
```

Only shows adviser info if paper is assigned

### **Assigning (Not Reassigning)**

```typescript
const isCurrentlyAssigned =
  isReassigning && currentAssignment?.adviserUuid === advisor.uuid;
```

Disable logic only applies when reassigning, not initial assignment

---

## 🔧 Files Modified

1. **`src/components/proposals/proposal-table.tsx`**
   - Added `getAdviserName()` helper function
   - Updated assignment info display to show adviser name
   - Enhanced adviser card with disable logic
   - Added "Current" badge for assigned adviser

---

## 🎉 Result

The proposal table now provides:

1. ✅ **Human-readable adviser names** instead of UUIDs
2. ✅ **Visual distinction** of currently assigned adviser
3. ✅ **Prevention of same-adviser reassignment**
4. ✅ **Clear feedback** with "Current" badge
5. ✅ **Disabled state** for current adviser
6. ✅ **Context-aware button text** ("Current Adviser" vs "Reassign")
7. ✅ **Full dark mode support**

All features work seamlessly together to create a more intuitive and error-free adviser assignment experience! 🚀
