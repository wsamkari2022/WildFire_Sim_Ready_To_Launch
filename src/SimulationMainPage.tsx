import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Check, BarChart2, Lightbulb, X, AlertTriangle } from 'lucide-react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import MetricsDisplay from './components/MetricsDisplay';
import DecisionOption from './components/DecisionOption';
import ExpertAnalysis from './components/ExpertAnalysis';
import RadarChart from './components/RadarChart';
import AlternativeDecisionModal from './components/AlternativeDecisionModal';
import CVRQuestionModal from './components/CVRQuestionModal';
import AdaptivePreferenceView from './components/AdaptivePreferenceView';
import { SimulationMetrics, DecisionOption as DecisionOptionType, ExplicitValue } from './types';
import { scenarios } from './data/scenarios';

// Register Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const defaultMetrics: SimulationMetrics = {
  livesSaved: 0,
  humanCasualties: 0,
  firefightingResource: 100,
  infrastructureCondition: 100,
  biodiversityCondition: 100,
  propertiesCondition: 100,
  nuclearPowerStation: 100,
};

const SimulationMainPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<SimulationMetrics>(defaultMetrics);
  const [topStableValues, setTopStableValues] = useState<string[]>([]);
  const [currentScenarioInitialOptions, setCurrentScenarioInitialOptions] = useState<DecisionOptionType[]>([]);
  const [animatingMetrics, setAnimatingMetrics] = useState<string[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<DecisionOptionType | null>(null);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [showRadarChart, setShowRadarChart] = useState(false);
  const [showAlternativesModal, setShowAlternativesModal] = useState(false);
  const [showCVRModal, setShowCVRModal] = useState(false);
  const [showAdaptivePreference, setShowAdaptivePreference] = useState(false);
  const [addedAlternatives, setAddedAlternatives] = useState<DecisionOptionType[]>([]);
  const [toggledOptions, setToggledOptions] = useState<{[key: string]: boolean}>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState<string | null>(null);
  const [priorityMessage, setPriorityMessage] = useState<string | null>(null);
  const [hasAccessedRankedView, setHasAccessedRankedView] = useState(false);
  const [simulationScenarioOutcomes, setSimulationScenarioOutcomes] = useState<Array<{
    scenarioId: number;
    decision: DecisionOptionType;
  }>>([]);
  const [matchedStableValues, setMatchedStableValues] = useState<string[]>([]);
  const [hasExploredAlternatives, setHasExploredAlternatives] = useState(false);
  const [showAlternativesHint, setShowAlternativesHint] = useState(false);

  const currentScenario = scenarios[currentScenarioIndex];

  const getMostFrequentExplicitValues = (): string[] => {
    const savedExplicitValues = localStorage.getItem('explicitValues');
    if (!savedExplicitValues) return [];

    try {
      const explicitValues = JSON.parse(savedExplicitValues) as ExplicitValue[];
      const valueFrequency: { [key: string]: number } = {};
      
      // Count frequency of each value
      explicitValues.forEach(value => {
        valueFrequency[value.value_selected] = (valueFrequency[value.value_selected] || 0) + 1;
      });

      // Sort by frequency and get top 2
      return Object.entries(valueFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([value]) => value.toLowerCase());
    } catch (error) {
      console.error('Error parsing explicit values:', error);
      return [];
    }
  };

  useEffect(() => {
    // Check if user has accessed RankedOptionsView
    const rankedViewAccessed = localStorage.getItem('rankedViewAccessed') === 'true';
    setHasAccessedRankedView(rankedViewAccessed);

    // Load matched stable values from localStorage
    const savedMatchedValues = localStorage.getItem('finalValues');
    const moralValuesReorder = localStorage.getItem('MoralValuesReorderList');
    
    // If user has reordered moral values, use those instead of original matched values
    if (moralValuesReorder && currentScenarioIndex > 0) {
      try {
        const reorderedValues = JSON.parse(moralValuesReorder);
        const topValues = reorderedValues.slice(0, 2).map((v: any) => v.id.toLowerCase());
        setMatchedStableValues(topValues);
      } catch (error) {
        console.error('Error parsing MoralValuesReorderList:', error);
        // Fallback to original matched values
        if (savedMatchedValues) {
          try {
            const parsedValues = JSON.parse(savedMatchedValues);
            const valueNames = parsedValues.map((v: any) => v.name.toLowerCase());
            setMatchedStableValues(valueNames);
          } catch (error) {
            console.error('Error parsing matched stable values:', error);
            setMatchedStableValues([]);
          }
        }
      }
    } else if (savedMatchedValues) {
      try {
        const parsedValues = JSON.parse(savedMatchedValues);
        const valueNames = parsedValues.map((v: any) => v.name.toLowerCase());
        setMatchedStableValues(valueNames);
      } catch (error) {
        console.error('Error parsing matched stable values:', error);
        setMatchedStableValues([]);
      }
    }

    const preferenceType = localStorage.getItem('preferenceTypeFlag');
    const metricsRanking = JSON.parse(localStorage.getItem('simulationMetricsRanking') || '[]');
    const valuesRanking = JSON.parse(localStorage.getItem('moralValuesRanking') || '[]');

    if (currentScenarioIndex > 0) {
      if (rankedViewAccessed) {
        if (preferenceType === 'true') {
          const topMetric = metricsRanking[0]?.label;
          setPriorityMessage(
            `Because you selected '${topMetric}' as your highest priority in the previous simulation, the top two options are ranked accordingly.`
          );
        } else {
          const value1 = valuesRanking[0]?.label;
          const value2 = valuesRanking[1]?.label;
          setPriorityMessage(
            `Because you selected '${value1}' and '${value2}' as your highest moral priorities in the previous simulation, the top two options are ranked accordingly.`
          );
        }
      }
    } else {
      setPriorityMessage(null);
    }
  }, [currentScenarioIndex]);

  useEffect(() => {
    // Set initial options for current scenario only once when scenario changes or when first loading
    if (currentScenario) {
      // Check if user has accessed AdaptivePreferenceView (MoralValuesReorderList exists)
      const moralValuesReorder = localStorage.getItem('MoralValuesReorderList');
      const simulationMetricsReorder = localStorage.getItem('SimulationMetricsReorderList');
      
      let initialOptions: DecisionOptionType[] = [];
      
      // If no reordering has occurred, use random selection for all scenarios
      if (!moralValuesReorder && !simulationMetricsReorder) {
        const shuffledOptions = [...currentScenario.options].sort(() => Math.random() - 0.5);
        initialOptions = shuffledOptions.slice(0, 2);
      } else {
        // Use preference-based selection (existing logic)
        initialOptions = calculatePreferenceBasedOptions();
      }
      
      setCurrentScenarioInitialOptions(initialOptions);
    }
    
    // Clear any previously stored metrics
    localStorage.removeItem('currentMetrics');
    
    const savedValues = localStorage.getItem('finalValues');
    if (savedValues) {
      try {
        const values = JSON.parse(savedValues);
        const stableValues = values
          .slice(0, 2)
          .map((v: { name: string }) => v.name.toLowerCase());
        
        setTopStableValues(stableValues);
      } catch (error) {
        console.error('Error parsing matched stable values:', error);
      }
    }
  }, [currentScenarioIndex, currentScenario]);

  // Reset added alternatives when scenario changes (but keep initial options calculation in main useEffect)
  useEffect(() => {
    if (currentScenarioIndex > 0) {
      setAddedAlternatives([]);
    }
  }, [currentScenarioIndex]);
  const calculatePreferenceBasedOptions = useCallback((): DecisionOptionType[] => {
    if (!currentScenario) return [];
    
    // Check if user has accessed AdaptivePreferenceView (MoralValuesReorderList exists)
    const moralValuesReorder = localStorage.getItem('MoralValuesReorderList');
    const simulationMetricsReorder = localStorage.getItem('SimulationMetricsReorderList');
    
    // FIRST PRIORITY: Check for reordered moral values
    if (moralValuesReorder) {
      try {
        const reorderedValues = JSON.parse(moralValuesReorder);
        const topValues = reorderedValues.slice(0, 2).map((v: any) => v.id.toLowerCase());
        
        // Find options that match the top 2 reordered moral values
        const matchingOptions = currentScenario.options.filter(option => 
          topValues.includes(option.label.toLowerCase())
        );
        
        // Sort matching options to maintain the order from MoralValuesReorderList
        const sortedMatchingOptions = matchingOptions.sort((a, b) => {
          const aIndex = topValues.indexOf(a.label.toLowerCase());
          const bIndex = topValues.indexOf(b.label.toLowerCase());
          return aIndex - bIndex;
        });
        
        if (sortedMatchingOptions.length >= 2) {
          return sortedMatchingOptions.slice(0, 2);
        } else if (sortedMatchingOptions.length === 1) {
          // If only one matching option, add the best remaining option
          const remainingOptions = currentScenario.options.filter(option => 
            !topValues.includes(option.label.toLowerCase())
          );
          return [sortedMatchingOptions[0], remainingOptions[0]];
        }
      } catch (error) {
        console.error('Error parsing MoralValuesReorderList:', error);
      }
    }
    
    // SECOND PRIORITY: Check for reordered simulation metrics
    if (simulationMetricsReorder) {
      try {
        const reorderedMetrics = JSON.parse(simulationMetricsReorder);
        const topMetric = reorderedMetrics[0]?.id;
        
        if (topMetric) {
          const sortedOptions = [...currentScenario.options].sort((a, b) => {
            const getMetricValue = (option: DecisionOptionType) => {
              switch (topMetric) {
                case 'livesSaved': return option.impact.livesSaved;
                case 'casualties': return option.impact.humanCasualties;
                case 'resources': return Math.abs(option.impact.firefightingResource);
                case 'infrastructure': return Math.abs(option.impact.infrastructureCondition);
                case 'biodiversity': return Math.abs(option.impact.biodiversityCondition);
                case 'properties': return Math.abs(option.impact.propertiesCondition);
                case 'nuclear': return Math.abs(option.impact.nuclearPowerStation);
                default: return 0;
              }
            };

            const isHigherBetter = topMetric === 'livesSaved';
            return isHigherBetter ? getMetricValue(b) - getMetricValue(a) : getMetricValue(a) - getMetricValue(b);
          });
          
          return sortedOptions.slice(0, 2);
        }
      } catch (error) {
        console.error('Error parsing SimulationMetricsReorderList:', error);
      }
    }
    
    // THIRD PRIORITY: Check what values are mentioned in the priority message (for backward compatibility)
    const preferenceType = localStorage.getItem('preferenceTypeFlag');
    const metricsRanking = JSON.parse(localStorage.getItem('simulationMetricsRanking') || '[]');
    const valuesRanking = JSON.parse(localStorage.getItem('moralValuesRanking') || '[]');
    
    if (hasAccessedRankedView) {
      if (preferenceType === 'true') {
        // Use simulation metrics ranking
        const topMetric = metricsRanking[0]?.id;
        if (topMetric) {
          const sortedOptions = [...currentScenario.options].sort((a, b) => {
            const getMetricValue = (option: DecisionOptionType) => {
              switch (topMetric) {
                case 'livesSaved': return option.impact.livesSaved;
                case 'casualties': return option.impact.humanCasualties;
                case 'resources': return Math.abs(option.impact.firefightingResource);
                case 'infrastructure': return Math.abs(option.impact.infrastructureCondition);
                case 'biodiversity': return Math.abs(option.impact.biodiversityCondition);
                case 'properties': return Math.abs(option.impact.propertiesCondition);
                case 'nuclear': return Math.abs(option.impact.nuclearPowerStation);
                default: return 0;
              }
            };

            const isHigherBetter = topMetric === 'livesSaved';
            return isHigherBetter ? getMetricValue(b) - getMetricValue(a) : getMetricValue(a) - getMetricValue(b);
          });
          
          return sortedOptions.slice(0, 2);
        }
      } else {
        // Use moral values ranking - get the exact values mentioned in the message
        const topValues = valuesRanking.slice(0, 2).map((v: any) => v.id.toLowerCase());
        
        // Find options that match these exact values
        const matchingOptions = currentScenario.options.filter(option => 
          topValues.includes(option.label.toLowerCase())
        );
        
        // Sort matching options to maintain the order from valuesRanking
        const sortedMatchingOptions = matchingOptions.sort((a, b) => {
          const aIndex = topValues.indexOf(a.label.toLowerCase());
          const bIndex = topValues.indexOf(b.label.toLowerCase());
          return aIndex - bIndex;
        });
        
        if (matchingOptions.length >= 2) {
          return sortedMatchingOptions.slice(0, 2);
        } else if (matchingOptions.length === 1) {
          // If only one matching option, add the best remaining option
          const remainingOptions = currentScenario.options.filter(option => 
            !topValues.includes(option.label.toLowerCase())
          );
          return [sortedMatchingOptions[0], remainingOptions[0]];
        }
      }
    }
    
    // FOURTH PRIORITY: Fallback to original matched stable values
    if (topStableValues.length > 0) {
      const matchingOptions = currentScenario.options.filter(option => 
        topStableValues.includes(option.label.toLowerCase())
      );
      if (matchingOptions.length >= 2) {
        return matchingOptions.slice(0, 2);
      }
    }
    
    // FIFTH PRIORITY: Final fallback to most frequent explicit values
    const frequentValues = getMostFrequentExplicitValues();
    if (frequentValues.length > 0) {
      const matchingOptions = currentScenario.options.filter(option => 
        frequentValues.includes(option.label.toLowerCase())
      );
      if (matchingOptions.length >= 2) {
        return matchingOptions.slice(0, 2);
      }
    }

    // Final fallback: random selection
    const shuffledOptions = [...currentScenario.options].sort(() => Math.random() - 0.5);
    return shuffledOptions.slice(0, 2);
  }, [currentScenario, currentScenarioIndex, topStableValues, hasAccessedRankedView]);

  const getInitialOptions = useCallback(() => {
    return currentScenarioInitialOptions;
  }, [currentScenarioInitialOptions]);
  const getAlternativeOptions = useCallback(() => {
    if (!currentScenario) return [];
    
    const initialOptionIds = getInitialOptions().map(opt => opt.id);
    const addedOptionIds = addedAlternatives.map(opt => opt.id);
    
    return currentScenario.options
      .filter(option => !initialOptionIds.includes(option.id) && !addedOptionIds.includes(option.id))
      .map(option => ({ ...option, isAlternative: true }));
  }, [currentScenario, getInitialOptions, addedAlternatives]);

  useEffect(() => {
    const initialOptions = getInitialOptions();
    const initialToggledOptions: {[key: string]: boolean} = {};
    [...initialOptions, ...addedAlternatives].forEach(option => {
      initialToggledOptions[option.id] = true;
    });
    setToggledOptions(initialToggledOptions);
  }, [currentScenarioIndex, getInitialOptions, addedAlternatives]);

  const handleDecisionSelect = (decision: DecisionOptionType) => {
    // Check if the selected option's value doesn't match user's stable values
    const optionValue = decision.label.toLowerCase();
    const doesNotMatchStableValues = !matchedStableValues.includes(optionValue);
    
    if (doesNotMatchStableValues && decision.cvrQuestion) {
      setSelectedDecision(decision);
      setShowCVRModal(true);
    } else {
      setSelectedDecision(decision);
    }
  };

  const handleCVRAnswer = (answer: boolean) => {
    setShowCVRModal(false);
    
    if (answer) {
      // User confirmed their choice, update moral values reorder list
      if (selectedDecision) {
        const selectedValue = selectedDecision.label.toLowerCase();
        
        // Get current matched stable values
        const savedMatchedValues = localStorage.getItem('finalValues');
        let matchedStableValuesList: string[] = [];
        
        if (savedMatchedValues) {
          try {
            const parsedValues = JSON.parse(savedMatchedValues);
            matchedStableValuesList = parsedValues.map((v: any) => ({
              id: v.name.toLowerCase(),
              label: v.name
            }));
          } catch (error) {
            console.error('Error parsing matched stable values:', error);
          }
        }
        
        // Create new moral values reorder list with selected value at top
        const newMoralValuesReorderList = [
          { id: selectedValue, label: selectedDecision.label },
          ...matchedStableValuesList.filter(v => v.id !== selectedValue)
        ];
        
        // Save to localStorage
        localStorage.setItem('MoralValuesReorderList', JSON.stringify(newMoralValuesReorderList));
        
        console.log('Updated MoralValuesReorderList:', newMoralValuesReorderList);
      }
      
      // Proceed with the decision - the selected decision is already set
    } else {
      // User rejected their choice, show adaptive preference view
      setShowAdaptivePreference(true);
    }
  };

  const handleAddAlternative = (option: DecisionOptionType) => {
    setAddedAlternatives(prev => [...prev, { ...option, isAlternative: true }]);
    setShowAlternativesModal(false);
  };

  const handleExploreAlternatives = () => {
    setHasExploredAlternatives(true);
    setShowAlternativesModal(true);
  };

  const handleConfirmAttempt = () => {
    if (!hasExploredAlternatives) {
      setShowAlternativesHint(true);
      setTimeout(() => setShowAlternativesHint(false), 3000);
      return;
    }
    handleConfirmDecision();
  };

  const handleConfirmDecision = () => {
    if (!selectedDecision) return;

    const newMetrics = {
      livesSaved: metrics.livesSaved + selectedDecision.impact.livesSaved,
      humanCasualties: metrics.humanCasualties + selectedDecision.impact.humanCasualties,
      firefightingResource: Math.max(0, metrics.firefightingResource + selectedDecision.impact.firefightingResource),
      infrastructureCondition: Math.max(0, metrics.infrastructureCondition + selectedDecision.impact.infrastructureCondition),
      biodiversityCondition: Math.max(0, metrics.biodiversityCondition + selectedDecision.impact.biodiversityCondition),
      propertiesCondition: Math.max(0, metrics.propertiesCondition + selectedDecision.impact.propertiesCondition),
      nuclearPowerStation: Math.max(0, metrics.nuclearPowerStation + selectedDecision.impact.nuclearPowerStation),
    };

    // Store the scenario outcome
    const outcome = {
      scenarioId: currentScenario.id,
      decision: selectedDecision
    };
    
    const updatedOutcomes = [...simulationScenarioOutcomes, outcome];
    setSimulationScenarioOutcomes(updatedOutcomes);
    localStorage.setItem('simulationScenarioOutcomes', JSON.stringify(updatedOutcomes));

    const changing = Object.keys(metrics).filter(
      (key) => metrics[key as keyof SimulationMetrics] !== newMetrics[key as keyof SimulationMetrics]
    );
    
    setAnimatingMetrics(changing);
    setMetrics(newMetrics);
    
    setTimeout(() => {
      setAnimatingMetrics([]);
    }, 1000);
    
    setSelectedDecision(null);
    
    if (currentScenarioIndex < scenarios.length - 1) {
      setIsTransitioning(true);
      
      let message = "";
      if (newMetrics.nuclearPowerStation < 50) {
        message = "⚠️ CRITICAL: Nuclear facility integrity compromised. Situation escalating - immediate action required!";
      } else if (newMetrics.firefightingResource < 30) {
        message = "⚠️ WARNING: Resources critically low. New threats emerging - strategic decisions vital!";
      } else {
        message = "Scenario complete. Preparing for escalating situation...";
      }
      setTransitionMessage(message);

      setTimeout(() => {
        setIsTransitioning(false);
        setTransitionMessage(null);
        setCurrentScenarioIndex(prev => prev + 1);
      }, 3000);
      setHasExploredAlternatives(false); // Reset for next scenario
    } else {
      // Final scenario completed
      localStorage.setItem('finalSimulationMetrics', JSON.stringify(newMetrics));
      navigate('/final-analysis');
    }
  };

  const handleRankedOptionSelect = (option: DecisionOptionType) => {
    setShowAdaptivePreference(false);
    setSelectedDecision(option);
  };

  const handleToggleOption = useCallback((optionId: string) => {
    setToggledOptions(prev => ({
      ...prev,
      [optionId]: !prev[optionId]
    }));
  }, []);

  const prepareRadarChartData = useCallback(() => {
    const labels = [
      'Fire Containment',
      'Firefighter Risk',
      'Resource Use',
      'Infrastructure Damage',
      'Biodiversity Impact',
      'Ethical Fairness'
    ];

    const visibleOptions = [...getInitialOptions(), ...addedAlternatives];
    const datasets = visibleOptions
      .filter(option => toggledOptions[option.id])
      .map((option, index) => {
        const colors = [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ];

        const borderColors = [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ];

        return {
          label: option.title,
          data: option.radarData ? [
            option.radarData.fireContainment,
            option.radarData.firefighterRisk,
            option.radarData.resourceUse,
            option.radarData.infrastructureDamage,
            option.radarData.biodiversityImpact,
            option.radarData.ethicalFairness
          ] : [],
          backgroundColor: colors[index % colors.length],
          borderColor: borderColors[index % borderColors.length],
          borderWidth: 2,
        };
      });

    return { labels, datasets };
  }, [getInitialOptions, addedAlternatives, toggledOptions]);

  const radarOptions = {
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          showLabelBackdrop: false,
          font: { size: 10 }
        },
        pointLabels: { font: { size: 12 } },
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        angleLines: { color: 'rgba(0, 0, 0, 0.1)' }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      },
      legend: {
        position: 'bottom' as const,
        labels: { font: { size: 12 }, padding: 20 }
      }
    },
    maintainAspectRatio: false
  };

  if (!currentScenario) return null;

  const availableAlternatives = getAlternativeOptions();

  if (showAdaptivePreference) {
    return (
      <AdaptivePreferenceView 
        onBack={() => setShowAdaptivePreference(false)}
        selectedOption={selectedDecision!}
        mainScenario={currentScenario}
        onConfirm={handleRankedOptionSelect}
      />
    );
  }

  return (
    <div className="h-screen bg-gray-50 p-4 flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold text-gray-800">
            Wildfire Crisis Simulation
          </h1>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Scenario {currentScenario.id} of {scenarios.length}
          </div>
        </div>
        
        <MetricsDisplay metrics={metrics} animatingMetrics={animatingMetrics} />
        
        <div className="bg-white rounded-lg shadow-md p-4 flex-1 flex flex-col overflow-hidden">
          <h2 className="text-lg font-semibold mb-1 text-gray-700">Current Scenario</h2>
          <h3 className="text-base font-medium mb-1 text-gray-800">{currentScenario.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{currentScenario.description}</p>
          
          {priorityMessage && currentScenarioIndex > 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
              <p className="text-sm text-blue-800">{priorityMessage}</p>
            </div>
          )}
          
          {!selectedDecision ? (
            <>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-medium text-gray-800">Select Your Decision</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={handleExploreAlternatives}
                    className={`flex items-center text-center text-sm px-3 py-1.5 rounded-md transition-colors duration-200 ${
                      availableAlternatives.length === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : addedAlternatives.length > 0
                        ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }`}
                    disabled={availableAlternatives.length === 0}
                  >
                    <Lightbulb size={16} className="mr-1.5" />
                    {addedAlternatives.length > 0 
                      ? `Alternative Options (${addedAlternatives.length})` 
                      : 'Explore Alternatives'
                    }
                  </button>
                  <button 
                    onClick={() => setShowRadarChart(true)}
                    className="flex items-center text-center text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md transition-colors duration-200"
                  >
                    <BarChart2 size={16} className="mr-1.5" />
                    View Trade-Off Comparison
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                {[...getInitialOptions(), ...addedAlternatives].map((option) => (
                  <DecisionOption
                    key={option.id}
                    option={option}
                    onSelect={handleDecisionSelect}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center mb-3">
                <h3 className="text-base font-medium text-gray-800 mr-2">Selected Decision:</h3>
                <span className={`px-2 py-1 rounded-md text-sm font-medium ${
                  selectedDecision.isAlternative 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedDecision.title}
                </span>
                <button 
                  onClick={() => setSelectedDecision(null)}
                  className="ml-auto flex items-center text-gray-500 hover:text-gray-700 text-sm"
                >
                  <X size={14} className="mr-1" />
                  Change Selection
                </button>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg mb-3 flex-1 overflow-hidden">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Expert Analysis</h4>
                <ExpertAnalysis decision={selectedDecision} />
              </div>
              
              {showAlternativesHint && (
                <div className="mb-3 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg">
                  <p className="text-sm text-yellow-800">
                    Reviewing alternatives is required before confirmation.
                  </p>
                </div>
              )}
              
              <button
                onClick={handleConfirmAttempt}
                className={`mt-auto font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                  hasExploredAlternatives
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                <Check size={16} className="mr-1" />
                Confirm Decision
              </button>
            </div>
          )}
        </div>
      </div>

      <RadarChart
        showRadarChart={showRadarChart}
        onClose={() => setShowRadarChart(false)}
        currentScenario={{
          options: [...getInitialOptions(), ...addedAlternatives],
          alternativeOptions: []
        }}
        toggledOptions={toggledOptions}
        toggleOption={handleToggleOption}
        prepareRadarChartData={prepareRadarChartData}
        radarOptions={radarOptions}
      />

      <AlternativeDecisionModal
        isOpen={showAlternativesModal}
        onClose={() => setShowAlternativesModal(false)}
        alternativeOptions={availableAlternatives}
        onAddAlternative={handleAddAlternative}
      />

      {selectedDecision?.cvrQuestion && (
        <CVRQuestionModal
          isOpen={showCVRModal}
          onClose={() => {
            setShowCVRModal(false);
            setSelectedDecision(null);
          }}
          question={selectedDecision.cvrQuestion}
          onAnswer={handleCVRAnswer}
        />
      )}

      {isTransitioning && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="text-center max-w-lg mx-auto p-6">
            <Flame className="mx-auto text-orange-500 mb-4 animate-pulse" size={48} />
            <h2 className="text-white text-2xl font-bold mb-4">
              {transitionMessage || "Scenario Complete"}
            </h2>
            {metrics.nuclearPowerStation < 50 && (
              <div className="bg-red-900 bg-opacity-50 p-4 rounded-lg mb-4 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={24} />
                <p className="text-red-200">Nuclear containment breach detected. Emergency protocols activated.</p>
              </div>
            )}
            <p className="text-gray-300 animate-pulse">
              Analyzing situation developments...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationMainPage;