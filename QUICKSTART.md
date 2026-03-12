# 🚀 Quick Start Guide

Get your AI Startup Analyzer running in 5 minutes!

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ Docker Desktop running
- ✅ pnpm installed (`npm install -g pnpm`)
- ✅ AI API key (Gemini or OpenRouter)

## Step 1: Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-startup-analyzer

# Install dependencies
pnpm install
```

## Step 2: Setup Environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env and add your API key
# Windows: notepad .env
# Mac/Linux: nano .env
```

**Required variables:**
```env
GEMINI_API_KEY="your-api-key-here"
# OR
OPENROUTER_API_KEY="your-api-key-here"
```

## Step 3: Start Services

### Option A: Automated Setup (Recommended)

**Windows:**
```bash
setup.bat
```

**Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

### Option B: Manual Setup

```bash
# Start Docker services
docker-compose up -d

# Wait 10 seconds for services to start
# Then run migrations
pnpm db:generate
pnpm db:migrate

# Start development servers
pnpm dev
```

## Step 4: Access the App

- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:4000
- 🗄️ **Database Studio**: `pnpm db:studio`

## Step 5: Test It Out

1. Open http://localhost:3000
2. Register a new account
3. Enter a startup idea
4. Watch the AI analyze it!

## Common Issues

### "pnpm not found"
```bash
npm install -g pnpm
```

### "Docker not running"
Start Docker Desktop application

### "Port already in use"
Change ports in `.env`:
```env
BACKEND_PORT=4001
```

### "Database connection failed"
```bash
# Restart Docker services
docker-compose down
docker-compose up -d
```

## Next Steps

- 📖 Read [Architecture Documentation](docs/ARCHITECTURE.md)
- 🚀 Check [Deployment Guide](docs/DEPLOYMENT.md)
- 🤝 See [Contributing Guide](CONTRIBUTING.md)

## Getting Help

- 💬 Open a GitHub Issue
- 📧 Contact: your-email@example.com
- 📚 Check the [README](README.md)

## Development Commands

```bash
# Start all services
pnpm dev

# Build everything
pnpm build

# Run linting
pnpm lint

# Database commands
pnpm db:migrate    # Run migrations
pnpm db:studio     # Open Prisma Studio
pnpm db:generate   # Generate Prisma client

# Docker commands
docker-compose up -d        # Start services
docker-compose down         # Stop services
docker-compose logs -f      # View logs
```

## Project Structure

```
ai-startup-analyzer/
├── apps/
│   ├── backend/     # NestJS API (Port 4000)
│   └── frontend/    # Next.js App (Port 3000)
├── packages/
│   ├── db/          # Prisma Database
│   └── shared/      # Shared Types
└── docker-compose.yml
```

## What's Next?

Now that you're up and running:

1. ✨ Customize the AI prompts in `apps/backend/src/agents/`
2. 🎨 Modify the UI in `apps/frontend/src/`
3. 📊 Add new features
4. 🚀 Deploy to production

Happy coding! 🎉
