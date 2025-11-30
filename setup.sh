#!/bin/bash

# 🎙️ Sésame ouvre-toi! - Setup Script
# This script sets up the Magic Voice Authentication system

set -e

echo "✨ Setting up Sésame ouvre-toi! Magic Voice Authentication..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Detect package manager
if command -v bun &> /dev/null; then
    PKG_MANAGER="bun"
    INSTALL_CMD="bun install"
    RUN_CMD="bun"
elif command -v pnpm &> /dev/null; then
    PKG_MANAGER="pnpm"
    INSTALL_CMD="pnpm install"
    RUN_CMD="pnpm"
elif command -v yarn &> /dev/null; then
    PKG_MANAGER="yarn"
    INSTALL_CMD="yarn install"
    RUN_CMD="yarn"
else
    PKG_MANAGER="npm"
    INSTALL_CMD="npm install"
    RUN_CMD="npx"
fi

echo "📦 Using package manager: $PKG_MANAGER"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
$INSTALL_CMD

echo ""
echo "🗄️  Setting up database..."

# Generate Prisma client
echo "  → Generating Prisma client..."
$RUN_CMD prisma generate

# Create database
echo "  → Creating SQLite database..."
$RUN_CMD prisma db push

echo ""
echo "✨ Setup complete! 🎉"
echo ""
echo "📝 Next steps:"
echo ""
echo "  1. Start the development server:"
echo "     $PKG_MANAGER dev"
echo ""
echo "  2. Open your browser to:"
echo "     http://localhost:3000"
echo ""
echo "  3. Register with your voice:"
echo "     → Enter your email"
echo "     → Choose a magic phrase"
echo "     → Record 3 voice samples"
echo ""
echo "  4. Login with your voice:"
echo "     → Enter your email"
echo "     → Speak your magic phrase"
echo "     → Watch the magic gate open! 🚪✨"
echo ""
echo "📚 For more information, see:"
echo "  - README.md (full documentation)"
echo "  - SETUP.md (setup guide)"
echo ""
echo "🎤 Tips for best voice authentication:"
echo "  ✓ Record in a quiet environment"
echo "  ✓ Speak clearly and consistently"
echo "  ✓ Use the same volume each time"
echo "  ✓ Grant microphone permissions"
echo ""
echo "Happy voice authenticating! 🎙️✨"

