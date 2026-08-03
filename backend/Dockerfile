# Build stage
FROM node:22-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
# Use BuildKit cache mount to speed up npm install on rebuilds
RUN --mount=type=cache,target=/root/.npm \
  npm ci --prefer-offline --no-audit

# Copy only prisma schema
COPY prisma ./prisma
# Generate Prisma Client
RUN npx prisma generate

COPY . .
RUN npm run build

# Production stage
FROM node:22-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# Wait for DB and run migrations, then start
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "dist/src/main.js"]
