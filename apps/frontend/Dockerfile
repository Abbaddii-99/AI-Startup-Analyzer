FROM node:18-alpine AS base
RUN npm install -g pnpm

FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/frontend/package.json ./apps/frontend/
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages ./packages
COPY . .
RUN pnpm --filter @ai-analyzer/frontend build

FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=build /app/apps/frontend/public ./apps/frontend/public
COPY --from=build /app/apps/frontend/package.json ./apps/frontend/
COPY --from=build /app/apps/frontend/next.config.js ./apps/frontend/
COPY --from=dependencies /app/node_modules ./node_modules

WORKDIR /app/apps/frontend

EXPOSE 3000

CMD ["pnpm", "start"]
