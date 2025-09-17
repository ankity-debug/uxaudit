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
    // Try multiple models in order of preference (free to premium)
    const models = [
      'google/gemma-3-27b-it:free'
    ];
    
    for (let i = 0; i < models.length; i++) {
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
            model: models[i],
            messages: makeMessages(withImage),
            temperature: 0.1,
            max_tokens: 4096,
            response_format: { type: 'json_object' }
          }, {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://lemonyellow.design',
              'X-Title': 'LimeMind UX Audit Tool'
            },
            timeout: 90000
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
        return this.parseOpenRouterResponse(JSON.parse(analysisText), prompt, models[i]);

      } catch (error: any) {
        const status = error?.response?.status || error?.response?.data?.error?.code;
        console.error(`OpenRouter API error with ${models[i]}:`, error.response?.data || error.message);
        if ((status === 429 || status === 402) && i < models.length - 1) {
          console.log(`Rate limited or insufficient credits on ${models[i]}, trying ${models[i + 1]}...`);
          continue;
        }
        // Bubble up the last error to caller (no demo fallback)
        let reason: any = error.response?.data?.error || error.message || 'Unknown analysis error';
        if (typeof reason === 'object') reason = reason.message || JSON.stringify(reason);
        throw new Error(`AI analysis failed: ${reason}`);
      }
    }
    throw new Error('AI analysis failed: all model attempts exhausted');
  }

  private buildAnalysisPrompt(prompt: GeminiAnalysisPrompt): string {
    const isUrl = prompt.analysisType === 'url' && !!prompt.url;
    const subject = isUrl ? `the website at \`${prompt.url}\`` : 'the provided design/screenshot';

    let basePrompt = `## ROLE & GOAL
You are a senior UX consultant from Lemon Yellow, renowned for delivering contextual, business-focused UX audits that go beyond generic templates. Your reputation depends on providing unique insights that directly connect UX friction to business impact.

You are analyzing ${subject} to deliver a comprehensive UX audit following Lemon Yellow's signature audit flow. Every output must be specific, contextual, and demonstrate deep understanding of this particular experience.

## CRITICAL CONTEXTUAL REQUIREMENTS
ABSOLUTELY FORBIDDEN:
- Generic percentages or business impact claims (like "+24% conversion rate")
- Template language that could apply to any website
- Fake competitive benchmarks or industry comparisons
- Made-up statistics or projected improvements
- Generic user personas like "busy professional" or "first-time visitor"

REQUIRED FOR EVERY INSIGHT:
- Quote actual text you see on the site
- Reference specific UI elements by their exact appearance/color/position
- Name actual pages or sections you analyzed
- Identify the real business model/industry from what you observe
- Base persona on the actual target audience evident from content

## AUDIT FLOW REQUIREMENTS

### 1. Executive Summary
- 1-2 sentences based ONLY on what you actually observed
- High-level UX state tied to the site's actual primary business goal
- Must reference specific elements or content from THIS site

### 2. Key Insights (Holistic Patterns)  
- 2-3 insights that emerge from analyzing THIS specific experience
- Quote actual text or describe specific visual elements as evidence
- Focus on patterns you can prove exist across multiple pages/flows

### 3. Persona-Driven User Journey
- Define ONE realistic persona based on the actual content/industry you observe
- Reference actual pages, buttons, forms, or content you can see
- Each step must reference specific elements: actual button text, form fields, page titles
- Issues must be observable problems, not theoretical ones

### 4. Heuristic Violations (Nielsen's 10)
- Reference specific elements you can actually see
- Quote actual text or describe exact visual problems
- Example: "Error Prevention → The contact form shows 'Required' labels only after submission attempt, not before"

### 5. Recommended Fixes (Prioritized)
- Based ONLY on problems you actually identified
- Reference specific elements that need changing
- No business impact projections or conversion rate estimates

## EVIDENCE REQUIREMENTS
Every single finding must include:
- Exact text you can read on the site (in quotes)
- Specific UI element descriptions (button color, position, size)
- Actual page names or URLs where you found the issue
- Real business context derived from the site's actual content/purpose

## ANALYSIS APPROACH
1. First, determine what this website/app actually does from the content
2. Identify the real target audience from the language, imagery, and features
3. Navigate through actual user flows visible in the interface
4. Document only observable problems with specific evidence
5. Create persona based on who this site is clearly designed for

${(prompt.targetAudience || prompt.userGoals || prompt.businessObjectives) ? '## CONTEXT' : ''}
${prompt.targetAudience ? `- Target Audience: ${prompt.targetAudience}` : ''}
${prompt.userGoals ? `- User Goals: ${prompt.userGoals}` : ''}
${prompt.businessObjectives ? `- Business Objectives: ${prompt.businessObjectives}` : ''}

## OUTPUT FORMAT (strict JSON schema)
Respond ONLY with a JSON object matching this new Lemon Yellow audit structure:

{
  "executiveSummary": "1-2 sentences referencing specific elements or content you observed on this site. Must mention actual business model/purpose.",
  "confidence": 0.0,
  "keyInsights": [
    "Quote actual text or reference specific visual elements you observed",
    "Describe specific patterns you found across actual pages/sections",
    "Reference real navigation paths or user flows you analyzed"
  ],
  "personaDrivenJourney": {
    "persona": "Specific persona based on actual target audience evident from site content (not generic)",
    "personaReasoning": "Evidence from actual site content showing why this persona fits (reference specific text/features)",
    "steps": [
      {
        "action": "Specific action referencing actual page names, button text, or content you can see",
        "issues": ["Observable problem with specific UI element or text you can quote"],
        "improvements": ["Specific fix for actual element you identified"]
      }
    ],
    "overallExperience": "excellent|good|fair|poor|broken"
  },
  "heuristicViolations": [
    {
      "heuristic": "Specific Nielsen heuristic name",
      "element": "Exact UI element with specific description (color, position, text)",
      "violation": "Observable problem you can see on this specific site",
      "businessImpact": "Impact based on this site's actual business model (no fake percentages)",
      "evidence": "Quote actual text in quotes or describe specific visual element in detail"
    }
  ],
  "prioritizedFixes": [
    {
      "recommendation": "Specific fix referencing actual elements that need changing",
      "priority": "high|medium|low",
      "businessImpact": "Qualitative impact description (no percentage claims or conversion estimates)",
      "effort": "high|medium|low",
      "timeframe": "immediate|short-term|long-term"
    }
  ],
  "scores": {
    "heuristics": { "score": 0.0, "maxScore": 5.0, "findings": "Assessment based on specific heuristic violations you found with evidence" },
    "uxLaws": { "score": 0.0, "maxScore": 5.0, "findings": "Assessment referencing specific UX law violations you observed" },
    "copywriting": { "score": 0.0, "maxScore": 5.0, "findings": "Assessment of actual text and copy you read on the site" },
    "accessibility": { "score": 0.0, "maxScore": 5.0, "findings": "Assessment based on accessibility issues you can observe" }
  },
  "analysisLog": {
    "siteBusinessGoal": "Primary business objective you determined from actual site content and features",
    "navigationPath": ["List actual pages/sections you analyzed - use real page names or URLs"],
    "keyObservations": ["Specific observation 1 with quoted text or element descriptions", "Specific observation 2 with evidence"],
    "testingApproach": "Describe what specific flows, pages, or elements you actually analyzed"
  }
}

FINAL VALIDATION CHECKLIST - Every response must pass:
✓ Executive summary mentions specific site content or business model
✓ Key insights quote actual text or reference specific visual elements  
✓ Persona is based on evidence from the actual site (not generic)
✓ User journey steps reference actual buttons, forms, or page elements
✓ Heuristic violations quote specific text or describe exact visual problems
✓ Recommendations reference specific elements that need changing
✓ NO generic percentages, conversion claims, or competitive benchmarks
✓ NO template language that could apply to any website

Output requirements:
- Valid JSON only (no markdown, no prose outside JSON)
- All content specific to ${isUrl ? `\`${prompt.url}\`` : 'this image'}
- If analysis is limited, be transparent in analysisLog about what you could/couldn't observe
`;

    if (isUrl) {
      basePrompt += `\n\nAnalyze the website now: ${prompt.url}`;
    } else {
      basePrompt += `\n\nAnalyze the provided screenshot/image for UX issues and opportunities.`;
    }

    return basePrompt;
  }

  private parseOpenRouterResponse(parsedResponse: any, prompt: GeminiAnalysisPrompt, modelUsed: string): AuditData {
    try {
      // Calculate overall scores and percentages
      const scores = parsedResponse.scores;
      const totalScore = scores.heuristics.score + scores.uxLaws.score + scores.copywriting.score + scores.accessibility.score;
      const totalMaxScore = scores.heuristics.maxScore + scores.uxLaws.maxScore + scores.copywriting.maxScore + scores.accessibility.maxScore;
      const overallPercentage = (totalScore / totalMaxScore) * 100;

      // Calculate grade
      const grade = this.calculateGrade(overallPercentage);

      // Process categories
      Object.keys(scores).forEach(key => {
        const category = scores[key];
        category.percentage = (category.score / category.maxScore) * 100;
        category.issues = parsedResponse.issues?.filter((issue: AuditIssue) => issue.category === key.replace('ux', 'ux-').toLowerCase()) || [];
        category.insights = category.findings || 'Analysis completed';
      });

      // Ensure all issues have unique IDs and required fields
      const issues = (parsedResponse.issues || []).map((issue: any) => ({
        ...issue,
        id: issue.id || uuidv4(),
        evidence: issue.evidence || [{ type: 'screenshot', reference: 'general-observation', description: 'Based on visual analysis' }],
        impact: issue.impact || 'medium',
        effort: issue.effort || 'medium'
      }));

      // Calculate maturity scorecard
      const maturityScorecard = {
        overall: overallPercentage,
        heuristics: (scores.heuristics.score / scores.heuristics.maxScore) * 100,
        uxLaws: (scores.uxLaws.score / scores.uxLaws.maxScore) * 100,
        copywriting: (scores.copywriting.score / scores.copywriting.maxScore) * 100,
        accessibility: (scores.accessibility.score / scores.accessibility.maxScore) * 100,
        maturityLevel: overallPercentage >= 90 ? 'expert' as const :
                     overallPercentage >= 80 ? 'advanced' as const :
                     overallPercentage >= 70 ? 'proficient' as const :
                     overallPercentage >= 60 ? 'developing' as const : 'novice' as const
      };

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
            grade,
            confidence: parsedResponse.confidence || 0.8
          },
          heuristics: scores.heuristics,
          uxLaws: scores.uxLaws,
          copywriting: scores.copywriting,
          accessibility: scores.accessibility,
          maturityScorecard
        },
        issues,
        summary: parsedResponse.executiveSummary || 'UX analysis completed',
        recommendations: parsedResponse.prioritizedFixes?.map((fix: any) => fix.recommendation) || [],
        insights: parsedResponse.keyInsights || [],
        userJourneys: parsedResponse.personaDrivenJourney ? [parsedResponse.personaDrivenJourney] : [],
        heuristicViolations: parsedResponse.heuristicViolations || [],
        prioritizedFixes: parsedResponse.prioritizedFixes || [],
        executiveSummary: parsedResponse.executiveSummary || '',
        keyInsights: parsedResponse.keyInsights || [],
        personaDrivenJourney: parsedResponse.personaDrivenJourney || null,
        evidenceFiles: this.extractEvidenceFiles(issues),
        analysisMetadata: {
          model: modelUsed,
          processingTime: Date.now(),
          pagesAnalyzed: prompt.url ? [prompt.url] : ['screenshot-analysis'],
          confidenceScore: parsedResponse.confidence || 0.8,
          siteBusinessGoal: parsedResponse.analysisLog?.siteBusinessGoal || '',
          navigationPath: parsedResponse.analysisLog?.navigationPath || []
        }
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('AI response parsing failed');
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
}
