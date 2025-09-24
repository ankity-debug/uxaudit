import axios from 'axios';
import { parseStringPromise } from 'xml2js';

export interface SitemapUrl {
  url: string;
  priority?: number;
  lastmod?: string;
  changefreq?: string;
}

export class SitemapService {

  /**
   * Extract sitemap URLs for a given domain with smart fallbacks
   */
  async extractSitemap(baseUrl: string): Promise<SitemapUrl[]> {
    try {
      const domain = this.extractDomain(baseUrl);
      const sitemapUrls = [
        `${domain}/sitemap.xml`,
        `${domain}/sitemap_index.xml`,
        `${domain}/sitemap.txt`,
        `${domain}/robots.txt` // fallback to extract from robots.txt
      ];

      for (const sitemapUrl of sitemapUrls) {
        try {
          const urls = await this.fetchSitemap(sitemapUrl);
          if (urls.length > 0) {
            console.log(`Sitemap found at: ${sitemapUrl} (${urls.length} URLs)`);
            return this.prioritizeUrls(urls, baseUrl);
          }
        } catch (error) {
          console.log(`Sitemap not found at: ${sitemapUrl}`);
        }
      }

      // Ultimate fallback: return just the base URL
      console.log('No sitemap found, using base URL only');
      return [{ url: baseUrl, priority: 1.0 }];

    } catch (error) {
      console.error('Sitemap extraction failed:', error);
      return [{ url: baseUrl, priority: 1.0 }];
    }
  }

  /**
   * Fetch and parse sitemap from URL
   */
  private async fetchSitemap(sitemapUrl: string): Promise<SitemapUrl[]> {
    const response = await axios.get(sitemapUrl, {
      timeout: 10000,
      headers: { 'User-Agent': 'UX-Audit-Bot/1.0' }
    });

    const content = response.data;

    // Handle XML sitemap
    if (sitemapUrl.endsWith('.xml')) {
      return await this.parseXmlSitemap(content);
    }

    // Handle text sitemap
    if (sitemapUrl.endsWith('.txt')) {
      return this.parseTextSitemap(content);
    }

    // Handle robots.txt
    if (sitemapUrl.endsWith('robots.txt')) {
      return this.extractSitemapFromRobots(content);
    }

    return [];
  }

  /**
   * Parse XML sitemap format
   */
  private async parseXmlSitemap(xmlContent: string): Promise<SitemapUrl[]> {
    try {
      const result = await parseStringPromise(xmlContent);
      const urls: SitemapUrl[] = [];

      // Handle sitemap index (multiple sitemaps)
      if (result.sitemapindex?.sitemap) {
        for (const sitemap of result.sitemapindex.sitemap) {
          const sitemapUrl = sitemap.loc[0];
          try {
            const childUrls = await this.fetchSitemap(sitemapUrl);
            urls.push(...childUrls);
          } catch (error) {
            console.log(`Failed to fetch child sitemap: ${sitemapUrl}`);
          }
        }
        return urls;
      }

      // Handle regular sitemap
      if (result.urlset?.url) {
        for (const urlEntry of result.urlset.url) {
          urls.push({
            url: urlEntry.loc[0],
            priority: urlEntry.priority ? parseFloat(urlEntry.priority[0]) : undefined,
            lastmod: urlEntry.lastmod ? urlEntry.lastmod[0] : undefined,
            changefreq: urlEntry.changefreq ? urlEntry.changefreq[0] : undefined
          });
        }
      }

      return urls;
    } catch (error) {
      console.error('XML sitemap parsing failed:', error);
      return [];
    }
  }

  /**
   * Parse text sitemap format (one URL per line)
   */
  private parseTextSitemap(textContent: string): SitemapUrl[] {
    return textContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && line.startsWith('http'))
      .map(url => ({ url, priority: 0.5 }));
  }

  /**
   * Extract sitemap URLs from robots.txt
   */
  private extractSitemapFromRobots(robotsContent: string): SitemapUrl[] {
    const sitemapLines = robotsContent
      .split('\n')
      .filter(line => line.toLowerCase().startsWith('sitemap:'))
      .map(line => line.split(':').slice(1).join(':').trim());

    const urls: SitemapUrl[] = [];
    for (const sitemapUrl of sitemapLines) {
      try {
        // Recursively fetch the actual sitemap
        this.fetchSitemap(sitemapUrl).then(childUrls => {
          urls.push(...childUrls);
        });
      } catch (error) {
        console.log(`Failed to fetch sitemap from robots.txt: ${sitemapUrl}`);
      }
    }

    return urls;
  }

  /**
   * Smart URL prioritization for optimal context
   */
  private prioritizeUrls(urls: SitemapUrl[], auditUrl: string): SitemapUrl[] {
    const auditPath = new URL(auditUrl).pathname;

    // Score URLs based on relevance to audit URL
    const scoredUrls = urls.map(item => {
      let score = item.priority || 0.5;

      // Exact match gets highest priority
      if (item.url === auditUrl) {
        score += 10;
      }

      // Home page gets high priority for context
      if (new URL(item.url).pathname === '/') {
        score += 5;
      }

      // Same section gets medium priority
      const itemPath = new URL(item.url).pathname;
      const auditSection = auditPath.split('/')[1];
      const itemSection = itemPath.split('/')[1];
      if (auditSection && itemSection === auditSection) {
        score += 3;
      }

      // Penalize very deep pages
      const depth = itemPath.split('/').length - 1;
      if (depth > 3) {
        score -= 1;
      }

      // Penalize query parameters (usually less important pages)
      if (new URL(item.url).search) {
        score -= 0.5;
      }

      return { ...item, score };
    });

    // Sort by score and return top URLs
    return scoredUrls
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Limit to top 10 for token efficiency
      .map(({ score, ...item }) => item);
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.host}`;
    } catch (error) {
      // Fallback if URL parsing fails
      return url.includes('://') ? url.split('/').slice(0, 3).join('/') : `https://${url}`;
    }
  }

  /**
   * Get optimal page selection for audit context (audit page + 1-2 siblings)
   */
  getOptimalPageSelection(urls: SitemapUrl[], auditUrl: string): string[] {
    const prioritized = this.prioritizeUrls(urls, auditUrl);

    // Always include audit URL first
    const selection = [auditUrl];

    // Add home page if it's not the audit URL
    const homePage = prioritized.find(u => new URL(u.url).pathname === '/');
    if (homePage && homePage.url !== auditUrl) {
      selection.push(homePage.url);
    }

    // Add one more relevant page (same section or high priority)
    const auditSection = new URL(auditUrl).pathname.split('/')[1];
    const siblingPage = prioritized.find(u =>
      u.url !== auditUrl &&
      u.url !== homePage?.url &&
      (new URL(u.url).pathname.split('/')[1] === auditSection || (u.priority || 0) > 0.8)
    );

    if (siblingPage) {
      selection.push(siblingPage.url);
    }

    return selection.slice(0, 3); // Maximum 3 pages for token efficiency
  }
}