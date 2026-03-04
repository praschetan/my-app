#!/bin/bash

# Railway Deployment Script
# Run this after you've logged in with: railway login

set -e

echo "🚂 Railway Deployment Script"
echo "=============================="
echo ""

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged into Railway"
    echo "Please run: railway login"
    exit 1
fi

echo "✅ Logged in as: $(railway whoami)"
echo ""

# Initialize project
echo "📦 Initializing Railway project..."
railway init <<< $'ai-marketing-automation\n'

echo ""
echo "🗄️  Adding PostgreSQL database..."
railway add --database postgres

echo ""
echo "⚙️  Setting environment variables..."
echo "Please provide your Anthropic API key:"
read -r ANTHROPIC_KEY

railway variables set ANTHROPIC_API_KEY="$ANTHROPIC_KEY"

echo ""
echo "🚀 Deploying application..."
railway up

echo ""
echo "⏳ Waiting for deployment to complete..."
sleep 10

echo ""
echo "🗄️  Running database migrations..."
railway run npm run db:push

echo ""
echo "🌱 Seeding database (optional)..."
read -p "Would you like to seed with sample data? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    railway run npm run db:seed
    echo "✅ Database seeded"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 View your project:"
railway open

echo ""
echo "📋 Useful commands:"
echo "  railway logs          - View application logs"
echo "  railway open          - Open project dashboard"
echo "  railway connect       - Connect to PostgreSQL"
echo "  railway variables     - View environment variables"
