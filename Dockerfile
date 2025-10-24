# ==========================================
# 🏗️ DEPENDENCIES STAGE - Install dependencies only
# ==========================================
FROM node:20-alpine AS deps

# Install necessary build tools for native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with clean install
RUN npm ci

# ==========================================
# 🔨 BUILDER STAGE - Build the Next.js app
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Set environment to production for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application (standalone output enabled in next.config.ts)
RUN npm run build

# ==========================================
# 🚀 RUNNER STAGE - Production runtime (70% smaller!)
# ==========================================
FROM node:20-alpine AS runner

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