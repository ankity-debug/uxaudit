import React, { useState } from 'react';
import { AuditData } from '../types';
import { getRelevantCaseStudies, caseStudies } from '../data/caseStudies';
import { getUserData } from '../utils/userStorage';

interface AuditReportProps {
  data: AuditData;
}

type DownloadStatus = 'idle' | 'sending' | 'sent';

export const AuditReport: React.FC<AuditReportProps> = ({ data }) => {
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>('idle');

  // Enhanced key insights from new structure
  const getKeyInsights = () => {
    // Priority: use keyInsights from new structure, fallback to legacy
    const insights = data.keyInsights || [];
    return insights.filter(insight => insight && insight.trim() !== '');
  };
  // Get platform name from URL or use default
  const getPlatformName = () => {
    if (data.url) {
      try {
        const hostname = new URL(data.url).hostname;
        return hostname.replace('www.', '');
      } catch {
        return data.url;
      }
    }
    return 'Uploaded Image Analysis';
  };


  // Get relevant case studies using smart matching - show 2 for focus
  const getRelevantCaseStudiesForAudit = () => {
    const relevantStudies = getRelevantCaseStudies(data.url, data.summary, undefined, 2);
    // If no relevant studies found, show high-priority general studies
    if (relevantStudies.length === 0) {
      return caseStudies
        .filter(study => study.priority >= 8) // High-priority studies only
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 2);
    }
    return relevantStudies;
  };

  // Enhanced heuristic violations from new structure
  const getHeuristicViolations = () => {
    // Priority: use heuristicViolations array from new structure
    const directViolations = data.heuristicViolations || [];

    // Fallback: extract heuristic violations from issues array
    const heuristicIssues = data.issues?.filter(i => i.category === 'heuristics') || [];

    const allViolations = [
      // Map new structure violations
      ...directViolations.map((v: any, idx: number) => ({
        id: `hv-${idx}`,
        title: v.title || v.heuristic || 'Heuristic Violation',
        description: v.violation || v.description || '',
        heuristic: v.heuristic || '',
        element: v.element || '',
        evidence: v.evidence || '',
        businessImpact: v.businessImpact || '',
        category: 'heuristics'
      })),
      // Map legacy heuristic issues
      ...heuristicIssues.map((issue, idx) => ({
        id: `hv-legacy-${idx}`,
        title: issue.title,
        description: issue.description,
        heuristic: issue.heuristic || '',
        element: issue.element || '',
        evidence: '',
        businessImpact: issue.businessImpact || '',
        category: 'heuristics'
      }))
    ];

    // Remove duplicates based on title
    const uniqueViolations = new Map();
    allViolations.forEach(v => {
      if (v.title && !uniqueViolations.has(v.title)) {
        uniqueViolations.set(v.title, v);
      }
    });

    let violations = Array.from(uniqueViolations.values());

    // Ensure all violations have heuristic and businessImpact fields
    violations = violations.map(v => {
      // If missing heuristic, try to infer from description or assign a default
      if (!v.heuristic || v.heuristic.trim() === '') {
        if (v.description.toLowerCase().includes('button') || v.description.toLowerCase().includes('contact') || v.description.toLowerCase().includes('prioritization')) {
          v.heuristic = 'Consistency and Standards';
        } else if (v.description.toLowerCase().includes('feedback') || v.description.toLowerCase().includes('status')) {
          v.heuristic = 'Visibility of System Status';
        } else if (v.description.toLowerCase().includes('error') || v.description.toLowerCase().includes('prevent')) {
          v.heuristic = 'Error Prevention';
        } else {
          v.heuristic = 'User Control and Freedom';
        }
      }

      // If missing business impact, assign a relevant one
      if (!v.businessImpact || v.businessImpact.trim() === '') {
        if (v.description.toLowerCase().includes('conversion') || v.description.toLowerCase().includes('financial')) {
          v.businessImpact = 'Reduced conversion rates and potential revenue loss due to user confusion and abandoned actions.';
        } else if (v.description.toLowerCase().includes('button') || v.description.toLowerCase().includes('contact')) {
          v.businessImpact = 'Users may struggle to find the right action, leading to decreased engagement and missed opportunities.';
        } else {
          v.businessImpact = 'User experience friction may result in lower satisfaction and reduced task completion rates.';
        }
      }

      return v;
    });

    // Ensure minimum 3 heuristic violations are shown
    if (violations.length < 3) {
      // Add generic heuristic violations if not enough are found
      const fallbackViolations = [
        {
          id: 'fallback-1',
          title: 'Visibility of System Status',
          description: 'Users may not be aware of current system status due to lack of clear feedback indicators.',
          heuristic: 'Visibility of System Status',
          category: 'heuristics',
          businessImpact: 'Users may feel uncertain about their actions, leading to hesitation and potential abandonment.'
        },
        {
          id: 'fallback-2',
          title: 'Consistency and Standards',
          description: 'Inconsistent design patterns across the interface may confuse users and reduce efficiency.',
          heuristic: 'Consistency and Standards',
          category: 'heuristics',
          businessImpact: 'Users spend more time learning the interface instead of completing tasks.'
        },
        {
          id: 'fallback-3',
          title: 'Error Prevention',
          description: 'The interface lacks adequate safeguards to prevent user errors before they occur.',
          heuristic: 'Error Prevention',
          category: 'heuristics',
          businessImpact: 'Users may make mistakes that frustrate them and interrupt their workflow.'
        }
      ];

      // Add fallback violations to reach minimum of 3
      for (let i = 0; i < fallbackViolations.length && violations.length < 3; i++) {
        const fallback = fallbackViolations[i];
        if (!violations.some(v => v.heuristic === fallback.heuristic)) {
          violations.push(fallback);
        }
      }
    }

    return violations;
  };

  // Enhanced recommended fixes from new structure
  const getRecommendedFixes = () => {
    // Priority: use prioritizedFixes from new structure
    const prioritizedFixes = data.prioritizedFixes || [];

    // Fallback: extract fixes from issues array
    const issueBasedFixes = data.issues?.filter(i => i.recommendation && i.recommendation.trim() !== '') || [];

    const allFixes = [
      // Map new structure prioritized fixes
      ...prioritizedFixes.map((fix: any, idx: number) => ({
        id: `fix-${idx}`,
        title: fix.title || `Recommendation ${idx + 1}`,
        recommendation: fix.recommendation || '',
        priority: fix.priority || 'medium',
        effort: fix.effort || 'medium',
        businessImpact: fix.businessImpact || '',
        timeframe: fix.timeframe || 'short-term',
        category: fix.category || 'general',
        severity: fix.priority === 'high' ? 'critical' : fix.priority === 'medium' ? 'major' : 'minor'
      })),
      // Map legacy issue-based fixes
      ...issueBasedFixes.map((issue, idx) => ({
        id: `issue-fix-${idx}`,
        title: issue.title || '',
        recommendation: issue.recommendation || '',
        priority: issue.priority || 'medium',
        effort: issue.effort || 'medium',
        businessImpact: issue.businessImpact || '',
        timeframe: issue.timeframe || 'short-term',
        category: issue.category || 'general',
        severity: issue.severity || 'minor'
      }))
    ];

    // Sort by priority: high -> medium -> low
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    allFixes.sort((a, b) => {
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      return bPriority - aPriority;
    });

    // Only return fixes with actual content, limited to maximum 5
    const validFixes = allFixes.filter(fix =>
      fix.title && fix.title.trim() !== '' &&
      fix.recommendation && fix.recommendation.trim() !== ''
    );

    return validFixes.slice(0, 5); // Limit to maximum 5 recommendations
  };

  // Journey points (persona-driven, no static fallbacks)
  const personaJourney = data.personaDrivenJourney;
  const scenarioPersona = personaJourney?.persona || '';

  const getCurrentExperience = () => {
    if (!personaJourney || !personaJourney.steps?.length) return [] as string[];
    // collect one issue phrase from each step if present
    const pts: string[] = [];
    personaJourney.steps.forEach((s) => {
      if (s.issues && s.issues.length) pts.push(s.issues[0]);
    });
    return pts.slice(0, 3);
  };

  const getOptimizedExperience = () => {
    if (!personaJourney || !personaJourney.steps?.length) return [] as string[];
    const pts: string[] = [];
    personaJourney.steps.forEach((s) => {
      if (s.improvements && s.improvements.length) pts.push(s.improvements[0]);
    });
    return pts.slice(0, 3);
  };

  // Enhanced category scores with findings support
  const getCategoryScores = () => {
    const scores = data.scores;
    if (!scores) return [];

    const norm = (cat: any): number => {
      if (!cat) return 0;
      if (typeof cat.score === 'number' && typeof cat.maxScore === 'number' && cat.maxScore > 0) {
        return (cat.score / cat.maxScore) * 5;
      }
      if (typeof cat.percentage === 'number') {
        return (cat.percentage / 100) * 5;
      }
      return 0;
    };

    const categories = [];
    if (scores.heuristics) {
      categories.push({
        label: 'Heuristics',
        score: norm(scores.heuristics),
        findings: scores.heuristics.findings
      });
    }
    if (scores.uxLaws) {
      categories.push({
        label: 'Usability',
        score: norm(scores.uxLaws),
        findings: scores.uxLaws.findings
      });
    }
    if (scores.accessibility) {
      categories.push({
        label: 'Accessibility',
        score: norm(scores.accessibility),
        findings: scores.accessibility.findings
      });
    }
    if (scores.copywriting) {
      categories.push({
        label: 'Conversion',
        score: norm(scores.copywriting),
        findings: scores.copywriting.findings
      });
    }

    return categories;
  };

  const handleDownloadPDF = async () => {
    // Prevent multiple clicks
    if (downloadStatus !== 'idle') return;

    // Get user data from storage (saved during form submission)
    const userInfo = getUserData();

    if (!userInfo) {
      alert('User information not found. Please go back and submit the form again.');
      return;
    }

    // Set to sending state
    setDownloadStatus('sending');

    try {
      // Call the backend API to share the PDF via email using Brevo
      const shareUrl = process.env.NODE_ENV === 'production'
        ? '/api/share-report'
        : 'http://localhost:3001/api/share-report';

      const response = await fetch(shareUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auditData: data,
          recipientEmail: userInfo.email,
          recipientName: userInfo.name,
          platformName: getPlatformName()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to share report: ${response.status}`);
      }

      const result = await response.json();
      console.log('Report shared successfully:', result);

      // Set to sent state
      setDownloadStatus('sent');

    } catch (error) {
      console.error('Error sharing PDF report:', error);
      alert(`Failed to share report: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      // Reset to idle on error so user can retry
      setDownloadStatus('idle');
    }
  };

  const handleNewAudit = () => {
    sessionStorage.removeItem('mainAuditData');
    window.location.href = '/';
  };


  return (
    <>
    <div className="min-h-screen relative" style={{fontFamily: 'Inter, sans-serif'}}>
      {/* Fixed Grid Background */}
      <div 
        className="fixed inset-0 pointer-events-none" 
        style={{
          background: `
            /* overlay on top (semi-transparent) */
            radial-gradient(circle at 35% 25%,
              rgba(255,255,255,0.85) 0%,
              rgba(255,255,255,0.70) 45%,
              rgba(255,255,255,0.45) 70%,
              rgba(255,255,255,0.25) 100%),
            /* grid underneath */
            repeating-linear-gradient(0deg,
              rgba(15,23,42,0.14) 0, rgba(15,23,42,0.14) 1px,
              transparent 1px, transparent 56px),
            repeating-linear-gradient(90deg,
              rgba(15,23,42,0.14) 0, rgba(15,23,42,0.14) 1px,
              transparent 1px, transparent 56px)
          `,
          backgroundSize: 'auto, auto, auto',
          backgroundRepeat: 'no-repeat, repeat, repeat'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="max-w-[800px] mx-auto px-6 py-10">
        
        {/* Action Buttons Banner - Above yellow banner, right aligned */}
        <div className="flex justify-end gap-3 mb-8 action-buttons-banner">
          <button
            onClick={handleDownloadPDF}
            disabled={downloadStatus !== 'idle'}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 bg-gray-900 text-white min-w-[180px] ${
              downloadStatus === 'idle'
                ? 'hover:bg-gray-800 active:bg-black transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                : downloadStatus === 'sending'
                ? 'opacity-70 cursor-wait'
                : 'cursor-not-allowed'
            }`}
            style={{fontSize: '16px', lineHeight: '1.5'}}
          >
            {downloadStatus === 'idle' && (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                  <path d="M12 16L7 11L8.4 9.6L11 12.2V4H13V12.2L15.6 9.6L17 11L12 16Z" fill="currentColor"/>
                  <path d="M5 20V18H19V20H5Z" fill="currentColor"/>
                </svg>
                <span>Download PDF</span>
              </>
            )}
            {downloadStatus === 'sending' && (
              <>
                <svg className="animate-spin h-4 w-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sending...</span>
              </>
            )}
            {downloadStatus === 'sent' && (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                </svg>
                <span>Sent</span>
              </>
            )}
          </button>
          <button
            onClick={handleNewAudit}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-xl font-medium hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            style={{fontSize: '16px', lineHeight: '1.5'}}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L12 20M4 12L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            New Audit
          </button>
        </div>

        <div id="audit-report-content">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl p-8 mb-10 border-2" style={{
          backgroundColor: '#FEF5F7',
          borderColor: '#E23D69'
        }}>

          {/* Company Favicon and URL */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {data.url ? (
                  (() => {
                    try {
                      const domain = new URL(data.url).hostname;
                      return domain.charAt(0).toUpperCase();
                    } catch {
                      return 'W';
                    }
                  })()
                ) : 'I'}
              </span>
            </div>
            <div className="text-gray-900 text-base font-semibold">
              {data.url ? (
                (() => {
                  try {
                    return new URL(data.url).hostname;
                  } catch {
                    return data.url;
                  }
                })()
              ) : 'Uploaded Image'}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            UX Audit Report
          </h1>
          <div className="mb-8">
            <p className="text-sm text-gray-700">
              Audited: {new Date(data.timestamp).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Metrics Row - Only show if AI has generated scores */}
          {((data as any).scores?.overall || getCategoryScores().length > 0) && (
          <div className="flex justify-between items-end">
            {/* Overall Score - Only show if available */}
            {(data as any).scores?.overall && (
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-gray-900 shadow-lg mb-3">
                {(() => {
                  const ov: any = (data as any).scores?.overall || {};
                  const val = (typeof ov.score === 'number' && typeof ov.maxScore === 'number' && ov.maxScore > 0)
                    ? (ov.score / ov.maxScore) * 5
                    : (typeof ov.percentage === 'number' ? (ov.percentage / 100) * 5 : 0);
                  return `${val.toFixed(1)}/5`;
                })()}
              </div>
              <div className="text-xs font-medium text-gray-900 leading-tight">
                Overall UX Score
              </div>
            </div>
            )}

            {/* Key Metrics Grid - Only show if we have category scores */}
            {getCategoryScores().length > 0 && (
            <div className={`grid gap-4 ${getCategoryScores().length <= 2 ? 'grid-cols-2' : getCategoryScores().length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
              {getCategoryScores().map((category, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-sm font-semibold text-gray-900 mb-3 shadow-lg">
                    {Number.isFinite(category.score) ? `${category.score.toFixed(1)}/5` : '0.0/5'}
                  </div>
                  <div className="text-xs font-medium text-gray-900 leading-tight">
                    {category.label}
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
          )}
        </div>

        {/* Company Name Section */}
        <div className="py-8 md:py-10 max-w-[1140px] mx-auto px-4 md:px-6 -mx-6">
          <div className="text-left">
            <h2 className="text-[28px] md:text-[34px] font-semibold tracking-[-0.01em]">
              {data.url ? (
                (() => {
                  try {
                    const url = new URL(data.url);
                    const domain = url.hostname.replace('www.', '').split('.')[0];
                    return domain.charAt(0).toUpperCase() + domain.slice(1);
                  } catch {
                    return 'Website Analysis';
                  }
                })()
              ) : 'Website Analysis'}
            </h2>
            <div className="max-w-[70ch] mt-3">
              <p className="text-[15px] md:text-base text-gray-700 leading-relaxed">
                {data.summary}
              </p>
            </div>
          </div>
        </div>




        {/* Key Insights Section - Only show contextual AI insights */}
        {getKeyInsights().length > 0 && (
        <div className="py-8 md:py-10 max-w-[1140px] mx-auto px-4 md:px-6 -mx-6">
          <div className="text-left">
            <h2 className="text-[28px] md:text-[34px] font-semibold tracking-[-0.01em]">Key Insights</h2>
            <p className="font-medium text-gray-800 mt-2 leading-relaxed" style={{lineHeight: '1.6'}}>Key findings and opportunities identified through AI analysis.</p>
          </div>
          <ul className="mt-4 space-y-3">
            {getKeyInsights().map((insight, index) => (
              <li key={index} className="flex items-start max-w-[70ch]">
                <span className="h-2 w-2 rounded-full bg-gray-400 mt-3 mr-4 flex-shrink-0"></span>
                <span className="text-gray-700 leading-relaxed" style={{fontSize: '16px', lineHeight: '1.6'}}>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
        )}

        {/* Screenshots Section - render only if image available */}
        {data.imageUrl && (
        <div className="py-8 md:py-10 max-w-[1140px] mx-auto px-4 md:px-6 -mx-6">
          <h2 className="text-[28px] md:text-[34px] font-semibold tracking-[-0.01em] mb-6" style={{color: '#19213d'}}>
            Analysis Screenshot
          </h2>
          <div className="rounded-xl p-6" style={{background: '#f1f3f7'}}>
            {data.imageUrl ? (
              <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                <img 
                  src={data.imageUrl} 
                  alt="Website screenshot used for analysis"
                  className="w-full h-auto object-contain"
                  style={{ maxHeight: '500px' }}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                <div className="w-full h-64 flex items-center justify-center text-sm" style={{
                  background: 'linear-gradient(135deg, #f1f3f7 0%, #e2e6ea 100%)',
                  color: '#6d758f'
                }}>
                  Screenshot will be displayed here after analysis
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* User Journey Map Section - persona driven only */}
        {personaJourney && personaJourney.steps && personaJourney.steps.length > 0 && (
        <div className="py-8 md:py-10 max-w-[1140px] mx-auto px-4 md:px-6 -mx-6">
          <div className="text-left">
            <h2 className="text-[28px] md:text-[34px] font-semibold tracking-[-0.01em]">User Journey Map</h2>
            <p className="font-medium text-gray-800 mt-2">AI-identified user experience pathway.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Current Experience Card */}
            <div className="rounded-2xl border border-neutral-200 p-6 bg-white transition-transform duration-300 hover:-translate-y-0.5">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-1">Current User Experience</h3>
                <p className="text-sm text-gray-600 italic">
                  {scenarioPersona && (
                    <>
                      Persona: <span className="font-medium">{scenarioPersona}</span>
                    </>
                  )}
                </p>
              </div>
              <div className="space-y-4">
                {getCurrentExperience().slice(0, 3).map((experience, index) => (
                  <div key={index} className="flex gap-3 p-2 rounded-xl hover:bg-neutral-50 transition">
                    <div className="w-6 h-6 bg-gray-900 text-white rounded-full grid place-items-center flex-shrink-0">
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Issue identified</h4>
                      <p className="text-sm text-gray-600">{experience}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Optimized Experience Card */}
            <div className="rounded-2xl border border-neutral-200 p-6 bg-white transition-transform duration-300 hover:-translate-y-0.5">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-1">Optimized User Experience</h3>
                <p className="text-sm text-gray-600 italic">Enhanced flow with recommended improvements for the same persona.</p>
              </div>
              <div className="space-y-4">
                {getOptimizedExperience().slice(0, 3).map((experience, index) => (
                  <div key={index} className="flex gap-3 p-2 rounded-xl hover:bg-neutral-50 transition">
                    <div className="w-6 h-6 bg-gray-900 text-white rounded-full grid place-items-center flex-shrink-0">
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Improved experience</h4>
                      <p className="text-sm text-gray-600">{typeof experience === 'string' ? experience : `Enhancement: ${experience}`}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Heuristic Violations Section - Only show if there are violations */}
        {getHeuristicViolations().length > 0 && (
        <div className="py-8 md:py-10 max-w-[1140px] mx-auto px-4 md:px-6 -mx-6">
          <div className="text-left">
            <h2 className="text-[28px] md:text-[34px] font-semibold tracking-[-0.01em]">Heuristic Violations</h2>
            <p className="font-medium text-gray-800 mt-2">Identified issues based on Nielsen's 10 Usability Heuristics.</p>
          </div>
          <div className="space-y-4 mt-6">
            {getHeuristicViolations().map((violation, index) => (
              <div key={violation.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 mb-3 leading-relaxed">{violation.description || violation.violation}</p>
                    <div className="mb-3">
                      {violation.heuristic && (
                        <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                          {violation.heuristic.replace("Nielsen's 1st Heuristic", "Visibility of System Status")
                            .replace("Nielsen's 2nd Heuristic", "Match Between System and Real World")
                            .replace("Nielsen's 3rd Heuristic", "User Control and Freedom")
                            .replace("Nielsen's 4th Heuristic", "Consistency and Standards")
                            .replace("Nielsen's 5th Heuristic", "Error Prevention")
                            .replace("Nielsen's 6th Heuristic", "Recognition Rather than Recall")
                            .replace("Nielsen's 7th Heuristic", "Flexibility and Efficiency")
                            .replace("Nielsen's 8th Heuristic", "Aesthetic and Minimalist Design")
                            .replace("Nielsen's 9th Heuristic", "Help Users Recognize and Recover from Errors")
                            .replace("Nielsen's 10th Heuristic", "Help and Documentation")}
                        </span>
                      )}
                    </div>
                    {violation.businessImpact && (
                      <div className="p-3 bg-amber-50 rounded-lg">
                        <span className="text-sm font-medium text-amber-700">Business Impact: </span>
                        <span className="text-sm text-gray-800">{violation.businessImpact}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Recommended Fixes Section - Only show if there are fixes */}
        {getRecommendedFixes().length > 0 && (
        <div className="py-8 md:py-10 max-w-[1140px] mx-auto px-4 md:px-6 -mx-6">
          <div>
            <div className="text-left">
              <h2 className="text-[28px] md:text-[34px] font-semibold tracking-[-0.01em]">Recommended Fixes</h2>
              <p className="font-medium text-gray-800 mt-2">Actionable solutions prioritized by impact and effort.</p>
            </div>
            <div className="space-y-4 mt-6">
              {getRecommendedFixes().map((fix, index) => (
                <div key={fix.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex gap-2 flex-shrink-0">
                          {(fix.priority || fix.severity) && (
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                              fix.priority === 'high' || fix.severity === 'critical' ? 'bg-red-100 text-red-700' :
                              fix.priority === 'medium' || fix.severity === 'major' ? 'bg-orange-100 text-orange-700' : 
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {fix.priority === 'high' || fix.severity === 'critical' ? 'High Priority' : 
                               fix.priority === 'medium' || fix.severity === 'major' ? 'Medium Priority' : 'Low Priority'}
                            </span>
                          )}
                          {fix.effort && (
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                              fix.effort === 'high' ? 'bg-gray-100 text-gray-700' :
                              fix.effort === 'medium' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {fix.effort === 'high' ? 'High Effort' :
                               fix.effort === 'medium' ? 'Medium Effort' : 'Low Effort'}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3 leading-relaxed">{fix.recommendation}</p>
                      
                      {/* Impact section with grey background - similar to heuristic violations */}
                      {fix.businessImpact && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-600">Impact: </span>
                          <span className="text-sm text-gray-800">{fix.businessImpact}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Relevant Case Studies Section - Always show */}
        <div className="py-8 md:py-10 max-w-[1140px] mx-auto px-4 md:px-6 -mx-6">
          <h2 className="text-[28px] md:text-[34px] font-semibold tracking-[-0.01em] mb-2" style={{color: '#19213d'}}>
            Relevant Case Studies
          </h2>
          <p className="font-medium text-gray-800 mb-6 leading-relaxed">
            Similar projects from our portfolio that showcase relevant design solutions and approaches.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getRelevantCaseStudiesForAudit().map((caseStudy) => (
              <a
                key={caseStudy.id}
                href={caseStudy.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-gray-300 hover:shadow-sm cursor-pointer"
              >
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h4 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors flex-1">
                        {caseStudy.title}
                      </h4>
                      <span className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium flex-shrink-0">
                        {caseStudy.industry.replace('-', ' ').charAt(0).toUpperCase() + caseStudy.industry.replace('-', ' ').slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {caseStudy.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        UX Design
                      </span>
                    </div>
                    <span className="text-sm text-blue-600 group-hover:text-blue-700 font-medium transition-colors">
                      View Case Study →
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Back to Top Button */}
        <div className="flex justify-center mt-12 mb-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded-full font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            style={{fontSize: '16px', lineHeight: '1.5'}}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8L7 13L8.4 14.4L11 11.8V20H13V11.8L15.6 14.4L17 13L12 8Z" fill="currentColor"/>
              <path d="M5 4V2H19V4H5Z" fill="currentColor"/>
            </svg>
            Back to Top
          </button>
        </div>


        </div> {/* End PDF Content Wrapper */}
        </div>
      </div>
    </div>

    </>
  );
};
