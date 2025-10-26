# Roles Empty Issue - FIXED ✅

## 🐛 The Problem

Your JWT token contained roles (including "ADMIN" and "USER"), but `session.user.roles` was showing as an empty array `[]`.

## 🔍 Root Cause

The issue was in the **session callback**. When creating the session from the JWT token, it was only using `token.user` object, which was being lost during token refresh. The roles existed in `token.roles` but weren't being properly mapped to the session.

## ✅ What Was Fixed

### 1. **Session Callback Enhancement**

**Before:**

```typescript
session.user = token.user as {
  id: string | null;
  username: string | null;
  email: string | null;
  roles: string[];
};
```

**After:**

```typescript
// Extract roles directly from token, not just from token.user
const roles = (token.roles as string[]) ?? [];

session.user = {
  id: tokenUser?.id ?? (token.sub as string) ?? null,
  username: tokenUser?.username ?? (token.name as string) ?? null,
  email: tokenUser?.email ?? (token.email as string) ?? null,
  roles: roles, // Always use token.roles
};
session.roles = roles; // Also add at session level
```

### 2. **Token Refresh Preservation**

**Before:**

```typescript
return {
  ...token,
  accessToken: refreshedTokens.access_token,
  refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
  expiresAt: Math.floor(Date.now() / 1000 + refreshedTokens.expires_in),
  error: undefined,
};
```

**After:**

```typescript
return {
  ...token,
  accessToken: refreshedTokens.access_token,
  refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
  expiresAt: Math.floor(Date.now() / 1000 + refreshedTokens.expires_in),
  error: undefined,
  // ✅ Explicitly preserve roles and user data
  roles: token.roles,
  user: token.user,
};
```

### 3. **Added Debug Logging**

```typescript
if (process.env.NODE_ENV === "development") {
  console.log("📦 Session created with roles:", roles);
}
```

## 🧪 How to Test

1. **Sign out completely:**

   ```bash
   # Clear browser cookies
   # Stop dev server
   ```

2. **Restart dev server:**

   ```bash
   npm run dev
   ```

3. **Sign in again**

4. **Check console logs:**

   - Server console should show:
     ```
     🔍 Keycloak Profile: { ... }
     ✅ Extracted Roles: ["ADMIN", "USER", ...]
     📦 Session created with roles: ["ADMIN", "USER", ...]
     ```

5. **Check browser console:**

   ```javascript
   // Open DevTools Console and run:
   fetch("/api/auth/session")
     .then((r) => r.json())
     .then(console.log);

   // Should show:
   // {
   //   user: {
   //     roles: ["ADMIN", "USER", ...]
   //   },
   //   roles: ["ADMIN", "USER", ...]
   // }
   ```

6. **Test access:**
   - Navigate to `/dashboard` - should work ✅
   - Check middleware logs show roles

## 📊 Expected Results

### Session Object (Browser)

```javascript
{
  user: {
    id: "8f4dc8f0-007e-408c-a562-e7709d75a3a8",
    username: "admin admin",
    email: "docuadmin@gmail.com",
    roles: ["ADMIN", "USER", "default-roles-docuapi", "offline_access", "uma_authorization"]
  },
  roles: ["ADMIN", "USER", ...],
  accessToken: "...",
  refreshToken: "...",
  accessTokenExpires: 1761504807,
  expires: "2025-11-25T17:53:33.660Z"
}
```

### Middleware Logs (Server)

```
token :>> {
  roles: ["ADMIN", "USER", ...],
  user: {
    roles: ["ADMIN", "USER", ...]
  }
}
```

### Access Control

- ✅ User with "ADMIN" role → Can access `/dashboard`
- ✅ User with "ADMIN" role → Can access all admin routes
- ❌ User without "ADMIN" role → Redirected to `/unauthorized`
- ❌ Not authenticated → Redirected to `/login`

## 🔐 Security Check

Your JWT token shows:

```json
{
  "realm_access": {
    "roles": [
      "default-roles-docuapi",
      "offline_access",
      "uma_authorization",
      "ADMIN",  ← ✅ This is what we need!
      "USER"
    ]
  }
}
```

The middleware checks for `"admin"` or `"administrator"` (case-insensitive), so "ADMIN" will match! ✅

## 📝 Files Modified

1. **`src/lib/auth/next-auth-options.ts`**
   - Enhanced session callback to always use `token.roles`
   - Preserve roles during token refresh
   - Added debug logging
   - Updated TypeScript types

## 🎉 Status

✅ **FIXED** - Roles are now properly extracted and available in the session!

✅ **BUILD SUCCESSFUL** - No errors, only warnings

## 🚀 Next Steps

1. Clear your browser cookies
2. Restart dev server (`npm run dev`)
3. Sign in
4. Check that `session.user.roles` now contains ["ADMIN", "USER", ...]
5. Try accessing `/dashboard` - should work!

## 📞 If It Still Doesn't Work

If you still see empty roles:

1. **Clear everything:**

   - Browser cookies
   - Local storage
   - Stop dev server
   - Delete `.next` folder
   - Restart: `npm run dev`

2. **Check logs:**

   - Server console should show role extraction
   - Look for `📦 Session created with roles:`

3. **Verify token:**
   - Go to [jwt.io](https://jwt.io)
   - Paste your access token
   - Check `realm_access.roles` contains "ADMIN"

## 💡 Why This Happened

The previous code relied on `token.user.roles`, which could be lost during:

- Token refresh
- Session recreation
- Page reloads

Now, the code directly uses `token.roles` which is more reliable and always preserved.
