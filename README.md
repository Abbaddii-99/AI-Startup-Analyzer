# 🚀 AI Startup Analyzer

<div align="center">

![AI Startup Analyzer](https://img.shields.io/badge/AI-Startup%20Analyzer-blue?style=for-the-badge&logo=openai)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**AI-powered startup idea analysis platform with multi-agent system**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Demo](#-demo) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

AI Startup Analyzer is a comprehensive platform that uses 7 specialized AI agents to analyze startup ideas and provide detailed insights on market demand, competition, MVP planning, monetization strategies, and go-to-market approaches.

### 🎯 Why This Project?

- **Multi-Agent Architecture** - Each agent specializes in one aspect of startup analysis
- **Production Ready** - Built with enterprise-grade technologies
- **Real-time Processing** - Queue-based system with progress tracking
- **Comprehensive Analysis** - From idea validation to market strategy
- **Open Source** - Free to use and customize

## ✨ Features

### 🤖 AI-Powered Analysis
- **7 Specialized Agents** working in sequence
- **Idea Analyzer** - Extracts core problem and target users
- **Market Research** - Analyzes TAM, SAM, SOM
- **Competitor Analysis** - Identifies direct/indirect competitors
- **MVP Generator** - Designs minimum viable product
- **Monetization Strategy** - Suggests revenue models
- **Go-To-Market** - Plans launch strategy
- **Final Report** - Comprehensive analysis with scoring

### 📊 Scoring System
- Market Demand Score (0-10)
- Competition Score (0-10)
- Execution Difficulty Score (0-10)
- Profit Potential Score (0-10)
- Overall Score

### 🔐 Security & Auth
- JWT-based authentication
- Bcrypt password hashing
- Secure API endpoints
- CORS protection

### 🎨 Modern UI/UX
- Responsive design
- Real-time progress tracking
- Interactive score cards
- Clean and intuitive interface

### 🚀 Performance
- Queue-based processing (BullMQ)
- Redis caching
- PostgreSQL database
- Horizontal scalability

## 🏗️ Architecture

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│     Next.js Frontend            │
│  (React + Tailwind CSS)         │
└────────────┬────────────────────┘
             │ REST API
             ▼
┌─────────────────────────────────┐
│     NestJS Backend              │
│  ┌──────────────────────────┐  │
│  │   7 AI Agents Pipeline   │  │
│  │  1. Idea Analyzer        │  │
│  │  2. Market Research      │  │
│  │  3. Competitor Analysis  │  │
│  │  4. MVP Generator        │  │
│  │  5. Monetization         │  │
│  │  6. Go-To-Market         │  │
│  │  7. Final Report         │  │
│  └──────────────────────────┘  │
└────┬──────────┬─────────┬──────┘
     │          │         │
     ▼          ▼         ▼
┌─────────┐ ┌──────┐ ┌────────┐
│PostgreSQL│ │Redis │ │Gemini/ │
│         │ │Queue │ │OpenRouter│
└─────────┘ └──────┘ └────────┘
```

## 📦 Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 14, React, TypeScript, Tailwind CSS |
| **Backend** | NestJS, TypeScript, Passport JWT |
| **Database** | PostgreSQL, Prisma ORM |
| **Queue** | Redis, BullMQ |
| **AI** | Google Gemini API, OpenRouter |
| **DevOps** | Docker, Docker Compose |
| **Monorepo** | pnpm, Turbo |
| **CI/CD** | GitHub Actions |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- AI API Key (Gemini or OpenRouter)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/ai-startup-analyzer.git
cd ai-startup-analyzer
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
GEMINI_API_KEY="your-gemini-api-key"
# OR
OPENROUTER_API_KEY="your-openrouter-api-key"

JWT_SECRET="your-super-secret-jwt-key"
```

4. **Start services**

**Windows:**
```bash
setup.bat
```

**Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**Or manually:**
```bash
docker-compose up -d
pnpm db:generate
pnpm db:migrate
pnpm dev
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Prisma Studio: `pnpm db:studio`

## 📁 Project Structure

```
ai-startup-analyzer/
├── apps/
│   ├── backend/              # NestJS API
│   │   ├── src/
│   │   │   ├── agents/       # AI agents
│   │   │   ├── auth/         # Authentication
│   │   │   ├── analysis/     # Analysis module
│   │   │   └── queue/        # Queue processors
│   │   └── Dockerfile
│   └── frontend/             # Next.js app
│       ├── src/
│       │   ├── app/          # App router pages
│       │   ├── components/   # React components
│       │   └── lib/          # Utilities
│       └── Dockerfile
├── packages/
│   ├── db/                   # Prisma schema
│   └── shared/               # Shared types
├── docs/                     # Documentation
├── .github/workflows/        # CI/CD
├── docker-compose.yml        # Dev environment
├── docker-compose.prod.yml   # Production
└── README.md
```

## 📚 Documentation

- [📖 Quick Start Guide](QUICKSTART.md)
- [🏗️ Architecture Documentation](docs/ARCHITECTURE.md)
- [🚀 Deployment Guide](docs/DEPLOYMENT.md)
- [🤝 Contributing Guide](CONTRIBUTING.md)
- [📋 Project Summary](PROJECT_SUMMARY.md)

## 🔑 Getting API Keys

### Gemini API (Recommended - Free Tier Available)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy and add to `.env`

### OpenRouter (Alternative)
1. Visit [OpenRouter](https://openrouter.ai/keys)
2. Sign up for account
3. Create API key
4. Copy and add to `.env`

## 🎯 Usage

1. **Register/Login** at http://localhost:3000
2. **Enter your startup idea** in the text area
3. **Click "Analyze My Idea"**
4. **Watch real-time progress** as agents work
5. **View comprehensive report** with scores and insights

## 🧪 Development

```bash
# Run all services in dev mode
pnpm dev

# Build all packages
pnpm build

# Run linting
pnpm lint

# Run tests
pnpm test

# Database commands
pnpm db:migrate     # Run migrations
pnpm db:generate    # Generate Prisma client
pnpm db:studio      # Open Prisma Studio
pnpm db:push        # Push schema changes

# Docker commands
docker-compose up -d           # Start services
docker-compose down            # Stop services
docker-compose logs -f         # View logs
docker-compose logs -f backend # View backend logs
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

See [Deployment Guide](docs/DEPLOYMENT.md) for detailed instructions.

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Analysis
- `POST /analysis` - Create new analysis
- `GET /analysis` - Get user's analyses
- `GET /analysis/:id` - Get specific analysis
- `GET /analysis/:id/progress` - Get analysis progress

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Foundor.ai](https://foundor.ai)
- Built with modern web technologies
- Powered by AI (Gemini/OpenRouter)

## 📧 Contact

- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- Email: your-email@example.com

## ⭐ Star History

If you find this project useful, please consider giving it a star!

---

<div align="center">

**Made with ❤️ by [Your Name]**

[⬆ Back to Top](#-ai-startup-analyzer)

</div>
