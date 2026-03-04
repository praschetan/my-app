#!/bin/sh

set -e

echo "🔄 Running database migrations..."

# Push database schema using drizzle-kit
npx drizzle-kit push --verbose

echo "✅ Migrations completed!"
echo ""
echo "🚀 Starting application..."

# Start Next.js
npm start
