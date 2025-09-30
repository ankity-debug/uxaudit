#!/bin/bash

# Test script for Phase 1 optimizations
# Run this after starting the backend server

echo "🚀 Testing Phase 1 Performance Optimizations"
echo "=============================================="
echo ""

# Test URL - change this to your target
TEST_URL="https://lemonyellow.design"

echo "📋 Test Configuration:"
echo "  URL: $TEST_URL"
echo "  Backend: http://localhost:3001"
echo ""

# Check if backend is running
echo "🔍 Checking if backend is running..."
if ! curl -s http://localhost:3001/api/status > /dev/null; then
    echo "❌ Backend is not running!"
    echo "   Start it with: cd uxaudit/backend && npm run dev"
    exit 1
fi
echo "✅ Backend is running"
echo ""

# Run audit and measure time
echo "⏱️  Starting audit (this will take ~75s)..."
echo "   Watch backend logs for detailed progress"
echo ""

START_TIME=$(date +%s)

# Make API request
RESPONSE=$(curl -s -X POST http://localhost:3001/api/audit \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"url\",\"url\":\"$TEST_URL\"}")

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "=============================================="
echo "✅ Audit completed in ${DURATION}s"
echo ""

# Check if response is valid JSON
if echo "$RESPONSE" | jq empty 2>/dev/null; then
    echo "📊 Results:"
    echo "$RESPONSE" | jq -r '
        "  Overall Score: \(.scores.overall.score)/\(.scores.overall.maxScore) (\(.scores.overall.percentage | floor)%)",
        "  Issues Found: \(.issues | length)",
        "  Pages Analyzed: \(.analysisMetadata.pagesAnalyzed | length)",
        "  Processing Time: \(.analysisMetadata.processingTime)ms"
    '

    echo ""
    echo "🎯 Performance Target: <60s (Ultra-Fast Mode)"
    if [ $DURATION -lt 60 ]; then
        echo "✅ PASSED - Faster than target!"
        echo "   🚀 Ultra-fast mode working perfectly!"
    elif [ $DURATION -lt 90 ]; then
        echo "⚠️  ACCEPTABLE - Within 90s but slower than 60s target"
        echo "   Consider optimizing further or checking site speed"
    else
        echo "❌ FAILED - Exceeded 90s threshold"
        echo "   Check logs for bottlenecks"
    fi
else
    echo "❌ Error: Invalid response from server"
    echo "$RESPONSE" | head -20
    exit 1
fi

echo ""
echo "💡 Check backend logs for detailed timing breakdown"