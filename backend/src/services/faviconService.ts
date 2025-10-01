import axios from 'axios';
import { JSDOM } from 'jsdom';

interface FaviconResult {
  success: boolean;
  faviconUrl?: string;
  fallbackLetter?: string;
}

export class FaviconService {
  private cache: Map<string, FaviconResult> = new Map();
  private cacheTimeout = 3600000; // 1 hour

  /**
   * Get favicon for a URL with multiple fallback strategies
   * Priority:
   * 1. /favicon.ico
   * 2. <link rel="icon"> from HTML
   * 3. Google Favicon Service
   * 4. Fallback to first letter
   */
  async getFavicon(url: string): Promise<FaviconResult> {
    try {
      const domain = this.extractDomain(url);

      // Check cache first
      if (this.cache.has(domain)) {
        const cached = this.cache.get(domain)!;
        console.log(`📦 Favicon cache hit: ${domain}`);
        return cached;
      }

      console.log(`🔍 Fetching favicon for: ${domain}`);

      // Try multiple strategies in parallel (with timeout)
      const result = await Promise.race([
        this.tryAllStrategies(domain, url),
        this.timeout(5000) // Max 5s total for favicon fetch
      ]);

      // Cache the result
      this.cache.set(domain, result);
      setTimeout(() => this.cache.delete(domain), this.cacheTimeout);

      return result;

    } catch (error) {
      console.warn('⚠️  Favicon fetch failed, using fallback');
      return this.createFallback(url);
    }
  }

  /**
   * Try all favicon strategies
   */
  private async tryAllStrategies(domain: string, fullUrl: string): Promise<FaviconResult> {
    // Strategy 1: Try /favicon.ico
    try {
      const faviconUrl = `${domain}/favicon.ico`;
      const response = await axios.head(faviconUrl, { timeout: 2000 });
      if (response.status === 200) {
        console.log(`✅ Found favicon.ico: ${faviconUrl}`);
        return { success: true, faviconUrl };
      }
    } catch {
      // Strategy 1 failed, continue
    }

    // Strategy 2: Parse HTML for <link rel="icon">
    try {
      const htmlResponse = await axios.get(fullUrl, {
        timeout: 3000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const dom = new JSDOM(htmlResponse.data);
      const document = dom.window.document;

      // Check multiple icon link types
      const iconSelectors = [
        'link[rel="icon"]',
        'link[rel="shortcut icon"]',
        'link[rel="apple-touch-icon"]',
        'link[rel="icon"][type="image/png"]',
        'link[rel="icon"][type="image/x-icon"]'
      ];

      for (const selector of iconSelectors) {
        const iconLink = document.querySelector(selector);
        if (iconLink) {
          let href = iconLink.getAttribute('href');
          if (href) {
            // Make absolute URL if relative
            if (href.startsWith('//')) {
              href = 'https:' + href;
            } else if (href.startsWith('/')) {
              href = domain + href;
            } else if (!href.startsWith('http')) {
              href = domain + '/' + href;
            }

            console.log(`✅ Found icon in HTML: ${href}`);
            return { success: true, faviconUrl: href };
          }
        }
      }
    } catch {
      // Strategy 2 failed, continue
    }

    // Strategy 3: Try Google Favicon Service
    try {
      const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      const response = await axios.head(googleFaviconUrl, { timeout: 2000 });
      if (response.status === 200) {
        console.log(`✅ Using Google Favicon Service`);
        return { success: true, faviconUrl: googleFaviconUrl };
      }
    } catch {
      // Strategy 3 failed
    }

    // All strategies failed, use fallback
    return this.createFallback(fullUrl);
  }

  /**
   * Create fallback favicon (first letter)
   */
  private createFallback(url: string): FaviconResult {
    try {
      const hostname = new URL(url).hostname;
      const letter = hostname.replace('www.', '').charAt(0).toUpperCase();
      console.log(`⚠️  Using fallback letter: ${letter}`);
      return {
        success: false,
        fallbackLetter: letter
      };
    } catch {
      return {
        success: false,
        fallbackLetter: 'W'
      };
    }
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.host}`;
    } catch {
      return url.includes('://') ? url.split('/').slice(0, 3).join('/') : `https://${url}`;
    }
  }

  /**
   * Promise timeout helper
   */
  private timeout(ms: number): Promise<FaviconResult> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Favicon fetch timeout')), ms)
    );
  }

  /**
   * Clear cache (for cleanup)
   */
  clearCache(): void {
    this.cache.clear();
  }
}