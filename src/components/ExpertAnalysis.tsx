import React from 'react';
import { Shield, Zap, Leaf, Scale, Ban, ThumbsUp, ThumbsDown, MessageCircle, Minus } from 'lucide-react';
import { DecisionOption } from '../types';

interface ExpertAnalysisProps {
  decision: DecisionOption;
}

const ExpertAnalysis: React.FC<ExpertAnalysisProps> = ({ decision }) => {
  const getRecommendationIcon = (recommendation: "Accept" | "Reject" | "Neutral") => {
    switch (recommendation) {
      case "Accept":
        return <ThumbsUp className="text-green-500\" size={14} />;
      case "Reject":
        return <ThumbsDown className="text-red-500" size={14} />;
      case "Neutral":
        return <Minus className="text-gray-500" size={14} />;
      default:
        return null;
    }
  };

  const getRecommendationStyle = (recommendation: "Accept" | "Reject" | "Neutral") => {
    switch (recommendation) {
      case "Accept":
        return "bg-green-100 text-green-800";
      case "Reject":
        return "bg-red-100 text-red-800";
      case "Neutral":
        return "bg-gray-100 text-gray-800";
      default:
        return "";
    }
  };

  const getExpertIcon = (expertType: string) => {
    switch (expertType) {
      case 'safety':
        return <Shield className="text-red-500\" size={14} />;
      case 'efficiency':
        return <Zap className="text-yellow-500" size={14} />;
      case 'sustainability':
        return <Leaf className="text-green-500" size={14} />;
      case 'fairness':
        return <Scale className="text-blue-500" size={14} />;
      case 'nonmaleficence':
        return <Ban className="text-purple-500" size={14} />;
      default:
        return <MessageCircle className="text-gray-500" size={14} />;
    }
  };

  const getExpertTitle = (expertType: string) => {
    return expertType.charAt(0).toUpperCase() + expertType.slice(1) + ' Expert';
  };

  return (
    <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-400px)] pr-1">
      {Object.entries(decision.expertOpinions).map(([expertType, opinion]) => (
        <div key={expertType} className="bg-white p-3 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getExpertIcon(expertType)}
              <h5 className="text-sm font-semibold text-gray-700">{getExpertTitle(expertType)}</h5>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getRecommendationStyle(opinion.recommendation)}`}>
                {opinion.recommendation}
              </span>
              {getRecommendationIcon(opinion.recommendation)}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-xs text-gray-700">
                <span className="font-semibold">Analysis:</span> {opinion.summary}
              </p>
            </div>
            
            <div className="bg-blue-50 p-2 rounded">
              <p className="text-xs text-blue-900">
                <span className="font-semibold">Comparison:</span> {opinion.comparison}
              </p>
            </div>

            <div className="bg-purple-50 p-2 rounded">
              <p className="text-xs text-purple-900">
                <span className="font-semibold">Confidence:</span> {opinion.confidence}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpertAnalysis;