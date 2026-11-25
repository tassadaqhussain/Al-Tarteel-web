# Install dependencies only when needed
FROM node:22-slim AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --legacy-peer-deps 2>/dev/null || \
    npm install --prefer-offline --no-audit --legacy-peer-deps

# Inherit deps directly instead of copying node_modules (~600 MB disk & time saved)
FROM deps AS builder
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Build-time API URL — must be the public HTTPS API in production images.
# Override via compose: NEXT_PUBLIC_API_URL=https://quranpilot.com/api/v1
ARG NEXT_PUBLIC_API_URL=https://quranpilot.com/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ARG NEXT_PUBLIC_SITE_URL=https://quranpilot.com
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

ARG NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
ENV NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=$NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION

ARG GOOGLE_SITE_VERIFICATION=
ENV GOOGLE_SITE_VERIFICATION=$GOOGLE_SITE_VERIFICATION

ARG NEXT_PUBLIC_BING_SITE_VERIFICATION=
ENV NEXT_PUBLIC_BING_SITE_VERIFICATION=$NEXT_PUBLIC_BING_SITE_VERIFICATION

ARG BING_SITE_VERIFICATION=
ENV BING_SITE_VERIFICATION=$BING_SITE_VERIFICATION

ARG NEXT_PUBLIC_ANALYTICS_PROVIDER=
ENV NEXT_PUBLIC_ANALYTICS_PROVIDER=$NEXT_PUBLIC_ANALYTICS_PROVIDER

ARG NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
ENV NEXT_PUBLIC_PLAUSIBLE_DOMAIN=$NEXT_PUBLIC_PLAUSIBLE_DOMAIN

ARG NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC=
ENV NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC=$NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC

ARG NEXT_PUBLIC_GA_ID=
ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID

ARG NEXT_PUBLIC_GA_MEASUREMENT_ID=
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID

ARG NEXT_PUBLIC_UMAMI_WEBSITE_ID=
ENV NEXT_PUBLIC_UMAMI_WEBSITE_ID=$NEXT_PUBLIC_UMAMI_WEBSITE_ID

ARG NEXT_PUBLIC_UMAMI_SRC=
ENV NEXT_PUBLIC_UMAMI_SRC=$NEXT_PUBLIC_UMAMI_SRC

ARG SITEMAP_LASTMOD=
ENV SITEMAP_LASTMOD=$SITEMAP_LASTMOD

ARG NEXT_PUBLIC_BUILD_DATE=
ENV NEXT_PUBLIC_BUILD_DATE=$NEXT_PUBLIC_BUILD_DATE

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
