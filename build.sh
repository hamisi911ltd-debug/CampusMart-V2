#!/bin/bash

echo "🚀 Building CampusMart for Railway deployment..."

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd artifacts/campusmart
npm install

# Build frontend
echo "🏗️ Building frontend..."
npm run build

# Copy built files to root
echo "📁 Copying built files..."
cd ../..
cp -r artifacts/campusmart/dist ./

# Install server dependencies
echo "🔧 Installing server dependencies..."
npm install --only=production

echo "✅ Build complete! Ready for Railway deployment."