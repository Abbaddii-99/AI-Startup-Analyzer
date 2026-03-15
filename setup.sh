#!/bin/bash

echo "🚀 Setting up AI Startup Analyzer..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null
then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "📦 Installing dependencies..."
pnpm install

echo "🐳 Starting Docker services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "🗄️ Running database migrations..."
pnpm db:generate
pnpm --filter @ai-analyzer/db exec dotenv -e ../../.env -- prisma migrate deploy

echo "✅ Setup complete!"
echo ""
echo "🎉 You can now start the development servers:"
echo "   pnpm dev"
echo ""
echo "📝 Don't forget to:"
echo "   1. Copy .env.example to .env"
echo "   2. Add your API keys (GEMINI_API_KEY or OPENROUTER_API_KEY)"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:4000"
