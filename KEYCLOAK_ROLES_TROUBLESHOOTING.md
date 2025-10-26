# Keycloak Roles Troubleshooting Guide

## Issue: Empty Roles Array

If you're seeing that `roles` is empty or undefined, follow these steps to diagnose and fix the issue.

## Step 1: Check Development Console Logs

After signing in, check your server console (where you run `npm run dev`) for these debug logs:

```
🔍 Keycloak Profile: { ... }
🔍 Realm Access Roles: [...]
🔍 Resource Access: { ... }
✅ Extracted Roles: [...]
```

These logs will show you exactly what Keycloak is returning.

## Step 2: Verify Keycloak Role Configuration

### In Keycloak Admin Console:

1. **Go to your Realm** (e.g., `master` or your custom realm)

2. **Check Realm Roles:**

   - Navigate to: `Realm Settings` → `Roles`
   - Verify `admin` role exists
   - Note: Role names are case-insensitive in our implementation

3. **Assign Realm Role to User:**

   - Navigate to: `Users` → Select your user → `Role Mapping` tab
   - Click `Assign role`
   - Select `admin` from the list
   - Click `Assign`

4. **Check Client Roles (if using client-specific roles):**
   - Navigate to: `Clients` → Select your client → `Roles` tab
   - Verify `admin` role exists in client
   - Assign to user: `Users` → Select user → `Role Mapping` → `Assign role` → Filter by client

## Step 3: Configure Client Scopes (IMPORTANT!)

Keycloak needs to be configured to include roles in the token:

### Option A: Use Realm Roles (Recommended)

1. Go to: `Client Scopes` → `roles` → `Mappers` tab
2. Find or create `realm roles` mapper
3. Ensure settings:
   - **Mapper Type**: User Realm Role
   - **Token Claim Name**: `realm_access.roles`
   - **Add to ID token**: ON
   - **Add to access token**: ON
   - **Add to userinfo**: ON

### Option B: Use Client Roles

1. Go to: `Clients` → Your client → `Client scopes` tab
2. Ensure `roles` scope is assigned (Default or Optional)
3. Go to: `Client Scopes` → `roles` → `Mappers` tab
4. Ensure `client roles` mapper exists with:
   - **Token Claim Name**: `resource_access.${client_id}.roles`
   - **Add to ID token**: ON
   - **Add to access token**: ON

## Step 4: Update Your Client Settings

In Keycloak Admin Console → `Clients` → Your Client:

1. **General Settings:**

   - Client authentication: ON (if confidential)
   - Authorization: OFF (unless needed)

2. **Capability config:**

   - Client authentication: ON
   - Standard flow: ON
   - Direct access grants: ON (optional)

3. **Login settings:**
   - Valid redirect URIs: `http://localhost:3000/*` (for dev)
   - Valid post logout redirect URIs: `http://localhost:3000/*`
   - Web origins: `http://localhost:3000`

## Step 5: Verify Environment Variables

Check your `.env.local` file:

```env
KEYCLOAK_CLIENT_ID=your-client-id
KEYCLOAK_CLIENT_SECRET=your-client-secret
KEYCLOAK_ISSUER=https://your-keycloak-domain/realms/your-realm
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## Step 6: Clear Session and Test

1. Sign out completely
2. Clear browser cookies for your domain
3. Restart your Next.js dev server: `npm run dev`
4. Sign in again
5. Check the console logs for the role extraction

## Expected Console Output (Success)

```
🔍 Keycloak Profile: {
  "sub": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "realm_access": {
    "roles": ["admin", "user", "offline_access", "uma_authorization", "default-roles-master"]
  },
  "resource_access": {
    "account": {
      "roles": ["manage-account", "view-profile"]
    }
  }
}
🔍 Realm Access Roles: ["admin", "user", ...]
🔍 Resource Access: { account: { roles: [...] } }
✅ Extracted Roles: ["admin", "user", "manage-account", "view-profile", ...]
```

## Common Issues and Solutions

### Issue 1: Roles exist in Keycloak but not in token

**Solution:** Configure client scopes mapper (see Step 3)

### Issue 2: Getting only default roles

**Solution:**

- Ensure user has the `admin` role assigned in Keycloak
- Check Role Mapping for the user (Step 2.3)

### Issue 3: Roles showing in console but still can't access

**Solution:**

- Check middleware is looking for the correct role name
- Our middleware checks for `"admin"` or `"administrator"` (case-insensitive)
- Add console.log in middleware to debug:
  ```typescript
  console.log("Token roles in middleware:", token?.roles);
  ```

### Issue 4: Client ID mismatch

**Solution:**

- Ensure `KEYCLOAK_CLIENT_ID` in `.env.local` matches your Keycloak client exactly
- The updated code now checks multiple locations:
  - `realm_access.roles`
  - `resource_access[KEYCLOAK_CLIENT_ID].roles`
  - `resource_access.account.roles`

### Issue 5: Roles disappear after token refresh

**Solution:**

- This is now fixed in the updated `next-auth-options.ts`
- Roles are preserved during token refresh

## Keycloak Default Roles to Ignore

These roles are automatically added by Keycloak and should be filtered if needed:

- `offline_access`
- `uma_authorization`
- `default-roles-{realm-name}`
- `manage-account`
- `manage-account-links`
- `view-profile`

## Testing Role Assignment

### Test Script:

```typescript
// Add to a test page
import { useSession } from "next-auth/react";

export default function TestPage() {
  const { data: session } = useSession();

  return <pre>{JSON.stringify(session, null, 2)}</pre>;
}
```

Access `/test` and check if roles appear in the session data.

## Alternative: Decode JWT Token Manually

If you want to see what's in the raw JWT token:

1. Sign in to your app
2. Open browser DevTools → Application → Cookies
3. Find the `next-auth.session-token` cookie
4. Copy its value
5. Go to [jwt.io](https://jwt.io)
6. Paste the token
7. Check the payload for roles

## Still Having Issues?

1. Check Keycloak server logs for errors
2. Verify Keycloak version compatibility (tested with Keycloak 20+)
3. Ensure your Keycloak realm is properly configured
4. Try creating a fresh user in Keycloak and assigning `admin` role
5. Check if CORS is properly configured in Keycloak

## Contact Your Keycloak Administrator

If you're not the Keycloak administrator, ask them to:

1. Verify the user has the `admin` role
2. Check client scope mappers are configured
3. Ensure the client has proper redirect URIs
4. Confirm roles are being included in the token

## Quick Fix: Manually Add Test Role

For quick testing, you can temporarily bypass role checking:

```typescript
// In middleware.ts (DEVELOPMENT ONLY!)
const isAdmin = true; // WARNING: Remove this before production!
```

**⚠️ IMPORTANT: Never deploy this to production!**
