import { SitemapService, SitemapUrl } from './sitemapService';
import { HtmlParserService, PageContext } from './htmlParserService';
import { OpenRouterService } from './openRouterService';
import { ScreenshotService } from './screenshotService';
import { AuditData, GeminiAnalysisPrompt } from '../types';

export class ContextualAuditService {
  private sitemapService: SitemapService;
  private htmlParserService: HtmlParserService;
  private openRouterService: OpenRouterService;
  private screenshotService: ScreenshotService;

  constructor(apiKey: string) {
    this.sitemapService = new SitemapService();
    this.htmlParserService = new HtmlParserService();
    this.openRouterService = new OpenRouterService(apiKey);
    this.screenshotService = new ScreenshotService();
  }

  /**
   * Perform enhanced contextual UX audit with sitemap + HTML analysis + visual analysis
   */
  async performContextualAudit(prompt: GeminiAnalysisPrompt): Promise<AuditData> {
    const startTime = Date.now();

    try {
      // Step 1: Extract sitemap and get optimal page selection
      console.log('Step 1: Extracting sitemap...');
      const sitemapUrls = await this.sitemapService.extractSitemap(prompt.url!);
      const selectedPages = this.sitemapService.getOptimalPageSelection(sitemapUrls, prompt.url!);

      console.log(`Selected pages for analysis: ${selectedPages.join(', ')}`);

      // Step 2: Parse HTML content for selected pages
      console.log('Step 2: Parsing HTML content...');
      const pageContexts = await this.htmlParserService.parseMultiplePages(selectedPages);
      const optimizedContexts = this.htmlParserService.optimizeForTokens(pageContexts, 6000);

      // Step 3: Capture screenshot for visual analysis (keep existing functionality)
      console.log('Step 3: Capturing screenshot...');
      let imageBase64: string | undefined;
      if (prompt.imageBase64) {
        imageBase64 = prompt.imageBase64;
      } else if (prompt.url && prompt.analysisType === 'url') {
        try {
          const screenshotBuffer = await this.screenshotService.captureWebsite(prompt.url);
          imageBase64 = this.screenshotService.bufferToBase64(screenshotBuffer);
          console.log('Screenshot captured successfully');
        } catch (screenshotError) {
          console.error('Screenshot capture failed:', screenshotError);
          imageBase64 = undefined;
        }
      }

      // Step 4: Build enhanced contextual prompt
      console.log('Step 4: Building contextual prompt...');
      const contextualPrompt = this.buildContextualPrompt(
        prompt,
        sitemapUrls.map(u => u.url),
        optimizedContexts
      );

      // Step 5: Perform AI analysis with enhanced context
      console.log('Step 5: Performing AI analysis...');
      const analysisResult = await this.openRouterService.analyzeWithContext(
        contextualPrompt,
        imageBase64
      );

      // Add processing metadata
      const processingTime = Date.now() - startTime;
      console.log(`Contextual audit completed in ${processingTime}ms`);

      return {
        ...analysisResult,
        imageUrl: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : undefined,
        analysisMetadata: {
          ...analysisResult.analysisMetadata,
          processingTime,
          pagesAnalyzed: selectedPages,
          siteBusinessGoal: `Contextual analysis (${sitemapUrls.length} pages in sitemap)`
        }
      };

    } catch (error) {
      console.error('Contextual audit failed, falling back to standard audit:', error);

      // Fallback to existing standard audit method
      return await this.openRouterService.analyzeUX(prompt);
    }
  }

  /**
   * Build enhanced prompt with contextual information
   */
  private buildContextualPrompt(
    originalPrompt: GeminiAnalysisPrompt,
    sitemapUrls: string[],
    pageContexts: PageContext[]
  ): string {
    const subject = originalPrompt.url || "the uploaded image";

    // Build sitemap context
    const sitemapContext = sitemapUrls.slice(0, 20).map(url => `- ${url}`).join('\n');

    // Build page context blocks
    const pageContextBlocks = pageContexts.map(context => this.formatPageContext(context)).join('\n\n');

    return `SYSTEM: You are a precise UX auditor. Use only the context provided below for evidence. Always produce ONLY valid JSON that exactly matches the audit schema.

CONTEXT (use this as your ONLY evidence source):

[SITEMAP - Site Structure]
${sitemapContext}

[PAGE CONTEXTS]
${pageContextBlocks}

INSTRUCTIONS:
1) Use the sitemap and page contexts above as the ONLY evidence source for all findings
2) For EVERY issue, heuristic violation, and recommendation, include:
   - Quoted evidence (exact text from page contexts)
   - Source page URL
   - Specific selector or element reference
3) Focus primarily on analyzing: ${subject}
4) Combine contextual insights (from HTML) with visual insights (from screenshot if provided)
5) Provide solid "WHY" reasoning for every finding based on the context provided

ANALYSIS REQUIREMENTS:
- heuristicViolations: Maximum 3 violations, minimum 2
- prioritizedFixes: Maximum 5 recommendations
- All findings must be grounded in the provided context
- Include specific evidence and selectors for actionable fixes
- Use actual heuristic names (not "Nielsen's X Heuristic")

${originalPrompt.targetAudience ? `Target Audience: ${originalPrompt.targetAudience}` : ''}
${originalPrompt.userGoals ? `User Goals: ${originalPrompt.userGoals}` : ''}
${originalPrompt.businessObjectives ? `Business Objectives: ${originalPrompt.businessObjectives}` : ''}

Analyze ${subject} and respond with ONLY a valid JSON object (no extra text):

{
  "url": "${subject}",
  "timestamp": "${new Date().toISOString()}",
  "summary": "Brief description of the business and main UX issues found (reference specific context)",

  "keyInsights": [
    "Key finding with specific evidence from page context",
    "Pattern observed with actual examples from provided context"
  ],

  "issues": [
    {
      "title": "Specific issue found",
      "category": "navigation|content|forms|accessibility|performance|visual-hierarchy",
      "description": "Description with quoted text from context and specific selectors",
      "recommendation": "Specific fix with reference to context elements",
      "severity": "critical|major|minor",
      "priority": "high|medium|low",
      "effort": "low|medium|high"
    }
  ],

  "scores": {
    "overall": {"score": 3.2, "maxScore": 5.0, "percentage": 64},
    "heuristics": {"score": 3.0, "maxScore": 5.0, "findings": "Assessment based on context"},
    "uxLaws": {"score": 3.0, "maxScore": 5.0, "findings": "Assessment based on context"},
    "accessibility": {"score": 3.0, "maxScore": 5.0, "findings": "Assessment based on context"},
    "copywriting": {"score": 3.0, "maxScore": 5.0, "findings": "Assessment based on context"}
  },

  "prioritizedFixes": [
    {
      "title": "Top recommendation",
      "recommendation": "Specific implementation guidance with context references",
      "priority": "high|medium|low",
      "effort": "low|medium|high"
    }
  ],

  "personaDrivenJourney": {
    "persona": "Primary user type based on site context",
    "steps": [
      {
        "step": "Landing experience based on homepage context",
        "issues": ["Issues from context analysis"],
        "improvements": ["Improvements based on context"]
      }
    ]
  },

  "heuristicViolations": [
    {
      "title": "Specific violation title",
      "heuristic": "Actual heuristic name",
      "violation": "Description with quoted context evidence",
      "element": "Specific selector from context",
      "evidence": "Quoted text from page context",
      "businessImpact": "Impact assessment based on context"
    }
  ]
}`;
  }

  /**
   * Format page context for prompt inclusion
   */
  private formatPageContext(context: PageContext): string {
    return `=== PAGE: ${context.url} ===

HEAD:
title: "${context.head.title}"
meta_description: "${context.head.metaDescription}"
${context.head.canonical ? `canonical: "${context.head.canonical}"` : ''}
${context.head.jsonLd ? `json_ld: ${JSON.stringify(context.head.jsonLd).substring(0, 200)}...` : ''}

NAV:
${context.nav.slice(0, 10).map(nav => `- "${nav.text}" -> ${nav.href}`).join('\n')}

MAIN_CONTENT:
headings: [${context.mainContent.headings.map(h => `"${h}"`).join(', ')}]
content: "${context.mainContent.firstParagraphs}"
selectors: [${context.mainContent.selectors.map(s => `"${s}"`).join(', ')}]

FORMS_AND_CTAS:
${context.formsAndCtas.forms.map(form =>
  `- form "${form.selector}" fields: [${form.fields.join(', ')}]`
).join('\n')}
${context.formsAndCtas.primaryCtas.map(cta =>
  `- cta "${cta.text}" selector: "${cta.selector}"${cta.href ? ` href: "${cta.href}"` : ''}`
).join('\n')}`;
  }
}