"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenshotService = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const sharp_1 = __importDefault(require("sharp"));
class ScreenshotService {
    async captureWebsite(url) {
        let browser;
        try {
            browser = await puppeteer_1.default.launch({
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
            const page = await browser.newPage();
            // Set viewport for desktop analysis
            await page.setViewport({
                width: 1920,
                height: 1080,
                deviceScaleFactor: 1
            });
            // Set user agent
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            // Navigate to URL with more robust error handling
            try {
                await page.goto(url, {
                    waitUntil: 'domcontentloaded', // Less strict than networkidle2
                    timeout: 15000 // Reduced timeout
                });
                // Wait for any dynamic content but with shorter timeout
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            catch (navError) {
                console.log('Navigation timeout, trying with basic load');
                // Try again with even simpler loading
                await page.goto(url, {
                    waitUntil: 'domcontentloaded',
                    timeout: 10000
                });
            }
            // Take screenshot
            const screenshot = await page.screenshot({
                type: 'jpeg',
                quality: 85,
                fullPage: false // Only capture above-the-fold
            });
            await browser.close();
            // Optimize image
            return await (0, sharp_1.default)(screenshot)
                .resize(1920, 1080, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
                .jpeg({ quality: 85 })
                .toBuffer();
        }
        catch (error) {
            if (browser) {
                try {
                    await browser.close();
                }
                catch (closeError) {
                    console.error('Error closing browser:', closeError);
                }
            }
            console.error('Screenshot capture error:', error);
            throw new Error(`Failed to capture screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async processUploadedImage(buffer) {
        try {
            // Optimize and standardize uploaded image
            return await (0, sharp_1.default)(buffer)
                .resize(1920, 1080, {
                fit: 'inside',
                withoutEnlargement: true,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
                .jpeg({ quality: 85 })
                .toBuffer();
        }
        catch (error) {
            console.error('Image processing error:', error);
            throw new Error('Failed to process uploaded image');
        }
    }
    bufferToBase64(buffer) {
        return buffer.toString('base64');
    }
}
exports.ScreenshotService = ScreenshotService;
//# sourceMappingURL=screenshotService.js.map