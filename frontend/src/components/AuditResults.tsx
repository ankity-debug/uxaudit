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
              <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 548 211" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M173.379 107.218H198.576V103.581H177.368V64.8906H173.379V107.218Z" fill="black"/>
                  <path d="M209.464 107.218H213.453V88.9146L228.648 64.8906H224.043L211.547 84.9839H211.371L198.875 64.8906H194.27L209.464 88.9146V107.218Z" fill="black"/>
                  <path d="M247.477 107.893C256.277 107.893 262.73 102.554 264.314 94.5757L264.373 94.2824H260.354L260.266 94.5464C258.506 100.56 254.047 104.168 247.477 104.168C238.384 104.168 232.458 97.0104 232.458 86.0397V86.0104C232.458 75.0105 238.325 67.9411 247.477 67.9411C254.077 67.9411 258.565 71.5785 260.178 77.2984L260.354 77.8264H264.373L264.314 77.5331C262.73 69.6131 256.247 64.2158 247.477 64.2158C235.802 64.2158 228.352 72.7225 228.352 86.0104V86.0397C228.352 99.2984 235.861 107.893 247.477 107.893Z" fill="black"/>
                  <path d="M270.27 107.218H274.259V87.3599H299.016V107.218H303.035V64.8906H299.016V83.7226H274.259V64.8906H270.27V107.218Z" fill="black"/>
                  <path d="M310.957 107.218H336.506V103.581H314.946V87.3306H335.421V83.7519H314.946V68.5279H336.506V64.8906H310.957V107.218Z" fill="black"/>
                  <path d="M343.338 107.218H368.887V103.581H347.327V87.3306H367.802V83.7519H347.327V68.5279H368.887V64.8906H343.338V107.218Z" fill="black"/>
                  <path d="M374.959 107.218H403.236V98.5652H385.724V64.8906H374.959V107.218Z" fill="black"/>
                  <path d="M408.164 107.218H437.175V98.5652H418.929V89.9999H436.089V81.9039H418.929V73.5439H437.175V64.8906H408.164V107.218Z" fill="black"/>
                  <path d="M443.246 107.218H453.982V82.5199H454.187L471.201 107.218H480.235V64.8906H469.499V89.3252H469.294L452.369 64.8906H443.246V107.218Z" fill="black"/>
                  <path d="M502.938 107.981C514.143 107.981 520.773 102.613 520.773 94.1652V94.1358C520.773 87.3599 516.607 83.7225 507.631 81.9919L503.29 81.1705C498.743 80.3199 496.749 79.1172 496.749 76.8292V76.7999C496.749 74.3652 498.978 72.5759 502.938 72.5759C506.81 72.5759 509.538 74.3066 509.861 77.0932L509.89 77.4159H519.893L519.863 76.7999C519.482 69.1146 513.469 64.1279 502.85 64.1279C493.141 64.1279 486.071 69.3786 486.071 77.5332V77.5626C486.071 84.0452 490.501 88.1812 498.89 89.7358L503.231 90.5572C508.189 91.5252 510.066 92.6398 510.066 95.0452V95.0745C510.066 97.7145 507.426 99.5332 503.143 99.5332C499.007 99.5332 495.839 97.7438 495.311 95.0158L495.253 94.6932H485.25L485.279 95.2212C485.749 103.317 492.407 107.981 502.938 107.981Z" fill="black"/>
                  <g mask="url(#mask0_3233_4999)">
                    <path fillRule="evenodd" clipRule="evenodd" d="M74.5649 145.488C104.361 145.488 128.663 121.186 128.663 91.3905C128.663 61.5941 104.361 37.292 74.5649 37.292C44.7687 37.292 20.4668 61.5941 20.4668 91.3905C20.4668 121.186 44.7687 145.488 74.5649 145.488Z" fill="#EF4171"/>
                  </g>
                  <g mask="url(#mask1_3233_4999)">
                    <path fillRule="evenodd" clipRule="evenodd" d="M52.7253 113.232C40.665 101.172 40.6646 81.6087 52.7253 69.5477C64.7863 57.4868 84.3491 57.4864 96.4101 69.5483C108.471 81.6087 108.471 101.172 96.4101 113.232C84.3491 125.293 64.7863 125.293 52.7253 113.232ZM31.2988 91.3896C31.2988 115.259 50.675 134.616 74.5686 134.615C84.1659 134.615 93.0328 131.49 100.209 126.205L123.228 149.225L120.934 151.518L139.937 170.521C140.088 170.696 140.246 170.866 140.412 171.031C144.211 174.831 150.374 174.831 154.173 171.031C157.972 167.232 157.972 161.069 154.173 157.269C154.007 157.104 153.836 156.945 153.661 156.793L134.66 137.792L132.402 140.05L109.392 117.04C114.698 109.865 117.836 100.993 117.836 91.3892C117.835 67.5213 98.4602 48.1631 74.5678 48.1631C50.6754 48.1631 31.2988 67.5207 31.2988 91.3896Z" fill="#FEFEFE"/>
                  </g>
                  <g mask="url(#mask2_3233_4999)">
                    <path fillRule="evenodd" clipRule="evenodd" d="M117.127 124.781C114.447 128.192 111.365 131.274 107.953 133.955L123.224 149.226L120.93 151.519L139.932 170.522C140.084 170.697 140.242 170.867 140.407 171.032C144.206 174.832 150.369 174.832 154.168 171.032C157.967 167.233 157.967 161.07 154.168 157.27C154.003 157.105 153.831 156.946 153.657 156.795L134.656 137.793L132.398 140.051L117.127 124.781Z" fill="#EF4171"/>
                  </g>
                  <path fillRule="evenodd" clipRule="evenodd" d="M41.8038 80.4691C47.8344 86.4999 57.6157 86.4999 63.6461 80.4695C69.6765 74.4391 69.6765 64.6574 63.6461 58.6274C62.4211 57.402 61.0409 56.4263 59.5692 55.6987L59.3753 59.0187L45.0689 75.7464L39.1992 77.0104C39.8843 78.2507 40.7519 79.4172 41.8038 80.4691Z" fill="#FEFEFE"/>
                </svg>
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
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - (data.scores.overall.percentage || 0) / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-900">
                    {((data.scores.overall.score || 0) / (data.scores.overall.maxScore || 5) * 5).toFixed(1)}/5
                  </span>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-600">
              {(data.scores.overall.percentage || 0).toFixed(0)}th percentile
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
                  <p className="font-semibold text-gray-900">{(data.scores.heuristics.percentage || 0).toFixed(0)}%</p>
                  <p className={`text-xs ${getScoreLabel(data.scores.heuristics.percentage || 0).color}`}>
                    {getScoreLabel(data.scores.heuristics.percentage || 0).label}
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
                  <p className="font-semibold text-gray-900">{(data.scores.uxLaws.percentage || 0).toFixed(0)}%</p>
                  <p className={`text-xs ${getScoreLabel(data.scores.uxLaws.percentage || 0).color}`}>
                    {getScoreLabel(data.scores.uxLaws.percentage || 0).label}
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
                  <p className="font-semibold text-gray-900">{(data.scores.copywriting.percentage || 0).toFixed(0)}%</p>
                  <p className={`text-xs ${getScoreLabel(data.scores.copywriting.percentage || 0).color}`}>
                    {getScoreLabel(data.scores.copywriting.percentage || 0).label}
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
                  <p className="font-semibold text-gray-900">{(data.scores.accessibility.percentage || 0).toFixed(0)}%</p>
                  <p className={`text-xs ${getScoreLabel(data.scores.accessibility.percentage || 0).color}`}>
                    {getScoreLabel(data.scores.accessibility.percentage || 0).label}
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
                  {(data.recommendations || []).slice(0, 3).map((rec, index) => (
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

              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-pink-600">⚡</span>
                  <h3 className="font-semibold text-pink-900">Quick Wins</h3>
                </div>
                <p className="text-2xl font-bold text-pink-600">
                  {Math.ceil(data.issues.filter(i => i.severity === 'minor').length * 0.6)}
                </p>
                <p className="text-sm text-pink-700">Easy to implement</p>
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
                  : 'border-pink-500 bg-pink-50'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      issue.priority === 'Critical' ? 'bg-red-500' : 'bg-pink-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{issue.title}</h3>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        issue.priority === 'Critical'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-pink-100 text-pink-800'
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
                            : 'bg-pink-100 text-pink-700'
                        }`}>
                          {issue.severity === 'major' ? 'High Priority' : 'Medium Priority'}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {issue.category === 'heuristics' ? 'Usability' :
                           issue.category === 'accessibility' ? 'Accessibility' :
                           issue.category === 'copywriting' ? 'Content' :
                           issue.category === 'ux-laws' ? 'UX Laws' :
                           issue.category === 'navigation' ? 'Navigation' :
                           issue.category === 'content' ? 'Content' :
                           issue.category === 'forms' ? 'Forms' :
                           issue.category === 'performance' ? 'Performance' :
                           issue.category === 'visual-hierarchy' ? 'Visual Hierarchy' : 'Other'}
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
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <span className="text-pink-600 text-lg">⚡</span>
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
              Report generated by lycheeLens AI • {new Date().toLocaleDateString()} • {data.issues.length} issues analyzed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};