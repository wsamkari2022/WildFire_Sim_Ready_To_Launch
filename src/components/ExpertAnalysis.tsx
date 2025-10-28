import React from 'react';
import { Shield, Zap, Leaf, Scale, Ban, ThumbsUp, ThumbsDown } from 'lucide-react';
import { DecisionOption } from '../types';

interface ExpertAnalysisProps {
  decision: DecisionOption;
}

const ExpertAnalysis: React.FC<ExpertAnalysisProps> = ({ decision }) => {
  const getRecommendationIcon = (recommendation: "Accept" | "Reject") => {
    return recommendation === "Accept" ? 
      <ThumbsUp className="text-green-500" size={14} /> : 
      <ThumbsDown className="text-red-500" size={14} />;
  };

  return (
    <div className="space-y-2 overflow-y-auto max-h-64 pr-1">
      {/* Safety Expert */}
      <div className="bg-white p-2 rounded border border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <Shield className="text-red-500 mr-1" size={14} />
            <h5 className="text-xs font-semibold text-gray-700">Safety Expert</h5>
          </div>
          <div className="flex items-center">
            <span className={`text-xs font-medium ${decision.expertOpinions.safety.recommendation === "Accept" ? "text-green-600" : "text-red-600"} mr-1`}>
              {decision.expertOpinions.safety.recommendation}
            </span>
            {getRecommendationIcon(decision.expertOpinions.safety.recommendation)}
          </div>
        </div>
        <div className="mb-1">
          <p className="text-xs text-gray-600 mb-1"><span className="font-semibold">Summary:</span> {decision.expertOpinions.safety.summary}</p>
          <p className="text-xs text-gray-600"><span className="font-semibold">Comparison:</span> {decision.expertOpinions.safety.comparison}</p>
        </div>
      </div>
      
      {/* Efficiency Expert */}
      <div className="bg-white p-2 rounded border border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <Zap className="text-yellow-500 mr-1" size={14} />
            <h5 className="text-xs font-semibold text-gray-700">Efficiency Expert</h5>
          </div>
          <div className="flex items-center">
            <span className={`text-xs font-medium ${decision.expertOpinions.efficiency.recommendation === "Accept" ? "text-green-600" : "text-red-600"} mr-1`}>
              {decision.expertOpinions.efficiency.recommendation}
            </span>
            {getRecommendationIcon(decision.expertOpinions.efficiency.recommendation)}
          </div>
        </div>
        <div className="mb-1">
          <p className="text-xs text-gray-600 mb-1"><span className="font-semibold">Summary:</span> {decision.expertOpinions.efficiency.summary}</p>
          <p className="text-xs text-gray-600"><span className="font-semibold">Comparison:</span> {decision.expertOpinions.efficiency.comparison}</p>
        </div>
      </div>
      
      {/* Sustainability Expert */}
      <div className="bg-white p-2 rounded border border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <Leaf className="text-green-500 mr-1" size={14} />
            <h5 className="text-xs font-semibold text-gray-700">Sustainability Expert</h5>
          </div>
          <div className="flex items-center">
            <span className={`text-xs font-medium ${decision.expertOpinions.sustainability.recommendation === "Accept" ? "text-green-600" : "text-red-600"} mr-1`}>
              {decision.expertOpinions.sustainability.recommendation}
            </span>
            {getRecommendationIcon(decision.expertOpinions.sustainability.recommendation)}
          </div>
        </div>
        <div className="mb-1">
          <p className="text-xs text-gray-600 mb-1"><span className="font-semibold">Summary:</span> {decision.expertOpinions.sustainability.summary}</p>
          <p className="text-xs text-gray-600"><span className="font-semibold">Comparison:</span> {decision.expertOpinions.sustainability.comparison}</p>
        </div>
      </div>
      
      {/* Fairness Expert */}
      <div className="bg-white p-2 rounded border border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <Scale className="text-blue-500 mr-1" size={14} />
            <h5 className="text-xs font-semibold text-gray-700">Fairness Expert</h5>
          </div>
          <div className="flex items-center">
            <span className={`text-xs font-medium ${decision.expertOpinions.fairness.recommendation === "Accept" ? "text-green-600" : "text-red-600"} mr-1`}>
              {decision.expertOpinions.fairness.recommendation}
            </span>
            {getRecommendationIcon(decision.expertOpinions.fairness.recommendation)}
          </div>
        </div>
        <div className="mb-1">
          <p className="text-xs text-gray-600 mb-1"><span className="font-semibold">Summary:</span> {decision.expertOpinions.fairness.summary}</p>
          <p className="text-xs text-gray-600"><span className="font-semibold">Comparison:</span> {decision.expertOpinions.fairness.comparison}</p>
        </div>
      </div>
      
      {/* Nonmaleficence Expert */}
      <div className="bg-white p-2 rounded border border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <Ban className="text-purple-500 mr-1" size={14} />
            <h5 className="text-xs font-semibold text-gray-700">Nonmaleficence Expert</h5>
          </div>
          <div className="flex items-center">
            <span className={`text-xs font-medium ${decision.expertOpinions.nonmaleficence.recommendation === "Accept" ? "text-green-600" : "text-red-600"} mr-1`}>
              {decision.expertOpinions.nonmaleficence.recommendation}
            </span>
            {getRecommendationIcon(decision.expertOpinions.nonmaleficence.recommendation)}
          </div>
        </div>
        <div className="mb-1">
          <p className="text-xs text-gray-600 mb-1"><span className="font-semibold">Summary:</span> {decision.expertOpinions.nonmaleficence.summary}</p>
          <p className="text-xs text-gray-600"><span className="font-semibold">Comparison:</span> {decision.expertOpinions.nonmaleficence.comparison}</p>
        </div>
      </div>
    </div>
  );
};

export default ExpertAnalysis;