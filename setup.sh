#!/bin/bash

# Smart Energy AI - Setup Script
# This script helps you set up the Smart Energy AI application

echo "🏠 Smart Energy AI - Setup Script"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
echo "✅ Frontend dependencies installed"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
cd ..
echo "✅ Backend dependencies installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo "📝 Creating environment configuration..."
    cp server/.env.example server/.env
    echo "⚠️  Please edit server/.env and add your API keys:"
    echo "   - OPENAI_API_KEY"
    echo "   - OPENWEATHER_API_KEY"
    echo ""
fi

# Create data directory
mkdir -p server/data
echo "✅ Data directory created"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit server/.env and add your API keys"
echo "2. Start the backend: cd server && npm run dev"
echo "3. Start the frontend (in another terminal): npm run dev"
echo ""
echo "📚 Read README_ENHANCED.md for detailed documentation"
echo ""
