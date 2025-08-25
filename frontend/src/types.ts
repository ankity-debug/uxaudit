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

export interface AuditData {
  id: string;
  url?: string;
  imageUrl?: string;
  timestamp: string;
  scores: AuditScores;
  issues: AuditIssue[];
  summary: string;
  recommendations: string[];
}

export interface AuditFormInput {
  type: 'url' | 'image';
  value: string | File;
}