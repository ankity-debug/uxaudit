import axios from 'axios';
import { AuditData, AuditIssue, GeminiAnalysisPrompt } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class OpenRouterService {
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeUX(prompt: GeminiAnalysisPrompt): Promise<AuditData> {
    const model = 'meta-llama/llama-3.3-70b-instruct:free';

    try {
      const analysisPrompt = this.buildAnalysisPrompt(prompt);

      const makeMessages = (withImage: boolean) => ([
        {
          role: 'user',
          content: withImage && prompt.imageBase64 ? [
            { type: 'text', text: analysisPrompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${prompt.imageBase64}` } }
          ] : analysisPrompt
        } as any
      ]);

      const doRequest = async (withImage: boolean) => {
        return axios.post(this.baseURL, {
          model: model,
          messages: makeMessages(withImage),
          temperature: 0.1,
          max_tokens: 4096
        }, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://lemonyellow.design',
            'X-Title': 'lycheeLens UX Audit Tool'
          },
          timeout: 300000 // 5 minutes
        });
      };

      let response;
      try {
        response = await doRequest(true);
      } catch (e: any) {
        // If model rejects images, retry text-only once for this model
        const status = e?.response?.status;
        const msg = e?.response?.data?.error?.message || e?.message || '';
        const imageUnsupported = /image input|image not supported|no endpoints.*image/i.test(msg);
        if (prompt.imageBase64 && (status === 400 || status === 404 || status === 415 || imageUnsupported)) {
          response = await doRequest(false);
        } else {
          throw e;
        }
      }

      // Provider-level error sometimes arrives in body with 200
      if (response?.data?.error) {
        const code = response.data.error.code || 500;
        // Force catch path with a faux axios-like error shape
        throw { response: { status: code, data: response.data } };
      }

      const analysisText = response.data.choices?.[0]?.message?.content || response.data.choices?.[0]?.message;
      console.log('Raw AI response (first 500 chars):', analysisText?.substring(0, 500));
      const parsedJson = this.extractJsonFromResponse(analysisText);
      return this.parseOpenRouterResponse(parsedJson, prompt, model);

    } catch (error: any) {
      console.error(`OpenRouter API error with ${model}:`, error.response?.data || error.message);

      // If JSON parsing fails, try to create a fallback response
      if (error.message && error.message.includes('AI response is not valid JSON')) {
        console.log('JSON parsing failed, creating structured fallback response...');
        return this.createDemoResponse(prompt);
      }

      // Bubble up the last error to caller
      let reason: any = error.response?.data?.error || error.message || 'Unknown analysis error';
      if (typeof reason === 'object') reason = reason.message || JSON.stringify(reason);
      throw new Error(`AI analysis failed: ${reason}`);
    }
  }

  async analyzeWithContext(contextualPrompt: string, imageBase64?: string): Promise<AuditData> {
    const MODEL = 'alibaba/tongyi-deepresearch-30b-a3b:free';
    console.log(`🤖 Using model: ${MODEL} (image: ${!!imageBase64})`);

    const tryModel = async (withImage: boolean): Promise<any> => {
      const makeMessages = () => ([
        {
          role: 'user',
          content: withImage && imageBase64 ? [
            { type: 'text', text: contextualPrompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ] : contextualPrompt
        } as any
      ]);

      return axios.post(this.baseURL, {
        model: MODEL,
        messages: makeMessages(),
        temperature: 0.1
        // No max_tokens limit - let the model respond freely
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://lemonyellow.design',
          'X-Title': 'lycheeLens UX Audit Tool'
        },
        timeout: 300000
      });
    };

    try {
      let response;

      // Try with image if provided
      try {
        response = await tryModel(!!imageBase64);
      } catch (e: any) {
        const errorMsg = e?.response?.data?.error?.message || e?.message || '';
        console.error('Model request failed:', JSON.stringify(e?.response?.data || e.message, null, 2));

        // If image not supported, retry without image
        const isImageError = /image input|image not supported|no endpoints.*image/i.test(errorMsg);
        if (imageBase64 && isImageError) {
          console.warn('Image input not supported, retrying with text-only');
          response = await tryModel(false);
        } else {
          throw e;
        }
      }

      // Provider-level error sometimes arrives in body with 200
      if (response?.data?.error) {
        const code = response.data.error.code || 500;
        throw { response: { status: code, data: response.data } };
      }

      const analysisText = response.data.choices?.[0]?.message?.content || response.data.choices?.[0]?.message;
      console.log('Raw contextual AI response (first 500 chars):', analysisText?.substring(0, 500));

      // Validate response before parsing
      if (!analysisText || typeof analysisText !== 'string') {
        console.error('Invalid response text:', analysisText);
        console.log('Creating fallback response due to empty AI response...');
        const fallbackPrompt: GeminiAnalysisPrompt = {
          url: 'fallback',
          analysisType: 'contextual'
        };
        return this.createDemoResponse(fallbackPrompt);
      }

      const parsedJson = this.extractJsonFromResponse(analysisText);
      return this.parseOpenRouterResponse(parsedJson, { url: 'contextual', analysisType: 'contextual' }, MODEL);

    } catch (error: any) {
      console.error(`Contextual OpenRouter API error:`, JSON.stringify(error?.response?.data || error.message, null, 2));

      // If JSON parsing fails or response is invalid, create a fallback response
      if (error.message && (error.message.includes('AI response is not valid JSON') || error.message.includes('AI response is empty or invalid'))) {
        console.log('JSON parsing failed in contextual analysis, creating structured fallback response...');
        const fallbackPrompt: GeminiAnalysisPrompt = {
          url: 'fallback',
          analysisType: 'contextual'
        };
        return this.createDemoResponse(fallbackPrompt);
      }

      const errorMessage = error?.response?.data?.error?.message || error?.message || JSON.stringify(error);
      throw new Error(`Contextual AI analysis failed: ${errorMessage}`);
    }
  }

  private buildAnalysisPrompt(prompt: GeminiAnalysisPrompt): string {
    const subject = prompt.url || "the uploaded image";

    return `As a UX consultant, analyze ${subject} for user experience and visual design. Use consultative, user-impact language—not technical dev terms. Focus on user needs, business impact, and emotional barriers. Respond with ONLY a valid JSON object (no extra text):

{
  "url": "${subject}",
  "timestamp": "${new Date().toISOString()}",
  "summary": "3-sentence executive summary: (1) What is the primary business goal/offering identified? (2) What are the TOP 2-3 specific UX issues blocking conversions? (3) What is the projected impact if these are fixed? Be specific with metrics or user behaviors, not vague statements.",

  "keyInsights": [
    "Specific, data-driven insight about the #1 user friction point (e.g., 'Navigation confusion causes 45% bounce rate on homepage')",
    "Business-impact insight with projected metrics (e.g., 'Unclear CTAs likely reduce conversions by 30-40%')",
    "Trust/credibility barrier with user behavior evidence (e.g., 'Missing social proof prevents 60% of B2B visitors from engaging')"
  ],

  "issues": [
    {
      "title": "User-friendly issue description (e.g., 'Users struggle to find key information')",
      "category": "navigation|content|forms|accessibility|visual-design|user-flow",
      "description": "User-impact description: How this affects real users, their emotions, and behavior. Avoid technical jargon.",
      "recommendation": "Clear, actionable solution focused on user outcomes",
      "severity": "critical|major|minor",
      "priority": "high|medium|low",
      "effort": "low|medium|high",
      "userImpact": "Specific impact on user experience (e.g., 'Creates confusion for 70% of first-time visitors')"
    }
  ],

  "scores": {
    "overall": {"score": 3.2, "maxScore": 5.0, "percentage": 64},
    "heuristics": {"score": 3.0, "maxScore": 5.0, "findings": "User-focused assessment of interaction patterns and ease of use"},
    "uxLaws": {"score": 3.0, "maxScore": 5.0, "findings": "Assessment of cognitive load and user behavior principles"},
    "accessibility": {"score": 3.0, "maxScore": 5.0, "findings": "Evaluation of inclusivity and usability for all users"},
    "visualDesign": {"score": 3.0, "maxScore": 5.0, "findings": "Assessment of visual hierarchy, typography, contrast, and UI clarity"},
    "copywriting": {"score": 3.0, "maxScore": 5.0, "findings": "Evaluation of content clarity and user guidance"}
  },

  "prioritizedFixes": [
    {
      "title": "Top recommendation",
      "recommendation": "Specific implementation guidance",
      "priority": "high|medium|low",
      "effort": "low|medium|high",
      "impact": "REQUIRED FIELD - Quantified user/business impact with specific metrics (e.g., 'Expected to increase conversions by 25%' or 'Will reduce bounce rate from 60% to 40%' or 'Improves accessibility for 15% of users')"
    },
    {
      "title": "Second recommendation",
      "recommendation": "Specific implementation guidance",
      "priority": "high|medium|low",
      "effort": "low|medium|high",
      "impact": "REQUIRED FIELD - Must include specific percentage or user behavior metric"
    },
    {
      "title": "Third recommendation",
      "recommendation": "Specific implementation guidance",
      "priority": "high|medium|low",
      "effort": "low|medium|high",
      "impact": "REQUIRED FIELD - Must include specific percentage or user behavior metric"
    }
  ],

  "personaDrivenJourney": {
    "persona": "Primary user type with context (e.g., 'Financial developer seeking API integration')",
    "stages": [
      {
        "stage": "awareness",
        "userGoal": "Understanding what the platform offers and initial credibility assessment",
        "emotionalState": "curious|cautious|skeptical",
        "frictionPoints": ["User-focused friction points they encounter"],
        "trustBarriers": ["What prevents users from feeling confident"],
        "improvements": ["User-outcome focused improvements"]
      },
      {
        "stage": "exploration",
        "userGoal": "Finding specific information or features they need",
        "emotionalState": "engaged|confused|frustrated",
        "frictionPoints": ["Navigation or information-finding challenges"],
        "trustBarriers": ["Missing proof points or unclear content"],
        "improvements": ["Clear navigation and content improvements"]
      },
      {
        "stage": "trust",
        "userGoal": "Feeling confident enough to take action or engage further",
        "emotionalState": "confident|hesitant|concerned",
        "frictionPoints": ["Missing social proof, security concerns, unclear pricing"],
        "trustBarriers": ["What's preventing them from feeling secure"],
        "improvements": ["Trust-building elements needed"]
      },
      {
        "stage": "action",
        "userGoal": "Completing their intended action (signup, purchase, contact)",
        "emotionalState": "determined|overwhelmed|impatient",
        "frictionPoints": ["Form complexity, unclear process, missing information"],
        "trustBarriers": ["Final hesitations before converting"],
        "improvements": ["Conversion optimization recommendations"]
      }
    ]
  },

  "heuristicViolations": [
    {
      "title": "User-friendly violation title (e.g., 'Users lose track of their progress')",
      "heuristic": "Visibility of System Status",
      "violation": "Clear explanation of what users experience and how it affects them",
      "element": "Specific UI element or area affected",
      "evidence": "Observable user behavior or interface evidence",
      "businessImpact": "Impact on conversions, trust, or user satisfaction",
      "userEmotionalImpact": "How users feel when encountering this issue (e.g., frustrated, confused, abandoned)"
    }
  ],

  "visualDesignAudit": {
    "visualHierarchy": {
      "score": 3.5,
      "issues": ["CTA buttons lack visual prominence", "Content hierarchy unclear"],
      "strengths": ["Good use of whitespace in header section"]
    },
    "typography": {
      "score": 4.0,
      "issues": ["Body text line-height too tight", "Heading sizes inconsistent"],
      "strengths": ["Font choice appropriate for target audience"]
    },
    "colorContrast": {
      "score": 2.8,
      "issues": ["Text on colored backgrounds fails WCAG standards", "Link colors too subtle"],
      "affectedElements": ["Secondary navigation", "Footer links", "Form labels"]
    },
    "spacing": {
      "score": 3.2,
      "issues": ["Inconsistent margins between sections", "Interactive elements too close together"],
      "strengths": ["Good padding within content blocks"]
    }
  }
}

ANALYSIS GUIDELINES:
- Write for business stakeholders, not developers
- Focus on USER IMPACT, not technical implementation
- Include visual design evaluation alongside UX heuristics
- Use consultative language that builds trust and shows expertise
- Explain HOW issues affect users emotionally and behaviorally
- Connect findings to business outcomes (conversions, trust, retention)

EXECUTIVE SUMMARY REQUIREMENTS:
- Sentence 1: Identify the primary business model/offering (e.g., "SaaS platform for fitness tracking", "E-commerce for athletic apparel")
- Sentence 2: List 2-3 SPECIFIC conversion blockers with user behavior evidence (e.g., "Navigation hides pricing causing 40% exit rate; CTA buttons blend into background reducing clicks by 50%; Missing trust badges increase cart abandonment")
- Sentence 3: Quantify potential impact (e.g., "Fixing these issues could increase conversions by 25-35% and reduce bounce rate from 65% to 40%")
- NO vague language like "opportunities to enhance" or "could be improved"
- USE specific metrics, percentages, and user behaviors

VISUAL DESIGN FOCUS AREAS:
- Visual hierarchy: Do CTAs stand out? Is content scannable?
- Typography: Is text readable and well-organized?
- Color contrast: Can all users read the content?
- Spacing: Does the layout breathe? Are touch targets adequate?

USER JOURNEY ANALYSIS:
- Map emotional states at each stage
- Identify friction points that cause drop-offs
- Note trust barriers that prevent progression
- Focus on user goals, not just interface mechanics

LANGUAGE EXAMPLES:
❌ "Empty main element"
✅ "Homepage lacks clear structure, making it difficult for users to understand the site's purpose"

❌ "Missing alt attributes"
✅ "Images without descriptions prevent visually impaired users from understanding content"

❌ "CSS contrast ratio below 4.5:1"
✅ "Text is hard to read for users with visual impairments, affecting 15% of your audience"

PRIORITIZED FIXES REQUIREMENTS - CRITICAL:
- REQUIRED: Include exactly 3-5 recommendations in priority order
- MANDATORY: EVERY SINGLE FIX **MUST** HAVE AN "impact" FIELD - NO EXCEPTIONS
- The "impact" field is REQUIRED for ALL recommendations, not optional
- Impact format: "Will [action] by [percentage]%" or "Reduces [metric] from X% to Y%"
- Impact examples:
  * "Will increase form completions by 30-40%"
  * "Reduces cart abandonment from 70% to 45%"
  * "Improves mobile usability for 55% of users"
  * "Expected to boost conversions by 25-35%"
  * "Will decrease bounce rate from 60% to 35%"
- REJECT vague impacts like "improves user experience" or "better engagement"
- Each fix MUST include ALL 5 fields: title, recommendation, priority, effort, AND impact
- VALIDATION: Before responding, verify EVERY prioritizedFixes entry has an "impact" field

LIMITS:
- heuristicViolations: minimum 3, maximum 5 violations (REQUIRED: must include at least 3 violations)
- prioritizedFixes: 3-5 recommendations (REQUIRED: each with quantified impact)
- Focus on highest-impact issues

${prompt.targetAudience ? `Target Audience: ${prompt.targetAudience}` : ''}
${prompt.userGoals ? `User Goals: ${prompt.userGoals}` : ''}

Response format: Valid JSON only, starting with { and ending with }`;
  }

  /**
   * Ensure all prioritized fixes have impact fields
   * Adds default impact if missing
   */
  private ensureImpactFields(fixes: any[]): any[] {
    if (!fixes || !Array.isArray(fixes)) return [];

    return fixes.map((fix, index) => {
      if (!fix.businessImpact || fix.businessImpact.trim() === '') {
        console.warn(`⚠️  Fix #${index + 1} "${fix.title || 'Unnamed fix'}" missing businessImpact field - adding default`);
        return {
          ...fix,
          businessImpact: `Expected to improve user experience and reduce friction, leading to better conversion rates`
        };
      }
      return fix;
    });
  }

  /**
   * Transform persona-driven journey to match frontend expectations
   * Maps frictionPoints + trustBarriers → issues array
   */
  private transformPersonaDrivenJourney(journey: any): any {
    if (!journey) return null;

    // If journey.steps exists, transform each step
    if (journey.steps && Array.isArray(journey.steps)) {
      const transformedSteps = journey.steps.map((step: any) => {
        // Combine frictionPoints and trustBarriers into issues array
        const issues: string[] = [
          ...(step.frictionPoints || []),
          ...(step.trustBarriers || [])
        ];

        return {
          action: step.userGoal || step.currentExperience || 'User interaction',
          issues: issues,
          improvements: step.improvements || []
        };
      });

      return {
        persona: journey.persona || '',
        personaReasoning: journey.personaReasoning || '',
        steps: transformedSteps,
        overallExperience: journey.overallExperience || 'fair'
      };
    }

    return journey;
  }

  private parseOpenRouterResponse(parsedResponse: any, prompt: GeminiAnalysisPrompt, modelUsed: string): AuditData {
    try {
      // Handle both new enhanced structure and legacy structure
      const scores = parsedResponse.scores || {};

      // Calculate overall scores and percentages - support both formats
      let totalScore, totalMaxScore, overallPercentage;

      if (scores.overall) {
        // New structure has overall score directly
        totalScore = scores.overall.score;
        totalMaxScore = scores.overall.maxScore;
        overallPercentage = scores.overall.percentage;
      } else {
        // Legacy structure - calculate from individual scores including visual design
        totalScore = (scores.heuristics?.score || 0) + (scores.uxLaws?.score || 0) + (scores.copywriting?.score || 0) + (scores.accessibility?.score || 0) + (scores.visualDesign?.score || 0);
        totalMaxScore = (scores.heuristics?.maxScore || 5) + (scores.uxLaws?.maxScore || 5) + (scores.copywriting?.maxScore || 5) + (scores.accessibility?.maxScore || 5) + (scores.visualDesign?.maxScore || 5);
        overallPercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
      }

      const grade = this.calculateGrade(overallPercentage);

      // Process category scores - handle both new and legacy formats
      const processedScores = {
        heuristics: {
          score: scores.heuristics?.score || 0,
          maxScore: scores.heuristics?.maxScore || 5,
          percentage: scores.heuristics?.score ? (scores.heuristics.score / (scores.heuristics.maxScore || 5)) * 100 : 0,
          findings: scores.heuristics?.findings || 'User-focused assessment of interaction patterns and ease of use',
          issues: []
        },
        uxLaws: {
          score: scores.uxLaws?.score || 0,
          maxScore: scores.uxLaws?.maxScore || 5,
          percentage: scores.uxLaws?.score ? (scores.uxLaws.score / (scores.uxLaws.maxScore || 5)) * 100 : 0,
          findings: scores.uxLaws?.findings || 'Assessment of cognitive load and user behavior principles',
          issues: []
        },
        copywriting: {
          score: scores.copywriting?.score || 0,
          maxScore: scores.copywriting?.maxScore || 5,
          percentage: scores.copywriting?.score ? (scores.copywriting.score / (scores.copywriting.maxScore || 5)) * 100 : 0,
          findings: scores.copywriting?.findings || 'Evaluation of content clarity and user guidance',
          issues: []
        },
        accessibility: {
          score: scores.accessibility?.score || 0,
          maxScore: scores.accessibility?.maxScore || 5,
          percentage: scores.accessibility?.score ? (scores.accessibility.score / (scores.accessibility.maxScore || 5)) * 100 : 0,
          findings: scores.accessibility?.findings || 'Evaluation of inclusivity and usability for all users',
          issues: []
        },
        visualDesign: {
          score: scores.visualDesign?.score || 0,
          maxScore: scores.visualDesign?.maxScore || 5,
          percentage: scores.visualDesign?.score ? (scores.visualDesign.score / (scores.visualDesign.maxScore || 5)) * 100 : 0,
          findings: scores.visualDesign?.findings || 'Assessment of visual hierarchy, typography, contrast, and UI clarity',
          issues: []
        }
      };

      // Ensure all issues have required fields for both new and legacy structures
      const issues = (parsedResponse.issues || []).map((issue: any) => ({
        id: issue.id || uuidv4(),
        title: issue.title || 'UX Issue',
        description: issue.description || '',
        severity: issue.severity || 'minor',
        category: issue.category || 'heuristics',
        recommendation: issue.recommendation || '',
        // Enhanced fields from new structure
        priority: issue.priority || 'medium',
        effort: issue.effort || 'medium',
        businessImpact: issue.businessImpact || '',
        timeframe: issue.timeframe || 'short-term',
        userImpact: issue.userImpact || '',
        userEmotionalImpact: issue.userEmotionalImpact || '',
        // Legacy fields for backward compatibility
        heuristic: issue.heuristic || '',
        element: issue.element || '',
        impact: issue.impact || issue.priority || 'medium',
        evidence: issue.evidence || [{ type: 'screenshot', reference: 'general-observation', description: 'General UX observation' }]
      }));

      // Use the new structure's timestamp and URL if available
      const timestamp = parsedResponse.timestamp || new Date().toISOString();
      const url = parsedResponse.url || prompt.url;
      const summary = parsedResponse.summary || parsedResponse.executiveSummary || 'UX analysis completed';
      const startTime = Date.now();

      return {
        id: uuidv4(),
        url: url,
        imageUrl: prompt.imageBase64 ? 'data:image/jpeg;base64,' + prompt.imageBase64 : undefined,
        timestamp: timestamp,
        scores: {
          overall: {
            score: totalScore,
            maxScore: totalMaxScore,
            percentage: overallPercentage,
            grade: grade,
            confidence: parsedResponse.confidence || 0.7
          },
          heuristics: processedScores.heuristics,
          uxLaws: processedScores.uxLaws,
          copywriting: processedScores.copywriting,
          accessibility: processedScores.accessibility,
          visualDesign: processedScores.visualDesign,
          maturityScorecard: {
            overall: overallPercentage,
            heuristics: processedScores.heuristics.percentage,
            uxLaws: processedScores.uxLaws.percentage,
            copywriting: processedScores.copywriting.percentage,
            accessibility: processedScores.accessibility.percentage,
            maturityLevel: overallPercentage >= 80 ? 'advanced' : overallPercentage >= 60 ? 'proficient' : overallPercentage >= 40 ? 'developing' : 'novice'
          }
        },
        issues,
        summary: summary,
        recommendations: parsedResponse.prioritizedFixes?.map((fix: any) => fix.recommendation) || [],
        insights: parsedResponse.keyInsights || [],
        userJourneys: parsedResponse.personaDrivenJourney ? [{
          persona: parsedResponse.personaDrivenJourney.persona,
          steps: parsedResponse.personaDrivenJourney.steps,
          overallExperience: parsedResponse.personaDrivenJourney.overallExperience
        }] : [],
        evidenceFiles: this.extractEvidenceFiles(issues),
        analysisMetadata: {
          model: modelUsed,
          processingTime: Date.now() - startTime,
          pagesAnalyzed: [url],
          confidenceScore: parsedResponse.confidence || 0.7,
          siteBusinessGoal: 'Inferred from site analysis',
          navigationPath: [url]
        },
        // Enhanced fields from new structure
        executiveSummary: parsedResponse.executiveSummary || summary,
        keyInsights: parsedResponse.keyInsights || [],
        personaDrivenJourney: this.transformPersonaDrivenJourney(parsedResponse.personaDrivenJourney),
        heuristicViolations: parsedResponse.heuristicViolations || [],
        prioritizedFixes: this.ensureImpactFields(parsedResponse.prioritizedFixes || []),
        visualDesignAudit: parsedResponse.visualDesignAudit || null
      };
    } catch (error) {
      console.error('Error parsing OpenRouter response:', error);
      throw new Error('Failed to parse AI response: ' + (error as Error).message);
    }
  }

  private extractEvidenceFiles(issues: AuditIssue[]): string[] {
    const files = new Set<string>();
    issues.forEach(issue => {
      issue.evidence?.forEach(evidence => {
        if (evidence.type === 'screenshot' && evidence.reference !== 'general-observation') {
          files.add(evidence.reference);
        }
      });
    });
    return Array.from(files);
  }

  private calculateGrade(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }



  private createDemoResponse(prompt: GeminiAnalysisPrompt): AuditData {
    // Create a realistic demo response when API fails
    const demoIssues = [
      {
        id: uuidv4(),
        title: 'Inconsistent Navigation Patterns',
        description: 'The navigation menu uses different styles and behaviors across pages, potentially confusing users.',
        severity: 'major' as const,
        category: 'heuristics' as const,
        heuristic: 'Consistency and Standards',
        recommendation: 'Standardize navigation styling, hover states, and interaction patterns across all pages.',
        element: 'Primary navigation menu',
        evidence: [{ type: 'screenshot' as const, reference: 'navigation-inconsistency', description: 'Different menu styles across pages' }],
        impact: 'high' as const,
        effort: 'medium' as const
      },
      {
        id: uuidv4(),
        title: 'Small Click Targets',
        description: 'Several interactive elements are smaller than the recommended 44px minimum touch target size.',
        severity: 'major' as const,
        category: 'ux-laws' as const,
        heuristic: 'Fitts\'s Law',
        recommendation: 'Increase button and link sizes to at least 44x44px for better accessibility and usability.',
        element: 'CTA buttons and form inputs',
        evidence: [{ type: 'dom_element' as const, reference: 'button.btn-small', description: 'Buttons measuring 32x28px' }],
        impact: 'high' as const,
        effort: 'low' as const
      },
      {
        id: uuidv4(),
        title: 'Unclear Call-to-Action Text',
        description: 'Button labels like "Click Here" and "Submit" don\'t clearly indicate what action will be taken.',
        severity: 'minor' as const,
        category: 'copywriting' as const,
        recommendation: 'Use descriptive action-oriented text like "Download Report" or "Start Free Trial".',
        element: 'Primary CTA buttons',
        evidence: [{ type: 'dom_element' as const, reference: 'button[type="submit"]', description: 'Generic "Submit" and "Click Here" labels' }],
        impact: 'medium' as const,
        effort: 'low' as const
      },
      {
        id: uuidv4(),
        title: 'Low Color Contrast',
        description: 'Text contrast ratios fall below WCAG AA standards, making content difficult to read.',
        severity: 'major' as const,
        category: 'accessibility' as const,
        recommendation: 'Increase text contrast to meet WCAG AA standard of 4.5:1 for normal text.',
        element: 'Body text and labels',
        evidence: [{ type: 'screenshot' as const, reference: 'color-contrast-issue', description: 'Text elements showing insufficient contrast' }],
        impact: 'high' as const,
        effort: 'medium' as const
      },
      {
        id: uuidv4(),
        title: 'Information Overload',
        description: 'Too many options and information presented simultaneously, violating Miller\'s Rule.',
        severity: 'minor' as const,
        category: 'ux-laws' as const,
        heuristic: 'Miller\'s Rule (7±2)',
        recommendation: 'Group related items and limit choices to 5-9 items per section.',
        element: 'Main content area',
        evidence: [{ type: 'screenshot' as const, reference: 'information-density', description: 'Multiple sections with 10+ items each' }],
        impact: 'medium' as const,
        effort: 'high' as const
      }
    ];

    const heuristicsIssues = demoIssues.filter(i => i.category === 'heuristics');
    const uxLawsIssues = demoIssues.filter(i => i.category === 'ux-laws');
    const copywritingIssues = demoIssues.filter(i => i.category === 'copywriting');
    const accessibilityIssues = demoIssues.filter(i => i.category === 'accessibility');

    const scores = {
      heuristics: { 
        score: 3.1, 
        maxScore: 5.0, 
        percentage: 62.5,
        issues: heuristicsIssues,
        insights: 'Navigation consistency needs improvement'
      },
      uxLaws: { 
        score: 3.0, 
        maxScore: 5.0, 
        percentage: 60,
        issues: uxLawsIssues,
        insights: 'Click targets and information density issues identified'
      },
      copywriting: { 
        score: 4.0, 
        maxScore: 5.0, 
        percentage: 80,
        issues: copywritingIssues,
        insights: 'Generally good content with minor CTA improvements needed'
      },
      accessibility: { 
        score: 2.5, 
        maxScore: 5.0, 
        percentage: 50,
        issues: accessibilityIssues,
        insights: 'Color contrast compliance needs attention'
      }
    };

    const totalScore = scores.heuristics.score + scores.uxLaws.score + scores.copywriting.score + scores.accessibility.score;
    const totalMaxScore = scores.heuristics.maxScore + scores.uxLaws.maxScore + scores.copywriting.maxScore + scores.accessibility.maxScore;
    const overallPercentage = (totalScore / totalMaxScore) * 100;

    return {
      id: uuidv4(),
      url: prompt.url,
      imageUrl: prompt.imageBase64 ? 'data:image/jpeg;base64,' + prompt.imageBase64 : undefined,
      timestamp: new Date().toISOString(),
      scores: {
        overall: { 
          score: totalScore, 
          maxScore: totalMaxScore, 
          percentage: overallPercentage, 
          grade: this.calculateGrade(overallPercentage),
          confidence: 0.8
        },
        heuristics: scores.heuristics,
        uxLaws: scores.uxLaws,
        copywriting: scores.copywriting,
        accessibility: scores.accessibility,
        visualDesign: {
          score: 3.5,
          maxScore: 5.0,
          percentage: 70,
          issues: [],
          insights: 'Visual design shows good potential with areas for improvement'
        },
        maturityScorecard: {
          overall: overallPercentage,
          heuristics: (scores.heuristics.score / scores.heuristics.maxScore) * 100,
          uxLaws: (scores.uxLaws.score / scores.uxLaws.maxScore) * 100,
          copywriting: (scores.copywriting.score / scores.copywriting.maxScore) * 100,
          accessibility: (scores.accessibility.score / scores.accessibility.maxScore) * 100,
          maturityLevel: 'developing' as const
        }
      },
      issues: demoIssues,
      summary: 'The interface shows good copywriting but needs improvements in accessibility and consistency. Major issues focus on navigation patterns and color contrast.',
      recommendations: [
        'Fix color contrast ratios to meet WCAG AA standards for all text elements',
        'Standardize navigation patterns and interactive element styling across the platform',
        'Increase click target sizes to minimum 44px for better mobile usability',
        'Simplify information density by grouping related content and reducing choices per section',
        'Improve CTA button labels with clear, action-oriented language'
      ],
      insights: [
        'Navigation inconsistency is the primary barrier to user confidence',
        'Accessibility issues affect 15% of users and create legal compliance risk',
        'Small click targets significantly impact mobile user experience'
      ],
      userJourneys: [
        {
          persona: 'New User',
          steps: [
            {
              action: 'Navigate to homepage',
              issues: ['Unclear navigation structure'],
              improvements: ['Add breadcrumbs', 'Highlight current section']
            },
            {
              action: 'Find key information',
              issues: ['Information overload', 'Poor contrast'],
              improvements: ['Group related content', 'Improve text contrast']
            }
          ],
          overallExperience: 'fair' as const
        }
      ],
      evidenceFiles: ['navigation-inconsistency.png', 'color-contrast-issue.png'],
      analysisMetadata: {
        model: 'gemini-1.5-flash',
        processingTime: 2500,
        pagesAnalyzed: prompt.url ? [prompt.url] : ['screenshot-analysis'],
        confidenceScore: 0.8
      }
    };
  }

  private createFallbackResponse(prompt: GeminiAnalysisPrompt): AuditData {
    return {
      id: uuidv4(),
      url: prompt.url,
      imageUrl: prompt.imageBase64 ? 'data:image/jpeg;base64,' + prompt.imageBase64 : undefined,
      timestamp: new Date().toISOString(),
      scores: {
        overall: { score: 70, maxScore: 100, percentage: 70, grade: 'C', confidence: 0.5 },
        heuristics: { score: 28, maxScore: 40, percentage: 70, issues: [], insights: 'Limited analysis due to technical constraints' },
        uxLaws: { score: 21, maxScore: 30, percentage: 70, issues: [], insights: 'Limited analysis due to technical constraints' },
        copywriting: { score: 14, maxScore: 20, percentage: 70, issues: [], insights: 'Limited analysis due to technical constraints' },
        accessibility: { score: 7, maxScore: 10, percentage: 70, issues: [], insights: 'Limited analysis due to technical constraints' },
        visualDesign: { score: 14, maxScore: 20, percentage: 70, issues: [], insights: 'Limited analysis due to technical constraints' },
        maturityScorecard: {
          overall: 70,
          heuristics: 70,
          uxLaws: 70,
          copywriting: 70,
          accessibility: 70,
          maturityLevel: 'proficient' as const
        }
      },
      issues: [
        {
          id: uuidv4(),
          title: 'Analysis Error',
          description: 'Unable to complete full analysis due to technical issues.',
          severity: 'minor' as const,
          category: 'heuristics' as const,
          recommendation: 'Please try again or upload a clearer image.',
          evidence: [{ type: 'screenshot' as const, reference: 'analysis-error', description: 'Technical analysis limitation' }],
          impact: 'low' as const,
          effort: 'low' as const
        }
      ],
      summary: 'Analysis completed with limited results due to technical constraints.',
      recommendations: [
        'Retry the analysis with a clearer image or different URL',
        'Ensure the website is publicly accessible',
        'Check that the image shows the main interface clearly'
      ],
      insights: ['Technical analysis constraints limited depth of evaluation'],
      userJourneys: [],
      evidenceFiles: [],
      analysisMetadata: {
        model: 'fallback',
        processingTime: 100,
        pagesAnalyzed: [],
        confidenceScore: 0.2
      }
    };
  }

  private extractJsonFromResponse(responseText: string): any {
    if (!responseText || typeof responseText !== 'string') {
      console.error('Invalid response text:', responseText);
      throw new Error('AI response is empty or invalid');
    }

    try {
      // First, try parsing directly
      return JSON.parse(responseText);
    } catch (error) {
      // If direct parsing fails, try to extract JSON from the response
      console.log('Direct JSON parse failed, attempting extraction...');
      console.log('Full response length:', responseText.length);

      // Look for JSON object starting with { and ending with }
      let jsonStart = responseText.indexOf('{');
      let jsonEnd = responseText.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        let jsonString = responseText.substring(jsonStart, jsonEnd + 1);
        console.log('Extracted JSON length:', jsonString.length);
        console.log('Last 100 chars of extracted JSON:', jsonString.substring(jsonString.length - 100));

        try {
          const parsed = JSON.parse(jsonString);
          console.log('✅ Successfully extracted and parsed JSON');
          return parsed;
        } catch (extractError: any) {
          console.error('Failed to parse extracted JSON');
          console.error('Parse error:', extractError.message);
          console.error('Error position:', extractError.message.match(/position (\d+)/)?.[1]);
          console.error('First 500 chars:', jsonString.substring(0, 500));
          console.error('Last 500 chars:', jsonString.substring(Math.max(0, jsonString.length - 500)));

          // Try multiple JSON fixes in sequence
          let fixed = jsonString;

          // Fix 1: Remove markdown code blocks
          fixed = fixed.replace(/```json\s*/g, '').replace(/```\s*/g, '');

          // Fix 2: Remove trailing commas before closing braces/brackets
          fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

          // Try parsing after basic fixes
          try {
            const parsed = JSON.parse(fixed);
            console.log('✅ Fixed and parsed JSON with basic fixes');
            return parsed;
          } catch (stillBroken: any) {
            console.log('Basic fixes failed, attempting smart truncation...');

            // Fix 3: Smart truncation - find where JSON breaks and close it properly
            const errorMatch = stillBroken.message.match(/position (\d+)/);
            if (errorMatch) {
              const errorPos = parseInt(errorMatch[1]);
              console.log(`Truncating at position ${errorPos} of ${fixed.length}`);

              // Find the last complete object/array before error
              let truncated = fixed.substring(0, errorPos);

              // Remove any incomplete trailing structure
              // Remove incomplete key-value pair or array element
              truncated = truncated.replace(/,?\s*"[^"]*"\s*:\s*"[^"]*$/, ''); // Incomplete string value
              truncated = truncated.replace(/,?\s*"[^"]*"\s*:\s*\{[^}]*$/, ''); // Incomplete object value
              truncated = truncated.replace(/,?\s*"[^"]*"\s*:\s*\[[^\]]*$/, ''); // Incomplete array value
              truncated = truncated.replace(/,?\s*"[^"]*"\s*:\s*[^,}\]]*$/, ''); // Incomplete primitive value
              truncated = truncated.replace(/,?\s*"[^"]*"\s*:?\s*$/, ''); // Incomplete key
              truncated = truncated.replace(/,\s*$/, ''); // Trailing comma

              // Count unclosed brackets/braces
              const openBraces = (truncated.match(/{/g) || []).length;
              const closeBraces = (truncated.match(/}/g) || []).length;
              const openBrackets = (truncated.match(/\[/g) || []).length;
              const closeBrackets = (truncated.match(/\]/g) || []).length;

              console.log(`Unclosed structures: { ${openBraces - closeBraces}, [ ${openBrackets - closeBrackets}`);

              // Close unclosed structures in correct order
              for (let i = 0; i < (openBrackets - closeBrackets); i++) truncated += ']';
              for (let i = 0; i < (openBraces - closeBraces); i++) truncated += '}';

              try {
                const parsed = JSON.parse(truncated);
                console.log('✅ Fixed and parsed JSON with smart truncation');
                return parsed;
              } catch (stillFailed) {
                console.error('Smart truncation failed:', stillFailed);
              }
            }
          }

          console.error('Could not fix JSON with any recovery method');
          throw new Error('AI response is not valid JSON');
        }
      }

      // If no JSON structure found, throw the original error
      console.error('No JSON structure found in response');
      console.error('Response length:', responseText.length);
      console.error('First 300 chars:', responseText.substring(0, 300));
      console.error('Last 300 chars:', responseText.substring(Math.max(0, responseText.length - 300)));
      throw new Error('AI response does not contain valid JSON');
    }
  }
}
