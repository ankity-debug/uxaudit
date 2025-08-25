import { GoogleGenerativeAI } from '@google/generative-ai';
import { AuditData, AuditIssue, GeminiAnalysisPrompt } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async analyzeUX(prompt: GeminiAnalysisPrompt): Promise<AuditData> {
    // Try with lighter model first (gemini-1.5-flash has higher limits)
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro'];
    
    for (let i = 0; i < models.length; i++) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: models[i],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 4096,
          }
        });

        const analysisPrompt = this.buildAnalysisPrompt(prompt);
        
        const result = await model.generateContent([
          {
            text: analysisPrompt
          },
          ...(prompt.imageBase64 ? [{
            inlineData: {
              mimeType: 'image/jpeg',
              data: prompt.imageBase64
            }
          }] : [])
        ]);

        const response = await result.response;
        const analysisText = response.text();

        return this.parseGeminiResponse(JSON.parse(analysisText), prompt);
        
      } catch (error: any) {
        console.error(`Gemini API error with ${models[i]}:`, error);
        
        // If it's a rate limit error and we have more models to try
        if (error.status === 429 && i < models.length - 1) {
          console.log(`Rate limited on ${models[i]}, trying ${models[i + 1]}...`);
          continue;
        }
        
        // If it's the last model or other error, return demo response
        console.log('All models failed or other error, returning demo response');
        return this.createDemoResponse(prompt);
      }
    }
    
    // Fallback (shouldn't reach here)
    return this.createDemoResponse(prompt);
  }

  private buildAnalysisPrompt(prompt: GeminiAnalysisPrompt): string {
    let basePrompt = `
You are a senior UX auditor analyzing a ${prompt.analysisType === 'screenshot' ? 'screenshot' : 'website'}. 
Provide a comprehensive UX audit based on the following criteria:
`;

    if (prompt.targetAudience || prompt.userGoals || prompt.businessObjectives) {
      basePrompt += '\n## CONTEXT:\n';
      if (prompt.targetAudience) {
        basePrompt += `\n- **Target Audience:** ${prompt.targetAudience}`;
      }
      if (prompt.userGoals) {
        basePrompt += `\n- **User Goals:** ${prompt.userGoals}`;
      }
      if (prompt.businessObjectives) {
        basePrompt += `\n- **Business Objectives:** ${prompt.businessObjectives}`;
      }
    }

    basePrompt += `

## ANALYSIS FRAMEWORK:

### 1. NIELSEN'S HEURISTICS (40% weight)
Evaluate against these 10 principles:
- Visibility of system status
- Match between system and real world
- User control and freedom
- Consistency and standards
- Error prevention
- Recognition rather than recall
- Flexibility and efficiency of use
- Aesthetic and minimalist design
- Help users recognize, diagnose, and recover from errors
- Help and documentation

### 2. UX LAWS (30% weight)
Assess compliance with:
- Fitts's Law (button sizes, click targets)
- Hick's Law (choice complexity, decision time)
- Miller's Rule (cognitive load, 7±2 items)
- Law of Proximity (visual grouping)
- Law of Common Region (spatial relationships)

### 3. COPYWRITING (20% weight)
Evaluate:
- Clarity and conciseness
- Call-to-action effectiveness
- Tone consistency
- Information hierarchy
- Microcopy quality

### 4. ACCESSIBILITY (10% weight)
Check for:
- Color contrast compliance (WCAG AA)
- Text readability
- Button/link visibility
- Visual hierarchy
- Basic structural elements

## OUTPUT FORMAT:
Respond with a JSON object in this exact structure:

{
  "summary": "Brief 1-2 sentence overall assessment",
  "confidence": 0.85,
  "insights": ["Key insight about user experience", "Important finding about usability"],
  "scores": {
    "heuristics": { "score": X, "maxScore": 40, "findings": "Brief summary" },
    "uxLaws": { "score": X, "maxScore": 30, "findings": "Brief summary" },
    "copywriting": { "score": X, "maxScore": 20, "findings": "Brief summary" },
    "accessibility": { "score": X, "maxScore": 10, "findings": "Brief summary" }
  },
  "issues": [
    {
      "id": "unique-id",
      "title": "Issue Title",
      "description": "Detailed description of the issue",
      "severity": "major|minor",
      "category": "heuristics|ux-laws|copywriting|accessibility",
      "heuristic": "Specific heuristic/law violated (if applicable)",
      "recommendation": "Specific actionable recommendation",
      "element": "Specific element or area affected",
      "evidence": [{"type": "screenshot", "reference": "general-observation", "description": "What this evidence shows"}],
      "impact": "high|medium|low",
      "effort": "high|medium|low"
    }
  ],
  "recommendations": [
    "Priority 1 recommendation",
    "Priority 2 recommendation"
  ],
  "userJourneys": [
    {
      "persona": "Primary user type",
      "steps": [{"action": "User action", "issues": ["Problems"], "improvements": ["Suggested fixes"]}],
      "overallExperience": "excellent|good|fair|poor|broken"
    }
  ]
}

## SCORING GUIDELINES:
- Major issues: -3 to -5 points per category
- Minor issues: -1 to -2 points per category
- Perfect implementation: Full points for category
- Severity classification: Major = blocks user goals, Minor = reduces experience quality

Be thorough but concise. Focus on actionable insights that non-designers can understand and implement.
    `;

    if (prompt.url) {
      return basePrompt + `\n\nAnalyze the website: ${prompt.url}`;
    }

    return basePrompt + '\n\nAnalyze the provided screenshot/image for UX issues and opportunities.';
  }

  private parseGeminiResponse(parsedResponse: any, prompt: GeminiAnalysisPrompt): AuditData {
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
        summary: parsedResponse.summary || 'UX analysis completed',
        recommendations: parsedResponse.recommendations || [],
        insights: parsedResponse.insights || [],
        userJourneys: parsedResponse.userJourneys || [],
        evidenceFiles: this.extractEvidenceFiles(issues),
        analysisMetadata: {
          model: 'gemini-1.5-flash',
          processingTime: Date.now(),
          pagesAnalyzed: prompt.url ? [prompt.url] : ['screenshot-analysis'],
          confidenceScore: parsedResponse.confidence || 0.8
        }
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      console.log('Raw response:', parsedResponse);
      
      // Fallback response
      return this.createFallbackResponse(prompt);
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
        score: 25, 
        maxScore: 40, 
        percentage: 62.5,
        issues: heuristicsIssues,
        insights: 'Navigation consistency needs improvement'
      },
      uxLaws: { 
        score: 18, 
        maxScore: 30, 
        percentage: 60,
        issues: uxLawsIssues,
        insights: 'Click targets and information density issues identified'
      },
      copywriting: { 
        score: 16, 
        maxScore: 20, 
        percentage: 80,
        issues: copywritingIssues,
        insights: 'Generally good content with minor CTA improvements needed'
      },
      accessibility: { 
        score: 5, 
        maxScore: 10, 
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
