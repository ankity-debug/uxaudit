// Enhanced types for production-ready AI system
export interface Evidence {
  type: 'screenshot' | 'dom_element' | 'accessibility_tree';
  reference: string; // Screenshot filename, DOM selector, or accessibility path
  description?: string;
}

export interface AuditIssue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  category: 'heuristics' | 'ux-laws' | 'copywriting' | 'accessibility';
  heuristic?: string; // Specific heuristic/law violated
  recommendation: string;
  element?: string; // Specific element affected
  evidence: Evidence[]; // Evidence binding for hallucination control
  impact: 'high' | 'medium' | 'low'; // User impact level
  effort: 'high' | 'medium' | 'low'; // Implementation effort
  page?: string; // Which page this issue appears on
}

export interface HeuristicAnalysis {
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  issues: AuditIssue[];
  compliance: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  findings: string; // Brief analysis of this heuristic
}

export interface CategoryScore {
  score: number;
  maxScore: number;
  percentage: number;
  issues: AuditIssue[];
  heuristics?: HeuristicAnalysis[]; // For heuristics category
  insights?: string; // Key insights for this category
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

export interface AuditScores {
  overall: {
    score: number;
    maxScore: number;
    percentage: number;
    grade: string;
    confidence: number; // AI confidence level (0-1)
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
  insights: string[]; // Key insights that emerged from analysis
  userJourneys: UserJourney[];
  evidenceFiles: string[]; // List of screenshot/evidence files
  analysisMetadata: {
    model: string;
    processingTime: number;
    pagesAnalyzed: string[];
    confidenceScore: number;
  };
}

export interface PageAnalysis {
  url: string;
  title: string;
  screenshot: string; // Base64 or file path
  domStructure: string; // Simplified DOM structure
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
  pages?: PageAnalysis[]; // For multi-page analysis
  domStructure?: string; // Structured DOM information
  accessibilityTree?: string;
  previousFindings?: AuditIssue[]; // For iterative analysis
  focusAreas?: string[]; // Specific areas to focus on
  targetAudience?: string;
  userGoals?: string;
  businessObjectives?: string;
}

// Schema definitions for AI response validation
export interface AIAnalysisResponse {
  summary: string;
  confidence: number; // Overall confidence in analysis (0-1)
  insights: string[];
  scores: {
    heuristics: { score: number; maxScore: 40; findings: string };
    uxLaws: { score: number; maxScore: 30; findings: string };
    copywriting: { score: number; maxScore: 20; findings: string };
    accessibility: { score: number; maxScore: 10; findings: string };
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

// Nielsen's 10 Heuristics enumeration for structure
export enum NielsensHeuristics {
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

// UX Laws enumeration
export enum UXLaws {
  FITTS_LAW = "Fitts's Law",
  HICKS_LAW = "Hick's Law", 
  MILLERS_RULE = "Miller's Rule",
  LAW_PROXIMITY = "Law of Proximity",
  LAW_COMMON_REGION = "Law of Common Region",
  LAW_SIMILARITY = "Law of Similarity"
}