# 1. Install dependencies only when needed
FROM node:20-alpine AS deps
# 🚀 FIX: Install OpenSSL so Prisma can detect it
RUN apk update && apk add --no-cache openssl libc6-compat

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ✅ Generate Prisma Client inside Docker (Now it will find OpenSSL 3.0)
RUN npx prisma generate

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3. Production image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 🚀 FIX: Install OpenSSL in the runner too
RUN apk update && apk add --no-cache openssl libc6-compat
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy the generated prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Defaults
ENV VAULT_URI="http://127.0.0.1:8200"
ENV VAULT_AUTHENTICATION="TOKEN"

CMD ["node", "server.js"]