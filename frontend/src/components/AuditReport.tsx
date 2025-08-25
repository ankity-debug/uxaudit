import React, { useState } from 'react';
import { AuditData } from '../types';
import { getRelevantCaseStudies } from '../data/caseStudies';
import html2pdf from 'html2pdf.js';

interface AuditReportProps {
  data: AuditData;
}

export const AuditReport: React.FC<AuditReportProps> = ({ data }) => {
  const [faviconError, setFaviconError] = useState(false);
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

  // Get favicon URL for the platform
  const getFaviconUrl = (): string | undefined => {
    if (data.url) {
      try {
        const url = new URL(data.url);
        return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
      } catch {
        return undefined;
      }
    }
    return undefined;
  };

  // Get relevant case studies using smart matching
  const getRelevantCaseStudiesForAudit = () => {
    return getRelevantCaseStudies(data.url, data.summary, 2);
  };

  // Get heuristic violations (Nielsen's 10)
  const getHeuristicViolations = () => {
    return data.issues.filter(issue => issue.category === 'heuristics').slice(0, 5);
  };

  // Get recommended fixes
  const getRecommendedFixes = () => {
    return data.issues.slice(0, 6);
  };

  // Format journey steps from issues and recommendations
  const getCurrentExperience = () => {
    const majorIssues = data.issues.filter(issue => issue.severity === 'major').slice(0, 3);
    return majorIssues.length > 0 ? majorIssues.map(issue => issue.description) : [
      'Users experiencing navigation difficulties',
      'Unclear content hierarchy and information architecture',
      'Accessibility barriers affecting user interaction'
    ];
  };

  const getOptimizedExperience = () => {
    const recommendations = data.recommendations.slice(0, 4);
    return recommendations.length > 0 ? recommendations : [
      'Enhanced navigation with clear visual hierarchy',
      'Improved content organization and labeling',
      'Accessible design following WCAG guidelines',
      'Streamlined user flows with better feedback'
    ];
  };

  // Get category scores for heuristics grid
  const getCategoryScores = () => {
    const criticalIssues = data.issues.filter(issue => issue.severity === 'critical').length;
    const majorIssues = data.issues.filter(issue => issue.severity === 'major').length;
    const minorIssues = data.issues.filter(issue => issue.severity === 'minor').length;
    
    // Calculate user impact based on issue severity distribution
    const userImpactScore = Math.max(0, 100 - (criticalIssues * 25 + majorIssues * 15 + minorIssues * 5));
    
    // Calculate conversion risk based on critical and major issues
    const conversionRisk = Math.max(0, 100 - (criticalIssues * 30 + majorIssues * 15));
    
    return [
      { label: 'Critical Issues', score: criticalIssues, isCount: true },
      { label: 'User Impact', score: userImpactScore },
      { label: 'Accessibility', score: data.scores.accessibility.percentage },
      { label: 'Conversion Risk', score: conversionRisk }
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
    sessionStorage.removeItem('deepDiveAuditData');
    window.location.href = '/';
  };

  const handleDeepDive = () => {
    // Store audit data in sessionStorage for deep dive access
    sessionStorage.setItem('deepDiveAuditData', JSON.stringify(data));
    // Navigate to deep dive report
    window.location.href = '/deep-dive';
  };

  return (
    <div className="min-h-screen bg-white" style={{fontFamily: 'Inter, sans-serif'}}>
      <div className="max-w-[800px] mx-auto px-6 py-10">
        
        <div id="audit-report-content">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl p-10 mb-10" style={{
          background: 'linear-gradient(135deg, #FAE100 0%, #F0D000 100%)'
        }}>

          {/* Action Buttons Banner */}
          <div className="flex justify-end gap-3 mb-8 action-buttons-banner">
            <button
              onClick={handleDeepDive}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-400 text-gray-900 rounded-xl font-medium hover:bg-yellow-500 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.663 17H4.5A2.5 2.5 0 0 1 2 14.5V9A2.5 2.5 0 0 1 4.5 6.5H9.663A1 1 0 0 1 10.5 7V16A1 1 0 0 1 9.663 17Z" fill="currentColor"/>
                <path d="M13.5 6.5H19.5A2.5 2.5 0 0 1 22 9V14.5A2.5 2.5 0 0 1 19.5 17H13.5A1 1 0 0 1 12.5 16V7A1 1 0 0 1 13.5 6.5Z" fill="currentColor"/>
              </svg>
              Deep Dive Analysis
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 16L7 11L8.4 9.6L11 12.2V4H13V12.2L15.6 9.6L17 11L12 16Z" fill="currentColor"/>
                <path d="M5 20V18H19V20H5Z" fill="currentColor"/>
              </svg>
              Download PDF
            </button>
            <button
              onClick={handleNewAudit}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L12 20M4 12L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              New Audit
            </button>
          </div>

          {/* Company Name */}
          <div className="flex items-center text-sm font-normal text-black mb-2">
            {getFaviconUrl() && !faviconError ? (
              <img 
                src={getFaviconUrl()} 
                alt={`${getPlatformName()} favicon`} 
                className="w-4 h-4 mr-2 rounded-sm"
                onError={() => setFaviconError(true)}
              />
            ) : (
              <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
            )}
            {getPlatformName()}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-black mb-8">
            Audit Breakdown
          </h1>

          {/* Metrics Row */}
          <div className="flex justify-between items-center">
            {/* Overall Score */}
            <div className="flex flex-col items-start">
              <div className="text-sm font-normal text-black mb-2">Overall UX Score</div>
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-3xl font-bold text-black shadow-lg">
                {(data.scores.overall.score / 10).toFixed(1)}
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-4 gap-4">
              {getCategoryScores().map((category, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-lg font-semibold text-black mb-3 shadow-sm">
                    {category.isCount ? category.score : category.score.toFixed(0)}
                  </div>
                  <div className="text-xs font-medium text-black leading-tight">
                    {category.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Section */}
        <div className="my-10">
          <h2 className="text-xl font-semibold mb-4" style={{color: '#19213d'}}>
            Platform/Client Name
          </h2>
          <p className="text-sm font-normal leading-relaxed mb-6" style={{color: '#6d758f'}}>
            {data.summary}
          </p>
          <p className="text-sm font-normal leading-relaxed" style={{color: '#6d758f'}}>
            Analysis Date: {new Date(data.timestamp).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} • {data.issues.length} Issues Identified • Overall Grade: {data.scores.overall.grade}
          </p>
        </div>

        {/* Overall Insights Section */}
        <div className="my-10">
          <h2 className="flex items-center text-xl font-semibold mb-4" style={{color: '#19213d'}}>
            <span className="w-6 h-6 bg-yellow-300 rounded-md flex items-center justify-center mr-3">
              💡
            </span>
            Overall Insights
          </h2>
          <div className="text-sm leading-relaxed" style={{color: '#6d758f'}}>
            <p className="mb-4">Key findings from the UX audit analysis:</p>
            <ul className="space-y-2">
              {data.recommendations.slice(0, 4).map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-300 font-bold mr-2 mt-1">•</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Screenshots Section */}
        <div className="my-10">
          <h2 className="flex items-center text-xl font-semibold mb-6" style={{color: '#19213d'}}>
            <span className="w-6 h-6 bg-yellow-300 rounded-md flex items-center justify-center mr-3">
              📸
            </span>
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

        {/* User Journey Map Section */}
        <div className="my-10">
          <h2 className="flex items-center text-xl font-semibold mb-6" style={{color: '#19213d'}}>
            <span className="w-6 h-6 bg-yellow-300 rounded-md flex items-center justify-center mr-3">
              🗺️
            </span>
            User Journey Map
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-base font-semibold mb-4" style={{color: '#19213d'}}>
                Current User Experience
              </h4>
              <div className="space-y-4">
                {getCurrentExperience().map((experience, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-5 h-5 bg-red-400 rounded-full mr-3 mt-1 flex-shrink-0"></div>
                    <div className="text-sm leading-relaxed" style={{color: '#6d758f'}}>
                      {experience}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-base font-semibold mb-4" style={{color: '#19213d'}}>
                Optimized User Experience
              </h4>
              <div className="space-y-4">
                {getOptimizedExperience().map((experience, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-5 h-5 bg-green-400 rounded-full mr-3 mt-1 flex-shrink-0"></div>
                    <div className="text-sm leading-relaxed" style={{color: '#6d758f'}}>
                      {experience}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Heuristic Violations Section */}
        <div className="my-10">
          <h2 className="flex items-center text-xl font-semibold mb-6" style={{color: '#19213d'}}>
            <span className="w-6 h-6 bg-yellow-300 rounded-md flex items-center justify-center mr-3">
              ⚠️
            </span>
            Heuristic Violations
          </h2>
          <div className="space-y-3">
            {getHeuristicViolations().length > 0 ? (
              getHeuristicViolations().map((violation, index) => (
                <div key={violation.id} className="flex items-start p-4 rounded-lg" style={{background: '#f1f3f7'}}>
                  <div className="w-5 h-5 bg-red-400 rounded-full mr-3 mt-1 flex-shrink-0 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium leading-relaxed text-black mb-1">
                      {violation.heuristic || violation.title}
                    </div>
                    <div className="text-sm leading-relaxed" style={{color: '#6d758f'}}>
                      {violation.description}
                    </div>
                    {violation.element && (
                      <div className="text-xs mt-1 px-2 py-1 bg-gray-200 rounded inline-block">
                        Element: {violation.element}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm" style={{color: '#6d758f'}}>
                <p>No specific heuristic violations detected. The interface generally follows usability principles.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Fixes Section */}
        <div className="my-10">
          <h2 className="flex items-center text-xl font-semibold mb-6" style={{color: '#19213d'}}>
            <span className="w-6 h-6 bg-yellow-300 rounded-md flex items-center justify-center mr-3">
              🔧
            </span>
            Recommended Fixes
          </h2>
          <div className="space-y-3">
            {getRecommendedFixes().map((fix, index) => (
              <div key={fix.id} className="flex items-start p-4 rounded-lg" style={{background: '#f1f3f7'}}>
                <div className="w-5 h-5 bg-green-400 rounded-full mr-3 mt-1 flex-shrink-0 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>
                <div>
                  <div className="text-sm font-medium leading-relaxed text-black mb-1">
                    {fix.title}
                  </div>
                  <div className="text-sm leading-relaxed" style={{color: '#6d758f'}}>
                    {fix.recommendation}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      fix.severity === 'major' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {fix.severity === 'major' ? 'High Priority' : 'Medium Priority'}
                    </span>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {fix.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Work Samples Section */}
        <div className="my-10">
          <h2 className="flex items-center text-xl font-semibold mb-6" style={{color: '#19213d'}}>
            <span className="w-6 h-6 bg-yellow-300 rounded-md flex items-center justify-center mr-3">
              📁
            </span>
            Relevant Case Studies
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {getRelevantCaseStudiesForAudit().map((caseStudy, index) => (
              <a
                key={caseStudy.id}
                href={caseStudy.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg h-36 p-6 transition-all duration-200 hover:shadow-md cursor-pointer group"
                style={{ background: '#f1f3f7' }}
              >
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-semibold mb-2 group-hover:text-yellow-600 transition-colors" style={{color: '#19213d'}}>
                      {caseStudy.title}
                    </h4>
                    <p className="text-sm leading-relaxed line-clamp-3" style={{color: '#6d758f'}}>
                      {caseStudy.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                      {caseStudy.industry.charAt(0).toUpperCase() + caseStudy.industry.slice(1)}
                    </span>
                    <span className="text-xs text-yellow-600 group-hover:text-yellow-700 font-medium">
                      View Case Study →
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        </div> {/* End PDF Content Wrapper */}
      </div>
    </div>
  );
};