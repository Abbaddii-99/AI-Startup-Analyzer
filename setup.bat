@echo off
echo 🚀 Setting up AI Startup Analyzer...

where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ pnpm is not installed. Please install it first:
    echo npm install -g pnpm
    exit /b 1
)

docker info >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not running. Please start Docker first.
    exit /b 1
)

echo 📦 Installing dependencies...
call pnpm install

echo 🐳 Starting Docker services...
call docker-compose up -d

echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo 🗄️ Running database migrations...
call pnpm db:generate
call pnpm --filter @ai-analyzer/db exec dotenv -e ../../.env -- prisma migrate deploy

echo ✅ Setup complete!
echo.
echo 🎉 You can now start the development servers:
echo    pnpm dev
echo.
echo 📝 Don't forget to:
echo    1. Copy .env.example to .env
echo    2. Add your API keys (GEMINI_API_KEY or OPENROUTER_API_KEY)
echo.
echo 🌐 URLs:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:4000
