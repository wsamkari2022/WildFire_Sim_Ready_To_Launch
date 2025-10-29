import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Users, Skull, Droplets, Building, Trees as Tree, Factory, RefreshCw, Lock } from 'lucide-react';
import { DecisionOption } from '../types';

interface RankedOptionsViewProps {
  scenario: {
    title: string;
    description: string;
    options: DecisionOption[];
  };
  onBack: () => void;
  onConfirm: (option: DecisionOption, isTop2: boolean) => void;
  currentMetrics: {
    livesSaved: number;
    humanCasualties: number;
    firefightingResource: number;
    infrastructureCondition: number;
    biodiversityCondition: number;
    propertiesCondition: number;
    nuclearPowerStation: number;
  };
  onReorderPriorities?: () => void;
}

const metricButtons = [
  { id: 'livesSaved', label: 'Lives Saved', icon: Users, color: 'text-green-600', higherIsBetter: true },
  { id: 'casualties', label: 'Casualties', icon: Skull, color: 'text-red-600', higherIsBetter: false },
  { id: 'resources', label: 'Resources', icon: Droplets, color: 'text-blue-600', higherIsBetter: false },
  { id: 'infrastructure', label: 'Infrastructure', icon: Building, color: 'text-gray-600', higherIsBetter: false },
  { id: 'biodiversity', label: 'Biodiversity', icon: Tree, color: 'text-green-600', higherIsBetter: false },
  { id: 'properties', label: 'Properties', icon: Building, color: 'text-blue-600', higherIsBetter: false },
  { id: 'nuclear', label: 'Nuclear', icon: Factory, color: 'text-purple-600', higherIsBetter: false }
];

const RankedOptionsView: React.FC<RankedOptionsViewProps> = ({
  scenario,
  onBack,
  onConfirm,
  currentMetrics,
  onReorderPriorities
}) => {
  const [selectedOption, setSelectedOption] = useState<DecisionOption | null>(null);
  const [rankedOptions, setRankedOptions] = useState<DecisionOption[]>([]);
  const [preferenceMessage, setPreferenceMessage] = useState('');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [previewMetrics, setPreviewMetrics] = useState(currentMetrics);
  const [showBubbleTooltip, setShowBubbleTooltip] = useState(true);
  const [hasClickedMetric, setHasClickedMetric] = useState(false);

  useEffect(() => {
    // Mark that the user has accessed the RankedOptionsView
    localStorage.setItem('rankedViewAccessed', 'true');

    const preferenceType = localStorage.getItem('preferenceTypeFlag');
    const metricsRanking = JSON.parse(localStorage.getItem('simulationMetricsRanking') || '[]');
    const valuesRanking = JSON.parse(localStorage.getItem('moralValuesRanking') || '[]');

    const rankings = preferenceType === 'true' ? metricsRanking : valuesRanking;

    const topPriorities = rankings.slice(0, 2).map(r => r.label).join(', ');
    setPreferenceMessage(
      preferenceType === 'true'
        ? `Based on your simulation metrics priorities (${topPriorities}), the following options are ranked according to their impact on these key metrics:`
        : `Based on your moral values priorities (${topPriorities}), the following options are ranked according to their alignment with these core values:`
    );

    const sortedOptions = [...scenario.options].sort((a, b) => {
      if (preferenceType === 'true') {
        const metricConfig = metricButtons.find(m => m.id === rankings[0]?.id);
        if (!metricConfig) return 0;

        let aValue = 0;
        let bValue = 0;

        switch (rankings[0]?.id) {
          case 'livesSaved':
            aValue = a.impact.livesSaved;
            bValue = b.impact.livesSaved;
            break;
          case 'casualties':
            aValue = a.impact.humanCasualties;
            bValue = b.impact.humanCasualties;
            break;
          case 'resources':
            aValue = Math.abs(a.impact.firefightingResource);
            bValue = Math.abs(b.impact.firefightingResource);
            break;
          case 'infrastructure':
            aValue = Math.abs(a.impact.infrastructureCondition);
            bValue = Math.abs(b.impact.infrastructureCondition);
            break;
          case 'biodiversity':
            aValue = Math.abs(a.impact.biodiversityCondition);
            bValue = Math.abs(b.impact.biodiversityCondition);
            break;
          case 'properties':
            aValue = Math.abs(a.impact.propertiesCondition);
            bValue = Math.abs(b.impact.propertiesCondition);
            break;
          case 'nuclear':
            aValue = Math.abs(a.impact.nuclearPowerStation);
            bValue = Math.abs(b.impact.nuclearPowerStation);
            break;
        }

        return metricConfig.higherIsBetter ? bValue - aValue : aValue - bValue;
      } else {
        const aScore = calculateValuesScore(a, rankings);
        const bScore = calculateValuesScore(b, rankings);
        return bScore - aScore;
      }
    });

    setRankedOptions(sortedOptions);
  }, [scenario]);

  useEffect(() => {
    if (selectedOption) {
      const newMetrics = {
        livesSaved: currentMetrics.livesSaved + selectedOption.impact.livesSaved,
        humanCasualties: currentMetrics.humanCasualties + selectedOption.impact.humanCasualties,
        firefightingResource: Math.max(0, currentMetrics.firefightingResource + selectedOption.impact.firefightingResource),
        infrastructureCondition: Math.max(0, currentMetrics.infrastructureCondition + selectedOption.impact.infrastructureCondition),
        biodiversityCondition: Math.max(0, currentMetrics.biodiversityCondition + selectedOption.impact.biodiversityCondition),
        propertiesCondition: Math.max(0, currentMetrics.propertiesCondition + selectedOption.impact.propertiesCondition),
        nuclearPowerStation: Math.max(0, currentMetrics.nuclearPowerStation + selectedOption.impact.nuclearPowerStation),
      };
      setPreviewMetrics(newMetrics);
    } else {
      setPreviewMetrics(currentMetrics);
    }
  }, [selectedOption, currentMetrics]);

  const calculateValuesScore = (option: DecisionOption, rankings: any[]) => {
    let score = 0;
    const weights = rankings.map((_, index) => rankings.length - index);
    
    rankings.forEach((value, index) => {
      if (option.label.toLowerCase() === value.id) {
        score += 100 * weights[index];
      }
    });
    return score;
  };

  const handleMetricClick = (metricId: string) => {
    setSelectedMetric(selectedMetric === metricId ? null : metricId);
    if (!hasClickedMetric) {
      setHasClickedMetric(true);
      setShowBubbleTooltip(false);
    }
  };

  const getMetricValue = (option: DecisionOption, metricId: string) => {
    switch (metricId) {
      case 'livesSaved':
        return `+${option.impact.livesSaved}`;
      case 'casualties':
        return `+${option.impact.humanCasualties}`;
      case 'resources':
        return `${option.impact.firefightingResource}%`;
      case 'infrastructure':
        return `${option.impact.infrastructureCondition}%`;
      case 'biodiversity':
        return `${option.impact.biodiversityCondition}%`;
      case 'properties':
        return `${option.impact.propertiesCondition}%`;
      case 'nuclear':
        return `${option.impact.nuclearPowerStation}%`;
      default:
        return '';
    }
  };

  const handleConfirm = () => {
    if (selectedOption) {
      // Track if user selected from top 2 options
      const selectedIndex = rankedOptions.findIndex(opt => opt.id === selectedOption.id);
      const isTop2 = selectedIndex < 2;

      // Set flag indicating user has reordered their values
      localStorage.setItem('hasReorderedValues', 'true');

      // Increment counter for hasReorderedValues
      const currentCount = localStorage.getItem('hasReorderedValuesCount');
      const newCount = currentCount ? parseInt(currentCount) + 1 : 1;
      localStorage.setItem('hasReorderedValuesCount', newCount.toString());

      onConfirm(selectedOption, isTop2);
    }
  };

  return (
    <div className="h-screen bg-gray-50 p-4 flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Preferences
          </button>
          <button
            onClick={onReorderPriorities}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <RefreshCw size={18} />
            Re-order Priorities
          </button>
        </div>

        {/* Success message when user clicks a metric */}
        {hasClickedMetric && !showBubbleTooltip && (
          <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-400 rounded-r-lg animate-fade-in">
            <p className="text-sm text-green-800">
              🎉 <strong>Great!</strong> Now you can see how each option impacts this metric. Try clicking other metrics to compare!
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-4 flex-1 flex flex-col">
          <h2 className="text-lg font-semibold mb-1 text-gray-700">{scenario.title}</h2>
          <p className="text-sm text-gray-600 mb-4">{scenario.description}</p>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-blue-800">{preferenceMessage}</p>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-6">
            <div className="flex items-start gap-2">
              <Lock size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-amber-900 font-medium mb-1">Selection Limited to Top 2 Options</p>
                <p className="text-amber-800 text-sm">
                  Only the top two ranked options are available for selection based on your priorities. To choose from other options, use the "Re-order Priorities" button to adjust your rankings.
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex flex-wrap gap-2 mb-6">
            {showBubbleTooltip && (
              <div className="absolute -top-12 left-0 z-20 animate-bounce">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm px-4 py-2 rounded-lg shadow-lg whitespace-nowrap font-medium">
                  ✨ Click any metric to see impact numbers!
                  <div className="absolute top-full left-8 transform -translate-x-1/2 w-0 h-0 border-t-8 border-purple-500 border-x-8 border-x-transparent"></div>
                </div>
              </div>
            )}
            {metricButtons.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={metric.id} className="relative">
                  <button
                    onClick={() => handleMetricClick(metric.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all duration-200 ${
                      selectedMetric === metric.id
                        ? 'bg-blue-500 text-white shadow-lg scale-105'
                        : showBubbleTooltip && index === 0
                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 ring-2 ring-purple-300 ring-offset-2'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon size={16} className={selectedMetric === metric.id ? 'text-white' : metric.color} />
                    {metric.label}
                  </button>
                  {showBubbleTooltip && index === 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full animate-ping"></span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            {rankedOptions.map((option, index) => {
              const isDisabled = index >= 2;
              return (
                <div
                  key={option.id}
                  onClick={() => !isDisabled && setSelectedOption(option)}
                  className={`p-4 rounded-lg border transition-all duration-200 relative ${
                    isDisabled
                      ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                      : selectedOption?.id === option.id
                      ? 'border-blue-500 bg-blue-50 cursor-pointer'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full font-semibold ${
                      isDisabled
                        ? 'bg-gray-200 text-gray-500'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {index + 1}
                    </span>
                    <h3 className={`font-medium ${
                      isDisabled ? 'text-gray-500' : 'text-gray-900'
                    }`}>{option.title}</h3>
                    {isDisabled && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-600 text-white text-xs font-medium rounded">
                        <Lock size={11} />
                        Locked
                      </div>
                    )}
                    <div className="flex-1"></div>
                    {selectedMetric && (
                      <span className={`font-medium ${
                        isDisabled
                          ? 'text-gray-400'
                          : metricButtons.find(m => m.id === selectedMetric)?.color
                      }`}>
                        {getMetricValue(option, selectedMetric)}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${
                    isDisabled ? 'text-gray-400' : 'text-gray-600'
                  }`}>{option.description}</p>
                </div>
              );
            })}
          </div>

          {selectedOption && (
            <button
              onClick={handleConfirm}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200"
            >
              <Check size={16} className="mr-1" />
              Select Option
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RankedOptionsView;