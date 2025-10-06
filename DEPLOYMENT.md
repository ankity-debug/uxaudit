# Deployment Guide for Ubuntu Server

## Installing Chrome Dependencies for Puppeteer

Puppeteer requires Chrome/Chromium and its dependencies to work on Ubuntu servers.

### Quick Install

Run this command on your Ubuntu server:

```bash
bash install-chrome-deps.sh
```

### Manual Installation

If the script doesn't work, install dependencies manually:

```bash
sudo apt-get update
sudo apt-get install -y chromium-browser
```

### Configuration

1. **Add environment variable** to your backend `.env` file:

```bash
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

2. **Restart your application**:

```bash
pm2 restart uxaudit
```

3. **Verify it works**:

```bash
pm2 logs uxaudit
```

You should see:
- ✅ "PDF generated successfully"
- ✅ "Screenshot captured successfully"

Instead of:
- ❌ "Failed to launch the browser process"

## Alternative: Using Docker

If you're using Docker, add this to your Dockerfile:

```dockerfile
# Install Chromium
RUN apt-get update && apt-get install -y \
    chromium-browser \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use system Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

## Troubleshooting

### Error: "Failed to launch the browser process"

**Solution:** Run the install script and set `PUPPETEER_EXECUTABLE_PATH`

### Error: "libgobject-2.0.so.0: cannot open shared object file"

**Solution:** Missing dependencies, run:
```bash
sudo apt-get install -y libglib2.0-0
```

### Error: "No usable sandbox"

**Solution:** Already handled by `--no-sandbox` flag in code

## PM2 Configuration

Make sure your PM2 ecosystem file loads the environment variables:

```javascript
module.exports = {
  apps: [{
    name: 'uxaudit',
    script: './backend/dist/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      PUPPETEER_EXECUTABLE_PATH: '/usr/bin/chromium-browser'
    }
  }]
}
```
