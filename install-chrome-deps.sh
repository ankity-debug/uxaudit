#!/bin/bash

# Install Chrome dependencies for Puppeteer on Ubuntu
# Run this on your production server

echo "🔧 Installing Chrome/Chromium dependencies for Puppeteer..."

# Update package list
sudo apt-get update

# Install required dependencies
sudo apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils

# Install Chromium browser (alternative to Chrome)
sudo apt-get install -y chromium-browser

echo "✅ Dependencies installed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Add this to your .env file:"
echo "   PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser"
echo ""
echo "2. Restart your PM2 app:"
echo "   pm2 restart uxaudit"
echo ""
echo "3. Check logs:"
echo "   pm2 logs uxaudit"
