# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                      (Next.js + React)                       │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │  Home    │  │ Analysis │  │  Auth    │                 │
│  │  Page    │  │  Results │  │  Pages   │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└────────────────────┬─────────────────────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                             │
│                    (NestJS + TypeScript)                     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     Auth     │  │   Analysis   │  │    Queue     │     │
│  │   Module     │  │    Module    │  │  Processor   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              AI Agents System                        │  │
│  │                                                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │  │
│  │  │    Idea     │  │   Market    │  │ Competitor  │ │  │
│  │  │  Analyzer   │→ │  Research   │→ │  Analysis   │ │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │  │
│  │                                                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │  │
│  │  │     MVP     │  │Monetization │  │ Go-To-Market│ │  │
│  │  │  Generator  │→ │   Strategy  │→ │   Strategy  │ │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐│  │
│  │  │         Final Report Generator                  ││  │
│  │  └─────────────────────────────────────────────────┘│  │
│  └──────────────────────────────────────────────────────┘  │
└────────┬──────────────────────┬──────────────────┬─────────┘
         │                      │                  │
         ▼                      ▼                  ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   PostgreSQL    │  │      Redis      │  │   AI Services   │
│   (Database)    │  │  (Queue/Cache)  │  │ Gemini/OpenRouter│
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Data Flow

1. **User submits idea** → Frontend sends to Backend API
2. **Backend creates analysis record** → Saves to PostgreSQL
3. **Job added to queue** → Redis/BullMQ
4. **Queue processor starts** → Runs agents sequentially
5. **Each agent processes** → Calls AI API (Gemini/OpenRouter)
6. **Results saved** → PostgreSQL
7. **Frontend polls progress** → Updates UI in real-time
8. **Analysis complete** → Display full report

## Agent Pipeline

```
Input: Startup Idea
    ↓
[1] Idea Analyzer
    → Extract: summary, problem, users, industry
    ↓
[2] Market Research
    → Analyze: TAM, SAM, SOM, trends
    ↓
[3] Competitor Analysis
    → Identify: direct/indirect competitors
    ↓
[4] MVP Generator
    → Design: features, flow, architecture
    ↓
[5] Monetization Strategy
    → Suggest: revenue models, pricing
    ↓
[6] Go-To-Market Strategy
    → Plan: channels, communities, growth
    ↓
[7] Final Report Generator
    → Combine: all data + scoring
    ↓
Output: Comprehensive Report + Score
```

## Technology Decisions

### Why NestJS?
- Modular architecture
- Built-in dependency injection
- TypeScript first-class support
- Easy integration with BullMQ

### Why BullMQ?
- Reliable job processing
- Progress tracking
- Retry mechanisms
- Redis-based (fast)

### Why Prisma?
- Type-safe database access
- Easy migrations
- Great DX with TypeScript
- Auto-generated types

### Why Next.js 14?
- App Router (modern)
- Server components
- Built-in optimization
- Great developer experience

### Why Monorepo?
- Shared types between frontend/backend
- Single source of truth
- Easier refactoring
- Better code reuse

## Scalability Considerations

1. **Queue System** - Can scale workers horizontally
2. **Database** - PostgreSQL can handle millions of records
3. **Redis** - In-memory cache for fast access
4. **Stateless API** - Easy to scale horizontally
5. **CDN for Frontend** - Fast global delivery

## Security

1. **JWT Authentication** - Secure token-based auth
2. **Password Hashing** - bcrypt with salt
3. **Environment Variables** - Secrets not in code
4. **CORS** - Restricted origins
5. **Input Validation** - class-validator

## Future Enhancements

- [ ] WebSocket for real-time updates (currently polling)
- [x] PDF export for reports
- [ ] Team collaboration features
- [ ] Payment integration (Stripe ready)
- [ ] Advanced analytics dashboard
- [ ] Multiple AI model selection
- [x] Caching layer (Redis)
- [x] Rate limiting per user
- [x] Refresh token rotation
- [x] Plan-based usage limits
