import React from 'react';
import { CategoryScore } from '../types';

interface ScoreCardProps {
  title: string;
  score: CategoryScore;
  icon?: string;
  description?: string;
  compact?: boolean;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ title, score, icon, description, compact = false }) => {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    if (percentage >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (compact) {
    // Circular compact design for UX Maturity Scorecard
    const percentage = parseInt(title.replace('%', ''));
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16 mb-2">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="35"
              stroke="rgb(229, 231, 235)"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="35"
              stroke="rgb(250, 204, 21)"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 35}`}
              strokeDashoffset={`${2 * Math.PI * 35 * (1 - percentage / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-800">{title}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Score</span>
          <span className={`text-lg font-bold ${getScoreColor(score.percentage || 0)}`}>
            {score.score}/{score.maxScore}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(score.percentage || 0)}`}
            style={{ width: `${score.percentage || 0}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {(score.percentage || 0).toFixed(1)}%
        </p>
      </div>

      <div className="text-sm text-gray-600">
        {(score.issues || []).length > 0 ? (
          <span className="text-red-600">{(score.issues || []).length} issues found</span>
        ) : (
          <span className="text-green-600">No issues found</span>
        )}
      </div>
    </div>
  );
};