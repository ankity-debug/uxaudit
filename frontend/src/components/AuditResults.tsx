import React from 'react';
import { AuditData } from '../types';
import { PDFExport } from './PDFExport';

interface AuditResultsProps {
  data: AuditData;
  onNewAudit: () => void;
}

export const AuditResults: React.FC<AuditResultsProps> = ({ data, onNewAudit }) => {
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
    const highIssues = data.issues.filter(issue => issue.severity === 'minor');
    
    return [
      ...criticalIssues.slice(0, 2).map(issue => ({ ...issue, priority: 'Critical' })),
      ...highIssues.slice(0, 3).map(issue => ({ ...issue, priority: 'High' }))
    ];
  };

  const overallScoreLabel = getScoreLabel(data.scores.overall.percentage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">LM</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">UX Audit Report</h1>
                <p className="text-sm text-gray-500">
                  {data.url ? (
                    (() => {
                      try {
                        return new URL(data.url).hostname;
                      } catch {
                        return data.url;
                      }
                    })()
                  ) : 'Uploaded Image'} • {new Date(data.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <PDFExport data={data} />
              <button
                onClick={onNewAudit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                New Audit
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Overall Score */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Overall Score</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${overallScoreLabel.bg} ${overallScoreLabel.color}`}>
                {overallScoreLabel.label}
              </span>
            </div>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - data.scores.overall.percentage / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {(data.scores.overall.score / 10).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-600">
              {data.scores.overall.percentage.toFixed(0)}th percentile
            </p>
          </div>

          {/* Category Scores */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Scores</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-sm">🎯</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Usability</p>
                    <p className="text-xs text-gray-500">Heuristics</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{data.scores.heuristics.percentage.toFixed(0)}%</p>
                  <p className={`text-xs ${getScoreLabel(data.scores.heuristics.percentage).color}`}>
                    {getScoreLabel(data.scores.heuristics.percentage).label}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-sm">⚡</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">UX Laws</p>
                    <p className="text-xs text-gray-500">Patterns</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{data.scores.uxLaws.percentage.toFixed(0)}%</p>
                  <p className={`text-xs ${getScoreLabel(data.scores.uxLaws.percentage).color}`}>
                    {getScoreLabel(data.scores.uxLaws.percentage).label}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-sm">✍️</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Content</p>
                    <p className="text-xs text-gray-500">Copywriting</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{data.scores.copywriting.percentage.toFixed(0)}%</p>
                  <p className={`text-xs ${getScoreLabel(data.scores.copywriting.percentage).color}`}>
                    {getScoreLabel(data.scores.copywriting.percentage).label}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 text-sm">♿</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Accessibility</p>
                    <p className="text-xs text-gray-500">WCAG</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{data.scores.accessibility.percentage.toFixed(0)}%</p>
                  <p className={`text-xs ${getScoreLabel(data.scores.accessibility.percentage).color}`}>
                    {getScoreLabel(data.scores.accessibility.percentage).label}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Executive Summary</h2>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="text-sm text-gray-500">
                {data.issues.filter(i => i.severity === 'major').length} Critical Issues
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <p className="text-gray-700 leading-relaxed mb-4">{data.summary}</p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Key Insights</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  {data.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-red-600">⚠️</span>
                  <h3 className="font-semibold text-red-900">Critical Issues</h3>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {data.issues.filter(i => i.severity === 'major').length}
                </p>
                <p className="text-sm text-red-700">Need immediate attention</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-yellow-600">⚡</span>
                  <h3 className="font-semibold text-yellow-900">Quick Wins</h3>
                </div>
                <p className="text-2xl font-bold text-yellow-600">
                  {Math.ceil(data.issues.filter(i => i.severity === 'minor').length * 0.6)}
                </p>
                <p className="text-sm text-yellow-700">Easy to implement</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-green-600">📈</span>
                  <h3 className="font-semibold text-green-900">Potential Impact</h3>
                </div>
                <p className="text-2xl font-bold text-green-600">40-60%</p>
                <p className="text-sm text-green-700">Score improvement</p>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Issues */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Priority Issues</h2>
          <div className="space-y-4">
            {getPriorityRecommendations().map((issue, index) => (
              <div key={issue.id} className={`border-l-4 p-6 rounded-r-lg ${
                issue.priority === 'Critical' 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-yellow-500 bg-yellow-50'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      issue.priority === 'Critical' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{issue.title}</h3>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        issue.priority === 'Critical' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {issue.priority} Priority
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">
                      {issue.priority === 'Critical' ? 'High Impact' : 'Medium Impact'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {issue.priority === 'Critical' ? 'Quick Fix' : '1-2 weeks'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Problem</h4>
                    <p className="text-sm text-gray-700">{issue.description}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Solution</h4>
                    <p className="text-sm text-gray-700">{issue.recommendation}</p>
                  </div>
                </div>
                
                {issue.heuristic && (
                  <div className="mt-4">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Violates: {issue.heuristic}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Critical Issues</h2>
            <div className="space-y-4">
              {data.issues.filter(issue => issue.severity === 'major').slice(0, 5).map((issue, index) => (
                <div key={issue.id} className="border-l-4 border-red-400 pl-4 py-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">{issue.title}</p>
                      <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          Critical
                        </span>
                        {issue.element && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {issue.element}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recommendations</h2>
            <div className="space-y-4">
              {data.issues.slice(0, 5).map((issue, index) => (
                <div key={issue.id} className="border-l-4 border-green-400 pl-4 py-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">{issue.title}</p>
                      <p className="text-sm text-gray-600 mb-2">{issue.recommendation}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          issue.severity === 'major' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {issue.severity === 'major' ? 'High Priority' : 'Medium Priority'}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {issue.category === 'heuristics' ? 'Usability' :
                           issue.category === 'accessibility' ? 'Accessibility' :
                           issue.category === 'copywriting' ? 'Content' : 'UX Laws'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Plan */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Implementation Timeline</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 text-lg">🚨</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Week 1-2</h3>
                  <p className="text-sm text-gray-600">Critical Issues</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Address {data.issues.filter(i => i.severity === 'major').length} critical issues that significantly impact user experience.
              </p>
              <div className="text-xs text-gray-500">
                Expected impact: 20-30% score improvement
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-lg">⚡</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Week 3-4</h3>
                  <p className="text-sm text-gray-600">High Priority</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Implement {data.issues.filter(i => i.severity === 'minor').slice(0, 3).length} high-impact improvements.
              </p>
              <div className="text-xs text-gray-500">
                Expected impact: 10-15% additional improvement
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">📈</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Month 2</h3>
                  <p className="text-sm text-gray-600">Optimization</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Fine-tune remaining improvements and monitor performance metrics.
              </p>
              <div className="text-xs text-gray-500">
                Expected impact: 5-10% final improvement
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-6">
              Follow this action plan to significantly improve your user experience and conversion rates.
            </p>
            <div className="flex justify-center space-x-4">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Download Full Report
              </button>
              <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Schedule Consultation
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Report generated by LimeMind AI • {new Date().toLocaleDateString()} • {data.issues.length} issues analyzed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};