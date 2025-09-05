"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterService = void 0;
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
class OpenRouterService {
    constructor(apiKey) {
        this.baseURL = 'https://openrouter.ai/api/v1/chat/completions';
        this.apiKey = apiKey;
    }
    async analyzeUX(prompt) {
        // Try multiple models in order of preference (free to premium)
        const models = [
            'meta-llama/llama-3.2-3b-instruct:free',
            'google/gemma-3-27b-it:free'
        ];
        for (let i = 0; i < models.length; i++) {
            try {
                const analysisPrompt = this.buildAnalysisPrompt(prompt);
                const makeMessages = (withImage) => ([
                    withImage && prompt.imageBase64
                        ? { role: 'user', content: [
                                { type: 'text', text: analysisPrompt },
                                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${prompt.imageBase64}` } }
                            ] }
                        : { role: 'user', content: analysisPrompt }
                ]);
                const doRequest = async (withImage) => axios_1.default.post(this.baseURL, {
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
                let response;
                try {
                    response = await doRequest(true);
                }
                catch (e) {
                    const status = e?.response?.status;
                    const msg = e?.response?.data?.error?.message || e?.message || '';
                    const imageUnsupported = /image input|image not supported|no endpoints.*image/i.test(msg);
                    if (prompt.imageBase64 && (status === 400 || status === 404 || status === 415 || imageUnsupported)) {
                        response = await doRequest(false);
                    }
                    else {
                        throw e;
                    }
                }
                if (response?.data?.error) {
                    const code = response.data.error.code || 500;
                    throw { response: { status: code, data: response.data } };
                }
                const analysisText = (response.data.choices?.[0]?.message?.content) || (response.data.choices?.[0]?.message);
                return this.parseOpenRouterResponse(JSON.parse(analysisText), prompt, models[i]);
            }
            catch (error) {
                const status = error?.response?.status || error?.response?.data?.error?.code;
                console.error(`OpenRouter API error with ${models[i]}:`, error.response?.data || error.message);
                // If it's a rate limit error and we have more models to try
                if ((status === 429 || status === 402) && i < models.length - 1) {
                    console.log(`Rate limited or insufficient credits on ${models[i]}, trying ${models[i + 1]}...`);
                    continue;
                }
                // Bubble up the last error to caller (no demo fallback)
                let reason = (error.response?.data?.error) || error.message || 'Unknown analysis error';
                if (typeof reason === 'object')
                    reason = reason.message || JSON.stringify(reason);
                throw new Error(`AI analysis failed: ${reason}`);
            }
        }
        throw new Error('AI analysis failed: all model attempts exhausted');
    }
    buildAnalysisPrompt(prompt) {
        const isUrl = prompt.analysisType === 'url' && !!prompt.url;
        const subject = isUrl ? `the website at \`${prompt.url}\`` : 'the provided design/screenshot';
        let basePrompt = `## ROLE & GOAL
You are a senior UX consultant from Lemon Yellow, renowned for delivering contextual, business-focused UX audits that go beyond generic templates. Your reputation depends on providing unique insights that directly connect UX friction to business impact.

You are analyzing ${subject} to deliver a comprehensive UX audit following Lemon Yellow's signature audit flow. Every output must be specific, contextual, and demonstrate deep understanding of this particular experience.

## AUDIT FLOW REQUIREMENTS

### 1. Executive Summary
- 1-2 sentences, business-facing language
- High-level UX state (excellent/good/fair/poor/broken) tied to the site's primary business goal
- Must be specific to THIS site's actual purpose and context

### 2. Key Insights (Holistic Patterns)  
- 2-3 "aha" insights that only emerge from analyzing the WHOLE experience
- Focus on patterns that span multiple touchpoints
- Example format: "Strong product visuals are undermined by inconsistent CTA copy across flows, creating doubt during checkout"

### 3. Persona-Driven User Journey
- Define ONE realistic persona specific to this site (not generic)
- Walk through actual navigation path step-by-step
- Each step format: action → issue(s) → improvement(s)
- Must reflect real user friction for THIS specific experience

### 4. Heuristic Violations (Nielsen's 10)
- Explicit mapping to specific heuristics
- Format: "Heuristic Name → Specific element → Why it matters HERE"
- Example: "Visibility of system status → Cart page shows no loading indicator, leaving users confused during checkout"

### 5. Recommended Fixes (Prioritized)
- 3-5 clear recommendations 
- Each includes: priority (high/med/low) + business impact
- Tied directly to issues found in THIS analysis

## ANTI-TEMPLATE DIRECTIVE
CRITICAL: Avoid all generic language. Your analysis must be demonstrably different from any other site audit by:
- Quoting actual text from the site
- Naming specific UI elements (buttons, colors, layouts)
- Referencing actual navigation paths you tested
- Identifying site-specific business goals and user needs

## ANALYSIS APPROACH
1. Identify the site's PRIMARY business goal and user intent
2. Define a realistic persona based on the actual content/industry
3. Navigate through key user flows (2-3 pages deep minimum)
4. Document specific friction points with concrete evidence
5. Map findings to Nielsen's heuristics with site-specific examples
6. Prioritize fixes based on business impact for THIS specific context

## EVIDENCE REQUIREMENTS
Every issue must include:
- Specific element/page where problem occurs
- Actual text or visual elements as proof
- Clear explanation of why it matters for THIS site's goals
- Concrete recommendation that fits this context

${(prompt.targetAudience || prompt.userGoals || prompt.businessObjectives) ? '## CONTEXT' : ''}
${prompt.targetAudience ? `- Target Audience: ${prompt.targetAudience}` : ''}
${prompt.userGoals ? `- User Goals: ${prompt.userGoals}` : ''}
${prompt.businessObjectives ? `- Business Objectives: ${prompt.businessObjectives}` : ''}

## OUTPUT FORMAT (strict JSON schema)
Respond ONLY with a JSON object matching this new Lemon Yellow audit structure:

{
  "executiveSummary": "1-2 sentences, business-facing. High-level UX state tied to this site's primary business goal.",
  "confidence": 0.0,
  "keyInsights": [
    "Holistic insight 1 that spans multiple touchpoints",
    "Holistic insight 2 that emerges from whole experience analysis",
    "Holistic insight 3 connecting patterns to business impact"
  ],
  "personaDrivenJourney": {
    "persona": "Specific persona relevant to THIS site (e.g., 'Marketing manager comparing SaaS tools')",
    "personaReasoning": "Why this persona perfectly fits this specific site and industry",
    "steps": [
      {
        "action": "Specific action taken on this site",
        "issues": ["Specific friction point at this step"],
        "improvements": ["Specific fix for this step"]
      }
    ],
    "overallExperience": "excellent|good|fair|poor|broken"
  },
  "heuristicViolations": [
    {
      "heuristic": "Specific Nielsen heuristic name",
      "element": "Exact UI element or page section",
      "violation": "What's wrong and why it matters for THIS site",
      "businessImpact": "How this affects conversions/engagement for this business",
      "evidence": "Quote actual text or describe specific visual element"
    }
  ],
  "prioritizedFixes": [
    {
      "recommendation": "Clear, actionable fix",
      "priority": "high|medium|low",
      "businessImpact": "Expected improvement in conversions/engagement/retention",
      "effort": "high|medium|low",
      "timeframe": "immediate|short-term|long-term"
    }
  ],
  "scores": {
    "heuristics": { "score": 0, "maxScore": 40, "findings": "Site-specific heuristic assessment" },
    "uxLaws": { "score": 0, "maxScore": 30, "findings": "Site-specific UX laws assessment" },
    "copywriting": { "score": 0, "maxScore": 20, "findings": "Site-specific copywriting assessment" },
    "accessibility": { "score": 0, "maxScore": 10, "findings": "Site-specific accessibility assessment" }
  },
  "analysisLog": {
    "siteBusinessGoal": "Primary business objective identified for this site",
    "navigationPath": ["/", "/actual-page", "/tested-flow"],
    "keyObservations": ["Site-specific observation 1", "Site-specific observation 2"],
    "testingApproach": "What flows and pages were analyzed"
  }
}

Strict requirements:
- Output must be valid JSON only (no markdown, no prose outside JSON)
- Keep all strings concise and specific to ${isUrl ? `\`${prompt.url}\`` : 'this image'}
- Do not invent pages you did not observe; if limited, be transparent in analysisLog
`;
        if (isUrl) {
            basePrompt += `\n\nAnalyze the website now: ${prompt.url}`;
        }
        else {
            basePrompt += `\n\nAnalyze the provided screenshot/image for UX issues and opportunities.`;
        }
        return basePrompt;
    }
    parseOpenRouterResponse(parsedResponse, prompt, modelUsed) {
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
                category.issues = parsedResponse.issues?.filter((issue) => issue.category === key.replace('ux', 'ux-').toLowerCase()) || [];
                category.insights = category.findings || 'Analysis completed';
            });
            // Ensure all issues have unique IDs and required fields
            const issues = (parsedResponse.issues || []).map((issue) => ({
                ...issue,
                id: issue.id || (0, uuid_1.v4)(),
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
                maturityLevel: overallPercentage >= 90 ? 'expert' :
                    overallPercentage >= 80 ? 'advanced' :
                        overallPercentage >= 70 ? 'proficient' :
                            overallPercentage >= 60 ? 'developing' : 'novice'
            };
            return {
                id: (0, uuid_1.v4)(),
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
                recommendations: parsedResponse.prioritizedFixes?.map((fix) => fix.recommendation) || [],
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
        }
        catch (error) {
            console.error('Error parsing AI response:', error);
            throw new Error('AI response parsing failed');
        }
    }
    extractEvidenceFiles(issues) {
        const files = new Set();
        issues.forEach(issue => {
            issue.evidence?.forEach(evidence => {
                if (evidence.type === 'screenshot' && evidence.reference !== 'general-observation') {
                    files.add(evidence.reference);
                }
            });
        });
        return Array.from(files);
    }
    calculateGrade(percentage) {
        if (percentage >= 90)
            return 'A';
        if (percentage >= 80)
            return 'B';
        if (percentage >= 70)
            return 'C';
        if (percentage >= 60)
            return 'D';
        return 'F';
    }
    createDemoResponse(prompt) {
        // Create a realistic demo response when API fails
        const demoIssues = [
            {
                id: (0, uuid_1.v4)(),
                title: 'Inconsistent Navigation Patterns',
                description: 'The navigation menu uses different styles and behaviors across pages, potentially confusing users.',
                severity: 'major',
                category: 'heuristics',
                heuristic: 'Consistency and Standards',
                recommendation: 'Standardize navigation styling, hover states, and interaction patterns across all pages.',
                element: 'Primary navigation menu',
                evidence: [{ type: 'screenshot', reference: 'navigation-inconsistency', description: 'Different menu styles across pages' }],
                impact: 'high',
                effort: 'medium'
            },
            {
                id: (0, uuid_1.v4)(),
                title: 'Small Click Targets',
                description: 'Several interactive elements are smaller than the recommended 44px minimum touch target size.',
                severity: 'major',
                category: 'ux-laws',
                heuristic: 'Fitts\'s Law',
                recommendation: 'Increase button and link sizes to at least 44x44px for better accessibility and usability.',
                element: 'CTA buttons and form inputs',
                evidence: [{ type: 'dom_element', reference: 'button.btn-small', description: 'Buttons measuring 32x28px' }],
                impact: 'high',
                effort: 'low'
            },
            {
                id: (0, uuid_1.v4)(),
                title: 'Unclear Call-to-Action Text',
                description: 'Button labels like "Click Here" and "Submit" don\'t clearly indicate what action will be taken.',
                severity: 'minor',
                category: 'copywriting',
                recommendation: 'Use descriptive action-oriented text like "Download Report" or "Start Free Trial".',
                element: 'Primary CTA buttons',
                evidence: [{ type: 'dom_element', reference: 'button[type="submit"]', description: 'Generic "Submit" and "Click Here" labels' }],
                impact: 'medium',
                effort: 'low'
            },
            {
                id: (0, uuid_1.v4)(),
                title: 'Low Color Contrast',
                description: 'Text contrast ratios fall below WCAG AA standards, making content difficult to read.',
                severity: 'major',
                category: 'accessibility',
                recommendation: 'Increase text contrast to meet WCAG AA standard of 4.5:1 for normal text.',
                element: 'Body text and labels',
                evidence: [{ type: 'screenshot', reference: 'color-contrast-issue', description: 'Text elements showing insufficient contrast' }],
                impact: 'high',
                effort: 'medium'
            },
            {
                id: (0, uuid_1.v4)(),
                title: 'Information Overload',
                description: 'Too many options and information presented simultaneously, violating Miller\'s Rule.',
                severity: 'minor',
                category: 'ux-laws',
                heuristic: 'Miller\'s Rule (7±2)',
                recommendation: 'Group related items and limit choices to 5-9 items per section.',
                element: 'Main content area',
                evidence: [{ type: 'screenshot', reference: 'information-density', description: 'Multiple sections with 10+ items each' }],
                impact: 'medium',
                effort: 'high'
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
            id: (0, uuid_1.v4)(),
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
                    maturityLevel: 'developing'
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
                    overallExperience: 'fair'
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
    createFallbackResponse(prompt) {
        return {
            id: (0, uuid_1.v4)(),
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
                    maturityLevel: 'proficient'
                }
            },
            issues: [
                {
                    id: (0, uuid_1.v4)(),
                    title: 'Analysis Error',
                    description: 'Unable to complete full analysis due to technical issues.',
                    severity: 'minor',
                    category: 'heuristics',
                    recommendation: 'Please try again or upload a clearer image.',
                    evidence: [{ type: 'screenshot', reference: 'analysis-error', description: 'Technical analysis limitation' }],
                    impact: 'low',
                    effort: 'low'
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
exports.OpenRouterService = OpenRouterService;
//# sourceMappingURL=openRouterService.js.map
