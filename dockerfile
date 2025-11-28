# 1. Install dependencies only when needed
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# ✅ FIXED: Added = sign (Line 13)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3. Production image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /app

# ✅ FIXED: Added = signs (Lines 20 & 21)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# ✅ FIXED: Added = signs (Lines 35 & 36)
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
# ... previous lines ...

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# --- NEW: VAULT CONFIGURATION DEFAULTS ---
ENV VAULT_URI="http://127.0.0.1:8200"
ENV VAULT_AUTHENTICATION="TOKEN"
# Default to dummy values so build doesn't fail; override these at runtime!
ENV VAULT_ROLE="my-role"
ENV VAULT_BACKEND="secret/data"
ENV VAULT_KUBERNETES_PATH="kubernetes"
# -----------------------------------------


CMD ["node", "server.js"]