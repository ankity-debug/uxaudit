export interface Evidence {
    type: 'screenshot' | 'dom_element' | 'accessibility_tree';
    reference: string;
    description?: string;
}
export interface AuditIssue {
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'major' | 'minor';
    category: 'heuristics' | 'ux-laws' | 'copywriting' | 'accessibility';
    heuristic?: string;
    recommendation: string;
    element?: string;
    evidence: Evidence[];
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    page?: string;
}
export interface HeuristicAnalysis {
    name: string;
    score: number;
    maxScore: number;
    percentage: number;
    issues: AuditIssue[];
    compliance: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    findings: string;
}
export interface CategoryScore {
    score: number;
    maxScore: number;
    percentage: number;
    issues: AuditIssue[];
    heuristics?: HeuristicAnalysis[];
    insights?: string;
}
export interface UXMaturityScorecard {
    overall: number;
    heuristics: number;
    uxLaws: number;
    copywriting: number;
    accessibility: number;
    maturityLevel: 'novice' | 'developing' | 'proficient' | 'advanced' | 'expert';
}
export interface UserJourney {
    persona: string;
    steps: {
        action: string;
        issues: string[];
        improvements: string[];
    }[];
    overallExperience: 'excellent' | 'good' | 'fair' | 'poor' | 'broken';
}
export interface PersonaDrivenJourney {
    persona: string;
    personaReasoning: string;
    steps: {
        action: string;
        issues: string[];
        improvements: string[];
    }[];
    overallExperience: 'excellent' | 'good' | 'fair' | 'poor' | 'broken';
}
export interface HeuristicViolation {
    heuristic: string;
    element: string;
    violation: string;
    businessImpact: string;
    evidence: string;
}
export interface PrioritizedFix {
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
    businessImpact: string;
    effort: 'high' | 'medium' | 'low';
    timeframe: 'immediate' | 'short-term' | 'long-term';
}
export interface AuditScores {
    overall: {
        score: number;
        maxScore: number;
        percentage: number;
        grade: string;
        confidence: number;
    };
    heuristics: CategoryScore;
    uxLaws: CategoryScore;
    copywriting: CategoryScore;
    accessibility: CategoryScore;
    maturityScorecard: UXMaturityScorecard;
}
export interface AuditData {
    id: string;
    url?: string;
    imageUrl?: string;
    timestamp: string;
    scores: AuditScores;
    issues: AuditIssue[];
    summary: string;
    recommendations: string[];
    insights: string[];
    userJourneys: UserJourney[];
    executiveSummary?: string;
    keyInsights?: string[];
    personaDrivenJourney?: PersonaDrivenJourney | null;
    heuristicViolations?: HeuristicViolation[];
    prioritizedFixes?: PrioritizedFix[];
    evidenceFiles: string[];
    analysisMetadata: {
        model: string;
        processingTime: number;
        pagesAnalyzed: string[];
        confidenceScore: number;
        siteBusinessGoal?: string;
        navigationPath?: string[];
    };
}
export interface PageAnalysis {
    url: string;
    title: string;
    screenshot: string;
    domStructure: string;
    accessibilityTree?: string;
    issues: AuditIssue[];
    metrics?: {
        loadTime?: number;
        elements: number;
        interactiveElements: number;
    };
}
export interface GeminiAnalysisPrompt {
    imageBase64?: string;
    url?: string;
    analysisType: 'screenshot' | 'url' | 'multi_page';
    pages?: PageAnalysis[];
    domStructure?: string;
    accessibilityTree?: string;
    previousFindings?: AuditIssue[];
    focusAreas?: string[];
    targetAudience?: string;
    userGoals?: string;
    businessObjectives?: string;
}
export interface AIAnalysisResponse {
    summary: string;
    confidence: number;
    insights: string[];
    scores: {
        heuristics: {
            score: number;
            maxScore: 40;
            findings: string;
        };
        uxLaws: {
            score: number;
            maxScore: 30;
            findings: string;
        };
        copywriting: {
            score: number;
            maxScore: 20;
            findings: string;
        };
        accessibility: {
            score: number;
            maxScore: 10;
            findings: string;
        };
    };
    issues: Array<{
        id: string;
        title: string;
        description: string;
        severity: 'critical' | 'major' | 'minor';
        category: 'heuristics' | 'ux-laws' | 'copywriting' | 'accessibility';
        heuristic?: string;
        recommendation: string;
        element?: string;
        evidence: Evidence[];
        impact: 'high' | 'medium' | 'low';
        effort: 'high' | 'medium' | 'low';
        page?: string;
    }>;
    recommendations: string[];
    userJourneys: UserJourney[];
}
export declare enum NielsensHeuristics {
    VISIBILITY_STATUS = "Visibility of system status",
    REAL_WORLD_MATCH = "Match between system and real world",
    USER_CONTROL = "User control and freedom",
    CONSISTENCY = "Consistency and standards",
    ERROR_PREVENTION = "Error prevention",
    RECOGNITION_RECALL = "Recognition rather than recall",
    FLEXIBILITY = "Flexibility and efficiency of use",
    AESTHETIC_MINIMAL = "Aesthetic and minimalist design",
    ERROR_RECOVERY = "Help users recognize, diagnose, and recover from errors",
    HELP_DOCUMENTATION = "Help and documentation"
}
export declare enum UXLaws {
    FITTS_LAW = "Fitts's Law",
    HICKS_LAW = "Hick's Law",
    MILLERS_RULE = "Miller's Rule",
    LAW_PROXIMITY = "Law of Proximity",
    LAW_COMMON_REGION = "Law of Common Region",
    LAW_SIMILARITY = "Law of Similarity"
}
//# sourceMappingURL=index.d.ts.map