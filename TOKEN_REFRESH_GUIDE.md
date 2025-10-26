# 🔄 Automatic Token Refresh System

## Overview

Your application now has a **fully automatic token refresh system** that:

- ✅ Refreshes tokens **before they expire** (1 minute before)
- ✅ Re-extracts roles from the new token (handles role updates)
- ✅ Works seamlessly without user interruption
- ✅ Handles both client-side and server-side scenarios
- ✅ Preserves user session and roles

## How It Works

### 1. **Client-Side Auto-Refresh** (`useTokenRefresh` hook)

**Location**: `src/hooks/useTokenRefresh.ts`

The hook runs in `HomeLayoutWrapper` and automatically:

- Monitors the token expiration time
- Schedules a refresh 1 minute before expiration
- Calls `update()` from `useSession()` to trigger NextAuth refresh
- Logs refresh status to the console for debugging

**Usage**:

```typescript
import { useTokenRefresh } from "@/hooks/useTokenRefresh";

function MyComponent() {
  useTokenRefresh(); // That's it!
  // ...
}
```

**Console Output**:

```
🔄 Token refresh scheduled: {
  expiresAt: "10/26/2025, 5:30:00 PM",
  timeUntilExpiry: "3599s",
  refreshIn: "3539s" (1 minute before expiry)
}
🔄 Refreshing token...
✅ Token refreshed successfully
```

### 2. **Server-Side Token Refresh** (NextAuth JWT Callback)

**Location**: `src/lib/auth/next-auth-options.ts` (lines 144-214)

When a token expires, the JWT callback:

1. Detects expiration
2. Calls `refreshTokenRequest()` with the refresh token
3. Receives a new access token from Keycloak
4. **Decodes the new access token** to extract updated roles
5. Updates the session with new token and roles

**Key Features**:

- ✅ Re-extracts roles from new access token (not just preserved)
- ✅ Handles role changes (if admin grants/removes roles in Keycloak)
- ✅ Preserves user data (id, username, email)
- ✅ Graceful fallback if role extraction fails

**Code Snippet**:

```typescript
// Re-extract roles from the new access token
const accessTokenPayload = JSON.parse(jsonPayload);
const realmRoles = accessTokenPayload?.realm_access?.roles ?? [];
const clientRoles =
  accessTokenPayload?.resource_access?.[clientId]?.roles ?? [];
const accountRoles = accessTokenPayload?.resource_access?.account?.roles ?? [];

updatedRoles = [...new Set([...realmRoles, ...clientRoles, ...accountRoles])];
```

### 3. **Middleware Grace Period**

**Location**: `src/middleware.ts` (lines 15-22)

The middleware now gives a **5-minute grace period** for token refresh:

```typescript
const REFRESH_GRACE_PERIOD = 5 * 60; // 5 minutes in seconds
const isValid =
  !!token?.accessToken &&
  (!token?.expiresAt || nowInSeconds < token.expiresAt + REFRESH_GRACE_PERIOD);
```

**Why?**

- Prevents redirect to login during the refresh process
- Allows time for the client-side hook to refresh the token
- Smoother user experience

## Token Refresh Flow

```
User Session Active
       ↓
Token Expires in 1 minute
       ↓
useTokenRefresh hook detects expiration
       ↓
Calls update() from useSession()
       ↓
NextAuth JWT callback triggered
       ↓
Checks if token is expired (lines 139-142)
       ↓
Calls refreshTokenRequest() (line 147)
       ↓
Receives new access_token from Keycloak
       ↓
Decodes new access_token (lines 156-167)
       ↓
Extracts updated roles (lines 169-178)
       ↓
Updates JWT token with new data (lines 190-207)
       ↓
Session callback updates session object
       ↓
User continues seamlessly with new token
```

## Testing

### Test 1: Verify Auto-Refresh is Working

1. Sign in at http://localhost:3001/login
2. Open browser console (F12)
3. Look for:

```
🔄 Token refresh scheduled: { ... }
```

4. Wait until refresh time (or adjust token expiry in Keycloak)
5. See:

```
🔄 Refreshing token...
✅ Token refreshed successfully
🔄 Updated roles after refresh: ["ADMIN", "USER", ...]
```

### Test 2: Verify Roles are Preserved

1. After refresh, check session:

```javascript
// In browser console
console.log(session.user.roles);
// Should show: ["ADMIN", "USER", ...]
```

### Test 3: Verify Role Updates

1. While logged in, go to Keycloak admin console
2. Add or remove a role from your user
3. Wait for next token refresh
4. Check console:

```
🔄 Updated roles after refresh: ["NEW_ROLE", "ADMIN", "USER"]
```

## Debugging

### Enable Detailed Logs

All refresh logs are automatically enabled in development mode:

- `🔄 Token refresh scheduled` - Refresh is scheduled
- `🔄 Refreshing token...` - Refresh is starting
- `✅ Token refreshed successfully` - Refresh succeeded
- `🔄 Updated roles after refresh` - New roles extracted
- `⚠️ Failed to extract roles` - Fallback to old roles
- `❌ Token refresh failed` - Refresh failed (user will need to re-login)

### Common Issues

**Issue**: Token refresh not triggering
**Solution**: Ensure `useTokenRefresh()` is called in `HomeLayoutWrapper`

**Issue**: Roles empty after refresh
**Solution**: Check `next-auth-options.ts` lines 197-205 ensure roles are properly extracted

**Issue**: User redirected to login during refresh
**Solution**: Check middleware grace period (should be 5 minutes)

## Configuration

### Adjust Refresh Timing

In `src/hooks/useTokenRefresh.ts` line 23:

```typescript
// Refresh 1 minute before expiration
const refreshTime = timeUntilExpiry - 60 * 1000;

// Change to 5 minutes before:
const refreshTime = timeUntilExpiry - 5 * 60 * 1000;
```

### Adjust Middleware Grace Period

In `src/middleware.ts` line 19:

```typescript
const REFRESH_GRACE_PERIOD = 5 * 60; // 5 minutes

// Change to 10 minutes:
const REFRESH_GRACE_PERIOD = 10 * 60;
```

## Security Notes

- ✅ Refresh tokens are stored securely in HttpOnly cookies
- ✅ Access tokens are never exposed to the client
- ✅ Roles are always extracted from the server-side access token
- ✅ Failed refresh triggers re-authentication (redirect to login)
- ✅ Middleware validates token on every protected route access

## Summary

Your token refresh system is now:

- **Automatic**: No user action required
- **Seamless**: No interruption to user experience
- **Secure**: Tokens handled server-side
- **Dynamic**: Roles updated on every refresh
- **Robust**: Graceful fallbacks and error handling

The user will never be logged out due to token expiration as long as:

1. They are actively using the application (client-side refresh)
2. The refresh token is still valid (typically 30 days in Keycloak)
3. Their Keycloak session is still active

🎉 **You're all set!**
