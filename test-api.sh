#!/bin/bash

echo "🧪 Testing UX Audit Platform API..."
echo "=================================="

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s http://localhost:3001/api/health | jq .

echo ""
echo "2. Testing status endpoint..."
curl -s http://localhost:3001/api/status | jq .

echo ""
echo "3. Testing URL audit (example.com)..."
curl -s -X POST http://localhost:3001/api/audit \
  -H "Content-Type: application/json" \
  -d '{"type": "url", "url": "https://example.com"}' | jq .summary

echo ""
echo "✅ API tests completed!"
echo "💡 To test the full application, open http://localhost:3000"