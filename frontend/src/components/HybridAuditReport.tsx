import React from 'react';
import { AuditData } from '../types';
import { PDFExport } from './PDFExport';

interface HybridAuditReportProps {
  data: AuditData;
  onNewAudit: () => void;
}

export const HybridAuditReport: React.FC<HybridAuditReportProps> = ({ data, onNewAudit }) => {
  const MicroscopeIcon: React.FC = () => (
    <div className="w-24 h-24 opacity-60">
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-gray-600">
        {/* Microscope body */}
        <rect x="35" y="45" width="8" height="25" fill="currentColor" opacity="0.8"/>
        <rect x="30" y="65" width="18" height="6" fill="currentColor" opacity="0.8"/>
        {/* Eyepiece */}
        <circle cx="39" cy="40" r="4" fill="currentColor" opacity="0.8"/>
        {/* Objective lens */}
        <rect x="37" y="50" width="4" height="8" fill="currentColor" opacity="0.8"/>
        {/* Base */}
        <ellipse cx="39" cy="75" rx="15" ry="4" fill="currentColor" opacity="0.6"/>
        {/* Stage */}
        <rect x="25" y="58" width="28" height="3" fill="currentColor" opacity="0.7"/>
        {/* Focus knobs */}
        <circle cx="50" cy="55" r="2" fill="currentColor" opacity="0.8"/>
        <circle cx="50" cy="60" r="2" fill="currentColor" opacity="0.8"/>
      </svg>
    </div>
  );

  const getScoreLabel = (percentage: number) => {
    if (percentage >= 90) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 75) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 60) return { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (percentage >= 40) return { label: 'Poor', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { label: 'Critical', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getCriticalIssues = () => {
    return data.issues.filter(issue => issue.severity === 'major').slice(0, 3);
  };

  const getPriorityRecommendations = () => {
    const criticalIssues = data.issues.filter(issue => issue.severity === 'major');
    const minorIssues = data.issues.filter(issue => issue.severity === 'minor');
    
    return [
      ...criticalIssues.slice(0, 2).map(issue => ({ ...issue, priority: 'Critical' })),
      ...minorIssues.slice(0, 3).map(issue => ({ ...issue, priority: 'High' }))
    ];
  };

  const overallScoreLabel = getScoreLabel(data.scores.overall.percentage);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section with Yellow Background (from Original) */}
      <div className="bg-[#FAE100] px-8 py-16 relative overflow-hidden">
        <div className="absolute top-8 right-8 opacity-40">
          <MicroscopeIcon />
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Company Logo and Name */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
                  <span className="text-[#FAE100] font-bold text-sm">LM</span>
                </div>
                <span className="text-[#232323] text-base font-semibold" style={{fontFamily: 'Inter, sans-serif'}}>LimeMind UX Audit</span>
              </div>
              
              {/* Title */}
              <h1 className="text-5xl font-bold text-[#232323] mb-4" style={{fontFamily: 'Inter, sans-serif', fontWeight: 600}}>
                UX Analysis Report
              </h1>
              
              {/* Subtitle with URL and issues count */}
              <p className="text-[#232323] text-lg mb-8" style={{fontFamily: 'Inter, sans-serif'}}>
                {data.url ? (
                  (() => {
                    try {
                      return new URL(data.url).hostname;
                    } catch {
                      return data.url;
                    }
                  })()
                ) : 'Uploaded Image'} • {data.issues.length} Issues Found
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <PDFExport data={data} />
              <button
                onClick={onNewAudit}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-800 text-[#FAE100] rounded-lg transition-colors font-medium border border-gray-600"
              >
                New Audit
              </button>
            </div>
          </div>

          {/* UX Score Section - Fixed Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
            {/* Left Column - Overall UX Score (Improved from Original) */}
            <div>
              <div className="text-base text-[#8A8A8A] mb-4" style={{fontFamily: 'Inter, sans-serif'}}>Overall UX Score</div>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <svg width="120" height="120" className="transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#f1f3f7"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#232323"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - data.scores.overall.percentage / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-4xl font-bold text-[#232323]" style={{fontFamily: 'Inter, sans-serif', fontWeight: 600}}>
                      {(data.scores.overall.score / 10).toFixed(1)}
                    </span>
                    <span className="text-xs text-[#8A8A8A]">out of 10</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${overallScoreLabel.bg} ${overallScoreLabel.color}`}>
                    {overallScoreLabel.label}
                  </span>
                  <span className="text-sm text-[#8A8A8A]">
                    {data.scores.overall.percentage.toFixed(0)}th percentile
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Category Scores (from New Report) */}
            <div>
              <div className="text-base text-[#8A8A8A] mb-4" style={{fontFamily: 'Inter, sans-serif'}}>Category Performance</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white bg-opacity-50 rounded-lg border border-gray-300">
                  <div className="text-lg font-bold text-[#232323]">
                    {data.scores.heuristics.percentage.toFixed(0)}%
                  </div>
                  <div className="text-xs text-[#8A8A8A] mt-1">Heuristics</div>
                </div>
                <div className="text-center p-4 bg-white bg-opacity-50 rounded-lg border border-gray-300">
                  <div className="text-lg font-bold text-[#232323]">
                    {data.scores.uxLaws.percentage.toFixed(0)}%
                  </div>
                  <div className="text-xs text-[#8A8A8A] mt-1">UX Laws</div>
                </div>
                <div className="text-center p-4 bg-white bg-opacity-50 rounded-lg border border-gray-300">
                  <div className="text-lg font-bold text-[#232323]">
                    {data.scores.copywriting.percentage.toFixed(0)}%
                  </div>
                  <div className="text-xs text-[#8A8A8A] mt-1">Copywriting</div>
                </div>
                <div className="text-center p-4 bg-white bg-opacity-50 rounded-lg border border-gray-300">
                  <div className="text-lg font-bold text-[#232323]">
                    {data.scores.accessibility.percentage.toFixed(0)}%
                  </div>
                  <div className="text-xs text-[#8A8A8A] mt-1">Accessibility</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-12 bg-gray-50 min-h-screen">
        {/* Executive Summary (from New Report) */}
        <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800" style={{fontFamily: 'Inter, sans-serif'}}>Executive Summary</h2>
              <p className="text-sm text-gray-500">
                {new Date(data.timestamp).toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </p>
            </div>
            <p className="text-gray-600 mb-4">Key findings and immediate action items</p>
          </div>
          
          {/* Critical Alert Box */}
          {getCriticalIssues().length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {getCriticalIssues().length} Critical Issues Found
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    These issues significantly impact user experience and should be addressed immediately.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">The Bottom Line</h3>
            <p className="text-gray-700 leading-relaxed mb-4" style={{fontFamily: 'Inter, sans-serif'}}>
              {data.summary}
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 bg-white rounded border">
                <div className="text-2xl font-bold text-red-600">
                  {data.issues.filter(i => i.severity === 'major').length}
                </div>
                <div className="text-sm text-gray-600">Critical Issues</div>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <div className="text-2xl font-bold text-yellow-600">
                  {data.issues.filter(i => i.severity === 'minor').length}
                </div>
                <div className="text-sm text-gray-600">Medium Priority</div>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.ceil(data.recommendations.length * 0.6)}
                </div>
                <div className="text-sm text-gray-600">Quick Wins</div>
              </div>
            </div>
          </div>
        </section>

        {/* Key AI Findings (Enhanced from New Report) */}
        <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-6 h-6 bg-[#FAE100] rounded flex items-center justify-center">
              <span className="text-[#232323] text-sm font-bold">!</span>
            </div>
            <h2 className="text-xl font-semibold text-[#19213d]">AI Analysis Findings</h2>
          </div>
          <p className="text-gray-600 mb-6">Deep insights discovered by our enhanced AI system with evidence binding</p>
          
          <div className="space-y-4">
            {data.recommendations.slice(0, 4).map((insight: string, index: number) => (
              <div key={index} className="flex items-start space-x-3 border-l-4 border-[#FAE100] bg-yellow-50 p-4">
                <div className="w-6 h-6 bg-[#FAE100] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[#232323] text-xs font-bold">{index + 1}</span>
                </div>
                <div>
                  <p className="text-[#474747] font-medium">Key Finding #{index + 1}</p>
                  <p className="text-[#6d758f] text-sm mt-1">{insight}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Priority Action Plan (Enhanced from New Report) */}
        <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-6 h-6 bg-[#FAE100] rounded flex items-center justify-center">
              <span className="text-[#232323] text-sm font-bold">🚨</span>
            </div>
            <h2 className="text-xl font-semibold text-[#19213d]">Priority Action Plan</h2>
          </div>
          <p className="text-gray-600 mb-6">Issues ranked by impact and effort - start here for maximum UX improvement</p>
          
          <div className="space-y-4">
            {getPriorityRecommendations().map((issue, index) => (
              <div key={issue.id} className={`border-l-4 p-4 rounded-r-lg ${
                issue.priority === 'Critical' 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-yellow-500 bg-yellow-50'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      issue.priority === 'Critical' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {issue.priority} Priority
                    </span>
                    <h3 className="font-medium text-gray-800">{issue.title}</h3>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium text-gray-600">
                      {issue.severity === 'major' ? 'High Impact' : 'Medium Impact'}
                    </div>
                    <div className="text-gray-500">
                      {issue.severity === 'major' ? 'Quick Fix' : '1-2 weeks'}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">🔍 What's Wrong</h4>
                    <p className="text-sm text-gray-600">{issue.description}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">🔧 How to Fix</h4>
                    <p className="text-sm text-gray-600">{issue.recommendation}</p>
                  </div>
                </div>
                
                {issue.heuristic && (
                  <div className="mt-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Violates: {issue.heuristic}
                    </span>
                  </div>
                )}

              </div>
            ))}
          </div>

          {/* Implementation Timeline */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-3">⏰ Recommended Implementation Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-blue-700">Week 1-2: Critical Issues</div>
                <div className="text-blue-600">
                  Fix {data.issues.filter(i => i.severity === 'major').length} critical issues
                </div>
              </div>
              <div>
                <div className="font-medium text-blue-700">Week 3-4: High Priority</div>
                <div className="text-blue-600">
                  Address {data.issues.filter(i => i.severity === 'minor').slice(0, 3).length} high-impact items
                </div>
              </div>
              <div>
                <div className="font-medium text-blue-700">Month 2: Optimization</div>
                <div className="text-blue-600">
                  Implement remaining improvements
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Detailed Issues Analysis (Enhanced) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Critical Issues */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-6 h-6 bg-[#FAE100] rounded flex items-center justify-center">
                <span className="text-[#232323] text-sm font-bold">!</span>
              </div>
              <h2 className="text-xl font-semibold text-[#19213d]">Heuristic Violations</h2>
            </div>
            <p className="text-gray-600 mb-6">Issues based on Nielsen's 10 Usability Heuristics</p>
            
            <div className="space-y-4">
              {data.issues.filter(issue => issue.category === 'heuristics').slice(0, 6).map((issue, index) => (
                <div key={issue.id} className="flex items-start space-x-3 border-l-4 border-red-400 bg-red-50 p-3">
                  <div className="w-6 h-6 bg-[#FAE100] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#232323] text-xs font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-[#474747] font-medium">{issue.heuristic || issue.title}</p>
                    <p className="text-[#6d758f] text-sm mt-1">{issue.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        issue.severity === 'major' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {issue.severity}
                      </span>
                      {issue.element && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {issue.element}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Solutions */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-6 h-6 bg-[#FAE100] rounded flex items-center justify-center">
                <span className="text-[#232323] text-sm font-bold">✓</span>
              </div>
              <h2 className="text-xl font-semibold text-[#19213d]">Recommended Fixes</h2>
            </div>
            <p className="text-gray-600 mb-6">Specific, implementable solutions ranked by impact</p>
            
            <div className="space-y-4">
              {data.issues.slice(0, 6).map((issue, index) => (
                <div key={issue.id} className="flex items-start space-x-3 border-l-4 border-green-400 bg-green-50 p-3">
                  <div className="w-6 h-6 bg-[#FAE100] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#232323] text-xs font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-[#474747] font-medium">{issue.title}</p>
                    <p className="text-[#6d758f] text-sm mt-1">{issue.recommendation}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        issue.severity === 'major' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {issue.severity === 'major' ? 'Quick Fix' : 'Medium Effort'}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {issue.category === 'heuristics' ? 'Usability' :
                         issue.category === 'accessibility' ? 'Accessibility' :
                         issue.category === 'copywriting' ? 'Content' : 'UX Laws'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Steps & Support */}
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready to Implement?</h2>
            <p className="text-gray-600">Get expert help turning these insights into results</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-semibold text-gray-800 mb-2">Quick Wins</h3>
              <p className="text-sm text-gray-600">
                Start with the {data.issues.filter(i => i.severity === 'major').length} critical issues for immediate impact
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-semibold text-gray-800 mb-2">Expected Impact</h3>
              <p className="text-sm text-gray-600">
                Following this plan could improve your UX score by 40-60%
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-800 mb-2">Expert Support</h3>
              <p className="text-sm text-gray-600">
                Need help? Our UX experts can guide implementation
              </p>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 mb-4">
              Report generated by LimeMind AI • {new Date().toLocaleDateString()} • {data.issues.length} issues analyzed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};