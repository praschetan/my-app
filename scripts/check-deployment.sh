#!/bin/bash

# Automated Railway Deployment Checker
# This script monitors the deployment and verifies it's working

APP_URL="https://my-app-production-7ca0.up.railway.app"
MAX_ATTEMPTS=30
SLEEP_INTERVAL=10

echo "🔍 Monitoring Railway deployment..."
echo "   App URL: $APP_URL"
echo ""

attempt=1
while [ $attempt -le $MAX_ATTEMPTS ]; do
  echo "[$attempt/$MAX_ATTEMPTS] Checking deployment status..."

  # Test API endpoint
  response=$(curl -s -w "\n%{http_code}" "$APP_URL/api/trpc/campaigns.list" 2>&1)
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  echo "   HTTP Status: $http_code"

  if [ "$http_code" = "200" ]; then
    echo ""
    echo "✅ Deployment successful! App is responding correctly."
    echo "   Response: $body"
    echo ""
    echo "🎉 You can now access your app at: $APP_URL"
    exit 0
  elif [ "$http_code" = "502" ] || [ "$http_code" = "503" ]; then
    echo "   ⏳ App is still deploying or crashed, waiting..."
  else
    echo "   Response: $body"
  fi

  echo ""
  sleep $SLEEP_INTERVAL
  attempt=$((attempt + 1))
done

echo "❌ Deployment check timed out after $((MAX_ATTEMPTS * SLEEP_INTERVAL)) seconds"
echo "   Please check Railway dashboard for deployment logs"
exit 1
