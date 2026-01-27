/**
 * FEEDBACK PAGE - COMPREHENSIVE FEEDBACK COLLECTION
 *
 * Purpose:
 * - Collects detailed feedback on simulation experience
 * - Includes CVR (Cognitive Value Recontextualization) feedback
 * - Includes APA (Adaptive Preference Alignment) feedback
 * - Includes Visualization/Expert Analysis feedback
 * - Includes Overall experience feedback
 * - Contains embedded "Final Analysis Report" modal (one of the 4 key pages)
 * - Calculates and displays session metrics
 * - Exports data in JSON/CSV format
 *
 * Dependencies:
 * - react-router-dom: Navigation
 * - lucide-react: UI icons
 * - chart.js, react-chartjs-2: Chart visualization in modal
 * - SessionDVs, SimulationMetrics types: Data structures
 * - TrackingManager: Event tracking utilities
 * - DatabaseService: Database operations
 * - ValueStabilityTable: Component for stability analysis
 *
 * Direct Database Calls:
 * 1. MongoService.insertSessionFeedback()
 *    - Inserts comprehensive feedback into 'session_feedback' table
 *    - Stores all CVR, APA, visualization, and overall feedback ratings/comments
 *    - Also stores calculated metrics: valueConsistencyIndex, performanceComposite, balanceIndex
 *
 * 2. MongoService.updateUserSession()
 *    - Updates 'user_sessions' table with completion status
 *    - Sets is_completed = true, completed_at timestamp
 *
 * 3. MongoService.syncFallbackData()
 *    - Attempts to sync any failed database insertions from localStorage
 *
 * Data Read from localStorage:
 * - 'simulationScenarioOutcomes': Scenario decisions and outcomes
 * - 'finalSimulationMetrics': Final cumulative metrics
 * - 'finalValues', 'MoralValuesReorderList': Value lists for alignment checking
 * - 'sessionEventLogs': Complete telemetry logs
 * - 'explicitValues', 'deepValues': For Final Analysis modal
 * - 'ScenariosFinalDecisionLabels', 'CheckingAlignmentList': Decision tracking 
 * 
 * Data Stored in localStorage: 
 * - 'sessionResults': Combined metrics and feedback data 
 * 
 * Data Stored in Database (session_feedback table): 
 * CVR Feedback Fields: 
 * - cvr_initial_reconsideration, cvr_final_reconsideration (boolean) 
 * - cvr_purpose_clarity, cvr_confidence_change, cvr_helpfulness (1-7 scale) 
 * - cvr_clarity, cvr_comfort_level, cvr_perceived_value (1-7 scale) 
 * - cvr_overall_impact (1-7 scale) 
 * - cvr_comments (text) 
 * 
 * APA Feedback Fields: 
 * - apa_purpose_clarity, apa_ease_of_use, apa_control_understanding (1-7 scale) 
 * - apa_decision_reflection, apa_scenario_alignment (boolean) 
 * - apa_comparison_usefulness, apa_perspective_value (1-7 scale) 
 * - apa_confidence_after_reordering, apa_perceived_value (1-7 scale) 
 * - apa_tradeoff_challenge, apa_reflection_depth (1-7 scale) 
 * - apa_comments (text) 
 * 
 * Visualization Feedback Fields: 
 * - used_tradeoff_comparison (boolean) 
 * - viz_clarity, viz_usefulness (1-7 scale) 
 * - viz_tradeoff_evaluation, viz_tradeoff_justification (1-7 scale) 
 * - viz_expert_usefulness (1-7 scale) 
 * - viz_helpfulness, viz_expert_confidence_impact (boolean) 
 * - viz_comments (text) 
 * 
 * Overall Feedback Fields: 
 * - overall_scenario_alignment (boolean) 
 * - overall_decision_satisfaction, overall_process_satisfaction (1-7 scale) 
 * - overall_confidence_consistency, overall_learning_insight (1-7 scale) 
 * - overall_comments (text) 
 * 
 * Calculated Metrics Stored: 
 * - value_consistency_index: Percentage of aligned decisions 
 * - performance_composite: Normalized average of all metrics 
 * - balance_index: Measure of balanced decision-making 
 * - cvr_arrivals, cvr_yes_count, cvr_no_count: CVR interaction counts 
 * - apa_reorderings, total_switches, avg_decision_time: Behavioral metrics 
 * - scenarios_final_decision_labels: Array of decision labels 
 * - checking_alignment_list: Array of alignment status 
 * 
 * Flow Position: Step 9 of 13 
 * Previous Page: /thank-you 
 * Next Page: /results-feedback (or /study-complete if feedback submitted) 
 * 
 * Key Features: 
 * - Comprehensive feedback form with 40+ questions 
 * - Real-time metrics calculation and display 
 * - Embedded \"Final Analysis Report\" modal with: 
 *   - Value distribution charts 
 *   - Value stability analysis 
 *   - Decision alignment overview 
 *   - Value consistency trends 
 *   - Final simulation metrics 
 * - Data export functionality (JSON/CSV) 
 * - Links to additional analysis pages (/view-results, /final-analysis) 
 * - Tooltips explaining each mechanism 
 * 
 * Notes: 
 * - Most comprehensive data collection page 
 * - Contains one of the 4 key analysis pages (Final Analysis Modal) 
 * - All feedback stored in single database table 
 * - Export creates downloadable files with complete session data 
 * - Metrics calculated from localStorage event logs 
 * - Database sync ensures no data loss 
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  Download, 
  BarChart2, 
  FileText, 
  ArrowRight, 
  Eye, 
  RefreshCcw, 
  TrendingUp, 
  BarChart3, 
  Lightbulb, 
  Info, 
  X, 
  Scale, 
  Brain, 
  Flame, 
  AlertTriangle, 
  Target, 
  XCircle
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  PointElement, 
  LineElement
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { SessionDVs } from '../types/tracking';
import { SimulationMetrics } from '../types';
import { TrackingManager } from '../utils/trackingUtils';
import { MongoService } from '../lib/mongoService';
import ValueStabilityTable from '../components/ValueStabilityTable';

ChartJS.register( 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend
);

interface FeedbackData {
  cvrInitialReconsideration: boolean | null;
  cvrFinalReconsideration: boolean | null;
  cvrPurposeClarity: number;
  cvrConfidenceChange: number;
  cvrHelpfulness: number;
  cvrClarity: number;
  cvrComfortLevel: number;
  cvrPerceivedValue: number;
  cvrOverallImpact: number;
  cvrComments: string;
  apaPurposeClarity: number;
  apaEaseOfUse: number;
  apaControlUnderstanding: number;
  apaDecisionReflection: boolean | null;
  apaScenarioAlignment: boolean | null;
  apaComparisonUsefulness: number;
  apaPerspectiveValue: number;
  apaConfidenceAfterReordering: number;
  apaPerceivedValue: number;
  apaTradeoffChallenge: number;
  apaReflectionDepth: number;
  apaComments: string;
  usedTradeoffComparison: boolean | null;
  vizClarity: number;
  vizHelpfulness: boolean | null;
  vizUsefulness: number;
  vizTradeoffEvaluation: number;
  vizTradeoffJustification: number;
  vizExpertUsefulness: number;
  vizExpertConfidenceImpact: boolean | null;
  vizComments: string;
  overallScenarioAlignment: boolean | null;
  overallDecisionSatisfaction: number;
  overallProcessSatisfaction: number;
  overallConfidenceConsistency: number;
  overallLearningInsight: number;
  overallComments: string;
}

interface ValueMatch {
  scenarioId: number;
  selectedValue: string;
  matchesExplicit: boolean;
  matchesImplicit: boolean;
  matchesSimulation: boolean;
  stabilityScore: number;
}

interface ValueCount {
  [key: string]: number;
}

interface ValueTrend {
  [key: string]: number[];
}

const MORAL_VALUES = ['Safety', 'Efficiency', 'Sustainability', 'Fairness', 'Nonmaleficence'];

const initializeValueTrends = (): ValueTrend => {
  const trends: ValueTrend = {};
  MORAL_VALUES.forEach(value => {
    trends[value.toLowerCase()] = [];
  });
  return trends;
};

const FeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<FeedbackData>({
    cvrInitialReconsideration: null,
    cvrFinalReconsideration: null,
    cvrPurposeClarity: 4,
    cvrConfidenceChange: 4,
    cvrHelpfulness: 4,
    cvrClarity: 4,
    cvrComfortLevel: 4,
    cvrPerceivedValue: 4,
    cvrOverallImpact: 4,
    cvrComments: '',
    apaPurposeClarity: 4,
    apaEaseOfUse: 4,
    apaControlUnderstanding: 4,
    apaDecisionReflection: null,
    apaScenarioAlignment: null,
    apaComparisonUsefulness: 4,
    apaPerspectiveValue: 4,
    apaConfidenceAfterReordering: 4,
    apaPerceivedValue: 4,
    apaTradeoffChallenge: 4,
    apaReflectionDepth: 4,
    apaComments: '',
    usedTradeoffComparison: null,
    vizClarity: 4,
    vizHelpfulness: null,
    vizUsefulness: 4,
    vizTradeoffEvaluation: 4,
    vizTradeoffJustification: 4,
    vizExpertUsefulness: 4,
    vizExpertConfidenceImpact: null,
    vizComments: '',
    overallScenarioAlignment: null,
    overallDecisionSatisfaction: 4,
    overallProcessSatisfaction: 4,
    overallConfidenceConsistency: 4,
    overallLearningInsight: 4,
    overallComments: ''
  });
  const [showCvrTooltip, setShowCvrTooltip] = useState(false);
  const [showApaTooltip, setShowApaTooltip] = useState(false);
  const [showVizTooltip, setShowVizTooltip] = useState(false);
  const [showOverallTooltip, setShowOverallTooltip] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [metrics, setMetrics] = useState<SessionDVs | null>(null);

  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [explicitValueCounts, setExplicitValueCounts] = useState<ValueCount>({});
  const [implicitValueCounts, setImplicitValueCounts] = useState<ValueCount>({});
  const [valueMatches, setValueMatches] = useState<ValueMatch[]>([]);
  const [finalMetrics, setFinalMetrics] = useState<SimulationMetrics | null>(null);
  const [overallStabilityScore, setOverallStabilityScore] = useState<number>(0);
  const [analysisError, setAnalysisError] = useState(false);
  const [valueTrends, setValueTrends] = useState<ValueTrend>(initializeValueTrends());
  const [explicitValueFrequencies, setExplicitValueFrequencies] = useState<Array<{value: string, count: number, percentage: number}>>([]);
  const [implicitValueFrequencies, setImplicitValueFrequencies] = useState<Array<{value: string, count: number, percentage: number}>>([]);

  useEffect(() => {
    calculateMetrics();
  }, []);

  const calculateMetrics = () => {
    try {
      const simulationOutcomes = JSON.parse(localStorage.getItem('simulationScenarioOutcomes') || '[]');
      const finalMetrics: SimulationMetrics = JSON.parse(localStorage.getItem('finalSimulationMetrics') || 'null');
      const matchedValues = JSON.parse(localStorage.getItem('finalValues') || '[]');
      const moralValuesReorder = localStorage.getItem('MoralValuesReorderList');
      const scenarioHistory = TrackingManager.getScenarioTrackingHistory();
      const allEvents = TrackingManager.getAllEvents();

      if (!simulationOutcomes.length || !finalMetrics) {
        console.error('Missing required data for metrics calculation');
        return;
      }

      const matchedStableValues: string[] = matchedValues.map((v: any) => (v.name || v).toString().toLowerCase());

      let moralValuesReorderList: string[] = [];
      if (moralValuesReorder) {
        try {
          const reorderedValues = JSON.parse(moralValuesReorder);
          moralValuesReorderList = reorderedValues.map((v: any) => (v.id || v.name || v).toString().toLowerCase());
        } catch (e) {
          moralValuesReorderList = matchedStableValues;
        }
      } else {
        moralValuesReorderList = matchedStableValues;
      }

      const cvrOpenEvents = allEvents.filter(e => e.event === 'cvr_opened');
      const cvrArrivals = cvrOpenEvents.length;

      const cvrAnswerEvents = allEvents.filter(e => e.event === 'cvr_answered');
      const cvrYesCount = cvrAnswerEvents.filter(e => e.cvrAnswer === true).length;
      const cvrNoCount = cvrAnswerEvents.filter(e => e.cvrAnswer === false).length;

      const apaEvents = allEvents.filter(e => e.event === 'apa_reordered');
      const apaReorderings = apaEvents.length;

      const decisionTimes: number[] = [];
      const scenarioDetailsMap = new Map<number, any>();

      scenarioHistory.forEach(scenario => {
        if (scenario.endTime && scenario.startTime) {
          const timeSeconds = (scenario.endTime - scenario.startTime) / 1000;
          decisionTimes.push(timeSeconds);

          scenarioDetailsMap.set(scenario.scenarioId, {
            timeSeconds: Math.round(timeSeconds),
            switches: scenario.switchCount || 0,
            cvrVisited: scenario.cvrVisited || false,
            cvrVisitCount: scenario.cvrVisitCount || 0,
            cvrYesAnswers: scenario.cvrYesAnswers || 0,
            apaReordered: scenario.apaReordered || false,
            apaReorderCount: scenario.apaReorderCount || 0
          });
        }
      });

      if (decisionTimes.length === 0) {
        simulationOutcomes.forEach(() => {
          decisionTimes.push(75);
        });
      }

      const avgDecisionTime = decisionTimes.length > 0
        ? decisionTimes.reduce((a, b) => a + b, 0) / decisionTimes.length
        : 0;

      const finalAlignmentByScenario: boolean[] = [];
      const scenarioDetails: SessionDVs['scenarioDetails'] = [];

      simulationOutcomes.forEach((outcome: any, index: number) => {
        const optionValue = (outcome.decision.label || '').toLowerCase();
        const scenarioId = outcome.scenarioId;

        const scenarioCvrVisits = cvrOpenEvents.filter(e => e.scenarioId === outcome.scenarioId);
        const scenarioCvrYesAnswers = cvrAnswerEvents.filter(
          e => e.scenarioId === outcome.scenarioId && e.cvrAnswer === true
        );

        let valueExistsInList = false;
        if (scenarioId === 1) {
          valueExistsInList = matchedStableValues.includes(optionValue);
        } else if (scenarioId === 2 || scenarioId === 3) {
          valueExistsInList = moralValuesReorderList.includes(optionValue);
        }

        const aligned = valueExistsInList && scenarioCvrYesAnswers.length === 0;
        finalAlignmentByScenario.push(aligned);

        const trackingData = scenarioDetailsMap.get(outcome.scenarioId) || {
          timeSeconds: Math.round(decisionTimes[index] || 0),
          switches: 0,
          cvrVisited: false,
          cvrVisitCount: 0,
          cvrYesAnswers: 0,
          apaReordered: false,
          apaReorderCount: 0
        };

        const scenarioOptionSelections = allEvents.filter(
          e => e.event === 'option_selected' && e.scenarioId === outcome.scenarioId
        );
        const switchCount = Math.max(0, scenarioOptionSelections.length - 1);

        const scenarioApaEvents = apaEvents.filter(e => e.scenarioId === outcome.scenarioId);

        scenarioDetails.push({
          scenarioId: outcome.scenarioId,
          finalChoice: outcome.decision.title || outcome.decision.label || 'Unknown',
          aligned,
          switches: trackingData.switches || switchCount,
          timeSeconds: trackingData.timeSeconds,
          cvrVisited: trackingData.cvrVisited || scenarioCvrVisits.length > 0,
          cvrVisitCount: trackingData.cvrVisitCount || scenarioCvrVisits.length,
          cvrYesAnswers: trackingData.cvrYesAnswers || scenarioCvrYesAnswers.length,
          apaReordered: trackingData.apaReordered || scenarioApaEvents.length > 0,
          apaReorderCount: trackingData.apaReorderCount || scenarioApaEvents.length
        });
      });

      const switchCountTotal = scenarioDetails.reduce((sum, s) => sum + s.switches, 0);

      const alignedCount = finalAlignmentByScenario.filter(Boolean).length;
      const valueConsistencyIndex = finalAlignmentByScenario.length > 0
        ? alignedCount / finalAlignmentByScenario.length
        : 0;

      const performanceComposite = calculatePerformanceComposite(finalMetrics);
      const balanceIndex = calculateBalanceIndex(finalMetrics);

      let misalignAfterCvrApaCount = 0;
      let realignAfterCvrApaCount = 0;

      scenarioDetails.forEach((scenario) => {
        const scenarioEvents = allEvents.filter(e => e.scenarioId === scenario.scenarioId);
        const confirmationEvent = scenarioEvents.find(e => e.event === 'option_confirmed');
        const flagsAtConfirmation = confirmationEvent?.flagsAtConfirmation;

        if (flagsAtConfirmation) {
          const hadSimulationMetricsReordering = flagsAtConfirmation.simulationMetricsReorderingFlag ?? false;
          const hadMoralValuesReordering = flagsAtConfirmation.moralValuesReorderingFlag ?? false;

          if (hadSimulationMetricsReordering || hadMoralValuesReordering) {
            realignAfterCvrApaCount++;
          }
        }

        if (!scenario.aligned) {
          misalignAfterCvrApaCount++;
        }
      });

      const valueOrderTrajectories: Array<{scenarioId: number, values: string[], preferenceType: string}> = [];

      apaEvents.forEach(event => {
        if (event.valuesAfter && event.scenarioId !== undefined) {
          valueOrderTrajectories.push({
            scenarioId: event.scenarioId,
            values: event.valuesAfter,
            preferenceType: event.preferenceType || 'unknown'
          });
        }
      });

      const calculatedMetrics: SessionDVs = {
        cvrArrivals,
        cvrYesCount,
        cvrNoCount,
        apaReorderings,
        misalignAfterCvrApaCount,
        realignAfterCvrApaCount,
        switchCountTotal,
        avgDecisionTime,
        decisionTimes,
        valueConsistencyIndex,
        performanceComposite,
        balanceIndex,
        finalAlignmentByScenario,
        valueOrderTrajectories,
        scenarioDetails
      };

      setMetrics(calculatedMetrics);
    } catch (error) {
      console.error('Error calculating metrics:', error);
    }
  };

  const calculatePerformanceComposite = (finalMetrics: SimulationMetrics): number => {
    const normalized = {
      livesSaved: Math.min(finalMetrics.livesSaved / 20000, 1),
      casualties: 1 - Math.min(finalMetrics.humanCasualties / 1000, 1),
      firefightingResource: finalMetrics.firefightingResource / 100,
      infrastructureCondition: finalMetrics.infrastructureCondition / 100,
      biodiversityCondition: finalMetrics.biodiversityCondition / 100,
      propertiesCondition: finalMetrics.propertiesCondition / 100,
      nuclearPowerStation: finalMetrics.nuclearPowerStation / 100
    };

    const values = Object.values(normalized);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.round(mean * 100) / 100;
  };

  const calculateBalanceIndex = (finalMetrics: SimulationMetrics): number => {
    const normalized = [
      Math.min(finalMetrics.livesSaved / 20000, 1),
      1 - Math.min(finalMetrics.humanCasualties / 1000, 1),
      finalMetrics.firefightingResource / 100,
      finalMetrics.infrastructureCondition / 100,
      finalMetrics.biodiversityCondition / 100,
      finalMetrics.propertiesCondition / 100,
      finalMetrics.nuclearPowerStation / 100
    ];

    const mean = normalized.reduce((a, b) => a + b, 0) / normalized.length;
    const variance = normalized.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / normalized.length;
    return Math.round((1 - variance) * 100) / 100;
  };

  const handleSliderChange = (key: keyof FeedbackData, value: number) => {
    setFeedback(prev => ({ ...prev, [key]: value }));
  };

  const loadAnalysisData = () => {
    try {
      const explicitValues = JSON.parse(localStorage.getItem('explicitValues') || '[]');
      const implicitValues = JSON.parse(localStorage.getItem('deepValues') || '[]');
      const simulationOutcomes = JSON.parse(localStorage.getItem('simulationScenarioOutcomes') || '[]');
      const metricsData = JSON.parse(localStorage.getItem('finalSimulationMetrics') || 'null');

      if (!explicitValues.length || !implicitValues.length || !simulationOutcomes.length || !metricsData) {
        setAnalysisError(true);
        return;
      }

      // Load value frequency data
      const explicitFreqs = JSON.parse(localStorage.getItem('ExplicitValueFrequencies') || '[]');
      const implicitFreqs = JSON.parse(localStorage.getItem('ImplicitValueFrequencies') || '[]');
      setExplicitValueFrequencies(explicitFreqs);
      setImplicitValueFrequencies(implicitFreqs);

      const explicitCounts: ValueCount = {};
      explicitValues.forEach((value: any) => {
        const normalizedValue = value.value_selected.toLowerCase();
        explicitCounts[normalizedValue] = (explicitCounts[normalizedValue] || 0) + 1;
      });
      setExplicitValueCounts(explicitCounts);

      const implicitCounts: ValueCount = {};
      implicitValues.forEach((value: any) => {
        const normalizedValue = value.name?.toLowerCase();
        if (normalizedValue) {
          implicitCounts[normalizedValue] = (implicitCounts[normalizedValue] || 0) + 1;
        }
      });
      setImplicitValueCounts(implicitCounts);

      const trends = initializeValueTrends();

      // Initialize all values with zeros for all 3 scenarios
      Object.keys(trends).forEach(value => {
        trends[value] = [0, 0, 0];
      });

      // Set values based on selection and top-two status at each scenario
      simulationOutcomes.forEach((outcome: any, index: number) => {
        const selectedValue = outcome.decision.label.toLowerCase();
        const topTwoAtDecision = outcome.topTwoValuesAtDecision || [];

        if (index < 3) {
          // Set 100 for the selected value
          if (trends[selectedValue]) {
            trends[selectedValue][index] = 100;
          }

          // Set 50 for top-two values that weren't selected at that moment
          topTwoAtDecision.forEach((topValue: string) => {
            const normalizedTopValue = topValue.toLowerCase();
            if (normalizedTopValue !== selectedValue && trends[normalizedTopValue]) {
              trends[normalizedTopValue][index] = 50;
            }
          });
        }
      });
      setValueTrends(trends);

      const matches: ValueMatch[] = simulationOutcomes.map((outcome: any) => {
        const selectedValueLabel = outcome.decision.label.toLowerCase();
        const matchesExplicit = explicitCounts[selectedValueLabel] > 0;
        const matchesImplicit = implicitCounts[selectedValueLabel] > 0;

        const explicitWeight = matchesExplicit ? 40 : 0;
        const implicitWeight = matchesImplicit ? 60 : 0;
        const stabilityScore = explicitWeight + implicitWeight;

        return {
          scenarioId: outcome.scenarioId,
          selectedValue: outcome.decision.label,
          matchesExplicit,
          matchesImplicit,
          matchesSimulation: true,
          stabilityScore
        };
      });

      setValueMatches(matches);
      setOverallStabilityScore(
        matches.reduce((acc, match) => acc + match.stabilityScore, 0) / matches.length
      );
      setFinalMetrics(metricsData);
      setAnalysisError(false);
    } catch (error) {
      console.error('Error loading analysis data:', error);
      setAnalysisError(true);
    }
  };

  const prepareValueDistributionData = () => {
    const values = MORAL_VALUES;

    return {
      labels: values,
      datasets: [
        {
          label: 'Explicit Choices',
          data: values.map(value => explicitValueCounts[value.toLowerCase()] || 0),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Implicit Choices',
          data: values.map(value => implicitValueCounts[value.toLowerCase()] || 0),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Simulation Decisions',
          data: values.map(value =>
            valueMatches.filter(match =>
              match.selectedValue.toLowerCase() === value.toLowerCase()
            ).length
          ),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  const prepareConsistencyTrendData = () => {
    const selectedValues = Object.keys(valueTrends);

    return {
      labels: ['Explicit Choices', 'Implicit Choices', 'Scenario 1', 'Scenario 2', 'Scenario 3'],
      datasets: selectedValues.map((value, index) => {
        const colors = [
          { line: 'rgb(239, 68, 68)', fill: 'rgba(239, 68, 68, 0.1)' },
          { line: 'rgb(59, 130, 246)', fill: 'rgba(59, 130, 246, 0.1)' },
          { line: 'rgb(16, 185, 129)', fill: 'rgba(16, 185, 129, 0.1)' },
          { line: 'rgb(245, 158, 11)', fill: 'rgba(245, 158, 11, 0.1)' },
          { line: 'rgb(139, 92, 246)', fill: 'rgba(139, 92, 246, 0.1)' }
        ];

        // Find the frequency percentage for this value in explicit choices
        const explicitFreq = explicitValueFrequencies.find(
          freq => freq.value.toLowerCase() === value.toLowerCase()
        );
        const explicitScore = explicitFreq ? explicitFreq.percentage : 0;

        // Find the frequency percentage for this value in implicit choices
        const implicitFreq = implicitValueFrequencies.find(
          freq => freq.value.toLowerCase() === value.toLowerCase()
        );
        const implicitScore = implicitFreq ? implicitFreq.percentage : 0;

        return {
          label: value.charAt(0).toUpperCase() + value.slice(1),
          data: [
            explicitScore,
            implicitScore,
            ...valueTrends[value]
          ],
          borderColor: colors[index % colors.length].line,
          backgroundColor: colors[index % colors.length].fill,
          tension: 0.1,
          fill: true
        };
      })
    };
  };

  const handleSubmitFeedback = async () => {
    if (!metrics) return;

    const finalResults: SessionDVs = {
      ...metrics,
      ...feedback,
    };

    localStorage.setItem('sessionResults', JSON.stringify(finalResults));

    const telemetryEvent = {
      event: 'feedback_submitted' as const,
      timestamp: new Date().toISOString(),
      data: finalResults
    };

    const existingLogs = JSON.parse(localStorage.getItem('sessionEventLogs') || '[]');
    existingLogs.push(telemetryEvent);
    localStorage.setItem('sessionEventLogs', JSON.stringify(existingLogs));

    const sessionId = MongoService.getSessionId();

    const scenariosFinalDecisionLabels = JSON.parse(localStorage.getItem('ScenariosFinalDecisionLabels') || '[]');
    const checkingAlignmentList = JSON.parse(localStorage.getItem('CheckingAlignmentList') || '[]');

    await MongoService.insertSessionFeedback({
      session_id: sessionId,
      cvr_initial_reconsideration: feedback.cvrInitialReconsideration,
      cvr_final_reconsideration: feedback.cvrFinalReconsideration,
      cvr_purpose_clarity: feedback.cvrPurposeClarity,
      cvr_confidence_change: feedback.cvrConfidenceChange,
      cvr_helpfulness: feedback.cvrHelpfulness,
      cvr_clarity: feedback.cvrClarity,
      cvr_comfort_level: feedback.cvrComfortLevel,
      cvr_perceived_value: feedback.cvrPerceivedValue,
      cvr_overall_impact: feedback.cvrOverallImpact,
      cvr_comments: feedback.cvrComments,
      apa_purpose_clarity: feedback.apaPurposeClarity,
      apa_ease_of_use: feedback.apaEaseOfUse,
      apa_control_understanding: feedback.apaControlUnderstanding,
      apa_decision_reflection: feedback.apaDecisionReflection,
      apa_scenario_alignment: feedback.apaScenarioAlignment,
      apa_comparison_usefulness: feedback.apaComparisonUsefulness,
      apa_perspective_value: feedback.apaPerspectiveValue,
      apa_confidence_after_reordering: feedback.apaConfidenceAfterReordering,
      apa_perceived_value: feedback.apaPerceivedValue,
      apa_tradeoff_challenge: feedback.apaTradeoffChallenge,
      apa_reflection_depth: feedback.apaReflectionDepth,
      apa_comments: feedback.apaComments,
      viz_clarity: feedback.vizClarity,
      viz_helpfulness: feedback.vizHelpfulness,
      viz_usefulness: feedback.vizUsefulness,
      viz_tradeoff_evaluation: feedback.vizTradeoffEvaluation,
      viz_tradeoff_justification: feedback.vizTradeoffJustification,
      viz_expert_usefulness: feedback.vizExpertUsefulness,
      viz_expert_confidence_impact: feedback.vizExpertConfidenceImpact,
      viz_comments: feedback.vizComments,
      overall_scenario_alignment: feedback.overallScenarioAlignment,
      overall_decision_satisfaction: feedback.overallDecisionSatisfaction,
      overall_process_satisfaction: feedback.overallProcessSatisfaction,
      overall_confidence_consistency: feedback.overallConfidenceConsistency,
      overall_learning_insight: feedback.overallLearningInsight,
      overall_comments: feedback.overallComments,
      value_consistency_index: metrics.valueConsistencyIndex,
      performance_composite: metrics.performanceComposite,
      balance_index: metrics.balanceIndex,
      cvr_arrivals: metrics.cvrArrivals,
      cvr_yes_count: metrics.cvrYesCount,
      cvr_no_count: metrics.cvrNoCount,
      apa_reorderings: metrics.apaReorderings,
      total_switches: metrics.switchCountTotal,
      avg_decision_time: metrics.avgDecisionTime,
      scenarios_final_decision_labels: scenariosFinalDecisionLabels,
      checking_alignment_list: checkingAlignmentList
    });

    await MongoService.updateUserSession(sessionId, {
      is_completed: true,
      completed_at: new Date().toISOString()
    });

    await MongoService.syncFallbackData();

    setIsSubmitted(true);
    setShowExport(true);
  };

  const handleExportData = (format: 'json' | 'csv') => {
    if (!metrics) return;

    const exportData = {
      ...metrics,
      ...feedback,
      exportedAt: new Date().toISOString(),
      userDemographics: JSON.parse(localStorage.getItem('userDemographics') || '{}'),
      allEvents: TrackingManager.getAllEvents()
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `simulation-results-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const csvData = convertToCSV(exportData);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `simulation-results-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const convertToCSV = (data: any): string => {
    const flatData: any = {};

    Object.keys(data).forEach(key => {
      const value = data[key];
      if (Array.isArray(value)) {
        if (typeof value[0] === 'object') {
          flatData[key] = JSON.stringify(value);
        } else {
          flatData[key] = value.join(';');
        }
      } else if (typeof value === 'object' && value !== null) {
        flatData[key] = JSON.stringify(value);
      } else {
        flatData[key] = value;
      }
    });

    const headers = Object.keys(flatData);
    const values = headers.map(header => {
      const val = flatData[header];
      if (typeof val === 'string' && val.includes(',')) {
        return `"${val}"`;
      }
      return val;
    });

    return [headers.join(','), values.join(',')].join('\n');
  };


  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedback form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <Star className="h-8 w-8 text-yellow-500" />
            <h1 className="text-2xl font-bold text-gray-900">
              Your Feedback
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-6 mb-8 border-2 border-blue-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            We Value Your Experience
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Your feedback is crucial to understanding how this simulation helped you reflect on value-driven decision-making.
            Please take a moment to share your thoughts about the process and your experience.
          </p>
        </div>

        {metrics && metrics.apaReorderings > 0 && (
        <div className="bg-gradient-to-br from-green-50 via-emerald-100 to-teal-50 rounded-lg shadow-lg border-2 border-green-300 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-green-900 flex items-center">
              <RefreshCcw className="h-6 w-6 mr-2 text-green-700" />
              Adaptive Preference Analysis (APA)
            </h3>
            <div className="flex items-center gap-2 bg-green-200 px-3 py-1.5 rounded-full shadow-sm">
              <span className="text-xs font-bold text-green-900">Total APA Reorderings:</span>
              <span className="text-sm font-bold text-green-900">{metrics.apaReorderings}</span>
            </div>
          </div>

          <p className="text-sm text-green-800 font-medium mb-6 leading-relaxed bg-white/60 p-3 rounded-lg">
            The APA (Adaptive Preference Alignment) feature allowed you to compare your chosen options with CVR scenarios and reprioritize your values based on new insights. The goal is to help you understand options from different perspectives and align future choices with your reordered values.
          </p>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Understanding and Usability</h4>

              <div className="space-y-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Purpose Clarity: How clear was the purpose of the APA feature in helping you balance Simulation Metrics and Moral Values when making decisions?
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500 w-4">1</span>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={feedback.apaPurposeClarity}
                      onChange={(e) => handleSliderChange('apaPurposeClarity', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      disabled={isSubmitted}
                    />
                    <span className="text-xs text-gray-500 w-4">7</span>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-base font-bold text-blue-600">{feedback.apaPurposeClarity}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                    <span>Very unclear</span>
                    <span>Very clear</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Ease of Use: How easy was it to rank or re-order your priorities during the APA process?
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500 w-4">1</span>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={feedback.apaEaseOfUse}
                      onChange={(e) => handleSliderChange('apaEaseOfUse', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      disabled={isSubmitted}
                    />
                    <span className="text-xs text-gray-500 w-4">7</span>
                    <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                      <span className="text-base font-bold text-cyan-600">{feedback.apaEaseOfUse}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                    <span>Very difficult</span>
                    <span>Very easy</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Control and Understanding: Did you feel that the APA interface gave you enough control to shape your decisions according to your ranked preferences?
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500 w-4">1</span>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={feedback.apaControlUnderstanding}
                      onChange={(e) => handleSliderChange('apaControlUnderstanding', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      disabled={isSubmitted}
                    />
                    <span className="text-xs text-gray-500 w-4">7</span>
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <span className="text-base font-bold text-teal-600">{feedback.apaControlUnderstanding}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                    <span>No control</span>
                    <span>Full control</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Perceived Impact and Alignment</h4>

              <div className="space-y-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Decision Reflection: Did the APA process cause you to rethink what mattered most in your decision-making (for example, Safety vs. Efficiency)?
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setFeedback(prev => ({ ...prev, apaDecisionReflection: true }))}
                      disabled={isSubmitted}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                        feedback.apaDecisionReflection === true
                          ? 'bg-green-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setFeedback(prev => ({ ...prev, apaDecisionReflection: false }))}
                      disabled={isSubmitted}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                        feedback.apaDecisionReflection === false
                          ? 'bg-green-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Scenario Alignment: Did the APA system help you see more aligned and relevant initial options when you arrived at the next scenarios?
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setFeedback(prev => ({ ...prev, apaScenarioAlignment: true }))}
                      disabled={isSubmitted}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                        feedback.apaScenarioAlignment === true
                          ? 'bg-green-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setFeedback(prev => ({ ...prev, apaScenarioAlignment: false }))}
                      disabled={isSubmitted}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                        feedback.apaScenarioAlignment === false
                          ? 'bg-green-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    APA Comparison Table Usefulness: How useful was comparing your simulation choices with CVR scenarios (APA Comparison Table)?
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500 w-4">1</span>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={feedback.apaComparisonUsefulness}
                      onChange={(e) => handleSliderChange('apaComparisonUsefulness', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      disabled={isSubmitted}
                    />
                    <span className="text-xs text-gray-500 w-4">7</span>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-base font-bold text-green-600">{feedback.apaComparisonUsefulness}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                    <span>Not useful</span>
                    <span>Very useful</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Perspective Value: How valuable was understanding options from different perspectives (value-based perspectives) through APA?
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500 w-4">1</span>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={feedback.apaPerspectiveValue}
                      onChange={(e) => handleSliderChange('apaPerspectiveValue', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      disabled={isSubmitted}
                    />
                    <span className="text-xs text-gray-500 w-4">7</span>
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-base font-bold text-emerald-600">{feedback.apaPerspectiveValue}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                    <span>Not valuable</span>
                    <span>Extremely valuable</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Confidence After Reordering: How confident were you in your final decisions after adjusting your moral or simulation value rankings?
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500 w-4">1</span>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={feedback.apaConfidenceAfterReordering}
                      onChange={(e) => handleSliderChange('apaConfidenceAfterReordering', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      disabled={isSubmitted}
                    />
                    <span className="text-xs text-gray-500 w-4">7</span>
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <span className="text-base font-bold text-teal-600">{feedback.apaConfidenceAfterReordering}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                    <span>Not confident</span>
                    <span>Very confident</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Perceived Value: How valuable was the APA feature overall in helping you make decisions that reflected your values and priorities?
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500 w-4">1</span>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={feedback.apaPerceivedValue}
                      onChange={(e) => handleSliderChange('apaPerceivedValue', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      disabled={isSubmitted}
                    />
                    <span className="text-xs text-gray-500 w-4">7</span>
                    <div className="w-10 h-10 bg-lime-100 rounded-full flex items-center justify-center">
                      <span className="text-base font-bold text-lime-600">{feedback.apaPerceivedValue}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                    <span>Not valuable</span>
                    <span>Extremely valuable</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Cognitive Effort and Challenge</h4>

              <div className="space-y-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Trade-off Challenge: How challenging was it to decide which moral values or simulation metrics should take priority when ranking them?
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500 w-4">1</span>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={feedback.apaTradeoffChallenge}
                      onChange={(e) => handleSliderChange('apaTradeoffChallenge', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      disabled={isSubmitted}
                    />
                    <span className="text-xs text-gray-500 w-4">7</span>
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-base font-bold text-amber-600">{feedback.apaTradeoffChallenge}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                    <span>Not challenging</span>
                    <span>Very challenging</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Reflection Depth: To what extent did APA make you reflect on the trade-offs between different moral or operational values?
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500 w-4">1</span>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={feedback.apaReflectionDepth}
                      onChange={(e) => handleSliderChange('apaReflectionDepth', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      disabled={isSubmitted}
                    />
                    <span className="text-xs text-gray-500 w-4">7</span>
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-base font-bold text-orange-600">{feedback.apaReflectionDepth}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                    <span>Not at all</span>
                    <span>A great deal</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                Tell us about your APA experience (optional)
                <button
                  onMouseEnter={() => setShowApaTooltip(true)}
                  onMouseLeave={() => setShowApaTooltip(false)}
                  onClick={() => setShowApaTooltip(!showApaTooltip)}
                  className="ml-2 text-green-500 hover:text-green-700 relative"
                >
                  <Info className="h-4 w-4" />
                  {showApaTooltip && (
                    <div className="absolute left-0 top-6 z-10 w-80 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                      <div className="space-y-2">
                        <p>Which part of APA helped you understand your priorities better?</p>
                        <p>Did ranking your preferences change how you approached the next scenario?</p>
                        <p>What about APA did you find most useful or challenging?</p>
                        <p>Did ranking your preferences change your next decisions?</p>
                        <p>Where did APA feel most valuable?</p>
                        <p>How could APA be improved?</p>
                      </div>
                    </div>
                  )}
                </button>
              </label>
              <textarea
                value={feedback.apaComments}
                onChange={(e) => setFeedback(prev => ({ ...prev, apaComments: e.target.value }))}
                rows={4}
                disabled={isSubmitted}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="What did you find most useful or challenging about APA? Did ranking your preferences change your next decisions? Where did APA feel most valuable? How could APA be improved?"
              />
            </div>
          </div>
        </div>
        )}

        <div className="bg-gradient-to-br from-orange-50 via-amber-100 to-yellow-50 rounded-lg shadow-lg border-2 border-orange-300 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-orange-900 flex items-center">
              <BarChart3 className="h-6 w-6 mr-2 text-orange-700" />
              Decision Support Tools
            </h3>
            <div className="flex items-center gap-2 bg-orange-200 px-3 py-1.5 rounded-full shadow-sm">
              <Lightbulb className="h-5 w-5 text-orange-900" />
              <span className="text-xs font-bold text-orange-900">Visualization & Analysis</span>
            </div>
          </div>

          <p className="text-sm text-orange-800 font-medium mb-6 leading-relaxed bg-white/60 p-3 rounded-lg">
            Throughout the simulation, you had access to expert recommendations, trade-off visualizations (radar and bar charts), and comparison tools to help you understand the implications of different choices.
          </p>

          <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Did you use the trade-off comparison view (i.e. Radar and Bar Chart)?
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setFeedback(prev => ({ ...prev, usedTradeoffComparison: true }))}
                disabled={isSubmitted}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  feedback.usedTradeoffComparison === true
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Yes
              </button>
              <button
                onClick={() => setFeedback(prev => ({ ...prev, usedTradeoffComparison: false }))}
                disabled={isSubmitted}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  feedback.usedTradeoffComparison === false
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                No
              </button>
            </div>
          </div>

          {feedback.usedTradeoffComparison === true && (
            <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Visualization (Radar & Bar Charts)</h4>

              <div className="space-y-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Visualization Clarity: How clear were the radar and bar chart visualizations?
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500 w-4">1</span>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={feedback.vizClarity}
                      onChange={(e) => handleSliderChange('vizClarity', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      disabled={isSubmitted}
                    />
                    <span className="text-xs text-gray-500 w-4">7</span>
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-base font-bold text-orange-600">{feedback.vizClarity}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                    <span>Very unclear</span>
                    <span>Very clear</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Visualization Helpfulness: Did these visualizations help you make your decision?
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setFeedback(prev => ({ ...prev, vizHelpfulness: true }))}
                      disabled={isSubmitted}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                        feedback.vizHelpfulness === true
                          ? 'bg-orange-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-400'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setFeedback(prev => ({ ...prev, vizHelpfulness: false }))}
                      disabled={isSubmitted}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                        feedback.vizHelpfulness === false
                          ? 'bg-orange-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-400'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Visualization Usefulness in Decision-Making: How useful were the radar and bar chart visualizations in your decision-making process?
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500 w-4">1</span>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={feedback.vizUsefulness}
                      onChange={(e) => handleSliderChange('vizUsefulness', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      disabled={isSubmitted}
                    />
                    <span className="text-xs text-gray-500 w-4">7</span>
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-base font-bold text-amber-600">{feedback.vizUsefulness}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                    <span>Not useful</span>
                    <span>Very useful</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Trade-Off and Comparison Views</h4>

              <div className="space-y-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Trade-Off Evaluation: How valuable were the trade-off comparisons and difference views in helping you evaluate your options?
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500 w-4">1</span>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={feedback.vizTradeoffEvaluation}
                      onChange={(e) => handleSliderChange('vizTradeoffEvaluation', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      disabled={isSubmitted}
                    />
                    <span className="text-xs text-gray-500 w-4">7</span>
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-base font-bold text-yellow-600">{feedback.vizTradeoffEvaluation}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                    <span>Not valuable</span>
                    <span>Very valuable</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Trade-Off Justification: How helpful were these trade-off views in helping you reach or justify a decision?
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500 w-4">1</span>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={feedback.vizTradeoffJustification}
                      onChange={(e) => handleSliderChange('vizTradeoffJustification', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      disabled={isSubmitted}
                    />
                    <span className="text-xs text-gray-500 w-4">7</span>
                    <div className="w-10 h-10 bg-lime-100 rounded-full flex items-center justify-center">
                      <span className="text-base font-bold text-lime-600">{feedback.vizTradeoffJustification}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                    <span>Not helpful</span>
                    <span>Very helpful</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Expert Analyses and Recommendations</h4>

              <div className="space-y-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Expert Guidance Usefulness: How useful were the expert analyses and recommendations in making your decisions?
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500 w-4">1</span>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={feedback.vizExpertUsefulness}
                      onChange={(e) => handleSliderChange('vizExpertUsefulness', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      disabled={isSubmitted}
                    />
                    <span className="text-xs text-gray-500 w-4">7</span>
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-base font-bold text-orange-600">{feedback.vizExpertUsefulness}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                    <span>Not useful</span>
                    <span>Very useful</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Expert Confidence Impact: Did the expert analyses increase your confidence in your chosen options?
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setFeedback(prev => ({ ...prev, vizExpertConfidenceImpact: true }))}
                      disabled={isSubmitted}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                        feedback.vizExpertConfidenceImpact === true
                          ? 'bg-orange-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-400'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setFeedback(prev => ({ ...prev, vizExpertConfidenceImpact: false }))}
                      disabled={isSubmitted}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                        feedback.vizExpertConfidenceImpact === false
                          ? 'bg-orange-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-400'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                Optional Open-Ended Reflection
                <button
                  onMouseEnter={() => setShowVizTooltip(true)}
                  onMouseLeave={() => setShowVizTooltip(false)}
                  onClick={() => setShowVizTooltip(!showVizTooltip)}
                  className="ml-2 text-orange-500 hover:text-orange-700 relative"
                >
                  <Info className="h-4 w-4" />
                  {showVizTooltip && (
                    <div className="absolute left-0 top-6 z-10 w-80 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                      <div className="space-y-2">
                        <p>Which visualization or analysis tool helped you most?</p>
                        <p>Did expert insights change your mind or reinforce your choice?</p>
                        <p>How did trade-off comparisons influence your decision process?</p>
                        <p>What could make these tools more intuitive or effective?</p>
                      </div>
                    </div>
                  )}
                </button>
              </label>
              <textarea
                value={feedback.vizComments}
                onChange={(e) => setFeedback(prev => ({ ...prev, vizComments: e.target.value }))}
                rows={4}
                disabled={isSubmitted}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Which tool helped you most in making your decision? Did expert insights change or reinforce your choice? What could improve the visualizations or comparison tools?"
              />
            </div>
          </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-purple-50 via-pink-100 to-rose-50 rounded-lg shadow-lg border-2 border-purple-300 p-6 mb-8">
          <h3 className="text-xl font-bold text-purple-900 mb-6 flex items-center">
            <Star className="h-6 w-6 mr-2 text-purple-700" />
            Overall Experience Feedback
          </h3>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Scenario Alignment Over Time: As you progressed through the scenarios, did you notice that the initial solutions increasingly matched your values or priorities?
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setFeedback(prev => ({ ...prev, overallScenarioAlignment: true }))}
                  disabled={isSubmitted}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    feedback.overallScenarioAlignment === true
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-400'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setFeedback(prev => ({ ...prev, overallScenarioAlignment: false }))}
                  disabled={isSubmitted}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    feedback.overallScenarioAlignment === false
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-400'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  No
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Decision Satisfaction: How satisfied are you with the decisions you made across all scenarios?
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500 w-4">1</span>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={feedback.overallDecisionSatisfaction}
                  onChange={(e) => handleSliderChange('overallDecisionSatisfaction', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  disabled={isSubmitted}
                />
                <span className="text-xs text-gray-500 w-4">7</span>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-base font-bold text-purple-600">{feedback.overallDecisionSatisfaction}</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                <span>Very dissatisfied</span>
                <span>Very satisfied</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Process Satisfaction: How satisfied are you with the overall decision-making process in the simulation?
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500 w-4">1</span>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={feedback.overallProcessSatisfaction}
                  onChange={(e) => handleSliderChange('overallProcessSatisfaction', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  disabled={isSubmitted}
                />
                <span className="text-xs text-gray-500 w-4">7</span>
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-base font-bold text-pink-600">{feedback.overallProcessSatisfaction}</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                <span>Very poor</span>
                <span>Excellent</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Confidence Consistency: How confident were you that your final decisions remained consistent with your personal or moral values throughout the simulation?
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500 w-4">1</span>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={feedback.overallConfidenceConsistency}
                  onChange={(e) => handleSliderChange('overallConfidenceConsistency', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  disabled={isSubmitted}
                />
                <span className="text-xs text-gray-500 w-4">7</span>
                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                  <span className="text-base font-bold text-rose-600">{feedback.overallConfidenceConsistency}</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                <span>Not confident</span>
                <span>Very confident</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Learning and Insight: How much did this simulation help you learn about how your values influence complex decision-making?
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500 w-4">1</span>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={feedback.overallLearningInsight}
                  onChange={(e) => handleSliderChange('overallLearningInsight', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  disabled={isSubmitted}
                />
                <span className="text-xs text-gray-500 w-4">7</span>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-base font-bold text-purple-600">{feedback.overallLearningInsight}</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                <span>Not at all</span>
                <span>A great deal</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                Optional Open-Ended Reflection
                <button
                  onMouseEnter={() => setShowOverallTooltip(true)}
                  onMouseLeave={() => setShowOverallTooltip(false)}
                  onClick={() => setShowOverallTooltip(!showOverallTooltip)}
                  className="ml-2 text-purple-500 hover:text-purple-700 relative"
                >
                  <Info className="h-4 w-4" />
                  {showOverallTooltip && (
                    <div className="absolute left-0 top-6 z-10 w-80 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                      <div className="space-y-2">
                        <p>Did your sense of alignment between values and outcomes improve over time?</p>
                        <p>Did the simulation change how you think about trade-offs?</p>
                        <p>What was most satisfying or frustrating about your overall experience?</p>
                        <p>What insights did you gain from interacting with multiple expert systems?</p>
                      </div>
                    </div>
                  )}
                </button>
              </label>
              <textarea
                value={feedback.overallComments}
                onChange={(e) => setFeedback(prev => ({ ...prev, overallComments: e.target.value }))}
                rows={4}
                disabled={isSubmitted}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="What did you learn about your values or decision process? Where did you feel most aligned or misaligned with the system? What part of the experience stood out most for you?"
              />
            </div>
          </div>

          {!isSubmitted ? (
            <button
              onClick={handleSubmitFeedback}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
            >
              <Star size={20} className="mr-2" />
              Submit Feedback
            </button>
          ) : (
            <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-500 mr-3" />
                <span className="text-green-800 font-semibold text-lg">Feedback submitted successfully!</span>
              </div>
            </div>
          )}
        </div>

        {isSubmitted && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6 border-2 border-purple-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Thank you for your feedback!
            </h3>
            <p className="text-gray-700">
              You can now explore your detailed results and analysis. Use the buttons below to access different views of your simulation performance.
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Explore Your Results
          </h3>
          <div className="max-w-2xl mx-auto space-y-4">
            <button
              onClick={() => {
                loadAnalysisData();
                setShowAnalysisModal(true);
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-5 px-8 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
            >
              <FileText className="h-6 w-6" />
              <span className="text-lg">View Final Analysis Report</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {isSubmitted && (
              <button
                onClick={() => navigate('/study-complete')}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold py-5 px-8 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
              >
                <CheckCircle2 className="h-6 w-6" />
                <span className="text-lg">Finish</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {/* Hidden View Results button - kept for potential future use */}
            {false && (
            <button
              onClick={() => navigate('/view-results')}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
            >
              <BarChart2 className="h-6 w-6" />
              <span>View Results</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            )}
          </div>
        </div>

        {showAnalysisModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center space-x-3">
                  <BarChart2 className="h-8 w-8 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Final Analysis Report</h2>
                </div>
                <button
                  onClick={() => setShowAnalysisModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {analysisError ? (
                <div className="p-8 text-center">
                  <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Data Not Found</h3>
                  <p className="text-gray-600 mb-4">
                    Please complete the simulation before accessing the final analysis.
                  </p>
                </div>
              ) : (
                <div className="p-8 space-y-8">
                  {/* Value Distribution Section */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Scale className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Value Distribution Analysis</h3>
                        <p className="text-sm text-gray-600 mt-1">How your values were expressed across different assessment types</p>
                      </div>
                    </div>
                    <div className="h-[400px]">
                      <Bar
                        data={prepareValueDistributionData()}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: 'Frequency',
                                font: { size: 13, weight: 'bold' }
                              },
                              grid: { color: 'rgba(0, 0, 0, 0.05)' }
                            },
                            x: {
                              grid: { display: false }
                            }
                          },
                          plugins: {
                            legend: {
                              position: 'bottom' as const,
                              labels: {
                                padding: 20,
                                font: { size: 13 },
                                usePointStyle: true
                              }
                            },
                            title: {
                              display: false
                            }
                          }
                        }}
                      />
                    </div>
                  </section>

                  {/* Value Stability Section */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Brain className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Value Stability Analysis</h3>
                        <p className="text-sm text-gray-600 mt-1">How consistently your stated values aligned with your decisions</p>
                      </div>
                    </div>

                    <div className="text-center mb-8">
                      <div className="inline-flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
                        <div className={`text-5xl font-bold mb-2 ${
                          overallStabilityScore >= 75 ? 'text-green-600' :
                          overallStabilityScore >= 50 ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {overallStabilityScore.toFixed(1)}%
                        </div>
                        <p className="text-lg font-semibold text-gray-800">Overall Value Stability Score</p>
                        <p className="text-sm text-gray-600 mt-2">
                          (Weighted: 40% Explicit, 60% Implicit Values)
                        </p>
                      </div>
                    </div>

                    <ValueStabilityTable matches={valueMatches} />
                  </section>

                  {/* Decision Alignment Section */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Target className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Decision Alignment Overview</h3>
                        <p className="text-sm text-gray-600 mt-1">Whether your final decisions matched your stated values</p>
                      </div>
                    </div>

                    {(() => {
                      const scenariosFinalDecisionLabels = JSON.parse(localStorage.getItem('ScenariosFinalDecisionLabels') || '[]');
                      const checkingAlignmentList = JSON.parse(localStorage.getItem('CheckingAlignmentList') || '[]');
                      const allEvents = JSON.parse(localStorage.getItem('sessionEventLogs') || '[]');

                      const alignedCount = checkingAlignmentList.filter((status: string) => status === 'Aligned').length;
                      const totalScenarios = checkingAlignmentList.length;
                      const alignmentPercentage = totalScenarios > 0 ? (alignedCount / totalScenarios) * 100 : 0;

                      return (
                        <>
                          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Overall Alignment Rate</p>
                                <p className="text-3xl font-bold text-gray-900">{alignedCount} / {totalScenarios}</p>
                                <p className="text-sm text-gray-600 mt-1">scenarios aligned with your values</p>
                              </div>
                              <div className="text-right">
                                <div className={`text-4xl font-bold ${
                                  alignmentPercentage >= 66 ? 'text-green-600' :
                                  alignmentPercentage >= 33 ? 'text-orange-600' :
                                  'text-red-600'
                                }`}>
                                  {alignmentPercentage.toFixed(0)}%
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {valueMatches.map((match, index) => {
                              const decisionLabel = scenariosFinalDecisionLabels[index] || match.selectedValue;
                              const alignmentStatus = checkingAlignmentList[index] || 'Unknown';
                              const isAligned = alignmentStatus === 'Aligned';

                              const scenarioEvents = allEvents.filter((e: any) =>
                                e.scenarioId === match.scenarioId ||
                                (e.data && e.data.scenarioId === match.scenarioId)
                              );

                              const confirmationEvent = scenarioEvents.find((e: any) =>
                                e.event === 'option_confirmed' ||
                                (e.data && e.data.event === 'option_confirmed')
                              );

                              const flags = confirmationEvent?.data?.flagsAtConfirmation || confirmationEvent?.flagsAtConfirmation;
                              const hadCvrYes = flags?.cvrYesClicked ?? false;
                              const hadCvrNo = flags?.cvrNoClicked ?? false;
                              const hadApaReorder = flags?.hasReorderedValues ?? false;

                              return (
                                <div
                                  key={match.scenarioId}
                                  className={`p-5 rounded-xl border-2 transition-all ${
                                    isAligned
                                      ? 'bg-green-50 border-green-300'
                                      : 'bg-red-50 border-red-300'
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <span className="text-base font-bold text-gray-900">Scenario {match.scenarioId}</span>
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full font-bold text-xs ${
                                          isAligned
                                            ? 'bg-green-100 text-green-800 border border-green-300'
                                            : 'bg-red-100 text-red-800 border border-red-300'
                                        }`}>
                                          {isAligned ? (
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                          ) : (
                                            <XCircle className="h-3.5 w-3.5" />
                                          )}
                                          {alignmentStatus}
                                        </div>
                                      </div>
                                      <div className="bg-white rounded-lg px-4 py-2.5 border border-gray-200">
                                        <p className="text-xs text-gray-600 mb-0.5">Final Decision</p>
                                        <p className="text-base font-bold text-gray-900">
                                          {decisionLabel.charAt(0).toUpperCase() + decisionLabel.slice(1)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {(hadCvrYes || hadCvrNo || hadApaReorder) && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <p className="text-xs font-semibold text-gray-600 mb-2">Interaction Flags</p>
                                      <div className="flex flex-wrap gap-2">
                                        {hadCvrYes && (
                                          <span className="px-2.5 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full border border-orange-300">
                                            CVR: Would Change Decision
                                          </span>
                                        )}
                                        {hadCvrNo && (
                                          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full border border-blue-300">
                                            CVR: Confirmed Decision
                                          </span>
                                        )}
                                        {hadApaReorder && (
                                          <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full border border-purple-300">
                                            Reordered Preferences
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </section>

                  {/* Value Consistency Trend */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Value Consistency Trend</h3>
                        <p className="text-sm text-gray-600 mt-1">How your value consistency evolved throughout the simulation</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="h-[450px]">
                        <Line
                          data={prepareConsistencyTrendData()}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: true,
                                max: 100,
                                title: {
                                  display: true,
                                  text: 'Consistency Score (%)',
                                  font: { size: 14, weight: 'bold' }
                                },
                                grid: {
                                  color: 'rgba(0, 0, 0, 0.05)',
                                  drawBorder: false
                                },
                                ticks: {
                                  font: { size: 12 },
                                  callback: function(value) {
                                    return value + '%';
                                  }
                                }
                              },
                              x: {
                                grid: {
                                  display: false
                                },
                                ticks: {
                                  font: { size: 12, weight: 'bold' }
                                }
                              }
                            },
                            elements: {
                              line: {
                                borderWidth: 3
                              },
                              point: {
                                radius: 6,
                                hoverRadius: 8,
                                borderWidth: 2,
                                backgroundColor: '#ffffff'
                              }
                            },
                            plugins: {
                              legend: {
                                position: 'top' as const,
                                align: 'center' as const,
                                labels: {
                                  padding: 20,
                                  usePointStyle: true,
                                  font: {
                                    size: 13,
                                    weight: 'bold'
                                  },
                                  boxWidth: 12,
                                  boxHeight: 12
                                }
                              },
                              tooltip: {
                                mode: 'index',
                                intersect: false,
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                titleColor: '#1f2937',
                                bodyColor: '#4b5563',
                                borderColor: '#d1d5db',
                                borderWidth: 2,
                                padding: 16,
                                bodyFont: {
                                  size: 13
                                },
                                titleFont: {
                                  size: 15,
                                  weight: 'bold'
                                },
                                displayColors: true,
                                boxWidth: 12,
                                boxHeight: 12,
                                boxPadding: 6,
                                callbacks: {
                                  label: function(context) {
                                    return context.dataset.label + ': ' + context.parsed.y.toFixed(0) + '%';
                                  }
                                }
                              }
                            },
                            interaction: {
                              mode: 'index',
                              intersect: false
                            }
                          }}
                        />
                      </div>
                    </div>

                  </section>

                  {/* Final Metrics Section */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Flame className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Final Simulation Metrics</h3>
                        <p className="text-sm text-gray-600 mt-1">The cumulative outcomes of your decisions</p>
                      </div>
                    </div>
                    {finalMetrics && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-green-600 mb-1">Lives Saved</p>
                            <p className="text-2xl font-bold text-green-700">
                              {finalMetrics.livesSaved}
                            </p>
                          </div>
                          <div className="bg-red-50 p-4 rounded-lg">
                            <p className="text-sm text-red-600 mb-1">Casualties</p>
                            <p className="text-2xl font-bold text-red-700">
                              {finalMetrics.humanCasualties}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Resources Remaining</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${finalMetrics.firefightingResource}%` }}
                              ></div>
                            </div>
                            <p className="text-right text-sm text-gray-600 mt-1">
                              {finalMetrics.firefightingResource}%
                            </p>
                          </div>

                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Infrastructure Condition</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-yellow-600 h-2.5 rounded-full"
                                style={{ width: `${finalMetrics.infrastructureCondition}%` }}
                              ></div>
                            </div>
                            <p className="text-right text-sm text-gray-600 mt-1">
                              {finalMetrics.infrastructureCondition}%
                            </p>
                          </div>

                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Biodiversity Condition</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-green-600 h-2.5 rounded-full"
                                style={{ width: `${finalMetrics.biodiversityCondition}%` }}
                              ></div>
                            </div>
                            <p className="text-right text-sm text-gray-600 mt-1">
                              {finalMetrics.biodiversityCondition}%
                            </p>
                          </div>

                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Properties Condition</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-purple-600 h-2.5 rounded-full"
                                style={{ width: `${finalMetrics.propertiesCondition}%` }}
                              ></div>
                            </div>
                            <p className="text-right text-sm text-gray-600 mt-1">
                              {finalMetrics.propertiesCondition}%
                            </p>
                          </div>

                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Nuclear Power Station</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${
                                  finalMetrics.nuclearPowerStation < 30
                                    ? 'bg-red-600'
                                    : finalMetrics.nuclearPowerStation < 70
                                      ? 'bg-yellow-600'
                                      : 'bg-green-600'
                                }`}
                                style={{ width: `${finalMetrics.nuclearPowerStation}%` }}
                              ></div>
                            </div>
                            <p className="text-right text-sm text-gray-600 mt-1">
                              {finalMetrics.nuclearPowerStation}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </section>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .slider:disabled::-webkit-slider-thumb {
          background: #9CA3AF;
          cursor: not-allowed;
        }

        .slider:disabled::-moz-range-thumb {
          background: #9CA3AF;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default FeedbackPage;
