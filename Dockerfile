# Multi-stage build for optimized production image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables must be present at build time for static generation
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Устанавливаем зависимости
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Создаем пользователя и группу
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /app/.next /app/.next/static /app/public

# Копируем только необходимые файлы с правильными правами
COPY --from=builder /app/next.config.js .
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Выводим список файлов для отладки
RUN ls -la /app && ls -la /app/.next/standalone

# Устанавливаем рабочую директорию и пользователя
WORKDIR /app
USER nextjs

# Устанавливаем порт по умолчанию
EXPOSE 3001

# Copy additional files needed for the application
COPY --from=builder --chown=nextjs:nodejs /app/models ./models
COPY --from=builder --chown=nextjs:nodejs /app/lib ./lib
COPY --from=builder --chown=nextjs:nodejs /app/create-admin.js ./create-admin.js
COPY --from=builder --chown=nextjs:nodejs /app/seed-data.js ./seed-data.js
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Устанавливаем переменные окружения
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Команда по умолчанию (может быть переопределена в docker-compose)
CMD ["node", "server.js"]

# Seeder image for running one-off scripts
FROM base AS seeder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy seed files
COPY seed-data.js ./seed-data.js
COPY seed-data-safe.js ./seed-data-safe.js

# Default command for seeder
CMD ["node", "seed-data-safe.js"]

# ---- Final stage (production image) ----
# Ensure the Next.js application stage is the last one so that platforms
# which build the *last* stage by default (e.g. Dokploy) pick it up.
FROM runner AS production

# Inherit everything from `runner`. The CMD is set again just for clarity.
CMD ["node", ".next/standalone/server.js"]
