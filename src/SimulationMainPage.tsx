/**
 * SIMULATION MAIN PAGE - WILDFIRE CRISIS SCENARIOS
 *
 * Purpose:
 * - Main simulation interface for 3 wildfire crisis scenarios
 * - Implements decision-making with AI expert agents
 * - Tracks user interactions with CVR and APA mechanisms
 * - Records comprehensive telemetry data for analysis
 * - Calculates cumulative metrics across scenarios
 *
 * Dependencies:
 * - react-router-dom: Navigation
 * - lucide-react: UI icons
 * - chart.js, react-chartjs-2: Radar chart visualization
 * - Multiple custom components: MetricsDisplay, DecisionOption, RadarChart, etc.
 * - scenarios data: 3 pre-defined wildfire scenarios
 * - TrackingManager: Event tracking and telemetry
 * - DatabaseService: Database operations
 *
 * Direct Database Calls:
 * 1. MongoService.insertScenarioInteraction() - Records each interaction in 'scenario_interactions' table
 * 2. MongoService.insertCVRResponse() - Records CVR responses in 'cvr_responses' table
 * 3. MongoService.insertAPAReordering() - Records value reordering in 'apa_reorderings' table
 * 4. MongoService.insertFinalDecision() - Records final decisions in 'final_decisions' table
 * 5. MongoService.insertValueEvolution() - Records value changes in 'value_evolution' table
 *
 * Data Read from localStorage:
 * - 'finalValues': Top matched stable values from ValuesPage
 * - 'explicitValues': Baseline explicit value choices
 *
 * Data Stored in localStorage (simulation outcomes):
 * - 'simulationScenarioOutcomes': Array of {scenarioId, decision, topTwoValuesAtDecision}
 * - 'finalSimulationMetrics': Final cumulative metrics
 * - 'sessionEventLogs': Complete telemetry event log
 * - 'ScenariosFinalDecisionLabels': Array of decision labels per scenario
 * - 'CheckingAlignmentList': Array of "Aligned"/"Not Aligned" per scenario
 * - 'MoralValuesReorderList': Final reordered moral values list
 * - 'Scenario1/2/3_MoralValueReordered': Per-scenario reordered values
 * - 'Scenario3_InfeasibleOptions': Infeasible options checked (Scenario 3 only)
 *
 * Data Stored in Database Tables:
 *
 * scenario_interactions: Every user interaction event
 * - session_id, scenario_id, event_type (option_selected, confirmed, radar_viewed, etc.)
 * - option details, is_aligned, time_since_start, switch_count
 *
 * cvr_responses: CVR question answers
 * - session_id, scenario_id, cvr_question, user_answer (yes/no)
 * - response_time_ms, decision_changed_after
 *
 * apa_reorderings: Value reordering events
 * - session_id, scenario_id, preference_type (moral_values/simulation_metrics)
 * - values_before, values_after (JSONB arrays)
 *
 * final_decisions: Confirmed decisions per scenario
 * - session_id, scenario_id, option details, is_aligned
 * - total_switches, total_time_seconds
 * - cvr_visited, cvr_visit_count, cvr_yes_answers
 * - apa_reordered, apa_reorder_count
 * - final_metrics (JSONB), infeasible_options_checked (JSONB)
 *
 * value_evolution: Changes in value priorities
 * - session_id, value_list_snapshot (JSONB)
 * - change_trigger, change_type
 *
 * Flow Position: Step 7 of 13 (Core simulation phase)
 * Previous Page: /tutorial
 * Next Page: /thank-you
 *
 * Key Features:
 * - 3 Sequential wildfire scenarios
 * - AI expert agents (Safety, Efficiency, Fairness, Sustainability, Nonmaleficence)
 * - CVR (Cognitive Value Recontextualization) mechanism
 * - APA (Adaptive Preference Alignment) mechanism
 * - Real-time metrics visualization
 * - Comprehensive event tracking
 * - Value alignment checking
 *
 * Notes:
 * - Most complex component in application
 * - Generates majority of research data
 * - Uses TrackingManager for centralized logging
 * - Automatic database saves with localStorage fallback
 * - Scenario 3 includes infeasible options feature
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Check, BarChart2, Lightbulb, X, AlertTriangle, Eye } from 'lucide-react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import MetricsDisplay from './components/MetricsDisplay';
import DecisionOption from './components/DecisionOption';
import ExpertAnalysisModal from './components/ExpertAnalysisModal';
import DecisionSummaryModal from './components/DecisionSummaryModal';
import RadarChart from './components/RadarChart';
import AlternativeDecisionModal from './components/AlternativeDecisionModal';
import CVRQuestionModal from './components/CVRQuestionModal';
import AdaptivePreferenceView from './components/AdaptivePreferenceView';
import CollapsibleHelpMessage from './components/CollapsibleHelpMessage';
import ReviewOptionModal from './components/ReviewOptionModal';
import { SimulationMetrics, DecisionOption as DecisionOptionType, ExplicitValue } from './types';
import { scenarios } from './data/scenarios';
import { TrackingManager } from './utils/trackingUtils';
import { MongoService } from './lib/mongoService';

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
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [showDecisionSummary, setShowDecisionSummary] = useState(false);
  const [tempSelectedOption, setTempSelectedOption] = useState<DecisionOptionType | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewOption, setReviewOption] = useState<DecisionOptionType | null>(null);
  const [addedAlternatives, setAddedAlternatives] = useState<DecisionOptionType[]>([]);
  const [toggledOptions, setToggledOptions] = useState<{[key: string]: boolean}>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState<string | null>(null);
  const [hasAccessedRankedView, setHasAccessedRankedView] = useState(false);
  const [simulationScenarioOutcomes, setSimulationScenarioOutcomes] = useState<Array<{
    scenarioId: number;
    decision: DecisionOptionType;
  }>>([]);
  const [matchedStableValues, setMatchedStableValues] = useState<string[]>([]);
  const [hasExploredAlternatives, setHasExploredAlternatives] = useState(false);
  const [isFromRankedView, setIsFromRankedView] = useState(false);
  const [showAlternativeNotification, setShowAlternativeNotification] = useState(false);
  const [finalTopTwoValues, setFinalTopTwoValues] = useState<string[]>([]);
  const [alternativesExploredCount, setAlternativesExploredCount] = useState<number>(0);
  const [scenariosFinalDecisionLabels, setScenariosFinalDecisionLabels] = useState<string[]>([]);
  const [checkingAlignmentList, setCheckingAlignmentList] = useState<string[]>([]);
  const [previousScenarioUsedSimulationMetrics, setPreviousScenarioUsedSimulationMetrics] = useState(false);
  const [scenario1MoralValueReordered, setScenario1MoralValueReordered] = useState<string[]>([]);
  const [scenario2MoralValueReordered, setScenario2MoralValueReordered] = useState<string[]>([]);
  const [scenario3MoralValueReordered, setScenario3MoralValueReordered] = useState<string[]>([]);
  const [infeasibleOptionsChecked, setInfeasibleOptionsChecked] = useState<{[key: string]: boolean}>({});

  const currentScenario = scenarios[currentScenarioIndex];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Reset hasExploredAlternatives when scenario changes
  useEffect(() => {
    setHasExploredAlternatives(false);
    setIsFromRankedView(false);

    // Check if previous scenario used simulation metrics reordering
    const prevUsedSimMetrics = localStorage.getItem('previousScenarioUsedSimulationMetrics') === 'true';
    setPreviousScenarioUsedSimulationMetrics(prevUsedSimMetrics);

    // Reset hasReorderedValues flag for new scenario
    localStorage.setItem('hasReorderedValues', 'false');

    // Reset new reordering flags for new scenario
    localStorage.setItem('simulationMetricsReorderingFlag', 'false');
    localStorage.setItem('moralValuesReorderingFlag', 'false');

    // Reset CVR flags for new scenario
    localStorage.setItem('cvrYesClicked', 'false');
    localStorage.setItem('cvrNoClicked', 'false');

    // Reset alternatives explored counter for new scenario
    setAlternativesExploredCount(0);
    localStorage.setItem('alternativesExploredCount', '0');

    // Reset infeasible options checked for new scenario
    setInfeasibleOptionsChecked({});

    // Initialize flag for first scenario
    if (currentScenarioIndex === 0) {
      localStorage.setItem('selectedFromTop2Previous', 'false');
    }

    // Start tracking for this scenario
    if (currentScenario) {
      TrackingManager.startScenario(currentScenario.id);
    }
  }, [currentScenarioIndex, currentScenario]);

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

    // Initialize FinalTopTwoValues from finalValues before simulation starts
    const savedMatchedValues = localStorage.getItem('finalValues');
    if (savedMatchedValues && currentScenarioIndex === 0) {
      try {
        const parsedValues = JSON.parse(savedMatchedValues);
        const topTwoValues = parsedValues.slice(0, 2).map((v: any) => v.name.toLowerCase());
        setFinalTopTwoValues(topTwoValues);
        localStorage.setItem('FinalTopTwoValues', JSON.stringify(topTwoValues));
      } catch (error) {
        console.error('Error initializing FinalTopTwoValues:', error);
      }
    }

    // Load matched stable values from localStorage
    const moralValuesReorder = localStorage.getItem('MoralValuesReorderList');

    // Check if previous scenario used simulation metrics reordering
    const prevUsedSimMetrics = localStorage.getItem('previousScenarioUsedSimulationMetrics') === 'true';

    // If previous scenario used simulation metrics, use FinalTopTwoValues as matched values
    if (prevUsedSimMetrics && currentScenarioIndex > 0) {
      const finalTopTwo = localStorage.getItem('FinalTopTwoValues');
      if (finalTopTwo) {
        try {
          const topTwoValues = JSON.parse(finalTopTwo);
          setMatchedStableValues(topTwoValues);
          console.log('Using FinalTopTwoValues as matched stable values:', topTwoValues);
        } catch (error) {
          console.error('Error parsing FinalTopTwoValues:', error);
          setMatchedStableValues([]);
        }
      }
    } else if (moralValuesReorder && currentScenarioIndex > 0) {
      // If user has reordered moral values, use those instead of original matched values
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

    // HIGHEST PRIORITY: Check if previous scenario used simulation metrics reordering
    // If true, use FinalTopTwoValues for initial options
    const prevUsedSimMetrics = localStorage.getItem('previousScenarioUsedSimulationMetrics') === 'true';
    if (prevUsedSimMetrics && currentScenarioIndex > 0) {
      const finalTopTwo = localStorage.getItem('FinalTopTwoValues');
      if (finalTopTwo) {
        try {
          const topTwoValues = JSON.parse(finalTopTwo);
          console.log('Previous scenario used simulation metrics. Using FinalTopTwoValues for initial options:', topTwoValues);

          // Find options that match FinalTopTwoValues
          const matchingOptions = currentScenario.options.filter(option =>
            topTwoValues.includes(option.label.toLowerCase())
          );

          // Sort matching options to maintain the order from FinalTopTwoValues
          const sortedMatchingOptions = matchingOptions.sort((a, b) => {
            const aIndex = topTwoValues.indexOf(a.label.toLowerCase());
            const bIndex = topTwoValues.indexOf(b.label.toLowerCase());
            return aIndex - bIndex;
          });

          if (sortedMatchingOptions.length >= 2) {
            console.log('Found 2+ matching options from FinalTopTwoValues:', sortedMatchingOptions.map(o => o.label));
            return sortedMatchingOptions.slice(0, 2);
          } else if (sortedMatchingOptions.length === 1) {
            // If only one matching option, add the best remaining option
            const remainingOptions = currentScenario.options.filter(option =>
              !topTwoValues.includes(option.label.toLowerCase())
            );
            console.log('Found 1 matching option from FinalTopTwoValues, adding best remaining:', [sortedMatchingOptions[0].label, remainingOptions[0]?.label]);
            return [sortedMatchingOptions[0], remainingOptions[0]];
          }
        } catch (error) {
          console.error('Error parsing FinalTopTwoValues:', error);
        }
      }
    }

    // SECOND PRIORITY: Check for reordered moral values (including CVR updates)
    const moralValuesReorder = localStorage.getItem('MoralValuesReorderList');
    const simulationMetricsReorder = localStorage.getItem('SimulationMetricsReorderList');

    if (moralValuesReorder) {
      try {
        const reorderedValues = JSON.parse(moralValuesReorder);
        const topValues = reorderedValues.slice(0, 2).map((v: any) => v.id.toLowerCase());
        
        console.log('Using reordered moral values for initial options:', topValues);
        
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
          console.log('Found 2+ matching options:', sortedMatchingOptions.map(o => o.label));
          return sortedMatchingOptions.slice(0, 2);
        } else if (sortedMatchingOptions.length === 1) {
          // If only one matching option, add the best remaining option
          const remainingOptions = currentScenario.options.filter(option => 
            !topValues.includes(option.label.toLowerCase())
          );
          console.log('Found 1 matching option, adding best remaining:', [sortedMatchingOptions[0].label, remainingOptions[0]?.label]);
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

  const handleReviewOption = (option: DecisionOptionType) => {
    setReviewOption(option);
    setShowReviewModal(true);
  };

  const handleDecisionSelect = (decision: DecisionOptionType) => {
    const optionValue = decision.label.toLowerCase();
    const isAligned = matchedStableValues.includes(optionValue);

    // Track option selection
    TrackingManager.recordOptionSelection(decision.id, decision.label, isAligned);

    // Mark that this selection is NOT from ranked view
    setIsFromRankedView(false);

    setTempSelectedOption(decision);
    setShowExpertModal(true);
  };

  const handleKeepChoice = () => {
    if (!tempSelectedOption) return;
    
    setShowExpertModal(false);
    
    // Check if the selected option's value matches user's stable values
    const optionValue = tempSelectedOption.label.toLowerCase();
    const isAligned = matchedStableValues.includes(optionValue);
    
    // If the option is aligned with user's values, update the MoralValuesReorderList
    if (isAligned) {
      // Get current matched stable values and moral values reorder list
      const savedMatchedValues = localStorage.getItem('finalValues');
      const existingMoralValuesReorder = localStorage.getItem('MoralValuesReorderList');
      let allAvailableValues: Array<{id: string, label: string}> = [];
      
      // First, try to get from existing reorder list
      if (existingMoralValuesReorder) {
        try {
          allAvailableValues = JSON.parse(existingMoralValuesReorder);
        } catch (error) {
          console.error('Error parsing existing MoralValuesReorderList:', error);
        }
      }
      
      // If no existing reorder list, get from matched stable values
      if (savedMatchedValues && allAvailableValues.length === 0) {
        try {
          const parsedValues = JSON.parse(savedMatchedValues);
          allAvailableValues = parsedValues.map((v: any) => ({
            id: v.name.toLowerCase(),
            label: v.name
          }));
        } catch (error) {
          console.error('Error parsing matched stable values:', error);
        }
      }
      
      // Remove the selected value from its current position and add it to the top
      const filteredValues = allAvailableValues.filter(v => v.id !== optionValue);
      const newMoralValuesReorderList = [
        { id: optionValue, label: tempSelectedOption.label },
        ...filteredValues
      ];
      
      // Save to localStorage
      localStorage.setItem('MoralValuesReorderList', JSON.stringify(newMoralValuesReorderList));
      
      // Update the matched stable values to reflect the new priority
      setMatchedStableValues(prev => {
        const updated = [optionValue, ...prev.filter(v => v !== optionValue)];
        return updated;
      });
      
      console.log('Updated MoralValuesReorderList for aligned choice:', newMoralValuesReorderList);
    }
    
    if (!isAligned) {
      setSelectedDecision(tempSelectedOption);
      if (currentScenario.id === 3) {
        setShowDecisionSummary(true);
      } else {
        setShowAdaptivePreference(true);
      }
    } else {
      setSelectedDecision(tempSelectedOption);
      setShowDecisionSummary(true);
    }
    setTempSelectedOption(null);
  };

  const handleReviewAlternatives = () => {
    setShowExpertModal(false);
    setShowDecisionSummary(false);
    setHasExploredAlternatives(true);
    setShowAlternativesModal(true);
    setTempSelectedOption(null);
  };

  const handleCVRAnswer = (answer: boolean) => {
    setShowCVRModal(false);

    // Set CVR flags based on answer and persist to localStorage
    if (answer) {
      localStorage.setItem('cvrYesClicked', 'true');
      localStorage.setItem('cvrNoClicked', 'false');

      // Increment counter for cvrYesClicked
      const currentCount = localStorage.getItem('cvrYesClickedCount');
      const newCount = currentCount ? parseInt(currentCount) + 1 : 1;
      localStorage.setItem('cvrYesClickedCount', newCount.toString());
    } else {
      localStorage.setItem('cvrYesClicked', 'false');
      localStorage.setItem('cvrNoClicked', 'true');

      // Increment counter for cvrNoClicked
      const currentCount = localStorage.getItem('cvrNoClickedCount');
      const newCount = currentCount ? parseInt(currentCount) + 1 : 1;
      localStorage.setItem('cvrNoClickedCount', newCount.toString());
    }

    // Track CVR answer
    if (selectedDecision) {
      TrackingManager.recordCVRAnswer(
        currentScenario.id,
        answer,
        selectedDecision.id,
        selectedDecision.label,
        selectedDecision.cvrQuestion
      );
    }

    if (answer) {
      // User confirmed their choice - show decision summary
      // Note: MoralValuesReorderList will be updated when decision is actually confirmed
      setShowDecisionSummary(true);
    } else {
      // User rejected their choice, show adaptive preference view
      setShowAdaptivePreference(true);

      // Note: APA tracking will be done when user actually reorders in AdaptivePreferenceView
      // For scenario 3, no reordering is needed as it's the last scenario
    }
  };

  const handleAddAlternative = (option: DecisionOptionType) => {
    setAddedAlternatives(prev => [...prev, { ...option, isAlternative: true }]);
    setShowAlternativesModal(false);

    // Increment alternatives explored counter
    const newCount = alternativesExploredCount + 1;
    setAlternativesExploredCount(newCount);
    localStorage.setItem('alternativesExploredCount', newCount.toString());

    // Track alternative added
    TrackingManager.recordAlternativeAdded(currentScenario.id, option.id, option.label);

    // Show notification bubble
    setShowAlternativeNotification(true);

    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setShowAlternativeNotification(false);
    }, 5000);
  };

  const handleExploreAlternatives = () => {
    setHasExploredAlternatives(true);

    // Track alternatives explored
    if (currentScenario) {
      TrackingManager.recordAlternativesExplored(currentScenario.id);
    }

    setShowAlternativesModal(true);
  };

  const handleConfirmDecision = () => {
    if (!hasExploredAlternatives) {
      return; // This should be handled by the modal's disabled state
    }

    if (!selectedDecision) return;

    setShowDecisionSummary(false);

    const newMetrics = {
      livesSaved: metrics.livesSaved + selectedDecision.impact.livesSaved,
      humanCasualties: metrics.humanCasualties + selectedDecision.impact.humanCasualties,
      firefightingResource: Math.max(0, metrics.firefightingResource + selectedDecision.impact.firefightingResource),
      infrastructureCondition: Math.max(0, metrics.infrastructureCondition + selectedDecision.impact.infrastructureCondition),
      biodiversityCondition: Math.max(0, metrics.biodiversityCondition + selectedDecision.impact.biodiversityCondition),
      propertiesCondition: Math.max(0, metrics.propertiesCondition + selectedDecision.impact.propertiesCondition),
      nuclearPowerStation: Math.max(0, metrics.nuclearPowerStation + selectedDecision.impact.nuclearPowerStation),
    };

    // Track option confirmation
    const optionValue = selectedDecision.label.toLowerCase();
    const isAligned = matchedStableValues.includes(optionValue);

    const flagsAtConfirmation = {
      hasReorderedValues: localStorage.getItem('hasReorderedValues') === 'true',
      cvrYesClicked: localStorage.getItem('cvrYesClicked') === 'true',
      cvrNoClicked: localStorage.getItem('cvrNoClicked') === 'true',
      simulationMetricsReorderingFlag: localStorage.getItem('simulationMetricsReorderingFlag') === 'true',
      moralValuesReorderingFlag: localStorage.getItem('moralValuesReorderingFlag') === 'true'
    };

    const finalTopTwoValuesBeforeUpdate = [...finalTopTwoValues];

    console.log(`[Scenario ${currentScenario.id}] Flags at confirmation:`, flagsAtConfirmation);
    console.log(`[Scenario ${currentScenario.id}] FinalTopTwoValues before update:`, finalTopTwoValuesBeforeUpdate);

    // If user answered "Yes" to CVR question, update MoralValuesReorderList now
    if (flagsAtConfirmation.cvrYesClicked && !isAligned) {
      const selectedValue = selectedDecision.label.toLowerCase();

      // Get current matched stable values and moral values reorder list
      const savedMatchedValues = localStorage.getItem('finalValues');
      const existingMoralValuesReorder = localStorage.getItem('MoralValuesReorderList');
      let allAvailableValues: Array<{id: string, label: string}> = [];

      // First, try to get from existing reorder list
      if (existingMoralValuesReorder) {
        try {
          allAvailableValues = JSON.parse(existingMoralValuesReorder);
        } catch (error) {
          console.error('Error parsing existing MoralValuesReorderList:', error);
        }
      }

      // If no existing reorder list, get from matched stable values
      if (savedMatchedValues && allAvailableValues.length === 0) {
        try {
          const parsedValues = JSON.parse(savedMatchedValues);
          allAvailableValues = parsedValues.map((v: any) => ({
            id: v.name.toLowerCase(),
            label: v.name
          }));
        } catch (error) {
          console.error('Error parsing matched stable values:', error);
        }
      }

      // Remove the selected value from its current position and add it to the top
      const filteredValues = allAvailableValues.filter(v => v.id !== selectedValue);
      const newMoralValuesReorderList = [
        { id: selectedValue, label: selectedDecision.label },
        ...filteredValues
      ];

      // Save to localStorage
      localStorage.setItem('MoralValuesReorderList', JSON.stringify(newMoralValuesReorderList));

      // Update the matched stable values to reflect the new priority
      setMatchedStableValues(prev => {
        const updated = [selectedValue, ...prev.filter(v => v !== selectedValue)];
        return updated;
      });

      console.log('Updated MoralValuesReorderList at confirmation:', newMoralValuesReorderList);
    }

    TrackingManager.confirmOption(
      selectedDecision.id,
      selectedDecision.label,
      isAligned,
      newMetrics,
      flagsAtConfirmation,
      finalTopTwoValuesBeforeUpdate
    );

    // BEFORE updating FinalTopTwoValues, track the final decision value and check alignment
    const finalDecisionValue = selectedDecision.label.toLowerCase();

    // 1. Add to ScenariosFinalDecisionLabels list
    const updatedDecisionLabels = [...scenariosFinalDecisionLabels, finalDecisionValue];
    setScenariosFinalDecisionLabels(updatedDecisionLabels);
    localStorage.setItem('ScenariosFinalDecisionLabels', JSON.stringify(updatedDecisionLabels));

    // 2. Check alignment BEFORE updating FinalTopTwoValues
    const alignmentStatus = finalTopTwoValues.includes(finalDecisionValue) ? 'Aligned' : 'Misaligned';
    const updatedAlignmentList = [...checkingAlignmentList, alignmentStatus];
    setCheckingAlignmentList(updatedAlignmentList);
    localStorage.setItem('CheckingAlignmentList', JSON.stringify(updatedAlignmentList));

    console.log(`Scenario ${currentScenario.id} - Final Decision: ${finalDecisionValue}, Alignment: ${alignmentStatus}`);
    console.log('Current FinalTopTwoValues (before update):', finalTopTwoValues);
    console.log('Updated ScenariosFinalDecisionLabels:', updatedDecisionLabels);
    console.log('Updated CheckingAlignmentList:', updatedAlignmentList);

    // Capture MoralValuesReorderList for this scenario if moralValuesReorderingFlag is true
    if (flagsAtConfirmation.moralValuesReorderingFlag) {
      const moralValuesReorderList = localStorage.getItem('MoralValuesReorderList');
      if (moralValuesReorderList) {
        try {
          const parsedList = JSON.parse(moralValuesReorderList);
          const valuesList = parsedList.map((item: any) => item.id || item.label || item);

          if (currentScenario.id === 1) {
            setScenario1MoralValueReordered(valuesList);
            localStorage.setItem('Scenario1_MoralValueReordered', JSON.stringify(valuesList));
            console.log('Captured Scenario1_MoralValueReordered:', valuesList);
          } else if (currentScenario.id === 2) {
            setScenario2MoralValueReordered(valuesList);
            localStorage.setItem('Scenario2_MoralValueReordered', JSON.stringify(valuesList));
            console.log('Captured Scenario2_MoralValueReordered:', valuesList);
          } else if (currentScenario.id === 3) {
            setScenario3MoralValueReordered(valuesList);
            localStorage.setItem('Scenario3_MoralValueReordered', JSON.stringify(valuesList));
            console.log('Captured Scenario3_MoralValueReordered:', valuesList);
          }
        } catch (error) {
          console.error('Error capturing MoralValuesReorderList for scenario:', error);
        }
      }
    } else {
      // If flag is false, store empty list for this scenario
      if (currentScenario.id === 1) {
        setScenario1MoralValueReordered([]);
        localStorage.setItem('Scenario1_MoralValueReordered', JSON.stringify([]));
        console.log('Scenario1_MoralValueReordered set to empty (flag is false)');
      } else if (currentScenario.id === 2) {
        setScenario2MoralValueReordered([]);
        localStorage.setItem('Scenario2_MoralValueReordered', JSON.stringify([]));
        console.log('Scenario2_MoralValueReordered set to empty (flag is false)');
      } else if (currentScenario.id === 3) {
        setScenario3MoralValueReordered([]);
        localStorage.setItem('Scenario3_MoralValueReordered', JSON.stringify([]));
        console.log('Scenario3_MoralValueReordered set to empty (flag is false)');
      }
    }

    // Update FinalTopTwoValues after confirming decision
    // Logic depends on which reordering flag is active
    if (flagsAtConfirmation.simulationMetricsReorderingFlag) {
      // If Simulation Metrics was used, don't update FinalTopTwoValues
      console.log('Skipping FinalTopTwoValues update because simulationMetricsReorderingFlag is true');
      console.log('FinalTopTwoValues remains:', finalTopTwoValues);

      // Set flag for next scenario to use FinalTopTwoValues for initial options
      localStorage.setItem('previousScenarioUsedSimulationMetrics', 'true');
    } else if (flagsAtConfirmation.moralValuesReorderingFlag) {
      // If Moral Values was used, replace FinalTopTwoValues with top 2 from MoralValuesReorderList
      const moralValuesReorderList = localStorage.getItem('MoralValuesReorderList');
      if (moralValuesReorderList) {
        try {
          const parsedList = JSON.parse(moralValuesReorderList);
          const topTwoMoralValues = parsedList.slice(0, 2).map((item: any) => item.id || item.label || item);

          setFinalTopTwoValues(topTwoMoralValues);
          localStorage.setItem('FinalTopTwoValues', JSON.stringify(topTwoMoralValues));
          console.log('Updated FinalTopTwoValues with top 2 from MoralValuesReorderList:', topTwoMoralValues);
        } catch (error) {
          console.error('Error parsing MoralValuesReorderList:', error);
        }
      } else {
        console.log('MoralValuesReorderList not found in localStorage');
      }
    } else {
      // Default behavior: add the decision value to the top
      const updatedTopTwoValues = [
        finalDecisionValue,
        ...finalTopTwoValues.filter(v => v !== finalDecisionValue)
      ].slice(0, 2); // Keep only top 2

      setFinalTopTwoValues(updatedTopTwoValues);
      localStorage.setItem('FinalTopTwoValues', JSON.stringify(updatedTopTwoValues));
      console.log('Updated FinalTopTwoValues with final decision:', updatedTopTwoValues);

      // Clear the flag since we're not using simulation metrics
      localStorage.setItem('previousScenarioUsedSimulationMetrics', 'false');
    }

    // Set flag based on whether this decision came from ranked view top 2
    localStorage.setItem('selectedFromTop2Previous', isFromRankedView.toString());

    // Store the scenario outcome with top two values at this moment
    const outcome = {
      scenarioId: currentScenario.id,
      decision: selectedDecision,
      topTwoValuesAtDecision: finalTopTwoValues
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

    // End scenario tracking
    const scenarioTracking = TrackingManager.endScenario();

    // Save final decision to database
    const sessionId = MongoService.getSessionId();
    if (scenarioTracking) {
      // For scenario 3, collect all infeasible options and which were checked
      let allInfeasibleOptions: any[] = [];
      const infeasibleOptionsData = currentScenario.id === 3 ?
        Object.entries(infeasibleOptionsChecked)
          .filter(([_, checked]) => checked)
          .map(([optionId, _]) => {
            const option = [...getInitialOptions(), ...addedAlternatives].find(o => o.id === optionId);
            return option ? {
              id: option.id,
              label: option.label,
              title: option.title
            } : null;
          })
          .filter(opt => opt !== null) : [];

      // Collect all infeasible options for scenario 3
      if (currentScenario.id === 3) {
        const allOptions = [...getInitialOptions(), ...addedAlternatives];
        allInfeasibleOptions = allOptions
          .filter(option => {
            const insufficientResources: any[] = [];
            if (metrics.firefightingResource + option.impact.firefightingResource < 0) {
              insufficientResources.push('Resources');
            }
            if (metrics.infrastructureCondition + option.impact.infrastructureCondition < 0) {
              insufficientResources.push('Infrastructure');
            }
            if (metrics.biodiversityCondition + option.impact.biodiversityCondition < 0) {
              insufficientResources.push('Biodiversity');
            }
            if (metrics.propertiesCondition + option.impact.propertiesCondition < 0) {
              insufficientResources.push('Properties');
            }
            return insufficientResources.length > 0;
          })
          .map(option => ({
            id: option.id,
            label: option.label,
            title: option.title,
            checked: infeasibleOptionsChecked[option.id] || false
          }));

        // Save to localStorage for ViewResultsPage
        localStorage.setItem('Scenario3_InfeasibleOptions', JSON.stringify(allInfeasibleOptions));
      }

      MongoService.insertFinalDecision({
        session_id: sessionId,
        scenario_id: currentScenario.id,
        scenario_title: currentScenario.title,
        option_id: selectedDecision.id,
        option_label: selectedDecision.label,
        option_title: selectedDecision.title,
        is_aligned: isAligned,
        from_top_two_ranked: isFromRankedView,
        total_switches: scenarioTracking.switchCount,
        total_time_seconds: Math.round((scenarioTracking.endTime! - scenarioTracking.startTime) / 1000),
        cvr_visited: scenarioTracking.cvrVisited,
        cvr_visit_count: scenarioTracking.cvrVisitCount,
        cvr_yes_answers: scenarioTracking.cvrYesAnswers,
        apa_reordered: scenarioTracking.apaReordered,
        apa_reorder_count: scenarioTracking.apaReorderCount,
        alternatives_explored: scenarioTracking.alternativesExplored,
        final_metrics: newMetrics,
        infeasible_options_checked: currentScenario.id === 3 ? allInfeasibleOptions : infeasibleOptionsData
      });
    }

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
      setHasExploredAlternatives(false);
    } else {
      localStorage.setItem('finalSimulationMetrics', JSON.stringify(newMetrics));

      const telemetryEvent = {
        event: 'scenario_completed',
        scenarioId: currentScenario.id,
        optionId: selectedDecision.id,
        timestamp: new Date().toISOString(),
        finalMetrics: newMetrics
      };

      const existingLogs = JSON.parse(localStorage.getItem('sessionEventLogs') || '[]');
      existingLogs.push(telemetryEvent);
      localStorage.setItem('sessionEventLogs', JSON.stringify(existingLogs));

      navigate('/thank-you');
    }
  };

  const handleRankedOptionSelect = (option: DecisionOptionType, isTop2: boolean) => {
    setShowAdaptivePreference(false);
    // Reset the selected decision state to null to show the main simulation UI
    setSelectedDecision(null);
    setSelectedDecision(option);
    setIsFromRankedView(isTop2);
    setShowDecisionSummary(true);
  };

  const handleInfeasibleCheck = (option: DecisionOptionType, checked: boolean) => {
    setInfeasibleOptionsChecked(prev => ({
      ...prev,
      [option.id]: checked
    }));
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
        onBack={() => {
          setShowAdaptivePreference(false);
          setSelectedDecision(null);
        }}
        selectedOption={selectedDecision!}
        mainScenario={currentScenario}
        onConfirm={handleRankedOptionSelect}
        scenarioId={currentScenario.id}
        isLastScenario={currentScenarioIndex === scenarios.length - 1}
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

        <CollapsibleHelpMessage
          id="cumulative-metrics"
          title="Understanding Your Cumulative Metrics"
        >
          <p>
            <strong>These metrics track your performance across all scenarios.</strong> Each decision you make will affect these cumulative scores, and they carry forward to subsequent scenarios.
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Lives Saved:</strong> Total lives protected by your decisions (higher is better)</li>
            <li><strong>Resources & Infrastructure:</strong> Remaining capacity and condition (maintain above 30%)</li>
            <li><strong>Environmental Impact:</strong> Biodiversity and nuclear safety (protect whenever possible)</li>
          </ul>
          <p className="mt-2 font-medium">
            Your goal is to balance these competing priorities while making ethical decisions under pressure.
          </p>
        </CollapsibleHelpMessage>

        <MetricsDisplay metrics={metrics} animatingMetrics={animatingMetrics} />

        <CollapsibleHelpMessage
          id="scenario-context"
          title="Understanding the Current Scenario"
        >
          <p>
            Each scenario presents a <strong>unique wildfire crisis</strong> requiring immediate action. Read the scenario description carefully to understand:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>The immediate threat and what's at stake</li>
            <li>The context and constraints you're facing</li>
            <li>Why this decision matters for the overall crisis</li>
          </ul>
        </CollapsibleHelpMessage>

        <div className="bg-gradient-to-br from-teal-50 via-teal-100 to-cyan-50 border-2 border-teal-300 rounded-lg shadow-lg p-3 mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-1 text-teal-700">Current Scenario</h2>
          <h3 className="text-lg font-bold mb-1 text-teal-900" style={{ fontFamily: 'Georgia, serif' }}>{currentScenario.title}</h3>
          <p className="text-sm text-teal-800 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>{currentScenario.description}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 flex-1 flex flex-col overflow-hidden">

          {!selectedDecision ? (
            <>
              <CollapsibleHelpMessage
                id="decision-options"
                title="How to Evaluate Your Options"
              >
                <p>
                  <strong>Each option card shows the immediate impact</strong> of that decision on your cumulative metrics. Consider:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Trade-offs:</strong> Most decisions involve sacrificing some values for others</li>
                  <li><strong>Expert opinions:</strong> Click any option to see what experts recommend</li>
                </ul>
                <p className="mt-2">
                  <strong>Click "View Trade-Off Comparison"</strong> below to visualize how options differ across all metrics.
                </p>
              </CollapsibleHelpMessage>

              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-medium text-gray-800">Select Your Decision</h3>
              </div>

              <div className="relative">
                {showAlternativeNotification && (
                  <div className="mb-3 bg-gradient-to-r from-cyan-50 to-teal-50 border-2 border-cyan-300 rounded-lg p-3 shadow-lg animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-cyan-400 text-white rounded-full p-1.5">
                          <Lightbulb size={16} />
                        </div>
                        <p className="text-cyan-900 font-medium text-sm">
                          ✨ New alternative added! Scroll down to see it below.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowAlternativeNotification(false)}
                        className="text-cyan-600 hover:text-cyan-800 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                  {[...getInitialOptions(), ...addedAlternatives].map((option) => (
                    <DecisionOption
                      key={option.id}
                      option={option}
                      onSelect={handleDecisionSelect}
                      onReview={handleReviewOption}
                      currentMetrics={metrics}
                      scenarioIndex={currentScenarioIndex}
                      hasExploredAlternatives={hasExploredAlternatives}
                      onInfeasibleCheck={handleInfeasibleCheck}
                      isInfeasibleChecked={infeasibleOptionsChecked[option.id] || false}
                    />
                  ))}
                </div>

                <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-4 mt-4 -mx-4 px-4 pb-2">
                  {currentScenarioIndex === 0 && (
                    <CollapsibleHelpMessage
                      id="explore-alternatives"
                      title="Important: Explore All Alternatives Before Deciding"
                    >
                      <p>
                        <strong>You must explore alternatives before confirming any decision.</strong> This ensures you've considered all available options.
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li><strong>Explore Alternatives:</strong> View additional options beyond the initial two</li>
                        <li><strong>Add Alternative to Decision List:</strong> Bring alternative options into your main view</li>
                        <li><strong>Compare visually:</strong> Use the Trade-Off Comparison tool to see Radar Charts, Bar Charts, and Differences</li>
                      </ul>
                      <p className="mt-2 font-medium">
                        After exploring, you can proceed with any option that best aligns with your values.
                      </p>
                    </CollapsibleHelpMessage>
                  )}
                  <div className="flex flex-col gap-2 relative">
                    <button
                      onClick={handleExploreAlternatives}
                      className={`w-full flex items-center justify-center text-center text-base font-semibold px-6 py-3.5 rounded-lg transition-all duration-300 relative ${
                        availableAlternatives.length === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : hasExploredAlternatives
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                          : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 animate-pulse shadow-xl shadow-purple-400/50'
                      }`}
                      disabled={availableAlternatives.length === 0}
                    >
                      {hasExploredAlternatives ? (
                        <Eye size={20} className="mr-2" />
                      ) : (
                        <Lightbulb size={20} className="mr-2" />
                      )}
                      {hasExploredAlternatives
                        ? `Alternatives Reviewed ${addedAlternatives.length > 0 ? `(${addedAlternatives.length} added)` : ''}`
                        : 'Explore Alternatives'
                      }
                      {!hasExploredAlternatives && availableAlternatives.length > 0 && (
                        <>
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full animate-ping"></span>
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full"></span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setShowRadarChart(true)}
                      className="w-full flex items-center justify-center text-center text-base font-semibold bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700 px-6 py-3.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <BarChart2 size={20} className="mr-2" />
                      View Trade-Off Comparison
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <ExpertAnalysisModal
        isOpen={showExpertModal}
        onClose={() => {
          setShowExpertModal(false);
          setTempSelectedOption(null);
        }}
        option={tempSelectedOption!}
        onKeepChoice={handleKeepChoice}
        onReviewAlternatives={handleReviewAlternatives}
        isAligned={tempSelectedOption ? matchedStableValues.includes(tempSelectedOption.label.toLowerCase()) : false}
        hasExploredAlternatives={hasExploredAlternatives}
      />

      <DecisionSummaryModal
        isOpen={showDecisionSummary}
        onClose={() => {
          setShowDecisionSummary(false);
          setSelectedDecision(null);
        }}
        option={selectedDecision!}
        onConfirmDecision={handleConfirmDecision}
        canConfirm={hasExploredAlternatives}
        onReviewAlternatives={handleExploreAlternatives}
        showMisalignmentWarning={currentScenario.id === 3 && selectedDecision ? !matchedStableValues.includes(selectedDecision.label.toLowerCase()) : false}
        scenarioNumber={currentScenario.id}
        matchedStableValues={matchedStableValues}
      />

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

      {reviewOption && (
        <ReviewOptionModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setReviewOption(null);
          }}
          option={reviewOption}
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