import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { DecisionOption } from '../types';
import MetricsDisplay from './MetricsDisplay';

interface RankedOptionsViewProps {
  scenario: {
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

const RankedOptionsView: React.FC<RankedOptionsViewProps> = ({
  scenario,
  onBack,
  onConfirm,
  currentMetrics
}) => {
  const [selectedOption, setSelectedOption] = useState<DecisionOption | null>(null);
  const [rankedOptions, setRankedOptions] = useState<DecisionOption[]>([]);
  const [preferenceMessage, setPreferenceMessage] = useState('');

  useEffect(() => {
    const preferenceType = localStorage.getItem('preferenceTypeFlag');
    const metricsRanking = JSON.parse(localStorage.getItem('simulationMetricsRanking') || '[]');
    const valuesRanking = JSON.parse(localStorage.getItem('moralValuesRanking') || '[]');
    
    const rankings = preferenceType === 'true' ? metricsRanking : valuesRanking;
    
    // Create preference message
    const topPriorities = rankings.slice(0, 3).map(r => r.label).join(', ');
    setPreferenceMessage(
      preferenceType === 'true'
        ? `Based on your simulation metrics priorities (${topPriorities}), the following options are ranked according to their impact on these key metrics:`
        : `Based on your moral values priorities (${topPriorities}), the following options are ranked according to their alignment with these core values:`
    );

    // Sort options based on the selected preference type and rankings
    const sortedOptions = [...scenario.options].sort((a, b) => {
      if (preferenceType === 'true') {
        const aScore = calculateMetricsScore(a, rankings);
        const bScore = calculateMetricsScore(b, rankings);
        return bScore - aScore;
      } else {
        const aScore = calculateValuesScore(a, rankings);
        const bScore = calculateValuesScore(b, rankings);
        return bScore - aScore;
      }
    });

    setRankedOptions(sortedOptions);
  }, [scenario]);

  const calculateMetricsScore = (option: DecisionOption, rankings: any[]) => {
    let score = 0;
    const weights = rankings.map((_, index) => rankings.length - index);
    
    rankings.forEach((metric, index) => {
      switch (metric.id) {
        case 'livesSaved':
          score += option.impact.livesSaved * weights[index];
          break;
        case 'casualties':
          score += (100 - option.impact.humanCasualties) * weights[index];
          break;
        // Add other metrics...
      }
    });
    return score;
  };

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

        <MetricsDisplay 
          metrics={currentMetrics}
          animatingMetrics={[]}
        />

        <div className="bg-white rounded-lg shadow-md p-4 flex-1 flex flex-col">
          <h2 className="text-lg font-semibold mb-1 text-gray-700">{scenario.title}</h2>
          <p className="text-sm text-gray-600 mb-4">{scenario.description}</p>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-blue-800">{preferenceMessage}</p>
          </div>

          <div className="space-y-4">
            {rankedOptions.map((option, index) => (
              <div
                key={option.id}
                onClick={() => setSelectedOption(option)}
                className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                  selectedOption?.id === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                    {index + 1}
                  </span>
                  <h3 className="font-medium text-gray-900">{option.title}</h3>
                </div>
                <p className="text-gray-600 text-sm">{option.description}</p>
              </div>
            ))}
          </div>

          {selectedOption && (
            <button
              onClick={() => onConfirm(selectedOption)}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200"
            >
              <Check size={16} className="mr-1" />
              Confirm Decision
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RankedOptionsView;