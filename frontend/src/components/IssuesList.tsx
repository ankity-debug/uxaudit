import React from 'react';
import { AuditIssue } from '../types';

interface IssuesListProps {
  title: string;
  issues: AuditIssue[];
  severity?: 'major' | 'minor';
  subtitle?: string;
  showAsViolations?: boolean;
  showAsRecommendations?: boolean;
}

export const IssuesList: React.FC<IssuesListProps> = ({ 
  title, 
  issues, 
  severity, 
  subtitle,
  showAsViolations = false,
  showAsRecommendations = false
}) => {
  const getSeverityColor = (severity: 'major' | 'minor') => {
    return severity === 'major' 
      ? 'bg-red-100 text-red-800 border-red-200'
      : 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'heuristics': return '🎯';
      case 'ux-laws': return '⚡';
      case 'copywriting': return '✍️';
      case 'accessibility': return '♿';
      default: return '🔍';
    }
  };

  // Template-style design for violations and recommendations
  if (showAsViolations || showAsRecommendations) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center space-x-2 mb-6">
          <span className="text-yellow-500 text-xl">
            {showAsViolations ? '⚠️' : '🔧'}
          </span>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        {subtitle && (
          <p className="text-gray-600 mb-6">{subtitle}</p>
        )}
        <div className="space-y-4">
          {issues.slice(0, 5).map((issue, index) => (
            <div key={issue.id} className="border-l-4 border-yellow-400 pl-4 py-2">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-400 text-gray-800 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 mb-1">
                    {issue.heuristic || 'Aesthetic and minimalist design'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {showAsViolations ? issue.description : issue.recommendation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Original design for backward compatibility
  if (issues.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">✨</div>
          <p className="text-gray-600">No {severity} issues found!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className={`border rounded-lg p-4 ${severity ? getSeverityColor(severity) : 'border-gray-200'}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getCategoryIcon(issue.category)}</span>
                <h4 className="font-semibold text-gray-900">{issue.title}</h4>
              </div>
              {severity && (
                <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(severity)}`}>
                  {severity.toUpperCase()}
                </span>
              )}
            </div>
            
            <p className="text-gray-700 mb-3 text-sm">{issue.description}</p>
            
            {issue.heuristic && (
              <div className="mb-3">
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {issue.heuristic}
                </span>
              </div>
            )}
            
            <div className="bg-white bg-opacity-50 rounded p-3">
              <p className="text-sm font-medium text-gray-900 mb-1">💡 Recommendation:</p>
              <p className="text-sm text-gray-700">{issue.recommendation}</p>
            </div>

            {issue.element && (
              <div className="mt-2">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Element:</span> {issue.element}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};