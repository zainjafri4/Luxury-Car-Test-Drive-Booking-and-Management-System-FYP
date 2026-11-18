# ============================================================
# Zain Reserve — API Dockerfile (multi-stage)
# ============================================================

# ---- Stage 1: deps ----
FROM node:22-alpine AS deps
WORKDIR /repo

# Copy workspace manifests
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install ALL deps (needed for prisma generate in build stage)
RUN npm ci --ignore-scripts

# ---- Stage 2: build ----
FROM node:22-alpine AS builder
WORKDIR /repo

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/api/node_modules ./apps/api/node_modules
COPY . .

# Generate Prisma client
RUN node node_modules/.bin/prisma generate --schema=apps/api/prisma/schema.prisma

# Compile TypeScript
RUN npm run build -w apps/api

# ---- Stage 3: runner ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 apiuser

# Copy compiled output + prisma files
COPY --from=builder /repo/apps/api/dist ./dist
COPY --from=builder /repo/apps/api/prisma ./prisma
COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/apps/api/node_modules ./api_node_modules

# Copy Prisma client into the place the compiled code expects it
RUN cp -r api_node_modules/.prisma ./node_modules/ 2>/dev/null || true

# Uploads volume mount point
RUN mkdir -p uploads && chown apiuser:nodejs uploads

USER apiuser

EXPOSE 4000

# Run migrations then start (use shell form for conditional logic)
CMD ["sh", "-c", "node node_modules/.bin/prisma migrate deploy --schema=prisma/schema.prisma && node dist/server.js"]

