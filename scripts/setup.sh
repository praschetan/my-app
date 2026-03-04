#!/bin/bash

# AI Marketing Automation Platform - Quick Setup Script

set -e

echo "🚀 AI Marketing Automation Platform Setup"
echo "=========================================="
echo ""

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. You have: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v)"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your ANTHROPIC_API_KEY"
    echo ""
else
    echo "✅ .env file exists"
    echo ""
fi

# Check if PostgreSQL is accessible
echo "🔌 Checking PostgreSQL connection..."
if ! command -v psql &> /dev/null; then
    echo "⚠️  psql command not found"
    echo "   You can use Docker: docker compose up -d"
    echo "   Or install PostgreSQL locally"
    echo ""
else
    echo "✅ PostgreSQL tools installed"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Check if we can connect to database
echo "🗄️  Checking database connection..."
if npm run db:push 2>&1 | grep -q "success"; then
    echo "✅ Database connected and schema pushed"
    echo ""

    # Offer to seed
    read -p "🌱 Would you like to seed the database with sample data? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run db:seed
        echo "✅ Database seeded"
        echo ""
    fi
else
    echo "⚠️  Could not connect to database"
    echo "   Make sure PostgreSQL is running:"
    echo "   - Docker: docker compose up -d"
    echo "   - Local: brew services start postgresql"
    echo ""
    echo "   Then run: npm run db:push"
    echo ""
fi

echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your ANTHROPIC_API_KEY"
echo "2. Start PostgreSQL if not running: docker compose up -d"
echo "3. Push database schema: npm run db:push"
echo "4. Start dev server: npm run dev"
echo "5. Open http://localhost:3000"
echo ""
echo "📚 See SETUP_GUIDE.md for detailed instructions"
