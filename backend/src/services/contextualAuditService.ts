import { SitemapService, SitemapUrl } from './sitemapService';
import { HtmlParserService, PageContext } from './htmlParserService';
import { OpenRouterService } from './openRouterService';
import { ScreenshotService } from './screenshotService';
import { AuditData, GeminiAnalysisPrompt } from '../types';
import axios from 'axios';

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
   * OPTIMIZED: Full depth maintained with smart parallelization and graceful fallbacks
   */
  async performContextualAudit(prompt: GeminiAnalysisPrompt): Promise<AuditData> {
    const startTime = Date.now();

    try {
      console.log('🚀 Starting optimized audit with full depth...');

      // STEP 1: Quick ping to determine site speed for adaptive timeouts
      const siteSpeed = await this.quickPing(prompt.url!);
      console.log(`⚡ Site speed: ${siteSpeed}ms`);

      // STEP 2: Parallel execution - sitemap, screenshot, and target page HTML
      console.log('🔄 Running parallel: sitemap + screenshot + target page parse...');

      const [sitemapResult, imageBase64, targetPageContext] = await Promise.all([
        // Task 1: Sitemap extraction with graceful fallback
        (async () => {
          try {
            const sitemap = await this.sitemapService.extractSitemap(prompt.url!);
            console.log(`✅ Sitemap extracted: ${sitemap.length} URLs`);
            return { success: true, data: sitemap };
          } catch (err) {
            console.warn('⚠️  Sitemap unavailable, using target page only');
            return { success: false, data: [{ url: prompt.url!, priority: 1.0 }] };
          }
        })(),

        // Task 2: Screenshot with graceful fallback
        (async () => {
          if (prompt.imageBase64) return prompt.imageBase64;
          if (!prompt.url) return undefined;

          try {
            const timeout = this.getAdaptiveTimeout(siteSpeed, 'screenshot');
            const screenshotBuffer = await this.screenshotService.captureWebsite(prompt.url, timeout);
            console.log('✅ Screenshot captured');
            return this.screenshotService.bufferToBase64(screenshotBuffer);
          } catch (err) {
            console.warn('⚠️  Screenshot unavailable, continuing with HTML only');
            return undefined;
          }
        })(),

        // Task 3: Parse target page immediately (don't wait for sitemap)
        (async () => {
          if (!prompt.url) return null;
          try {
            const contexts = await this.htmlParserService.parseMultiplePages([prompt.url]);
            console.log('✅ Target page parsed');
            return contexts[0];
          } catch (err) {
            console.warn('⚠️  HTML parsing failed for target page');
            return null;
          }
        })()
      ]);

      // STEP 3: Get optimal page selection and parse siblings
      const sitemapUrls = sitemapResult.data;
      const selectedPages = this.sitemapService.getOptimalPageSelection(sitemapUrls, prompt.url!);

      // Parse sibling pages (exclude target since we already have it)
      const siblingPages = selectedPages.filter(p => p !== prompt.url);
      console.log(`🔄 Parsing ${siblingPages.length} sibling pages...`);

      let siblingContexts: PageContext[] = [];
      if (siblingPages.length > 0) {
        try {
          siblingContexts = await this.htmlParserService.parseMultiplePages(siblingPages);
          console.log(`✅ Parsed ${siblingContexts.length} sibling pages`);
        } catch (err) {
          console.warn('⚠️  Some sibling pages failed to parse');
        }
      }

      // Combine all page contexts
      const allContexts = targetPageContext
        ? [targetPageContext, ...siblingContexts]
        : siblingContexts;

      const optimizedContexts = this.htmlParserService.optimizeForTokens(allContexts, 6000);

      // STEP 4: Build full contextual prompt (keeping original depth)
      console.log('📝 Building contextual prompt...');
      const contextualPrompt = this.buildContextualPrompt(
        prompt,
        sitemapUrls.map(u => u.url),
        optimizedContexts
      );

      // STEP 5: AI analysis with Grok-4 (full quality)
      console.log('🤖 Running AI analysis (Grok-4)...');
      const analysisResult = await this.openRouterService.analyzeWithContext(
        contextualPrompt,
        imageBase64
      );

      // Add processing metadata
      const processingTime = Date.now() - startTime;
      const seconds = Math.round(processingTime / 1000);
      console.log(`✅ Optimized audit completed in ${processingTime}ms (${seconds}s)`);

      return {
        ...analysisResult,
        imageUrl: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : undefined,
        analysisMetadata: {
          ...analysisResult.analysisMetadata,
          processingTime,
          pagesAnalyzed: selectedPages,
          siteBusinessGoal: `Full-depth analysis (${sitemapUrls.length} pages in sitemap)`
        }
      };

    } catch (error) {
      console.error('❌ Optimized audit failed:', error);
      throw new Error(`Audit failed: ${(error as Error).message}`);
    }
  }

  /**
   * Quick ping to detect site speed (for adaptive timeouts)
   */
  private async quickPing(url: string): Promise<number> {
    const start = Date.now();
    try {
      await axios.head(url, { timeout: 5000, validateStatus: () => true });
      return Date.now() - start;
    } catch {
      return 5000; // Assume slow if ping fails
    }
  }

  /**
   * Get adaptive timeout based on site speed
   */
  private getAdaptiveTimeout(pingTime: number, operation: 'screenshot' | 'html'): number {
    const baseTimeouts = {
      screenshot: { fast: 15000, medium: 20000, slow: 25000 },
      html: { fast: 12000, medium: 15000, slow: 18000 }
    };

    if (pingTime < 1000) return baseTimeouts[operation].fast;
    if (pingTime < 3000) return baseTimeouts[operation].medium;
    return baseTimeouts[operation].slow;
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

    return `As a senior UX consultant, analyze ${subject} using consultative, user-impact language—not technical terms. Focus on user needs, business outcomes, and emotional barriers.

BUSINESS CONTEXT PROVIDED:
[Site Structure] ${sitemapContext}
[Page Content] ${pageContextBlocks}

${originalPrompt.targetAudience ? `Target Users: ${originalPrompt.targetAudience}` : ''}
${originalPrompt.userGoals ? `User Goals: ${originalPrompt.userGoals}` : ''}
${originalPrompt.businessObjectives ? `Business Impact: ${originalPrompt.businessObjectives}` : ''}

CONSULTATIVE LANGUAGE GUIDELINES:
✅ USE: "Users struggle to find navigation", "Trust barriers prevent conversion", "Poor color contrast affects readability"
❌ AVOID: "NAV is empty", "MAIN_CONTENT selector", "DOM element missing"

✅ USE: "Visual hierarchy confuses users", "Button placement reduces clicks", "Page loading frustrates visitors"
❌ AVOID: "CSS selector issues", "HTML structure problems", "Technical implementation errors"

ANALYSIS FOCUS AREAS:
1. **User Experience Impact** - How do findings affect real users?
2. **Business Consequences** - What revenue/conversion impact occurs?
3. **Emotional Journey** - What do users feel at each interaction?
4. **Visual Design Quality** - Hierarchy, contrast, typography, spacing issues
5. **Trust & Credibility** - What makes users confident or hesitant?
6. **Accessibility Barriers** - Who gets excluded and why?

VISUAL DESIGN EVALUATION CRITERIA:
- Visual hierarchy clarity and information prioritization
- Color contrast and accessibility compliance
- Typography readability and brand consistency
- Spacing, alignment, and visual breathing room
- Interactive element visibility and affordance

⚠️ CRITICAL INSTRUCTIONS - MUST FOLLOW:
1. **ANALYZE THE ACTUAL SITE** - Do NOT use generic examples or placeholder scores
2. **CALCULATE REAL SCORES** - Base scores (1.0-5.0) on ACTUAL observations from the page content provided
3. **BE SITE-SPECIFIC** - Every heuristic violation MUST reference specific elements you see in the page data
4. **VARY YOUR SCORES** - Different categories should have different scores based on actual quality
5. **INCLUDE businessImpact** - EVERY prioritizedFix MUST have a businessImpact field
6. **NO TEMPLATES** - Do not copy example text; write fresh analysis for THIS specific site

SCORING GUIDANCE:
- 4.5-5.0: Excellent (very few issues)
- 3.5-4.4: Good (minor improvements needed)
- 2.5-3.4: Fair (several issues to address)
- 1.5-2.4: Poor (significant problems)
- 1.0-1.4: Critical (major redesign needed)

Provide comprehensive UX consultancy-level analysis with ONLY a JSON response:

{
  "url": "${subject}",
  "timestamp": "${new Date().toISOString()}",
  "summary": "Consultative summary of business value and user experience opportunities",

  "keyInsights": [
    "User-focused insight explaining visitor behavior and business impact",
    "Trust and credibility factors affecting conversion and engagement"
  ],

  "issues": [
    {
      "title": "User-friendly issue title focusing on impact",
      "category": "heuristics|ux-laws|copywriting|accessibility|visual-design|user-flow",
      "description": "How this issue affects real users and business outcomes",
      "recommendation": "Clear implementation guidance for improving user experience",
      "severity": "critical|major|minor",
      "impact": "high|medium|low",
      "effort": "low|medium|high",
      "userEmotionalImpact": "How users feel when encountering this issue"
    }
  ],

  "scores": {
    "overall": {"score": <YOUR_CALCULATED_SCORE>, "maxScore": 5.0, "percentage": <CALCULATED_PERCENTAGE>},
    "heuristics": {"score": <SCORE_1_TO_5>, "maxScore": 5.0, "findings": "Site-specific assessment based on actual navigation, forms, and interaction patterns observed"},
    "uxLaws": {"score": <SCORE_1_TO_5>, "maxScore": 5.0, "findings": "Site-specific cognitive load and behavior principles evaluation based on actual content density"},
    "accessibility": {"score": <SCORE_1_TO_5>, "maxScore": 5.0, "findings": "Site-specific inclusive design assessment based on actual contrast, labels, and structure"},
    "copywriting": {"score": <SCORE_1_TO_5>, "maxScore": 5.0, "findings": "Site-specific content clarity evaluation based on actual headlines and CTAs"},
    "visualDesign": {"score": <SCORE_1_TO_5>, "maxScore": 5.0, "findings": "Site-specific visual hierarchy assessment based on actual layout and typography"}
  },

  "visualDesignAudit": {
    "visualHierarchy": {
      "score": 3.0,
      "issues": ["Specific visual hierarchy problems users experience"],
      "strengths": ["What works well in guiding user attention"]
    },
    "typography": {
      "score": 3.0,
      "issues": ["Readability and brand consistency problems"],
      "strengths": ["Effective typography choices"]
    },
    "colorContrast": {
      "score": 3.0,
      "issues": ["Accessibility and readability barriers"],
      "affectedElements": ["Specific elements with contrast problems"]
    },
    "spacing": {
      "score": 3.0,
      "issues": ["Crowded or confusing layout problems"],
      "strengths": ["Areas with effective spacing"]
    }
  },

  "prioritizedFixes": [
    {
      "recommendation": "High-impact improvement with clear business benefit",
      "priority": "high|medium|low",
      "businessImpact": "Revenue/conversion/user satisfaction impact",
      "effort": "low|medium|high",
      "timeframe": "immediate|short-term|long-term"
    }
  ],

  "personaDrivenJourney": {
    "persona": "SPECIFIC user type based on ACTUAL site content and business goals (e.g., 'B2B decision-maker seeking enterprise solutions', 'Small business owner researching design services')",
    "personaReasoning": "DETAILED explanation of why this persona matches the site's ACTUAL content, navigation, and CTAs",
    "steps": [
      {
        "step": 1,
        "stage": "awareness|exploration|trust|action|retention",
        "userGoal": "SPECIFIC goal based on ACTUAL page content (e.g., 'Find pricing information for design services', 'Understand company expertise')",
        "emotionalState": "curious|cautious|frustrated|confident|hesitant|overwhelmed",
        "currentExperience": "DETAILED description of what user encounters at this stage on THIS specific site",
        "frictionPoints": ["SPECIFIC barriers from ACTUAL page (e.g., 'Pricing hidden in footer', 'Contact form requires 10 fields')"],
        "trustBarriers": ["SPECIFIC credibility issues from ACTUAL page (e.g., 'No client logos shown', 'Missing team credentials')"],
        "improvements": ["ACTIONABLE enhancements for THIS site (e.g., 'Add pricing table to homepage', 'Include client testimonials in hero section')"]
      }
    ],
    "overallExperience": "excellent|good|fair|poor|broken",
    "keyTakeaway": "One-sentence summary of the user journey quality and primary opportunity"
  }
}

FINAL VALIDATION CHECKLIST - VERIFY BEFORE SUBMITTING:
✓ All scores are CALCULATED based on actual page analysis (NOT 3.0, 3.0, 3.0, 3.2)
✓ Every heuristicViolation mentions SPECIFIC page elements (headings, nav items, CTAs, forms)
✓ Every prioritizedFix has a NON-EMPTY businessImpact field
✓ Scores VARY across categories (different numbers for heuristics, accessibility, etc.)
✓ Analysis references the ACTUAL page content provided (titles, nav items, CTAs)
✓ personaDrivenJourney includes 3-5 journey steps with SITE-SPECIFIC details
✓ Each journey step references ACTUAL page elements and navigation flow

Return ONLY valid JSON starting with { and ending with }`;
  }

  /**
   * Format page context for user-centric analysis
   */
  private formatPageContext(context: PageContext): string {
    const navItems = context.nav.slice(0, 10);
    const navDescription = navItems.length > 0
      ? navItems.map(nav => `"${nav.text}"`).join(', ')
      : 'No navigation menu visible to users';

    const ctaDescription = context.formsAndCtas.primaryCtas.length > 0
      ? context.formsAndCtas.primaryCtas.map(cta => `"${cta.text}"`).join(', ')
      : 'No clear call-to-action buttons available';

    const formDescription = context.formsAndCtas.forms.length > 0
      ? context.formsAndCtas.forms.map(form => `form with fields: [${form.fields.join(', ')}]`).join(', ')
      : 'No forms for user interaction';

    return `=== USER EXPERIENCE ON: ${context.url} ===

PAGE TITLE & DESCRIPTION:
- Page title: "${context.head.title}"
- Search description: "${context.head.metaDescription || 'Missing - users won\'t see description in search results'}"

NAVIGATION EXPERIENCE:
- Available navigation: ${navDescription}

MAIN CONTENT FOR USERS:
- Primary headings: [${context.mainContent.headings.map(h => `"${h}"`).join(', ')}]
- Content preview: "${context.mainContent.firstParagraphs}"

USER ACTIONS AVAILABLE:
- Call-to-action buttons: ${ctaDescription}
- Interactive forms: ${formDescription}`;
  }

  /**
   * Build simplified prompt for ultra-fast analysis (reduced token count)
   */
  private buildSimplifiedPrompt(
    originalPrompt: GeminiAnalysisPrompt,
    pageContext: PageContext | null
  ): string {
    const subject = originalPrompt.url || "the uploaded image";

    // If we have page context, add minimal info
    let contextBlock = '';
    if (pageContext) {
      contextBlock = `
PAGE CONTEXT:
Title: "${pageContext.head.title}"
Main Headings: ${pageContext.mainContent.headings.slice(0, 3).join(', ')}
Primary CTAs: ${pageContext.formsAndCtas.primaryCtas.slice(0, 2).map(c => c.text).join(', ')}
`;
    }

    return `As a senior UX consultant, analyze ${subject} using consultative language focused on user impact and business outcomes.

${contextBlock}

${originalPrompt.targetAudience ? `Target Users: ${originalPrompt.targetAudience}` : ''}
${originalPrompt.userGoals ? `User Goals: ${originalPrompt.userGoals}` : ''}

Provide ONLY a JSON response (no markdown, no code blocks):

{
  "url": "${subject}",
  "timestamp": "${new Date().toISOString()}",
  "summary": "2-3 sentence consultative summary of key UX opportunities",

  "keyInsights": [
    "User-focused insight with business impact",
    "Trust/conversion barrier identified"
  ],

  "scores": {
    "overall": {"score": <CALCULATE_ACTUAL_SCORE>, "maxScore": 5.0, "percentage": <CALCULATE_PERCENTAGE>},
    "heuristics": {"score": <ACTUAL_SCORE_1_TO_5>, "maxScore": 5.0, "findings": "ACTUAL site-specific assessment"},
    "accessibility": {"score": <ACTUAL_SCORE_1_TO_5>, "maxScore": 5.0, "findings": "ACTUAL site-specific assessment"},
    "uxLaws": {"score": <ACTUAL_SCORE_1_TO_5>, "maxScore": 5.0, "findings": "ACTUAL site-specific assessment"},
    "copywriting": {"score": <ACTUAL_SCORE_1_TO_5>, "maxScore": 5.0, "findings": "ACTUAL site-specific assessment"}
  },

  "heuristicViolations": [
    {
      "title": "SITE-SPECIFIC issue based on ACTUAL page elements (e.g., 'Homepage carousel confuses users with auto-rotating content')",
      "heuristic": "User Control and Freedom|Visibility of System Status|Consistency and Standards|Error Prevention|Recognition Rather than Recall|Flexibility and Efficiency|Aesthetic and Minimalist Design|Help Users Recognize Errors|Help and Documentation",
      "violation": "DETAILED explanation referencing ACTUAL elements from page content (navigation menus, CTAs, forms, headings) and their specific usability problems",
      "businessImpact": "SPECIFIC impact on conversion, trust, or user satisfaction for THIS site's users"
    }
  ],

  "prioritizedFixes": [
    {
      "title": "SPECIFIC fix title (e.g., 'Add persistent navigation to product pages')",
      "recommendation": "DETAILED actionable solution referencing specific page elements that need improvement",
      "priority": "high|medium|low",
      "effort": "low|medium|high",
      "businessImpact": "REQUIRED - Expected measurable outcome (e.g., 'Reduce bounce rate by 15% on product pages', 'Increase form completion by 25%')"
    }
  ],

  "personaDrivenJourney": {
    "persona": "SPECIFIC user type based on ACTUAL site (e.g., 'Small business owner seeking UX consulting')",
    "personaReasoning": "Why this persona matches the site's content and CTAs",
    "steps": [
      {
        "step": 1,
        "stage": "awareness|exploration|trust|action",
        "userGoal": "SPECIFIC goal from ACTUAL site content",
        "emotionalState": "curious|cautious|frustrated|confident",
        "currentExperience": "What user encounters on THIS site",
        "frictionPoints": ["ACTUAL barrier from page"],
        "trustBarriers": ["ACTUAL credibility issue"],
        "improvements": ["ACTIONABLE fix for THIS site"]
      }
    ],
    "overallExperience": "excellent|good|fair|poor|broken",
    "keyTakeaway": "One-sentence journey quality summary"
  }
}

IMPORTANT:
- Focus on TOP 3-5 issues only
- Include 3-5 journey steps with SITE-SPECIFIC details
- Every journey step must reference ACTUAL page elements
- Return valid JSON starting with { and ending with }`;
  }
}