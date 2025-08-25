import { AuditData } from './types';

export const mockAuditData: AuditData = {
  id: "test-123",
  url: "https://stripe.com",
  timestamp: "2023-12-20T10:30:00Z",
  scores: {
    overall: {
      score: 31,
      maxScore: 100,
      percentage: 31,
      grade: "D"
    },
    heuristics: { score: 25, maxScore: 50, percentage: 50, issues: [] },
    uxLaws: { score: 15, maxScore: 30, percentage: 50, issues: [] },
    copywriting: { score: 10, maxScore: 20, percentage: 50, issues: [] },
    accessibility: { score: 8, maxScore: 25, percentage: 32, issues: [] }
  },
  summary: "The website does not leverage user experience principles effectively, there should be a more comprehensive understanding of determining design-wise approach. The interface is ineffective and does not build sufficient trust through UI design on the most important elements.",
  recommendations: [
    "The deep case interface findings offers very few parameters.",
    "There needs to be progress checkup, specifically a call to action to show or highlight what the website offers to users.",
    "Poor design and other CRM should get that would support the user experience by providing better visual hierarchy and cleaner layout structure."
  ],
  issues: [
    {
      id: "1",
      title: "Poor Navigation Structure",
      description: "The navigation menu lacks clear hierarchy and intuitive labeling, making it difficult for users to find relevant sections",
      severity: "major",
      category: "heuristics",
      heuristic: "User Control and Freedom",
      recommendation: "Implement a clear information architecture with logical grouping and breadcrumb navigation",
      element: "Navigation Bar",
      impact: "high",
      effort: "medium"
    },
    {
      id: "2", 
      title: "Insufficient Color Contrast",
      description: "Text color contrast does not meet WCAG guidelines, particularly for secondary text elements",
      severity: "major",
      category: "accessibility",
      recommendation: "Increase color contrast ratios to meet WCAG AA standards (minimum 4.5:1 for normal text)",
      element: "Text Elements",
      impact: "high",
      effort: "low"
    },
    {
      id: "3",
      title: "Unclear Call-to-Action Buttons",
      description: "Primary actions are not visually prominent enough and lack clear visual hierarchy",
      severity: "minor",
      category: "heuristics",
      heuristic: "Visibility of System Status",
      recommendation: "Make CTAs more prominent with better visual hierarchy, consistent styling, and clear action words",
      element: "Buttons",
      impact: "medium",
      effort: "low"
    },
    {
      id: "4",
      title: "Missing Error Prevention",
      description: "Forms lack validation and error prevention mechanisms, leading to user frustration",
      severity: "minor",
      category: "ux-laws",
      recommendation: "Add real-time validation, clear error messages, and helpful input formatting guidance",
      impact: "medium",
      effort: "medium"
    },
    {
      id: "5",
      title: "Inconsistent Visual Design",
      description: "Inconsistent spacing, typography, and component styling throughout the interface",
      severity: "major",
      category: "heuristics", 
      heuristic: "Consistency and Standards",
      recommendation: "Implement a design system with consistent spacing, typography, and component patterns",
      impact: "high",
      effort: "high"
    },
    {
      id: "6",
      title: "Poor Mobile Responsiveness", 
      description: "Interface elements don't adapt well to smaller screen sizes",
      severity: "minor",
      category: "ux-laws",
      recommendation: "Implement responsive design patterns with mobile-first approach",
      impact: "medium",
      effort: "medium"
    }
  ]
};