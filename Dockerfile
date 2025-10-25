# ==========================================
# 🏗️ DEPENDENCIES STAGE - Install dependencies only
# ==========================================
FROM node:20-alpine AS deps

# Install necessary build tools for native modules
# These are required for packages like: fabric, pg, canvas, etc.
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with clean install
# Note: We need ALL dependencies including devDependencies for the build stage
RUN npm ci --no-audit

# ==========================================
# 🔨 BUILDER STAGE - Build the Next.js app
# ==========================================
FROM node:20-alpine AS builder

# Install build dependencies (needed for canvas/fabric during build)
RUN apk add --no-cache \
    libc6-compat \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Set environment to production for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Accept NEXT_PUBLIC_ environment variables as build arguments
# These are embedded into the client-side JavaScript during build
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# Build the Next.js application (standalone output enabled in next.config.ts)
RUN npm run build

# ==========================================
# 🚀 RUNNER STAGE - Production runtime (70% smaller!)
# ==========================================
FROM node:20-alpine AS runner

# Install runtime libraries (needed for canvas/fabric at runtime)
RUN apk add --no-cache \
    libc6-compat \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone Next.js output (includes minimal node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port 3000
EXPOSE 3000

# Set hostname to allow external connections
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Health check with better error handling
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start the Next.js application using standalone server
CMD ["node", "server.js"]