import { JSDOM } from 'jsdom';
import axios from 'axios';

export interface PageContext {
  url: string;
  head: {
    title: string;
    metaDescription: string;
    canonical?: string;
    jsonLd?: any[];
  };
  nav: {
    text: string;
    href: string;
  }[];
  mainContent: {
    headings: string[];
    firstParagraphs: string;
    selectors: string[];
  };
  formsAndCtas: {
    forms: {
      selector: string;
      fields: string[];
    }[];
    primaryCtas: {
      text: string;
      selector: string;
      href?: string;
    }[];
  };
}

export class HtmlParserService {

  /**
   * Fetch and parse HTML content for multiple URLs with token optimization
   */
  async parseMultiplePages(urls: string[]): Promise<PageContext[]> {
    const contexts: PageContext[] = [];

    for (const url of urls) {
      try {
        console.log(`Parsing content for: ${url}`);
        const context = await this.parseSinglePage(url);
        contexts.push(context);
      } catch (error) {
        console.error(`Failed to parse ${url}:`, error);
        // Add minimal context even if parsing fails
        contexts.push(this.createFallbackContext(url));
      }
    }

    return contexts;
  }

  /**
   * Parse single page with optimized content extraction
   */
  private async parseSinglePage(url: string): Promise<PageContext> {
    // Fetch HTML content
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    return {
      url,
      head: this.extractHeadData(document),
      nav: this.extractNavigation(document),
      mainContent: this.extractMainContent(document),
      formsAndCtas: this.extractFormsAndCtas(document)
    };
  }

  /**
   * Extract optimized HEAD section data
   */
  private extractHeadData(document: Document) {
    const title = document.querySelector('title')?.textContent?.trim() || '';
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || undefined;

    // Extract JSON-LD structured data (limited to first 2 for token efficiency)
    const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    const jsonLd = jsonLdScripts.slice(0, 2).map(script => {
      try {
        return JSON.parse(script.textContent || '{}');
      } catch {
        return null;
      }
    }).filter(Boolean);

    return {
      title,
      metaDescription,
      canonical,
      jsonLd: jsonLd.length > 0 ? jsonLd : undefined
    };
  }

  /**
   * Extract navigation structure (token-optimized)
   */
  private extractNavigation(document: Document) {
    const navElements = [
      ...Array.from(document.querySelectorAll('nav a')),
      ...Array.from(document.querySelectorAll('header a')),
      ...Array.from(document.querySelectorAll('.nav a, .navigation a, .menu a'))
    ];

    const navLinks = navElements
      .slice(0, 15) // Limit to first 15 links for token efficiency
      .map(link => ({
        text: (link.textContent || '').trim().substring(0, 50), // Limit text length
        href: link.getAttribute('href') || ''
      }))
      .filter(link => link.text && link.text.length > 0)
      .filter((link, index, array) =>
        // Remove duplicates based on text
        array.findIndex(l => l.text === link.text) === index
      );

    return navLinks;
  }

  /**
   * Extract main content with smart truncation
   */
  private extractMainContent(document: Document) {
    // Try multiple selectors to find main content
    const mainSelectors = [
      'main',
      '[role="main"]',
      '.main-content',
      '.content',
      'article',
      '.post-content',
      '.entry-content'
    ];

    let mainElement = null;
    for (const selector of mainSelectors) {
      mainElement = document.querySelector(selector);
      if (mainElement) break;
    }

    // Fallback to body if no main content found
    if (!mainElement) {
      mainElement = document.body;
    }

    // Extract headings (limit to first 5)
    const headings = Array.from(mainElement.querySelectorAll('h1, h2, h3'))
      .slice(0, 5)
      .map(h => (h.textContent || '').trim())
      .filter(h => h.length > 0);

    // Extract first few paragraphs (token-optimized)
    const paragraphs = Array.from(mainElement.querySelectorAll('p'))
      .map(p => (p.textContent || '').trim())
      .filter(p => p.length > 20) // Filter out very short paragraphs
      .slice(0, 3); // First 3 substantial paragraphs

    const firstParagraphs = paragraphs
      .join(' ')
      .substring(0, 800) // Hard limit for token efficiency
      .replace(/\s+/g, ' '); // Normalize whitespace

    // Extract useful selectors for evidence
    const selectors = [
      mainElement.tagName.toLowerCase() + (mainElement.id ? `#${mainElement.id}` : '') + (mainElement.className ? `.${Array.from(mainElement.classList)[0]}` : ''),
      headings.length > 0 ? 'h1, h2, h3' : '',
      paragraphs.length > 0 ? 'p' : ''
    ].filter(Boolean);

    return {
      headings,
      firstParagraphs,
      selectors
    };
  }

  /**
   * Extract forms and CTAs with optimization
   */
  private extractFormsAndCtas(document: Document) {
    // Extract forms (limit to first 3)
    const forms = Array.from(document.querySelectorAll('form'))
      .slice(0, 3)
      .map(form => {
        const fields = Array.from(form.querySelectorAll('input, select, textarea'))
          .map(field => field.getAttribute('name') || field.getAttribute('type') || 'unnamed')
          .filter((field, index, array) => array.indexOf(field) === index) // Remove duplicates
          .slice(0, 10); // Limit fields per form

        const selector = form.id ? `#${form.id}` :
                        form.className ? `.${Array.from(form.classList)[0]}` :
                        'form';

        return { selector, fields };
      });

    // Extract primary CTAs (buttons and prominent links)
    const ctaSelectors = [
      'button[type="submit"]',
      '.btn-primary, .button-primary, .cta',
      'a[href*="signup"], a[href*="register"], a[href*="contact"]',
      '.hero button, .hero a'
    ];

    const primaryCtas = ctaSelectors
      .flatMap(selector => Array.from(document.querySelectorAll(selector)))
      .slice(0, 5) // Limit to first 5 CTAs
      .map(element => ({
        text: (element.textContent || '').trim().substring(0, 50),
        selector: element.tagName.toLowerCase() +
                 (element.id ? `#${element.id}` : '') +
                 (element.className ? `.${Array.from(element.classList)[0]}` : ''),
        href: element.getAttribute('href') || undefined
      }))
      .filter(cta => cta.text.length > 0);

    return { forms, primaryCtas };
  }

  /**
   * Create fallback context when parsing fails
   */
  private createFallbackContext(url: string): PageContext {
    return {
      url,
      head: {
        title: 'Parse failed',
        metaDescription: ''
      },
      nav: [],
      mainContent: {
        headings: [],
        firstParagraphs: '',
        selectors: []
      },
      formsAndCtas: {
        forms: [],
        primaryCtas: []
      }
    };
  }

  /**
   * Estimate token count for content optimization
   */
  estimateTokenCount(contexts: PageContext[]): number {
    const serialized = JSON.stringify(contexts);
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(serialized.length / 4);
  }

  /**
   * Trim contexts to fit within token limits
   */
  optimizeForTokens(contexts: PageContext[], maxTokens: number = 4000): PageContext[] {
    while (this.estimateTokenCount(contexts) > maxTokens && contexts.length > 1) {
      // Remove the least important page (not the audit target)
      contexts.pop();
    }

    // If still too large, trim content from each page
    if (this.estimateTokenCount(contexts) > maxTokens) {
      contexts.forEach(context => {
        // Trim paragraphs further
        context.mainContent.firstParagraphs = context.mainContent.firstParagraphs.substring(0, 400);
        // Limit headings
        context.mainContent.headings = context.mainContent.headings.slice(0, 3);
        // Limit navigation
        context.nav = context.nav.slice(0, 8);
        // Limit forms and CTAs
        context.formsAndCtas.forms = context.formsAndCtas.forms.slice(0, 2);
        context.formsAndCtas.primaryCtas = context.formsAndCtas.primaryCtas.slice(0, 3);
      });
    }

    return contexts;
  }
}