#!/bin/bash

# Build script optimized for Termux environment
echo "🔨 Building SnipVault for static export..."

# Set environment variables for Termux
export NODE_OPTIONS="--max-old-space-size=2048"
export NEXT_TELEMETRY_DISABLED=1

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf .next out

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the application
echo "🏗️ Building Next.js application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Static files are in the 'out' directory"
    echo ""
    echo "To deploy to Firebase Hosting:"
    echo "1. Install Firebase CLI: npm install -g firebase-tools"
    echo "2. Login to Firebase: firebase login"
    echo "3. Deploy: npm run firebase:deploy"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi