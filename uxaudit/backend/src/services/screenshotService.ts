import puppeteer, { Browser, Page } from 'puppeteer';
import sharp from 'sharp';

export class ScreenshotService {
  private browser: Browser | null = null;

  /**
   * Get or create persistent browser instance for performance
   */
  private async getBrowser(): Promise<Browser> {
    if (!this.browser || !this.browser.isConnected()) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-extensions',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-dev-tools'
        ]
      });
    }
    return this.browser;
  }

  /**
   * Wait for network to be idle by tracking inflight requests
   */
  private async waitForNetworkIdle(
    page: Page,
    timeout: number = 20000,
    idleTime: number = 700
  ): Promise<void> {
    let inflight = 0;
    let idleTimer: NodeJS.Timeout | null = null;

    return new Promise((resolve, reject) => {
      let resolved = false;

      const cleanup = () => {
        page.off('request', onRequest);
        page.off('requestfinished', onRequestFinished);
        page.off('requestfailed', onRequestFinished);
        if (idleTimer) clearTimeout(idleTimer);
      };

      const scheduleIdleCheck = () => {
        if (idleTimer) clearTimeout(idleTimer);
        if (inflight === 0 && !resolved) {
          idleTimer = setTimeout(() => {
            resolved = true;
            cleanup();
            resolve();
          }, idleTime);
        }
      };

      const onRequest = () => {
        inflight++;
        if (idleTimer) clearTimeout(idleTimer);
      };

      const onRequestFinished = () => {
        inflight = Math.max(0, inflight - 1);
        scheduleIdleCheck();
      };

      page.on('request', onRequest);
      page.on('requestfinished', onRequestFinished);
      page.on('requestfailed', onRequestFinished);

      // Global timeout to prevent infinite waiting
      const globalTimeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          cleanup();
          reject(new Error(`Network idle timeout after ${timeout}ms`));
        }
      }, timeout);

      // Check if already idle
      scheduleIdleCheck();
    });
  }

  async captureWebsite(url: string, maxTimeout: number = 15000): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Set viewport for desktop analysis
      await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1
      });

      // Set user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      console.log(`📸 Navigating to ${url} (adaptive timeout: ${maxTimeout/1000}s max)...`);

      // Step 1: Navigate to page (wait for DOM only)
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: Math.min(maxTimeout, 12000)
      });

      console.log('📸 Waiting for network idle...');

      // Step 2: Wait for network to be truly idle
      try {
        const idleTimeout = Math.max(maxTimeout - 5000, 8000); // Reserve time for other steps
        await this.waitForNetworkIdle(page, idleTimeout, 700); // Good balance
        console.log('✅ Network idle detected');
      } catch (err) {
        console.warn('⚠️  Network idle timeout, using fallback...');
        try {
          await page.waitForNetworkIdle({ idleTime: 500, timeout: 3000 });
        } catch (fallbackErr) {
          console.warn('⚠️  Fallback timeout, proceeding anyway');
        }
      }

      // Step 3: Wait for common loading indicators to disappear
      const spinnerSelectors = [
        '.loading', '.spinner', '.loader',
        '[class*="loading"]', '[class*="spinner"]',
        '[data-loading="true"]'
      ];

      for (const selector of spinnerSelectors) {
        try {
          await page.waitForSelector(selector, { hidden: true, timeout: 1500 });
          console.log(`✅ Loading indicator ${selector} hidden`);
          break;
        } catch {
          // Selector not found or still visible, continue
        }
      }

      // Step 4: Small delay for fonts/animations to settle
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('📸 Capturing screenshot...');
      const screenshot = await page.screenshot({
        type: 'jpeg',
        quality: 85,
        fullPage: false
      });

      await page.close();

      // Optimize image
      return await sharp(screenshot)
        .resize(1920, 1080, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .jpeg({ quality: 85 })
        .toBuffer();

    } catch (error) {
      await page.close();
      console.error('Screenshot capture error:', error);
      throw new Error(`Failed to capture screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processUploadedImage(buffer: Buffer): Promise<Buffer> {
    try {
      // Optimize and standardize uploaded image
      return await sharp(buffer)
        .resize(1920, 1080, { 
          fit: 'inside',
          withoutEnlargement: true,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .jpeg({ quality: 85 })
        .toBuffer();
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error('Failed to process uploaded image');
    }
  }

  bufferToBase64(buffer: Buffer): string {
    return buffer.toString('base64');
  }

  /**
   * Cleanup browser instance on service shutdown
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}