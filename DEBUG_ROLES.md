# Debug Empty Roles - Step by Step

## Step 1: Verify the Code is Correct

Check that `src/lib/auth/next-auth-options.ts` has these exact lines:

### Around line 54:

```typescript
console.log("✅ Extracted Roles:", allRoles);
```

### Around line 147:

```typescript
console.log("📦 Session created with roles:", roles);
```

If these lines are missing, the file didn't save correctly.

## Step 2: Force Complete Refresh

Do this EXACTLY in order:

1. **Sign Out** - Click sign out button
2. **Close ALL browser tabs** of your app
3. **Stop Dev Server** - `Ctrl+C` in terminal
4. **Clear Build Cache**:
   ```bash
   Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
   ```
5. **Clear Node Modules Cache** (optional but recommended):
   ```bash
   npm cache clean --force
   ```
6. **Start Fresh**:
   ```bash
   npm run dev
   ```
7. **Open in Incognito/Private Window** - `Ctrl+Shift+N` or `Ctrl+Shift+P`
8. **Navigate to** `http://localhost:3000/login`
9. **Keep Terminal Visible** - You need to see server logs
10. **Sign In**

## Step 3: Watch Server Console During Sign In

The moment you click "Sign In" and get redirected back, you should see:

```
🔍 Keycloak Profile: {
  "sub": "...",
  "realm_access": {
    "roles": ["ADMIN", "USER", ...]
  }
}
🔍 Realm Access Roles: ["ADMIN", "USER", ...]
🔍 Resource Access: {...}
✅ Extracted Roles: ["ADMIN", "USER", ...]
📦 Session created with roles: ["ADMIN", "USER", ...]
```

## Step 4: Check Session in Browser

Run in browser console:

```javascript
fetch("/api/auth/session")
  .then((r) => r.json())
  .then((data) => {
    console.log("=== SESSION DEBUG ===");
    console.log("User:", data?.user);
    console.log("User Roles:", data?.user?.roles);
    console.log("Session Roles:", data?.roles);
    console.log("Session Expires:", data?.expires);
  });
```

## ✅ What Success Looks Like

### Server Console:

```
✅ Extracted Roles: ["default-roles-docuapi", "offline_access", "uma_authorization", "ADMIN", "USER"]
📦 Session created with roles: ["default-roles-docuapi", "offline_access", "uma_authorization", "ADMIN", "USER"]
```

### Browser Console:

```
User Roles: (5) ["default-roles-docuapi", "offline_access", "uma_authorization", "ADMIN", "USER"]
Session Roles: (5) ["default-roles-docuapi", "offline_access", "uma_authorization", "ADMIN", "USER"]
```

## ❌ If You DON'T See Server Logs

If you don't see the emoji logs in server console when signing in:

### Possibility 1: File Didn't Save

- Check `src/lib/auth/next-auth-options.ts`
- Make sure it has the console.log statements
- Save the file again
- Restart dev server

### Possibility 2: Not in Development Mode

- Check your `.env.local` file
- Make sure `NODE_ENV` is NOT set to `production`
- Or remove `NODE_ENV` entirely

### Possibility 3: Session Still Cached

Try this nuclear option:

```bash
# Stop server
Ctrl+C

# Delete everything
Remove-Item -Recurse -Force .next, node_modules\.cache -ErrorAction SilentlyContinue

# Restart
npm run dev
```

Then sign in using an **incognito window**.

## 🆘 Still Not Working?

If you've done ALL of the above and still see empty roles:

1. **Take a screenshot** of your server console output during sign-in
2. **Copy and paste** what you see in browser console from:
   ```javascript
   fetch("/api/auth/session")
     .then((r) => r.json())
     .then(console.log);
   ```
3. **Check** if you see ANY console.log output in server console at all

## Quick Verification Script

Add this to `src/app/page.tsx` temporarily:

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/next-auth-options";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div style={{ padding: 20 }}>
      <h1>Session Debug</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
```

Navigate to `/` and you'll see your session server-side.

## Test Command

Run this to verify your auth config loaded:

```bash
npx next info
```

Should show Next.js version and config details.
