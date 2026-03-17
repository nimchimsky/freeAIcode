#!/bin/bash

# Seed the Railway database via API endpoint
URL="https://freeaicode-production.up.railway.app/api/admin/seed"
PASSWORD="FreeAI2024Secure!"

echo "🌱 Seeding Railway database..."
echo "URL: $URL"
echo ""

curl -X POST "$URL" \
  -H "Authorization: Bearer $PASSWORD" \
  -H "Content-Type: application/json" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s | jq '.'

echo ""
echo "✅ Seed request completed"
