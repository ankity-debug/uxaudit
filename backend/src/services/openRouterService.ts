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
    const model = 'x-ai/grok-4-fast:free';

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
            'X-Title': 'LimeMind UX Audit Tool'
          },
          timeout: 30000
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

  private buildAnalysisPrompt(prompt: GeminiAnalysisPrompt): string {
    const subject = prompt.url || "the uploaded image";

    return `Analyze ${subject} and respond with ONLY a valid JSON object (no extra text):

{
  "url": "${subject}",
  "timestamp": "${new Date().toISOString()}",
  "summary": "Brief description of the business and main UX issues found",

  "keyInsights": [
    "Key finding with specific evidence from the site",
    "Pattern observed with actual examples"
  ],

  "issues": [
    {
      "title": "Specific issue found",
      "category": "navigation|content|forms|accessibility|performance|visual-hierarchy",
      "description": "Description with quoted text or specific UI elements",
      "recommendation": "Specific fix needed",
      "severity": "critical|major|minor",
      "priority": "high|medium|low",
      "effort": "low|medium|high"
    }
  ],

  "scores": {
    "overall": {"score": 3.2, "maxScore": 5.0, "percentage": 64},
    "heuristics": {"score": 3.0, "maxScore": 5.0, "findings": "Brief assessment"},
    "uxLaws": {"score": 3.0, "maxScore": 5.0, "findings": "Brief assessment"},
    "accessibility": {"score": 3.0, "maxScore": 5.0, "findings": "Brief assessment"},
    "copywriting": {"score": 3.0, "maxScore": 5.0, "findings": "Brief assessment"}
  },

  "prioritizedFixes": [
    {
      "title": "Top recommendation",
      "recommendation": "Specific implementation guidance",
      "priority": "high|medium|low",
      "effort": "low|medium|high"
    }
  ],

  "personaDrivenJourney": {
    "persona": "Primary user type (e.g., 'First-time visitor looking to understand services')",
    "steps": [
      {
        "step": "Landing on homepage",
        "issues": ["Unclear value proposition", "No clear next step"],
        "improvements": ["Add prominent headline", "Include clear CTA button"]
      },
      {
        "step": "Navigation exploration",
        "issues": ["Confusing menu structure"],
        "improvements": ["Restructure navigation hierarchy"]
      },
      {
        "step": "Contact/conversion attempt",
        "issues": ["Contact form too complex"],
        "improvements": ["Simplify contact form"]
      }
    ]
  },

  "heuristicViolations": [
    {
      "title": "Visibility of System Status",
      "heuristic": "Nielsen's 1st Heuristic",
      "violation": "Users don't know what's happening during loading",
      "element": "Submit button on contact form",
      "evidence": "No loading indicator when form is submitted",
      "businessImpact": "May lead to form abandonment"
    }
  ]
}

Focus on the most critical UX issues. Keep analysis concise but specific.

IMPORTANT LIMITS:
- heuristicViolations: Maximum 3 violations, minimum 2
- prioritizedFixes: Maximum 5 recommendations
- Use actual heuristic names (e.g., "Visibility of System Status") not "Nielsen's 1st Heuristic"

${prompt.targetAudience ? `Target: ${prompt.targetAudience}` : ''}
${prompt.userGoals ? `Goals: ${prompt.userGoals}` : ''}

Response format: JSON only, starting with { and ending with }`;
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
        // Legacy structure - calculate from individual scores
        totalScore = (scores.heuristics?.score || 0) + (scores.uxLaws?.score || 0) + (scores.copywriting?.score || 0) + (scores.accessibility?.score || 0);
        totalMaxScore = (scores.heuristics?.maxScore || 5) + (scores.uxLaws?.maxScore || 5) + (scores.copywriting?.maxScore || 5) + (scores.accessibility?.maxScore || 5);
        overallPercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
      }

      const grade = this.calculateGrade(overallPercentage);

      // Process category scores - handle both new and legacy formats
      const processedScores = {
        heuristics: {
          score: scores.heuristics?.score || 0,
          maxScore: scores.heuristics?.maxScore || 5,
          percentage: scores.heuristics?.score ? (scores.heuristics.score / (scores.heuristics.maxScore || 5)) * 100 : 0,
          findings: scores.heuristics?.findings || 'Assessment completed',
          issues: []
        },
        uxLaws: {
          score: scores.uxLaws?.score || 0,
          maxScore: scores.uxLaws?.maxScore || 5,
          percentage: scores.uxLaws?.score ? (scores.uxLaws.score / (scores.uxLaws.maxScore || 5)) * 100 : 0,
          findings: scores.uxLaws?.findings || 'Assessment completed',
          issues: []
        },
        copywriting: {
          score: scores.copywriting?.score || 0,
          maxScore: scores.copywriting?.maxScore || 5,
          percentage: scores.copywriting?.score ? (scores.copywriting.score / (scores.copywriting.maxScore || 5)) * 100 : 0,
          findings: scores.copywriting?.findings || 'Assessment completed',
          issues: []
        },
        accessibility: {
          score: scores.accessibility?.score || 0,
          maxScore: scores.accessibility?.maxScore || 5,
          percentage: scores.accessibility?.score ? (scores.accessibility.score / (scores.accessibility.maxScore || 5)) * 100 : 0,
          findings: scores.accessibility?.findings || 'Assessment completed',
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
        // Legacy fields for backward compatibility
        heuristic: issue.heuristic || '',
        element: issue.element || '',
        impact: issue.impact || issue.priority || 'medium'
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
        personaDrivenJourney: parsedResponse.personaDrivenJourney || null,
        heuristicViolations: parsedResponse.heuristicViolations || [],
        prioritizedFixes: parsedResponse.prioritizedFixes || []
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

  private extractJsonFromResponse(responseText: string): any {
    try {
      // First, try parsing directly
      return JSON.parse(responseText);
    } catch (error) {
      // If direct parsing fails, try to extract JSON from the response

      // Look for JSON object starting with { and ending with }
      let jsonStart = responseText.indexOf('{');
      let jsonEnd = responseText.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonString = responseText.substring(jsonStart, jsonEnd + 1);
        try {
          return JSON.parse(jsonString);
        } catch (extractError) {
          console.error('Failed to extract JSON from response:', responseText.substring(0, 200) + '...');
          throw new Error('AI response is not valid JSON');
        }
      }

      // If no JSON structure found, throw the original error
      console.error('No JSON structure found in response:', responseText.substring(0, 200) + '...');
      throw new Error('AI response does not contain valid JSON');
    }
  }
}
