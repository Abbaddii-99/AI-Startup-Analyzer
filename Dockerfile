FROM node:20-slim

RUN apt-get update && apt-get install -y openssl

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/
COPY packages/db/package.json packages/db/
COPY packages/shared/package.json packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/backend/ apps/backend/
COPY apps/frontend/ apps/frontend/
COPY packages/db/ packages/db/
COPY packages/shared/ packages/shared/

# Generate Prisma client and build backend
RUN cd packages/db && pnpm exec prisma generate
RUN cd apps/backend && pnpm exec nest build

# Expose port (Render sets PORT env var)
ENV NODE_ENV=production
ENV PORT=10000

# Start
CMD ["node", "-r", "tsconfig-paths/register", "apps/backend/dist/apps/backend/src/main.js"]
