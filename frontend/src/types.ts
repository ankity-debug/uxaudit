export interface AuditIssue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  category: 'heuristics' | 'ux-laws' | 'copywriting' | 'accessibility';
  heuristic?: string;
  recommendation: string;
  element?: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
}

export interface CategoryScore {
  score: number;
  maxScore: number;
  percentage: number;
  issues: AuditIssue[];
}

export interface AuditScores {
  overall: {
    score: number;
    maxScore: number;
    percentage: number;
    grade: string;
  };
  heuristics: CategoryScore;
  uxLaws: CategoryScore;
  copywriting: CategoryScore;
  accessibility: CategoryScore;
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

export interface AuditData {
  id: string;
  url?: string;
  imageUrl?: string;
  timestamp: string;
  scores: AuditScores;
  issues: AuditIssue[];
  summary: string;
  recommendations: string[];
  // New Lemon Yellow audit structure
  executiveSummary?: string;
  keyInsights?: string[];
  personaDrivenJourney?: PersonaDrivenJourney | null;
  heuristicViolations?: HeuristicViolation[];
  prioritizedFixes?: PrioritizedFix[];
}

export interface AuditFormInput {
  type: 'url' | 'image';
  value: string | File;
}