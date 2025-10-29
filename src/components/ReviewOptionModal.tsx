import React from 'react';
import { X, Shield, Droplets, Leaf, Scale, Ban, Users, Skull, Building, Trees as Tree, Factory, Lightbulb, GitCompare, Target } from 'lucide-react';
import { DecisionOption } from '../types';

interface ReviewOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  option: DecisionOption;
}

const ReviewOptionModal: React.FC<ReviewOptionModalProps> = ({ isOpen, onClose, option }) => {
  if (!isOpen) return null;

  const valueMap = {
    safety: {
      name: 'Safety',
      icon: Shield,
      iconColor: 'text-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-300',
      accentColor: 'bg-blue-500'
    },
    efficiency: {
      name: 'Efficiency',
      icon: Droplets,
      iconColor: 'text-cyan-600',
      bgGradient: 'from-cyan-50 to-cyan-100',
      borderColor: 'border-cyan-300',
      accentColor: 'bg-cyan-500'
    },
    sustainability: {
      name: 'Sustainability',
      icon: Leaf,
      iconColor: 'text-green-600',
      bgGradient: 'from-green-50 to-green-100',
      borderColor: 'border-green-300',
      accentColor: 'bg-green-500'
    },
    fairness: {
      name: 'Fairness',
      icon: Scale,
      iconColor: 'text-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-300',
      accentColor: 'bg-purple-500'
    },
    nonmaleficence: {
      name: 'Nonmaleficence',
      icon: Ban,
      iconColor: 'text-red-600',
      bgGradient: 'from-red-50 to-red-100',
      borderColor: 'border-red-300',
      accentColor: 'bg-red-500'
    }
  };

  const getRecommendationBadgeColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Accept':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md';
      case 'Reject':
        return 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md';
      case 'Neutral':
        return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl max-w-5xl w-full my-8 border border-gray-200">
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-t-2xl p-6 flex items-center justify-between z-10 shadow-lg">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              {option.title}
            </h1>
            <p className="text-teal-50 text-sm leading-relaxed">
              {option.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-teal-100 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-20 ml-4"
          >
            <X size={28} />
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-10rem)] overflow-y-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-teal-500 to-cyan-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-800">Expert Analysis</h2>
            </div>
            <div className="grid grid-cols-1 gap-5">
              {Object.entries(option.expertOpinions).map(([key, opinion]) => {
                const valueInfo = valueMap[key as keyof typeof valueMap];
                const Icon = valueInfo.icon;

                return (
                  <div
                    key={key}
                    className={`bg-gradient-to-br ${valueInfo.bgGradient} border-2 ${valueInfo.borderColor} rounded-xl p-5 shadow-md hover:shadow-xl transition-shadow duration-300`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`${valueInfo.accentColor} p-3 rounded-lg shadow-md`}>
                          <Icon size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {valueInfo.name} Expert
                          </h3>
                          <p className="text-xs text-gray-600 font-medium">Professional Assessment</p>
                        </div>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-lg text-sm font-bold ${getRecommendationBadgeColor(
                          opinion.recommendation
                        )}`}
                      >
                        {opinion.recommendation}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-white bg-opacity-70 rounded-lg p-4 border-l-4 border-blue-500 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb size={16} className="text-blue-600" />
                          <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wide">
                            Analysis
                          </h4>
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {opinion.summary}
                        </p>
                      </div>

                      <div className="bg-white bg-opacity-70 rounded-lg p-4 border-l-4 border-purple-500 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <GitCompare size={16} className="text-purple-600" />
                          <h4 className="text-sm font-bold text-purple-900 uppercase tracking-wide">
                            Comparison
                          </h4>
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {opinion.comparison}
                        </p>
                      </div>

                      <div className="bg-white bg-opacity-70 rounded-lg p-4 border-l-4 border-emerald-500 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Target size={16} className="text-emerald-600" />
                          <h4 className="text-sm font-bold text-emerald-900 uppercase tracking-wide">
                            Confidence Level
                          </h4>
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {opinion.confidence}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-5 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-800">Impact Summary</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border-l-4 border-green-500 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-green-600" />
                      <span className="text-xs font-bold text-gray-700">Lives Saved</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      +{option.impact.livesSaved}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border-l-4 border-red-500 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skull size={16} className="text-red-600" />
                      <span className="text-xs font-bold text-gray-700">Casualties</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">
                      +{option.impact.humanCasualties}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border-l-4 border-cyan-500 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets size={16} className="text-cyan-600" />
                      <span className="text-xs font-bold text-gray-700">Resources</span>
                    </div>
                    <span className="text-lg font-bold text-cyan-600">
                      {option.impact.firefightingResource}%
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border-l-4 border-gray-500 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building size={16} className="text-gray-600" />
                      <span className="text-xs font-bold text-gray-700">Infrastructure</span>
                    </div>
                    <span className="text-lg font-bold text-gray-600">
                      {option.impact.infrastructureCondition}%
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border-l-4 border-emerald-500 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tree size={16} className="text-emerald-600" />
                      <span className="text-xs font-bold text-gray-700">Biodiversity</span>
                    </div>
                    <span className="text-lg font-bold text-emerald-600">
                      {option.impact.biodiversityCondition}%
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border-l-4 border-blue-500 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building size={16} className="text-blue-600" />
                      <span className="text-xs font-bold text-gray-700">Properties</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {option.impact.propertiesCondition}%
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border-l-4 border-purple-500 shadow-sm col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Factory size={16} className="text-purple-600" />
                      <span className="text-xs font-bold text-gray-700">Nuclear Station</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">
                      {option.impact.nuclearPowerStation}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-5 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-800">Key Considerations</h2>
              </div>
              <div className="space-y-2">
                {option.riskInfo.map((risk, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border-l-4 border-orange-500 shadow-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <p className="text-sm text-gray-800 leading-relaxed font-medium">{risk}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-white rounded-b-2xl border-t-2 border-gray-200 p-6 shadow-lg">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 px-6 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <X size={24} />
            Close Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewOptionModal;
