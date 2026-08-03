# Install dependencies only when needed
FROM node:22-slim AS deps
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y libc6 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --legacy-peer-deps 2>/dev/null || \
    npm install --prefer-offline --no-audit --legacy-peer-deps

# Rebuild the source code only when necessary
FROM node:22-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Build-time API URL (override at run if needed)
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# Production runner, copy all the files and run next
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
