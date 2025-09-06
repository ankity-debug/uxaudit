import React, { useMemo, useCallback } from 'react';
import { AuditData } from '../types';
import { getRelevantCaseStudies } from '../data/caseStudies';
import html2pdf from 'html2pdf.js';

interface AuditReportProps {
  data: AuditData;
}

export const AuditReport: React.FC<AuditReportProps> = ({ data }) => {
  // Deduplication & phrasing helpers to keep sections distinctive
  const normalizeText = (t: string) =>
    t
      .toLowerCase()
      .replace(/\b(the|a|an|and|or|to|for|of|on|in|at|with|we|you|your|our)\b/g, ' ')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const getThemeId = useCallback((t: string) => {
    const s = normalizeText(t);
    if (/44px|tap|touch|click target|target size/.test(s)) return 'tap-target';
    if (/(navigation|nav|menu).*(different|inconsistent|across pages|vary|behaviors)/.test(s)) return 'nav-consistency';
    if (/contrast|low contrast/.test(s)) return 'contrast';
    if (/form|validation|error|label/.test(s)) return 'forms';
    if (/cta|call to action|primary action|button prominence/.test(s)) return 'cta';
    if (/responsive|mobile|smaller screen|viewport/.test(s)) return 'responsive';
    if (/copy|labeling|microcopy|ambiguous/.test(s)) return 'copy-clarity';
    if (/hierarchy|information architecture|ia|findability|grouping/.test(s)) return 'ia-hierarchy';
    if (/feedback|status|loading|progress|spinner/.test(s)) return 'feedback-status';
    return s.split(' ').slice(0, 5).join('-');
  }, []);

  const themePhrases = useMemo((): Record<string, { overall: string; journey: string; heuristic: string }> => ({
    'tap-target': {
      overall: 'Standardize 44px+ tap targets across mobile to reduce misses.',
      journey: 'Sub‑44px tap targets in critical flows lead to missed taps.',
      heuristic: 'Tap targets below 44px reduce usability; increase to 44px+.'
    },
    'nav-consistency': {
      overall: 'Unify navigation patterns (labels, placement, behavior) across pages.',
      journey: 'Navigation changes between pages create disorientation in multi‑step tasks.',
      heuristic: 'Breaks “Consistency & Standards”; align styles and interactions.'
    },
    contrast: {
      overall: 'Raise text contrast to WCAG 2.2 AA (≥4.5:1) for readability.',
      journey: 'Low‑contrast text slows scanning on key pages.',
      heuristic: 'Contrast fails AA in components; adjust colors/weights.'
    },
    forms: {
      overall: 'Harden forms: labels, inline validation, and helpful errors.',
      journey: 'Missing labels/validation cause retries and drop‑off.',
      heuristic: 'Violates error prevention/recognition; add labels and real‑time checks.'
    },
    cta: {
      overall: 'Clarify primary actions with consistent, prominent CTA styling.',
      journey: 'Ambiguous CTAs delay decisions in key steps.',
      heuristic: 'Weak hierarchy; strengthen CTA prominence and state feedback.'
    },
    responsive: {
      overall: 'Fix responsive breakpoints; ensure components adapt at sm/md.',
      journey: 'On mobile, cramped UI and shifts slow task completion.',
      heuristic: 'Improve flexibility/efficiency with mobile‑first patterns.'
    },
    'copy-clarity': {
      overall: 'Tighten copy and labels to cut ambiguity and cognitive load.',
      journey: 'Vague labels force rereads during flows.',
      heuristic: 'Match between system and real world: use plain language.'
    },
    'ia-hierarchy': {
      overall: 'Strengthen information hierarchy and IA for scanability and findability.',
      journey: 'Weak hierarchy hides key info at decision points.',
      heuristic: 'Favor recognition over recall: group and label clearly.'
    },
    'feedback-status': {
      overall: 'Add timely, clear feedback for async actions and long tasks.',
      journey: 'Missing progress cues create uncertainty during waits.',
      heuristic: 'Visibility of system status: surface loading/progress states.'
    }
  }), []);

  const rewriteForContext = useCallback((
    raw: string,
    context: 'overall' | 'journey' | 'heuristic',
    heuristicName?: string
  ) => {
    const theme = getThemeId(raw);
    const map = themePhrases[theme];
    if (map) {
      if (context === 'heuristic' && heuristicName) {
        return `${map.heuristic} (${heuristicName}).`;
      }
      return map[context];
    }
    const base = raw.replace(/\s+/g, ' ').trim().replace(/\.$/, '');
    if (context === 'overall') return `Elevate: ${base}.`;
    if (context === 'journey') return `In‑flow impact: ${base}.`;
    return `Guideline gap: ${base}.`;
  }, [getThemeId, themePhrases]);

  const uniqueByTheme = useCallback((items: { text: string; extra?: any }[], seen: Set<string>) => {
    const out: { text: string; theme: string; extra?: any }[] = [];
    for (const it of items) {
      const theme = getThemeId(it.text);
      if (seen.has(theme)) continue;
      seen.add(theme);
      out.push({ text: it.text, theme, extra: it.extra });
      if (seen.size > 64) break;
    }
    return out;
  }, [getThemeId]);

  const { overallPoints, heuristicItems, filteredFixes } = useMemo(() => {
    const seen = new Set<string>();

    // Overall points from recommendations; backfill from issues if sparse
    const overallPool = (data.recommendations || []).map((r) => ({ text: r }));
    const overall = uniqueByTheme(overallPool, seen).slice(0, 4);

    // Heuristics points from heuristic issues
    const heurPool = data.issues
      .filter((i) => i.category === 'heuristics')
      .map((i) => ({ text: i.description || i.title, extra: { heuristic: i.heuristic } }));
    const heur = uniqueByTheme(heurPool, seen).slice(0, 5);

    // Filter fixes to avoid repetition by theme
    const usedThemes = new Set([
      ...overall.map((o) => o.theme),
      ...heur.map((h) => h.theme)
    ]);
    const fixes = data.issues
      .filter((i) => {
        const key = getThemeId(`${i.title || ''} ${i.description || ''} ${i.recommendation || ''}`);
        return !usedThemes.has(key);
      })
      .slice(0, 6);

    return {
      overallPoints: overall.map((o) => rewriteForContext(o.text, 'overall')),
      heuristicItems: heur.map((h) => ({
        text: rewriteForContext(h.text, 'heuristic'),
        label: h.extra?.heuristic || undefined
      })),
      filteredFixes: fixes
    };
  }, [data, getThemeId, rewriteForContext, uniqueByTheme]);
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


  // Get relevant case studies using smart matching
  const getRelevantCaseStudiesForAudit = () => {
    return getRelevantCaseStudies(data.url, data.summary, 2);
  };

  // Get heuristic points (prefer deduped from issues; fallback to backend heuristicViolations)
  const getHeuristicViolations = () => {
    if (heuristicItems && heuristicItems.length > 0) {
      return heuristicItems.map((h, idx) => ({ id: `h-${idx}`, title: h.text, heuristic: h.label, category: 'heuristics' } as any));
    }
    const hv = (data as any).heuristicViolations || [];
    if (Array.isArray(hv) && hv.length > 0) {
      return hv.map((v: any, idx: number) => ({
        id: `hv-${idx}`,
        title: v.violation || v.issue || v.heuristic || 'Heuristic issue',
        description: v.violation || v.issue || '',
        heuristic: v.heuristic,
        element: v.element,
        category: 'heuristics'
      }));
    }
    return [] as any[];
  };

  // Get recommended fixes (prefer deduped issues; fallback to prioritizedFixes from backend)
  const getRecommendedFixes = () => {
    if (filteredFixes && filteredFixes.length > 0) return filteredFixes;
    const pf = (data as any).prioritizedFixes || [];
    if (Array.isArray(pf) && pf.length > 0) {
      return pf.map((f: any, idx: number) => ({
        id: `pf-${idx}`,
        title: f.recommendation || 'Recommendation',
        recommendation: f.recommendation || '',
        severity: f.priority === 'high' ? 'major' : 'minor',
        category: 'recommendation'
      }));
    }
    return [] as any[];
  };

  // Journey points (persona-driven, no static fallbacks)
  const personaJourney = data.personaDrivenJourney;
  const scenarioPersona = personaJourney?.persona || '';
  const scenarioGoal = useMemo(() => {
    if (personaJourney?.personaReasoning) return personaJourney.personaReasoning;
    const first = personaJourney?.steps?.[0]?.action;
    return first ? first : '';
  }, [personaJourney]);

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

  // Category metrics (out of 5) synced to AI scores
  const getCategoryScores = () => {
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

    const heuristics = norm((data as any).scores?.heuristics);
    const usability = norm((data as any).scores?.uxLaws);
    const accessibility = norm((data as any).scores?.accessibility);
    const conversion = norm((data as any).scores?.copywriting);

    return [
      { label: 'Heuristics', score: heuristics },
      { label: 'Usability', score: usability },
      { label: 'Accessibility', score: accessibility },
      { label: 'Conversion', score: conversion }
    ];
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('audit-report-content');
    const opt = {
      margin: 1,
      filename: `ux-audit-${getPlatformName()}-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    // Hide the action buttons during PDF generation
    const actionButtons = document.querySelector('.action-buttons-banner');
    if (actionButtons) {
      (actionButtons as HTMLElement).style.display = 'none';
    }
    
    html2pdf().set(opt).from(element).save().then(() => {
      // Show the action buttons again
      if (actionButtons) {
        (actionButtons as HTMLElement).style.display = 'flex';
      }
    });
  };

  const handleNewAudit = () => {
    sessionStorage.removeItem('mainAuditData');
    window.location.href = '/';
  };


  return (
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
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 active:bg-black transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16L7 11L8.4 9.6L11 12.2V4H13V12.2L15.6 9.6L17 11L12 16Z" fill="currentColor"/>
              <path d="M5 20V18H19V20H5Z" fill="currentColor"/>
            </svg>
            Download PDF
          </button>
          <button
            onClick={handleNewAudit}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-xl font-medium hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L12 20M4 12L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            New Audit
          </button>
        </div>

        <div id="audit-report-content">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl p-8 mb-10" style={{
          background: 'linear-gradient(135deg, #FAE100 0%, #F0D000 100%)'
        }}>

          {/* Company Favicon and URL */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-[#FAE100] font-bold text-sm">
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
            <div className="text-black text-base font-semibold">
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
          <h1 className="text-4xl font-bold text-black mb-8">
            Audit Breakdown
          </h1>

          {/* Metrics Row - Updated Layout with Bottom Labels */}
          <div className="flex justify-between items-end">
            {/* Overall Score */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-3xl font-bold text-black shadow-lg mb-3">
                {(() => {
                  const ov: any = (data as any).scores?.overall || {};
                  const val = (typeof ov.score === 'number' && typeof ov.maxScore === 'number' && ov.maxScore > 0)
                    ? (ov.score / ov.maxScore) * 5
                    : (typeof ov.percentage === 'number' ? (ov.percentage / 100) * 5 : 0);
                  return val.toFixed(1);
                })()}
              </div>
              <div className="text-xs font-medium text-black leading-tight">
                Overall UX Score
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-4 gap-4">
              {getCategoryScores().map((category, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-lg font-semibold text-black mb-3 shadow-lg">
                    {Number.isFinite(category.score) ? category.score.toFixed(1) : '0.0'}
                  </div>
                  <div className="text-xs font-medium text-black leading-tight">
                    {category.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Company Name Section */}
        <div className="py-8 md:py-10 max-w-[1140px] mx-auto px-4 md:px-6 -mx-6">
          <div className="text-left">
            <div className="text-sm text-gray-500 mb-2">
              Published on: {new Date(data.timestamp).toLocaleDateString('en-US', { 
                year: 'numeric',
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <h2 className="text-[28px] md:text-[34px] font-semibold tracking-[-0.01em] mt-2">
              {data.url ? (
                (() => {
                  try {
                    const url = new URL(data.url);
                    const domain = url.hostname.replace('www.', '').split('.')[0];
                    return domain.charAt(0).toUpperCase() + domain.slice(1);
                  } catch {
                    return 'Company Name';
                  }
                })()
              ) : 'Company Name'}
            </h2>
            <div className="max-w-[70ch] mt-3">
              <p className="text-[15px] md:text-base text-gray-700 leading-relaxed">
                {data.summary}
              </p>
            </div>
          </div>
        </div>

        {/* Overall Insights Section - render only if recommendations present */}
        {overallPoints.length > 0 && (
        <div className="py-8 md:py-10 max-w-[1140px] mx-auto px-4 md:px-6 -mx-6">
          <div className="text-left">
            <h2 className="text-[28px] md:text-[34px] font-semibold tracking-[-0.01em]">Overall Insights</h2>
            <p className="font-medium text-gray-800 mt-2">The deep, non-obvious findings about the user experience.</p>
          </div>
          <ul className="mt-4 space-y-2">
            {overallPoints.map((point, index) => (
              <li key={index} className="flex items-start max-w-[70ch]">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 mt-2 mr-3"></span>
                <span className="text-[15px] md:text-base text-gray-700 leading-relaxed">{point}</span>
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
            <p className="font-medium text-gray-800 mt-2">Persona‑based pathway derived from AI analysis.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Current Experience Card */}
            <div className="rounded-2xl border border-neutral-200 p-6 bg-white transition-transform duration-300 hover:-translate-y-0.5">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-1">Current User Experience</h3>
                <p className="text-sm text-gray-600 italic">
                  {scenarioPersona && (
                    <>
                      Persona: <span className="font-medium">{scenarioPersona}</span>.{' '}
                    </>
                  )}
                  {scenarioGoal && (
                    <>
                      Scenario: <span className="font-medium">{scenarioPersona || 'User'} wants to {scenarioGoal}</span>.
                    </>
                  )}
                </p>
              </div>
              <div className="space-y-4">
                {getCurrentExperience().slice(0, 3).map((experience, index) => (
                  <div key={index} className="flex gap-3 p-2 rounded-xl hover:bg-neutral-50 transition">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full grid place-items-center flex-shrink-0">
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
                    <div className="w-6 h-6 bg-yellow-400 rounded-full grid place-items-center flex-shrink-0">
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

        {/* Heuristic Violations Section - left aligned */}
        <div className="py-8 md:py-10 max-w-[1140px] mx-auto px-4 md:px-6 -mx-6">
          <div className="text-left">
            <h2 className="text-[28px] md:text-[34px] font-semibold tracking-[-0.01em]">Heuristic Violations</h2>
            <p className="font-medium text-gray-800 mt-2">Identified issues based on Nielsen's 10 Usability Heuristics.</p>
          </div>
          <div className="space-y-2 mt-6">
            {getHeuristicViolations().length > 0 ? (
              getHeuristicViolations().map((violation, index) => (
                <div key={violation.id} className="flex gap-3 items-start p-3 rounded-xl hover:bg-neutral-50 transition">
                  <div className="h-6 w-6 rounded-full bg-yellow-400 text-[12px] font-semibold grid place-items-center mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start gap-2 flex-wrap">
                      <h4 className="font-semibold text-[#111]">{violation.title}</h4>
                      {violation.heuristic && (
                        <span className="text-[11px] px-2 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-800">
                          {violation.heuristic}
                        </span>
                      )}
                    </div>
                    {violation.description && (
                      <p className="text-sm text-gray-600 mt-1">{violation.description}</p>
                    )}
                    {violation.element && (
                      <div className="text-xs mt-1 px-2 py-1 bg-gray-200 rounded inline-block">
                        Element: {violation.element}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex gap-3 items-start p-3 rounded-xl hover:bg-neutral-50 transition">
                <div className="h-6 w-6 rounded-full bg-green-400 text-[12px] font-semibold grid place-items-center mt-0.5">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold">No major heuristic violations detected</h4>
                  <p className="text-sm text-gray-600">The interface generally follows usability principles.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Fixes Section - left aligned */}
        <div className="py-8 md:py-10 max-w-[1140px] mx-auto px-4 md:px-6 -mx-6">
          <div>
            <div className="text-left">
              <h2 className="text-[28px] md:text-[34px] font-semibold tracking-[-0.01em]">Recommended Fixes</h2>
              <p className="font-medium text-gray-800 mt-2">Quick wins and structural improvements.</p>
            </div>
            <div className="space-y-2 mt-6">
              {getRecommendedFixes().map((fix) => (
                <div key={fix.id} className="flex gap-3 items-start p-3 rounded-xl hover:bg-neutral-50 transition">
                  <div className="h-6 w-6 rounded-full bg-yellow-400 grid place-items-center mt-0.5">
                    <span className="text-[14px] font-semibold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">{fix.title}</h4>
                    <p className="text-sm text-gray-600">{fix.recommendation}</p>
                    {(fix.severity || fix.category) && (
                      <div className="flex gap-2 mt-2">
                        {fix.severity && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            fix.severity === 'critical' ? 'bg-red-100 text-red-700' :
                            fix.severity === 'major' ? 'bg-orange-100 text-orange-700' : 
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {fix.severity === 'critical' ? 'Critical' : 
                             fix.severity === 'major' ? 'High Priority' : 'Medium Priority'}
                          </span>
                        )}
                        {fix.category && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {fix.category}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Work Samples Section - left aligned */}
        <div className="py-8 md:py-10 max-w-[1140px] mx-auto px-4 md:px-6 -mx-6">
          <h2 className="text-[28px] md:text-[34px] font-semibold tracking-[-0.01em] mb-6" style={{color: '#19213d'}}>
            Relevant Case Studies
          </h2>
          <div className="grid grid-cols-2 gap-6">
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
                    <h4 className="text-lg font-semibold mb-3 text-gray-900 group-hover:text-gray-700 transition-colors">
                      {caseStudy.title}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {caseStudy.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                      {caseStudy.industry.charAt(0).toUpperCase() + caseStudy.industry.slice(1)}
                    </span>
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
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded-full font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
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
  );
};
