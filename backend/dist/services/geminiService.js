"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
class GeminiService {
    constructor(apiKey) {
        this.baseURL = 'https://openrouter.ai/api/v1';
        this.apiKey = apiKey;
    }
    async analyzeUX(prompt) {
        try {
            const analysisPrompt = this.buildAnalysisPrompt(prompt);
            const messages = [];
            // Add text content
            if (prompt.imageBase64) {
                messages.push({
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: analysisPrompt
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${prompt.imageBase64}`
                            }
                        }
                    ]
                });
            }
            else {
                messages.push({
                    role: "user",
                    content: analysisPrompt
                });
            }
            const requestBody = {
                model: "google/gemma-3-27b-it:free",
                messages: messages,
                temperature: 0.1,
                top_p: 1,
                max_tokens: 8192,
                response_format: {
                    type: "json_object"
                }
            };
            const response = await axios_1.default.post(`${this.baseURL}/chat/completions`, requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': 'https://uxaudit.app',
                    'X-Title': 'UX Audit App'
                },
                timeout: 90000
            });
            // Check for errors in response
            if (response.data.error) {
                throw new Error(`OpenRouter API error: ${response.data.error.message}`);
            }
            const analysisText = response.data.choices?.[0]?.message?.content;
            if (!analysisText) {
                throw new Error('No analysis text received from OpenRouter API');
            }
            return this.parseGeminiResponse(JSON.parse(analysisText), prompt);
        }
        catch (error) {
            console.error('OpenRouter API error:', error.response?.data || error.message);
            let reason = error.response?.data?.error || error.message || 'Unknown analysis error';
            if (typeof reason === 'object')
                reason = reason.message || JSON.stringify(reason);
            throw new Error(`AI analysis failed: ${reason}`);
        }
    }
    buildAnalysisPrompt(prompt) {
        const isUrl = prompt.analysisType === 'url' && !!prompt.url;
        const subject = isUrl ? `the website at \`${prompt.url}\`` : 'the provided design/screenshot';
        let basePrompt = `## ROLE & GOAL
You are a senior UX consultant from Lemon Yellow, renowned for delivering contextual, business-focused UX audits that go beyond generic templates. Your reputation depends on providing unique insights that directly connect UX friction to business impact.

You are analyzing ${subject} to deliver a comprehensive UX audit following Lemon Yellow's signature audit flow. Every output must be specific, contextual, and demonstrate deep understanding of this particular experience.

## COMMUNICATION STYLE
Write like you're explaining issues to a busy product manager:
- Use conversational, direct language
- Lead with the problem, not the theory
- Be specific about what's broken and how to fix it
- Avoid UX jargon and academic language
- Write recommendations as clear action items

## CRITICAL CONTEXTUAL REQUIREMENTS
ABSOLUTELY FORBIDDEN:
- Generic percentages or business impact claims (like "+24% conversion rate")
- Template language that could apply to any website
- Fake competitive benchmarks or industry comparisons
- Made-up statistics or projected improvements
- Generic user personas like "busy professional" or "first-time visitor"
- Verbose, lengthy, or redundant explanations
- Academic or overly technical language

WRITING STYLE REQUIREMENTS:
- Write in clear, direct, actionable language
- Use simple, everyday words instead of jargon
- Lead with the specific problem or opportunity
- Make every word count - no filler phrases
- Be specific about what needs to change

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
- 2-3 direct, actionable insights that emerge from analyzing THIS specific experience
- Write each insight as: "Problem/Opportunity" → "Specific Evidence" → "Impact"
- Quote actual text or describe specific visual elements as evidence
- Focus on patterns you can prove exist across multiple pages/flows
- Example: "Navigation lacks clear hierarchy → Main menu items have identical styling → Users can't identify primary actions"

### 3. Persona-Driven User Journey
- Define ONE realistic persona based on the actual content/industry you observe
- Reference actual pages, buttons, forms, or content you can see
- Each step must reference specific elements: actual button text, form fields, page titles
- Issues must be observable problems, not theoretical ones

### 4. Heuristic Violations (Nielsen's 10)
- Write violations as: "Heuristic → Specific Problem → Element/Location"
- Use direct, plain language - avoid UX jargon
- Quote actual text or describe exact visual problems
- Example: "Error Prevention → Form shows errors only after submission → Contact form 'Email' field"

### 5. Recommended Fixes (Prioritized)
- Write fixes as direct action statements: "Change X to Y" or "Add Z to improve Y"
- Based ONLY on problems you actually identified
- Reference specific elements that need changing
- Use imperative verbs: "Change", "Add", "Remove", "Fix", "Update"
- No business impact projections or conversion rate estimates
- Example: "Change 'Submit' button to 'Get Free Quote' to clarify the action"

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
6. Write findings in clear, everyday language that anyone can understand
7. Frame issues as specific problems that need specific solutions

${(prompt.targetAudience || prompt.userGoals || prompt.businessObjectives) ? '## CONTEXT' : ''}
${prompt.targetAudience ? `- Target Audience: ${prompt.targetAudience}` : ''}
${prompt.userGoals ? `- User Goals: ${prompt.userGoals}` : ''}
${prompt.businessObjectives ? `- Business Objectives: ${prompt.businessObjectives}` : ''}

## OUTPUT FORMAT (strict JSON schema)
Respond ONLY with a JSON object matching this new Lemon Yellow audit structure:

{
  "executiveSummary": "1-2 direct sentences about the main UX issue and business context you observed. Use simple, clear language.",
  "confidence": 0.0,
  "keyInsights": [
    "Direct insight about main navigation or layout issue with specific evidence",
    "Clear finding about content or interaction problem with actual examples",
    "Actionable opportunity about user flow or conversion with specific location"
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
      "element": "Specific UI element location or component name",
      "violation": "Clear, direct problem statement using simple language",
      "businessImpact": "Brief, realistic impact based on actual business model - no percentages",
      "evidence": "Actual text quote or specific visual description you can see"
    }
  ],
  "prioritizedFixes": [
    {
      "recommendation": "Direct action statement using imperative verbs - what exactly to change",
      "priority": "high|medium|low",
      "businessImpact": "Simple, realistic benefit - no percentage claims or conversion estimates",
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
✓ Executive summary uses clear, direct language about specific site issues
✓ Key insights written as Problem → Evidence → Impact format
✓ Persona is based on evidence from the actual site (not generic)
✓ User journey steps reference actual buttons, forms, or page elements
✓ Heuristic violations use simple, plain language - no UX jargon
✓ Recommendations start with action verbs: "Change", "Add", "Remove", "Fix"
✓ ALL content is naturally concise and actionable - no filler words
✓ NO generic percentages, conversion claims, or competitive benchmarks
✓ NO template language that could apply to any website
✓ NO academic or overly technical language

Output requirements:
- Valid JSON only (no markdown, no prose outside JSON)
- All content specific to ${isUrl ? `\`${prompt.url}\`` : 'this image'}
- If analysis is limited, be transparent in analysisLog about what you could/couldn't observe
`;
        if (isUrl) {
            basePrompt += `\n\nAnalyze the website now: ${prompt.url}`;
        }
        else {
            basePrompt += `\n\nAnalyze the provided screenshot/image for UX issues and opportunities.`;
        }
        return basePrompt;
    }
    parseGeminiResponse(parsedResponse, prompt) {
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
                    model: 'google/gemma-3-27b-it:free',
                    processingTime: Date.now(),
                    pagesAnalyzed: prompt.url ? [prompt.url] : ['screenshot-analysis'],
                    confidenceScore: parsedResponse.confidence || 0.8,
                    siteBusinessGoal: parsedResponse.analysisLog?.siteBusinessGoal || '',
                    navigationPath: parsedResponse.analysisLog?.navigationPath || []
                }
            };
        }
        catch (error) {
            console.error('Error parsing Gemini response:', error);
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
}
exports.GeminiService = GeminiService;
//# sourceMappingURL=geminiService.js.map