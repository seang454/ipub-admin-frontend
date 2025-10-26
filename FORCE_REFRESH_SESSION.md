# Force Session Refresh - Get Roles Working

## The Problem

You're seeing empty roles because you're still using a session that was created **before** the fix. The new role extraction code only runs when creating a **new session**.

## 🔧 Steps to Force Fresh Session

### 1. Sign Out Completely

Click "Sign Out" in your application.

### 2. Clear Browser Cookies

**Chrome/Edge:**

1. Press `F12` to open DevTools
2. Go to `Application` tab
3. In left sidebar: `Cookies` → `http://localhost:3000`
4. Right-click → `Clear`
5. Also clear cookies for your Keycloak domain

**Or use Incognito/Private mode** to start fresh.

### 3. Stop Development Server

In your terminal where `npm run dev` is running:

- Press `Ctrl + C` to stop the server

### 4. Clear Next.js Cache

Run this command:

```bash
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
```

### 5. Restart Development Server

```bash
npm run dev
```

### 6. Sign In Again

1. Go to `http://localhost:3000/login`
2. Sign in with your admin credentials
3. **Watch the server console** for these logs:

```
🔍 Keycloak Profile: {...}
🔍 Realm Access Roles: ["default-roles-docuapi", "offline_access", "uma_authorization", "ADMIN", "USER"]
🔍 Resource Access: {...}
✅ Extracted Roles: ["default-roles-docuapi", "offline_access", "uma_authorization", "ADMIN", "USER"]
📦 Session created with roles: ["default-roles-docuapi", "offline_access", "uma_authorization", "ADMIN", "USER"]
```

If you see these logs, **roles are now working!**

### 7. Verify in Browser

Open browser console and run:

```javascript
fetch("/api/auth/session")
  .then((r) => r.json())
  .then((data) => console.log("Roles:", data.user.roles));
```

Should show:

```
Roles: ["default-roles-docuapi", "offline_access", "uma_authorization", "ADMIN", "USER"]
```

## ✅ Expected Result

After following these steps, your session should look like:

```javascript
{
  user: {
    id: "8f4dc8f0-007e-408c-a562-e7709d75a3a8",
    username: "admin admin",
    email: "docuadmin@gmail.com",
    roles: ["default-roles-docuapi", "offline_access", "uma_authorization", "ADMIN", "USER"]
  },
  roles: ["default-roles-docuapi", "offline_access", "uma_authorization", "ADMIN", "USER"],
  accessToken: "...",
  refreshToken: "...",
  accessTokenExpires: 1761505578,
  expires: "2025-11-25T18:06:20.397Z"
}
```

## 🚨 Still Not Working?

If roles are STILL empty after following all steps above:

### Check Server Console

When you sign in, you should see these logs. If you DON'T see them:

1. Make sure the file `src/lib/auth/next-auth-options.ts` has the latest changes
2. Make sure you stopped and restarted the dev server
3. Check for any errors in the server console

### If Logs Show Roles But Session Doesn't

If server logs show roles being extracted but the session still has empty roles:

1. Check that you're looking at the **new** session (check the `expires` timestamp)
2. Try using an incognito window to rule out cookie issues
3. Clear browser cache completely

### Debug Command

Add this to any page to see what's in your session:

```tsx
import { useSession } from "next-auth/react";

export default function DebugPage() {
  const { data: session } = useSession();
  return <pre>{JSON.stringify(session, null, 2)}</pre>;
}
```

## 💡 Why This is Necessary

NextAuth caches sessions. The old session was created with the old code that didn't properly extract roles. The new code needs to run during the **initial sign-in** to extract roles from the Keycloak profile.

Once you create a fresh session with the new code, roles will be:

- ✅ Extracted during sign-in
- ✅ Preserved during token refresh
- ✅ Available in session.user.roles
- ✅ Available in session.roles
- ✅ Used by middleware for access control

## 🎯 Quick Test Commands

```bash
# Stop server
Ctrl + C

# Clear cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Restart
npm run dev
```

Then clear cookies and sign in again!
