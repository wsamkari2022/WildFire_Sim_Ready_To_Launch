import React from 'react';
import { Users, Skull, Droplets, Building, Trees as Tree, Factory, ThumbsUp, Shield, Scale, Leaf, Ban, AlertTriangle } from 'lucide-react';
import { DecisionOption as DecisionOptionType, SimulationMetrics } from '../types';

interface DecisionOptionProps {
  option: DecisionOptionType;
  onSelect: (option: DecisionOptionType) => void;
  currentMetrics?: SimulationMetrics;
  scenarioIndex?: number;
}

const DecisionOption: React.FC<DecisionOptionProps> = ({ option, onSelect, currentMetrics, scenarioIndex }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const formatImpactValue = (value: number, isLivesSaved: boolean = false, isCasualties: boolean = false) => {
    if (isLivesSaved) {
      return `+${value}`;
    }
    if (isCasualties) {
      return `+${value}`;
    }
    return `${value}%`;
  };

  const getRecommendationCount = () => {
    const recommendations = Object.values(option.expertOpinions).map(opinion => opinion.recommendation);
    const acceptCount = recommendations.filter(rec => rec === "Accept").length;
    return acceptCount;
  };

  const checkFeasibility = () => {
    if (scenarioIndex !== 2 || !currentMetrics) {
      return { isFeasible: true, insufficientResources: [] };
    }

    const insufficientResources: Array<{ metric: string; needed: number; available: number }> = [];

    if (currentMetrics.firefightingResource + option.impact.firefightingResource < 0) {
      insufficientResources.push({
        metric: 'Resources',
        needed: Math.abs(option.impact.firefightingResource),
        available: currentMetrics.firefightingResource
      });
    }

    if (currentMetrics.infrastructureCondition + option.impact.infrastructureCondition < 0) {
      insufficientResources.push({
        metric: 'Infrastructure',
        needed: Math.abs(option.impact.infrastructureCondition),
        available: currentMetrics.infrastructureCondition
      });
    }

    if (currentMetrics.biodiversityCondition + option.impact.biodiversityCondition < 0) {
      insufficientResources.push({
        metric: 'Biodiversity',
        needed: Math.abs(option.impact.biodiversityCondition),
        available: currentMetrics.biodiversityCondition
      });
    }

    if (currentMetrics.propertiesCondition + option.impact.propertiesCondition < 0) {
      insufficientResources.push({
        metric: 'Properties',
        needed: Math.abs(option.impact.propertiesCondition),
        available: currentMetrics.propertiesCondition
      });
    }

    return {
      isFeasible: insufficientResources.length === 0,
      insufficientResources
    };
  };

  const { isFeasible, insufficientResources } = checkFeasibility();

  // Map value labels to their display properties
  const valueMap = {
    safety: { name: 'Safety', icon: <Shield size={12} className="mr-1" /> },
    efficiency: { name: 'Efficiency', icon: <Droplets size={12} className="mr-1" /> },
    sustainability: { name: 'Sustainability', icon: <Leaf size={12} className="mr-1" /> },
    fairness: { name: 'Fairness', icon: <Scale size={12} className="mr-1" /> },
    nonmaleficence: { name: 'Nonmaleficence', icon: <Ban size={12} className="mr-1" /> }
  };

  const valueDisplay = valueMap[option.label as keyof typeof valueMap];

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`bg-white border ${
          !isFeasible
            ? 'border-red-300 bg-red-50/50 opacity-75'
            : 'border-gray-300'
        } text-left p-3 rounded-lg transition-all duration-200 flex flex-col w-full`}
      >
      {!isFeasible && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
          <AlertTriangle size={16} className="text-red-600" />
        </div>
      )}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <h4 className={`text-lg font-bold ${!isFeasible ? 'text-red-800' : 'bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent'} mb-1 ${!isFeasible ? 'ml-6' : ''} tracking-tight`}>
            {option.title}
          </h4>
          <p className="text-gray-700 text-sm leading-relaxed">{option.description}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
            <ThumbsUp size={12} className="text-green-600" />
            <span className="text-xs text-gray-700 whitespace-nowrap font-medium">
              {getRecommendationCount()}/5 recommend
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-md p-2 mb-2">
        <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Key Considerations</h5>
        {option.riskInfo.map((risk, index) => (
          <div key={index} className="flex items-start mb-1 last:mb-0">
            <span className="text-red-500 mr-2 mt-0.5 font-bold">•</span>
            <p className="text-xs text-gray-700 leading-relaxed">{risk}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mb-2">
        <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Metrics Impact</h5>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <div className="flex items-center text-green-600 font-medium">
            <Users size={14} className="mr-1.5" />
            <span className="text-xs">Lives Saved: {formatImpactValue(option.impact.livesSaved, true)}</span>
          </div>
          <div className="flex items-center text-red-600 font-medium">
            <Skull size={14} className="mr-1.5" />
            <span className="text-xs">Casualties: {formatImpactValue(option.impact.humanCasualties, false, true)}</span>
          </div>
          <div className="flex items-center text-blue-600 font-medium">
            <Droplets size={14} className="mr-1.5" />
            <span className="text-xs">Resources: {formatImpactValue(option.impact.firefightingResource)}</span>
          </div>
          <div className="flex items-center text-gray-600 font-medium">
            <Building size={14} className="mr-1.5" />
            <span className="text-xs">Infrastructure: {formatImpactValue(option.impact.infrastructureCondition)}</span>
          </div>
          <div className="flex items-center text-green-600 font-medium">
            <Tree size={14} className="mr-1.5" />
            <span className="text-xs">Biodiversity: {formatImpactValue(option.impact.biodiversityCondition)}</span>
          </div>
          <div className="flex items-center text-blue-600 font-medium">
            <Building size={14} className="mr-1.5" />
            <span className="text-xs">Properties: {formatImpactValue(option.impact.propertiesCondition)}</span>
          </div>
          <div className="flex items-center text-purple-600 font-medium">
            <Factory size={14} className="mr-1.5" />
            <span className="text-xs">Nuclear: {formatImpactValue(option.impact.nuclearPowerStation)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => !isFeasible ? null : onSelect(option)}
        disabled={!isFeasible}
        className={`w-full py-2 px-4 rounded-md font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          !isFeasible
            ? 'bg-red-100 text-red-700 cursor-not-allowed border border-red-300'
            : 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 shadow-md hover:shadow-lg'
        }`}
      >
        {!isFeasible ? 'Not Feasible' : 'Select'}
      </button>
      </div>

      {!isFeasible && isHovered && insufficientResources.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-red-600 text-white text-xs px-3 py-2 rounded-md shadow-lg transition-opacity duration-200">
          <div className="font-semibold mb-1">Not Feasible:</div>
          {insufficientResources.map((resource, idx) => (
            <div key={idx}>
              Not enough {resource.metric} (needs {resource.needed}%, you have {resource.available}%)
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DecisionOption;