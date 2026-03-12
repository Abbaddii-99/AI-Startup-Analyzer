#!/bin/bash

echo "========================================"
echo "  Git Setup for AI Startup Analyzer"
echo "========================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null
then
    echo "❌ Git is not installed!"
    echo "Please install Git first:"
    echo "  Ubuntu/Debian: sudo apt-get install git"
    echo "  macOS: brew install git"
    exit 1
fi

echo "✅ Git is installed"
echo ""

# Replace README
echo "📝 Updating README for GitHub..."
cp README_GITHUB.md README.md
echo "✅ README updated"
echo ""

# Initialize git if not already
if [ ! -d .git ]; then
    echo "🔧 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "ℹ️  Git already initialized"
fi
echo ""

# Add all files
echo "📦 Adding files to Git..."
git add .
echo "✅ Files added"
echo ""

# Commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: AI Startup Analyzer with multi-agent system"
if [ $? -eq 0 ]; then
    echo "✅ Commit created"
else
    echo "ℹ️  No changes to commit or already committed"
fi
echo ""

echo "========================================"
echo "  Next Steps:"
echo "========================================"
echo ""
echo "1. Create a new repository on GitHub:"
echo "   https://github.com/new"
echo ""
echo "2. Name it: ai-startup-analyzer"
echo ""
echo "3. Run these commands (replace YOUR_USERNAME):"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/ai-startup-analyzer.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "========================================"
echo ""
