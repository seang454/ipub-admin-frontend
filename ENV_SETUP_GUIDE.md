# 🔐 Environment Variables Setup Guide

## Issue: `/undefined/` in API URLs

If you see URLs like `https://admin.docuhub.me/undefined/api/v1/...`, it means `NEXT_PUBLIC_API_BASE_URL` is not set correctly.

## Why This Happens

In Next.js, environment variables prefixed with `NEXT_PUBLIC_` are:

- ✅ **Build-time variables** - Embedded into JavaScript during `npm run build`
- ❌ **NOT runtime variables** - Cannot be changed after build
- ❌ **NOT from .env files** - Must be provided during Docker build

## Solution: Add GitHub Secret

### Step 1: Add to GitHub Secrets

1. Go to your repository: `https://github.com/seang454/ipub-admin-frontend`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add this secret:

```
Name: NEXT_PUBLIC_API_BASE_URL
Value: https://api.docuhub.me
```

(Replace with your actual API domain)

### Step 2: Verify Other Secrets

Make sure you have ALL these secrets configured:

#### GCP VM Configuration

- ✅ `GCE_VM_IP` - Your VM IP address
- ✅ `GCE_VM_USER` - SSH username
- ✅ `GCE_SSH_PRIVATE_KEY` - SSH private key
- ✅ `PAT_TOKEN` - GitHub Personal Access Token

#### Authentication (Server-side - Runtime)

- ✅ `NEXTAUTH_URL` - Your frontend URL (e.g., `https://admin.docuhub.me`)
- ✅ `NEXTAUTH_SECRET` - Random secret key
- ✅ `KEYCLOAK_CLIENT_ID` - Keycloak client ID
- ✅ `KEYCLOAK_CLIENT_SECRET` - Keycloak client secret
- ✅ `KEYCLOAK_ISSUER` - Keycloak issuer URL

#### Local Storage (Server-side - Runtime)

- ✅ `REACT_APP_SECURE_LOCAL_STORAGE_HASH_KEY` - Hash key
- ✅ `REACT_APP_SECURE_LOCAL_STORAGE_PREFIX` - Prefix
- ✅ `REACT_APP_SECURE_LOCAL_STORAGE_DISABLED_KEYS` - Disabled keys

#### API Configuration (Client-side - BUILD TIME)

- 🔴 **`NEXT_PUBLIC_API_BASE_URL`** - **MUST ADD THIS!**

### Step 3: Deploy

After adding the secret, commit and push:

```bash
git add Dockerfile .github/workflows/frontend.yml ENV_SETUP_GUIDE.md
git commit -m "Fix: Pass NEXT_PUBLIC_API_BASE_URL during Docker build"
git push origin main
```

## How It Works Now

### Before (Broken):

```
Docker Build → No NEXT_PUBLIC_API_BASE_URL → Build with undefined → API calls fail ❌
```

### After (Fixed):

```
Docker Build → --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.docuhub.me → Embedded in JS → API calls work ✅
```

## Local Development

For local development, create `.env.local`:

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://api.docuhub.me
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-dev-secret
KEYCLOAK_CLIENT_ID=your-client-id
KEYCLOAK_CLIENT_SECRET=your-client-secret
KEYCLOAK_ISSUER=https://your-keycloak.com/realms/your-realm
```

Then run:

```bash
npm run dev
```

## Verification

After deployment, check the browser console:

```javascript
// In browser console
console.log(process.env.NEXT_PUBLIC_API_BASE_URL);
// Should print: https://api.docuhub.me
// NOT: undefined
```

## Common Issues

### 1. Still seeing `/undefined/`?

- ✅ Check GitHub Secret is named exactly: `NEXT_PUBLIC_API_BASE_URL`
- ✅ Wait for new deployment to finish
- ✅ Hard refresh browser (Ctrl+Shift+R)
- ✅ Clear browser cache

### 2. 404 errors?

- ✅ Verify your API is running at the URL
- ✅ Check API endpoints match (e.g., `/api/v1/auth/users`)
- ✅ Verify CORS settings on your API

### 3. Still broken after adding secret?

- ✅ Make sure you pushed the updated Dockerfile
- ✅ Check GitHub Actions logs for build errors
- ✅ Verify the build log shows the environment variable

## Need Help?

Check the deployment logs in GitHub Actions to see if the build argument was passed correctly.

Look for this line in the logs:

```
DOCKER_BUILDKIT=1 docker build --build-arg NEXT_PUBLIC_API_BASE_URL=***
```

The `***` means the secret is being passed (GitHub hides secret values in logs).

---

**Built with ❤️ by the DocuHub Team**
