@echo off
echo ========================================
echo   Git Setup for AI Startup Analyzer
echo ========================================
echo.

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Git is not installed!
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo ✅ Git is installed
echo.

REM Replace README
echo 📝 Updating README for GitHub...
copy /Y README_GITHUB.md README.md >nul
echo ✅ README updated
echo.

REM Initialize git if not already
if not exist .git (
    echo 🔧 Initializing Git repository...
    git init
    echo ✅ Git initialized
) else (
    echo ℹ️  Git already initialized
)
echo.

REM Add all files
echo 📦 Adding files to Git...
git add .
echo ✅ Files added
echo.

REM Commit
echo 💾 Creating initial commit...
git commit -m "Initial commit: AI Startup Analyzer with multi-agent system"
if %ERRORLEVEL% EQU 0 (
    echo ✅ Commit created
) else (
    echo ℹ️  No changes to commit or already committed
)
echo.

echo ========================================
echo   Next Steps:
echo ========================================
echo.
echo 1. Create a new repository on GitHub:
echo    https://github.com/new
echo.
echo 2. Name it: ai-startup-analyzer
echo.
echo 3. Run these commands (replace YOUR_USERNAME):
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/ai-startup-analyzer.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo ========================================
echo.
pause
