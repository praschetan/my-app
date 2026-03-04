#!/bin/sh

set -e

echo "🔄 Running database migrations..."

# Run pre-generated migrations using plain JavaScript
node scripts/migrate.js

echo ""
echo "🚀 Starting application..."

# Start Next.js standalone server
node server.js
