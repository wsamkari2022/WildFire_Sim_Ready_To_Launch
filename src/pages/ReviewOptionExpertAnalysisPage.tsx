import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Shield, Droplets, Leaf, Scale, Ban } from 'lucide-react';
import { DecisionOption } from '../types';

const ReviewOptionExpertAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const option = location.state?.option as DecisionOption;

  if (!option) {
    navigate('/simulation');
    return null;
  }

  const valueMap = {
    safety: { name: 'Safety', icon: Shield, color: 'text-blue-600' },
    efficiency: { name: 'Efficiency', icon: Droplets, color: 'text-cyan-600' },
    sustainability: { name: 'Sustainability', icon: Leaf, color: 'text-green-600' },
    fairness: { name: 'Fairness', icon: Scale, color: 'text-purple-600' },
    nonmaleficence: { name: 'Nonmaleficence', icon: Ban, color: 'text-red-600' }
  };

  const getRecommendationBadgeColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Accept':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Reject':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Neutral':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              {option.title}
            </h1>
            <p className="text-gray-700 text-base leading-relaxed">
              {option.description}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Expert Analysis</h2>
            <div className="space-y-4">
              {Object.entries(option.expertOpinions).map(([key, opinion]) => {
                const valueInfo = valueMap[key as keyof typeof valueMap];
                const Icon = valueInfo.icon;

                return (
                  <div
                    key={key}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon size={20} className={valueInfo.color} />
                        <h3 className="text-lg font-semibold text-gray-800">
                          {valueInfo.name} Expert
                        </h3>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getRecommendationBadgeColor(
                          opinion.recommendation
                        )}`}
                      >
                        {opinion.recommendation}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">
                          Analysis:
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {opinion.summary}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">
                          Comparison:
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {opinion.comparison}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">
                          Confidence:
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {opinion.confidence}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Impact Summary</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">Lives Saved:</span>
                  <span className="text-green-600 font-semibold">
                    +{option.impact.livesSaved}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">Casualties:</span>
                  <span className="text-red-600 font-semibold">
                    +{option.impact.humanCasualties}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">Resources:</span>
                  <span className="text-blue-600 font-semibold">
                    {option.impact.firefightingResource}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">Infrastructure:</span>
                  <span className="text-gray-600 font-semibold">
                    {option.impact.infrastructureCondition}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">Biodiversity:</span>
                  <span className="text-green-600 font-semibold">
                    {option.impact.biodiversityCondition}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">Properties:</span>
                  <span className="text-blue-600 font-semibold">
                    {option.impact.propertiesCondition}%
                  </span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span className="text-gray-700 font-medium">Nuclear:</span>
                  <span className="text-purple-600 font-semibold">
                    {option.impact.nuclearPowerStation}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Key Considerations</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              {option.riskInfo.map((risk, index) => (
                <div key={index} className="flex items-start mb-2 last:mb-0">
                  <span className="text-red-500 mr-2 mt-0.5 font-bold">•</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{risk}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/simulation')}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 px-6 py-3 rounded-lg font-semibold text-base transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <ArrowLeft size={20} />
            Back to Simulation
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewOptionExpertAnalysisPage;
