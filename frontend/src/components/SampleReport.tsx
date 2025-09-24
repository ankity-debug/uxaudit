import React from 'react';
import { AuditReport } from './AuditReport';
import { AuditData } from '../types';

interface SampleReportProps {
  reason?: string | null;
}

// Minimal, neutral sample data – references example.com only.
const sampleAuditData: AuditData = {
  id: 'sample-000',
  url: 'https://example.com',
  timestamp: new Date().toISOString(),
  scores: {
    overall: { score: 72, maxScore: 100, percentage: 72, grade: 'C' },
    heuristics: { score: 28, maxScore: 40, percentage: 70, issues: [] },
    uxLaws: { score: 21, maxScore: 30, percentage: 70, issues: [] },
    copywriting: { score: 14, maxScore: 20, percentage: 70, issues: [] },
    accessibility: { score: 9, maxScore: 10, percentage: 90, issues: [] },
  },
  issues: [
    {
      id: 's1',
      title: 'Clarify primary action hierarchy',
      description: 'Primary CTAs look similar to secondary links, causing hesitation.',
      severity: 'major',
      category: 'heuristics',
      heuristic: 'Visibility of System Status',
      recommendation: 'Use consistent button styling with clear prominence and states.',
      impact: 'high',
      effort: 'low',
    },
    {
      id: 's2',
      title: 'Low contrast on secondary text',
      description: 'Some text falls below WCAG AA contrast threshold.',
      severity: 'major',
      category: 'accessibility',
      recommendation: 'Increase contrast to ≥4.5:1 and verify tokens.',
      impact: 'high',
      effort: 'medium',
    },
    {
      id: 's3',
      title: 'Touch targets below 44px',
      description: 'Tap areas are small on mobile, increasing error rate.',
      severity: 'minor',
      category: 'ux-laws' as any,
      heuristic: "Fitts's Law",
      recommendation: 'Standardize 44px+ targets and 8px spacing.',
      impact: 'medium',
      effort: 'low',
    },
  ],
  summary: 'This is a sample report illustrating the structure and level of detail you will receive for a real audit.',
  recommendations: [
    'Clarify CTA prominence and states across pages',
    'Raise contrast to WCAG AA for secondary text',
    'Adopt consistent mobile spacing and 44px+ tap targets',
  ],
  executiveSummary: 'Sample report preview for demonstration purposes.',
  keyInsights: [
    'Hierarchy: stronger visual distinction for primary actions',
    'Accessibility: color contrast needs standardization',
  ],
  personaDrivenJourney: {
    persona: 'First‑time visitor',
    personaReasoning: 'learn what the product does and try it quickly',
    steps: [
      { action: 'land on homepage', issues: ['CTA blends with links'], improvements: ['Use strong primary style + motion on hover'] },
      { action: 'scan features section', issues: ['Low contrast on text'], improvements: ['Raise contrast in token scheme'] },
      { action: 'try signup', issues: ['Small touch targets'], improvements: ['44px+ targets, clear focus states'] },
    ],
    overallExperience: 'good',
  },
  imageUrl: '/logo512.png',
};

export const SampleReport: React.FC<SampleReportProps> = ({ reason }) => {
  // Ensure we do not leak any previous session data
  const data: AuditData = { ...sampleAuditData };
  // We intentionally do not set imageUrl here; the AuditReport will show the screenshot section only when present.

  return (
    <div className="min-h-screen">
      {/* Prominent, sticky alert banner */}
      <div className="sticky top-0 z-[60] w-full bg-amber-200 text-amber-950 border-b border-amber-400 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="max-w-[1140px] mx-auto px-4 py-2.5 flex items-center gap-3">
          <span className="px-2 py-0.5 rounded-full bg-amber-300 text-amber-950 border border-amber-500 text-[12px] font-semibold">Sample Report</span>
          <strong className="font-semibold">Audit failed:</strong>
          <span className="truncate">{reason || 'We could not complete the analysis.'}</span>
          <span className="ml-auto" />
          <button className="underline font-semibold" onClick={() => (window.location.href = '/')}>Retry</button>
        </div>
      </div>

      {/* Render the regular report UI using the sample data */}
      <AuditReport data={data} />
    </div>
  );
};
