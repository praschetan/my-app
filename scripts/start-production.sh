#!/bin/sh

echo "🔄 Running database migrations..."

# Run pre-generated migrations - non-fatal if schema already exists
node scripts/migrate.js || echo "⚠️  Migration returned non-zero (schema may already exist). Continuing..."

echo ""
echo "🚀 Starting application..."

# Start Next.js (this must succeed)
exec npm start
