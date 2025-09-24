export interface AuditIssue {
  id?: string;
  title: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  category: 'navigation' | 'content' | 'forms' | 'accessibility' | 'performance' | 'visual-hierarchy' | 'heuristics' | 'ux-laws' | 'copywriting';
  heuristic?: string;
  recommendation: string;
  element?: string;
  impact?: 'high' | 'medium' | 'low';
  effort?: 'low' | 'medium' | 'high';
  // Enhanced fields for new structure
  priority?: 'high' | 'medium' | 'low';
  businessImpact?: string;
  timeframe?: 'immediate' | 'short-term' | 'long-term';
}

export interface CategoryScore {
  score: number;
  maxScore: number;
  percentage?: number;
  issues?: AuditIssue[];
  findings?: string; // New field for textual findings
}

export interface AuditScores {
  overall: {
    score: number;
    maxScore: number;
    percentage: number;
    grade?: string;
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
  title?: string;
  element: string;
  violation: string;
  businessImpact: string;
  evidence: string;
  category?: string;
}

export interface PrioritizedFix {
  title?: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  businessImpact: string;
  effort: 'low' | 'medium' | 'high';
  timeframe: 'immediate' | 'short-term' | 'long-term';
  category?: 'navigation' | 'content' | 'forms' | 'accessibility' | 'performance' | 'visual-hierarchy' | 'heuristics' | 'ux-laws' | 'copywriting';
}

export interface AuditData {
  // Core identification
  id: string;
  url?: string;
  imageUrl?: string;
  timestamp: string;

  // Legacy structure (backward compatibility)
  scores: AuditScores;
  issues: AuditIssue[];
  summary: string;
  recommendations?: string[];

  // Enhanced audit structure (new format)
  executiveSummary?: string;
  keyInsights?: string[];
  personaDrivenJourney?: PersonaDrivenJourney | null;
  heuristicViolations?: HeuristicViolation[];
  prioritizedFixes?: PrioritizedFix[];
  confidence?: number;
}

// New interface for the enhanced response format
export interface EnhancedAuditResponse {
  url: string;
  timestamp: string;
  summary: string;
  keyInsights: string[];
  personaDrivenJourney: PersonaDrivenJourney;
  issues: AuditIssue[];
  heuristicViolations: HeuristicViolation[];
  prioritizedFixes: PrioritizedFix[];
  scores: {
    overall: {
      score: number;
      maxScore: number;
      percentage: number;
    };
    heuristics: {
      score: number;
      maxScore: number;
      findings: string;
    };
    uxLaws: {
      score: number;
      maxScore: number;
      findings: string;
    };
    accessibility: {
      score: number;
      maxScore: number;
      findings: string;
    };
    copywriting: {
      score: number;
      maxScore: number;
      findings: string;
    };
  };
  confidence?: number;
}

export interface AuditFormInput {
  type: 'url' | 'image';
  value: string | File;
}