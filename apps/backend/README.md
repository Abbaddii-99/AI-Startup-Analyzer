# Backend - NestJS API

## Structure

```
src/
├── agents/           # AI agents for analysis
├── auth/            # JWT authentication
├── analysis/        # Analysis endpoints
├── queue/           # BullMQ processors
├── common/          # Shared utilities
├── app.module.ts    # Root module
└── main.ts          # Entry point
```

## Development

```bash
# Install dependencies
pnpm install

# Run in dev mode
pnpm dev

# Build
pnpm build

# Start production
pnpm start
```

## Environment Variables

See `.env.example` in root directory.

## API Documentation

### Authentication

**POST /auth/register**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**POST /auth/login**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Analysis

All analysis endpoints require JWT token in Authorization header.

**POST /analysis**
```json
{
  "idea": "A platform that connects..."
}
```

**GET /analysis**
Returns all user's analyses.

**GET /analysis/:id**
Returns specific analysis.

**GET /analysis/:id/progress**
Returns analysis progress (0-100).
