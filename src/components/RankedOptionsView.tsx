import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Users, Skull, Droplets, Building, Trees as Tree, Factory } from 'lucide-react';
import { DecisionOption } from '../types';

interface RankedOptionsViewProps {
  scenario: {
    id: number;
    title: string;
    description: string;
    options: DecisionOption[];
  };
  onBack: () => void;
  onConfirm: (option: DecisionOption) => void;
  currentMetrics: {
    livesSaved: number;
    humanCasualties: number;
    firefightingResource: number;
    infrastructureCondition: number;
    biodiversityCondition: number;
    propertiesCondition: number;
    nuclearPowerStation: number;
  };
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
  currentMetrics
}) => {
  const [selectedOption, setSelectedOption] = useState<DecisionOption | null>(null);
  const [rankedOptions, setRankedOptions] = useState<DecisionOption[]>([]);
  const [preferenceMessage, setPreferenceMessage] = useState('');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [previewMetrics, setPreviewMetrics] = useState(currentMetrics);

  useEffect(() => {
    const preferenceType = localStorage.getItem('preferenceTypeFlag');
    const metricsRanking = JSON.parse(localStorage.getItem('simulationMetricsRanking') || '[]');
    const valuesRanking = JSON.parse(localStorage.getItem('moralValuesRanking') || '[]');
    
    if (scenario.id > 1) {
      if (preferenceType === 'true' && metricsRanking.length > 0) {
        const topMetric = metricsRanking[0];
        const sortedOptions = [...scenario.options].sort((a, b) => {
          const getMetricValue = (option: DecisionOption) => {
            switch (topMetric.id) {
              case 'livesSaved':
                return option.impact.livesSaved * (topMetric.higherIsBetter ? 1 : -1);
              case 'casualties':
                return option.impact.humanCasualties;
              case 'resources':
                return Math.abs(option.impact.firefightingResource);
              case 'infrastructure':
                return Math.abs(option.impact.infrastructureCondition);
              case 'biodiversity':
                return Math.abs(option.impact.biodiversityCondition);
              case 'properties':
                return Math.abs(option.impact.propertiesCondition);
              case 'nuclear':
                return Math.abs(option.impact.nuclearPowerStation);
              default:
                return 0;
            }
          };
          return getMetricValue(a) - getMetricValue(b);
        });

        setPreferenceMessage(`Because you selected '${topMetric.label}' as your highest priority in the previous simulation, the top two options are ranked accordingly.`);
        setRankedOptions(sortedOptions);
      } else if (preferenceType === 'false' && valuesRanking.length > 0) {
        const topValues = valuesRanking.slice(0, 2);
        const matchingOptions = scenario.options.filter(option => 
          topValues.some(value => value.id.toLowerCase() === option.label.toLowerCase())
        );
        const otherOptions = scenario.options.filter(option => 
          !topValues.some(value => value.id.toLowerCase() === option.label.toLowerCase())
        );

        const valueLabels = topValues.map(v => v.label).join("' and '");
        setPreferenceMessage(`Because you selected '${valueLabels}' as your highest moral priorities in the previous simulation, the top two options are ranked accordingly.`);
        setRankedOptions([...matchingOptions, ...otherOptions]);
      }
    } else {
      // Original behavior for Scenario 1
      const rankings = preferenceType === 'true' ? metricsRanking : valuesRanking;
      const topPriorities = rankings.slice(0, 3).map(r => r.label).join(', ');
      setPreferenceMessage(
        preferenceType === 'true'
          ? `Based on your simulation metrics priorities (${topPriorities}), the following options are ranked according to their impact on these key metrics:`
          : `Based on your moral values priorities (${topPriorities}), the following options are ranked according to their alignment with these core values:`
      );
      setRankedOptions([...scenario.options]);
    }
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
      onConfirm(selectedOption);
    }
  };

  return (
    <div className="h-screen bg-gray-50 p-4 flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <button 
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Preferences
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 flex-1 flex flex-col">
          <h2 className="text-lg font-semibold mb-1 text-gray-700">{scenario.title}</h2>
          <p className="text-sm text-gray-600 mb-4">{scenario.description}</p>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-blue-800">{preferenceMessage}</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {metricButtons.map((metric) => {
              const Icon = metric.icon;
              return (
                <button
                  key={metric.id}
                  onClick={() => setSelectedMetric(selectedMetric === metric.id ? null : metric.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors duration-200 ${
                    selectedMetric === metric.id
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={16} className={metric.color} />
                  {metric.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            {rankedOptions.map((option, index) => (
              <div
                key={option.id}
                onClick={() => setSelectedOption(option)}
                className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                  selectedOption?.id === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : index < 2 && scenario.id > 1
                      ? 'border-green-200 hover:border-blue-300 hover:bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                    {index + 1}
                  </span>
                  <h3 className="font-medium text-gray-900">{option.title}</h3>
                  {selectedMetric && (
                    <span className={`ml-auto font-medium ${metricButtons.find(m => m.id === selectedMetric)?.color}`}>
                      {getMetricValue(option, selectedMetric)}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm">{option.description}</p>
              </div>
            ))}
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