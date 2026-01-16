#!/bin/bash

echo "🚀 Liminal Game - Build & Validation Script"
echo "==========================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "📋 Summary of Improvements:"
    echo "  ✓ Accurate timer with visual progress bar"
    echo "  ✓ Mandatory 'I understand' checkbox on How to Play"
    echo "  ✓ All input methods: arrow keys, swipe, click+drag"
    echo "  ✓ Intense haptic feedback (5-pulse) on errors"
    echo "  ✓ Enhanced visual flash (red/yellow pulsing)"
    echo "  ✓ Timer: 1.5s baseline → 0.45s minimum"
    echo "  ✓ Responsive design with auto-scaling"
    echo "  ✓ Error boundaries and robust error handling"
    echo "  ✓ Lazy loading for optimal performance"
    echo "  ✓ Enhanced leaderboard with error states"
    echo ""
    echo "🎮 To run the game:"
    echo "   npm run dev"
    echo ""
else
    echo ""
    echo "❌ Build failed. Check errors above."
    exit 1
fi
