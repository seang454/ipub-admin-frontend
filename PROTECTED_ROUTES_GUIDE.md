# Protected Routes Guide

This application implements a comprehensive role-based access control (RBAC) system to protect admin routes.

## Overview

The system uses **two layers of protection**:

1. **Server-side middleware** - First line of defense at the edge
2. **Client-side ProtectedRoute component** - Additional UI-level protection

## Server-Side Protection (Middleware)

The middleware (`src/middleware.ts`) automatically protects all admin routes and checks for the ADMIN role.

### Protected Routes

All routes in the `(admin)` folder are automatically protected:

- `/dashboard`
- `/users`
- `/students`
- `/advisers`
- `/papers`
- `/papersDetail`
- `/proposals`
- `/notification`
- `/generate`

### How It Works

1. **Authentication Check**: Verifies user has a valid JWT token
2. **Role Check**: Verifies user has "admin" or "administrator" role (case-insensitive)
3. **Redirect Logic**:
   - Not authenticated → redirects to `/login`
   - Authenticated but not admin → redirects to `/unauthorized`
   - Authenticated and admin → allows access

### Middleware Code

```typescript
// Check if user has admin role (case-insensitive)
const roles = token?.roles as string[] | undefined;
const isAdmin =
  roles?.some(
    (role) =>
      role.toLowerCase() === "admin" || role.toLowerCase() === "administrator"
  ) ?? false;

// If user is authenticated but NOT an admin
if (isValid && !isAdmin && adminProtectedRoute) {
  return NextResponse.redirect(new URL("/unauthorized", req.url));
}
```

## Client-Side Protection (ProtectedRoute Component)

For additional security and better UX, you can wrap admin pages with the `ProtectedRoute` component.

### Usage

```tsx
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>Admin content here</div>
    </ProtectedRoute>
  );
}
```

### Props

- `requiredRole`: `"admin" | "user" | "adviser" | "student"` (default: "admin")
- `fallbackUrl`: Where to redirect unauthorized users (default: "/unauthorized")
- `children`: The protected content

### Example with Different Roles

```tsx
// Require admin role
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>

// Require adviser role
<ProtectedRoute requiredRole="adviser">
  <AdviserPanel />
</ProtectedRoute>

// Custom fallback URL
<ProtectedRoute requiredRole="admin" fallbackUrl="/custom-error">
  <SensitiveData />
</ProtectedRoute>
```

## Custom Hooks

### useIsAdmin()

Check if current user is an admin:

```tsx
import { useIsAdmin } from "@/components/auth/ProtectedRoute";

function MyComponent() {
  const isAdmin = useIsAdmin();

  return (
    <div>
      {isAdmin ? <button>Admin Action</button> : <p>Admin only feature</p>}
    </div>
  );
}
```

### useHasRole(role: string)

Check if user has a specific role:

```tsx
import { useHasRole } from "@/components/auth/ProtectedRoute";

function MyComponent() {
  const isAdviser = useHasRole("adviser");
  const isStudent = useHasRole("student");

  return (
    <div>
      {isAdviser && <AdviserFeatures />}
      {isStudent && <StudentFeatures />}
    </div>
  );
}
```

## Role Configuration

Roles are obtained from Keycloak and stored in the JWT token:

### Keycloak Setup

1. Roles are defined in Keycloak realm or client
2. Common roles: "admin", "administrator", "adviser", "student", "user"
3. Roles are case-insensitive in this implementation

### Token Structure

```typescript
{
  accessToken: "...",
  refreshToken: "...",
  roles: ["admin", "user"],  // Array of role strings
  user: {
    id: "...",
    username: "...",
    email: "...",
    roles: ["admin", "user"]
  }
}
```

## Unauthorized Page

Users without proper permissions are redirected to `/unauthorized`, which displays:

- Clear error message
- User's current email
- Option to go home
- Option to sign out

## Testing

### Test as Admin

1. Sign in with a user that has "admin" role in Keycloak
2. Try accessing `/dashboard` - should succeed
3. All admin routes should be accessible

### Test as Non-Admin

1. Sign in with a user without "admin" role
2. Try accessing `/dashboard` - should redirect to `/unauthorized`
3. All admin routes should be blocked

### Test Unauthenticated

1. Sign out
2. Try accessing `/dashboard` - should redirect to `/login`

## Security Best Practices

1. ✅ **Server-side validation first** - Middleware catches unauthorized access before page loads
2. ✅ **Client-side validation second** - Component provides additional UX protection
3. ✅ **Token-based auth** - JWT tokens with role claims
4. ✅ **Automatic token refresh** - Handles expired tokens gracefully
5. ✅ **Case-insensitive roles** - Prevents issues with role naming
6. ✅ **Clear error messages** - Users understand why access is denied

## Troubleshooting

### User has admin role but still can't access

1. Check token in browser DevTools:
   ```typescript
   // In development, check console for token logs
   // Look for: token :>> { ... roles: [...] }
   ```
2. Verify role name matches exactly (case-insensitive, but check for typos)
3. Clear browser cookies and sign in again
4. Check Keycloak role assignments

### Middleware not working

1. Verify `NEXTAUTH_SECRET` is set in `.env`
2. Check middleware matcher includes your route
3. Restart development server after middleware changes

### Infinite redirect loop

1. Check if `/unauthorized` or `/login` is in middleware matcher
2. Ensure auth routes don't have conflicting protection
3. Verify token validation logic

## Future Enhancements

Potential improvements:

- [ ] Permission-based access (beyond roles)
- [ ] Route-specific role requirements
- [ ] Audit logging for access attempts
- [ ] Rate limiting for unauthorized attempts
- [ ] Multi-factor authentication for admin routes
