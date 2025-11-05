/**
 * VIEW RESULTS PAGE - SESSION METRICS & TRACKING DATA (KEY PAGE #3)
 *
 * Purpose:
 * - Displays comprehensive session metrics and behavioral data
 * - One of the 4 key analysis pages you specifically requested documentation for
 * - Shows CVR (Cognitive Value Recontextualization) interaction statistics
 * - Shows APA (Adaptive Preference Alignment) reordering statistics
 * - Displays per-scenario behavioral metrics (switches, time, CVR/APA counts)
 * - Calculates performance indices
 * - Includes detailed debug tracking table for research analysis
 *
 * Dependencies:
 * - react-router-dom: Navigation
 * - lucide-react: UI icons
 * - SessionDVs, TelemetryEvent types: Tracking data structures
 * - SimulationMetrics type: Simulation metrics structure
 * - TrackingManager: Event tracking utilities
 *
 * Direct Database Calls:
 * - None (reads from localStorage only for display)
 * - This is an analysis/visualization page
 *
 * Data Read from localStorage:
 * - 'simulationScenarioOutcomes': Scenario decisions and outcomes
 * - 'finalSimulationMetrics': Final cumulative metrics
 * - 'finalValues', 'MoralValuesReorderList': Value lists for alignment
 * - 'sessionEventLogs': Complete telemetry event logs (via TrackingManager)
 * - 'ScenariosFinalDecisionLabels': Decision labels per scenario
 * - 'CheckingAlignmentList': Alignment status per scenario
 * - 'Scenario1/2/3_MoralValueReordered': Per-scenario reordered values
 * - 'Scenario3_InfeasibleOptions': Infeasible options with checked status
 *
 * Key Metrics Calculated & Displayed:
 *
 * 1. Summary Cards (Top Row): 
 *    - CVR Arrivals: Total times CVR modal was opened 
 *    - APA Reorderings: Total value reordering events 
 *    - Total Switches: Total option changes across scenarios 
 *    - Avg Decision Time: Average seconds per scenario 
 * 
 * 2. CVR Answers Breakdown: 
 *    - "Yes, I would" answers: Count of CVR affirmative responses 
 *    - "No, I would not" answers: Count of CVR negative responses 
 * 
 * 3. Post-CVR/APA Alignment Changes: 
 *    - Misalignment Switches: Decisions that became misaligned 
 *    - Realignment Switches: Decisions that became aligned after CVR/APA 
 * 
 * 4. Performance Indices: 
 *    - Value Consistency Index: % of aligned decisions (0-100%) 
 *    - Performance Composite: Normalized average of all metrics (0-1) 
 *    - Balance Index: Measure of balanced outcomes (0-1) 
 * 
 * 5. Scenario Details Table: 
 *    Per-scenario breakdown showing: 
 *    - Final Choice (decision label) 
 *    - Switches (option changes) 
 *    - Time (seconds) 
 *    - CVR Visits (number of times CVR opened) 
 *    - CVR "Yes" (affirmative answers) 
 *    - APA Count (reordering events) 
 * 
 * 6. Debug Tracking Table (Comprehensive Research Data): 
 *    Detailed per-scenario analysis with: 
 *    - Value Lists Used: 
 *      - Scenario-specific reordered values 
 *      - FinalTopTwoValues at confirmation 
 *      - Infeasible options (Scenario 3 only) with checked status 
 *    - Final Decision Label 
 *    - Alignment Status (Aligned/Not Aligned) 
 *    - Flags at Confirmation: 
 *      - APA Reordered (boolean) 
 *      - CVR "Yes" (boolean) 
 *      - CVR "No" (boolean) 
 *      - Simulation Metrics Reordering (boolean) 
 *      - Moral Values Reordering (boolean) 
 *    - Interaction Counters: 
 *      - APA Reorders count 
 *      - CVR "Yes" count 
 *      - CVR "No" count 
 *      - Alternatives Added count 
 *      - Option Switches count 
 * 
 * Flow Position: Step 11 of 13 (accessed from /feedback) 
 * Previous Page: /feedback 
 * Next Page: Back to /feedback 
 * 
 * Calculation Details: 
 * 
 * Value Consistency Index: 
 * - Counts scenarios where decision aligned with baseline values 
 * - Formula: (aligned_count / total_scenarios) * 100 
 * 
 * Performance Composite: 
 * - Normalizes all metrics to 0-1 scale 
 * - Calculates mean of normalized values 
 * - Represents overall performance quality 
 * 
 * Balance Index: 
 * - Calculates variance of normalized metrics 
 * - Formula: 1 - variance 
 * - Higher value = more balanced outcomes 
 * 
 * Alignment Determination: 
 * - Scenario 1: Uses matchedStableValues list 
 * - Scenarios 2 & 3: Uses moralValuesReorderList 
 * - Aligned if: value in list AND no CVR "yes" answers 
 * 
 * Notes: 
 * - Most detailed metrics page for research analysis 
 * - Debug table shows all value lists and flags used 
 * - Infeasible options display includes checkbox status 
 * - All counters derived from event logs 
 * - Color-coded for quick visual analysis 
 * - Critical for understanding participant behavior patterns 
 * - Shows impact of CVR and APA interventions 
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Clock, 
  RotateCcw, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  MessageSquare, 
  Activity, 
  ThumbsUp, 
  ThumbsDown, 
  ArrowLeft
} from 'lucide-react';
import { SessionDVs, TelemetryEvent } from '../types/tracking';
import { SimulationMetrics } from '../types';
import { TrackingManager } from '../utils/trackingUtils';

const ViewResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<SessionDVs | null>(null);

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
      const allEvents: TelemetryEvent[] = TrackingManager.getAllEvents();

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

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Calculating session metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              View Results
            </h1>
          </div>
          <button
            onClick={() => navigate('/feedback')}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold text-lg py-4 px-6 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Feedback</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">CVR Arrivals</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.cvrArrivals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center">
              <RotateCcw className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">APA Reorderings</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.apaReorderings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Switches</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.switchCountTotal}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Decision Time</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(metrics.avgDecisionTime)}s</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
              CVR Answers
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <ThumbsUp className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm font-medium text-gray-700">"Yes, I would" Answers</span>
                </div>
                <span className="text-xl font-bold text-green-600">{metrics.cvrYesCount}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <ThumbsDown className="h-5 w-5 text-red-500 mr-3" />
                  <span className="text-sm font-medium text-gray-700">"No, I would not" Answers</span>
                </div>
                <span className="text-xl font-bold text-red-600">{metrics.cvrNoCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-red-600" />
              Post-CVR/APA Alignment Changes
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-500 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Misalignment Switches</span>
                </div>
                <span className="text-xl font-bold text-red-600">{metrics.misalignAfterCvrApaCount}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Realignment Switches</span>
                </div>
                <span className="text-xl font-bold text-green-600">{metrics.realignAfterCvrApaCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Indices</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Value Consistency Index</span>
              <span className="text-xl font-bold text-blue-600">{(metrics.valueConsistencyIndex * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Performance Composite</span>
              <span className="text-xl font-bold text-green-600">{metrics.performanceComposite.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Balance Index</span>
              <span className="text-xl font-bold text-purple-600">{metrics.balanceIndex.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Scenario Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scenario</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Final Choice</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Switches</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Time (s)</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">CVR Visits</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">CVR "Yes"</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">APA Count</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metrics.scenarioDetails.map((scenario, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      Scenario {scenario.scenarioId}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {scenario.finalChoice}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-medium text-gray-900">
                      {scenario.switches}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-700">
                      {scenario.timeSeconds}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-semibold text-blue-700">
                      {scenario.cvrVisitCount}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-semibold text-green-700">
                      {scenario.cvrYesAnswers}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-semibold text-purple-700">
                      {scenario.apaReorderCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg shadow-lg p-6 mb-8 border-2 border-yellow-400">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Debug Tracking - Comprehensive Scenario Behavior
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-yellow-300 bg-white rounded-lg">
              <thead className="bg-yellow-100">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-bold text-yellow-900 uppercase border-r border-yellow-300">
                    Scenario
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-yellow-900 uppercase border-r border-yellow-300">
                    Value Lists Used
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-yellow-900 uppercase border-r border-yellow-300">
                    Final Decision Label
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-bold text-yellow-900 uppercase border-r border-yellow-300">
                    Alignment Status
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-bold text-yellow-900 uppercase border-r border-yellow-300">
                    Flags at Confirmation
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-bold text-yellow-900 uppercase">
                    Interaction Counters
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-yellow-200">
                {(() => {
                  const scenariosFinalDecisionLabels = JSON.parse(localStorage.getItem('ScenariosFinalDecisionLabels') || '[]');
                  const checkingAlignmentList = JSON.parse(localStorage.getItem('CheckingAlignmentList') || '[]');
                  const finalValues = (() => {
                    try {
                      const saved = localStorage.getItem('finalValues');
                      if (saved) {
                        const parsed = JSON.parse(saved);
                        return parsed.map((v: any) => (v.name || v).toString());
                      }
                    } catch (e) {}
                    return [];
                  })();
                  const moralValuesReorder = (() => {
                    try {
                      const saved = localStorage.getItem('MoralValuesReorderList');
                      if (saved) {
                        const parsed = JSON.parse(saved);
                        return parsed.map((v: any) => (v.id || v.name || v).toString());
                      }
                    } catch (e) {}
                    return [];
                  })();

                  const scenario1MoralValueReordered = (() => {
                    try {
                      const saved = localStorage.getItem('Scenario1_MoralValueReordered');
                      if (saved) {
                        return JSON.parse(saved);
                      }
                    } catch (e) {}
                    return [];
                  })();

                  const scenario2MoralValueReordered = (() => {
                    try {
                      const saved = localStorage.getItem('Scenario2_MoralValueReordered');
                      if (saved) {
                        return JSON.parse(saved);
                      }
                    } catch (e) {}
                    return [];
                  })();

                  const scenario3MoralValueReordered = (() => {
                    try {
                      const saved = localStorage.getItem('Scenario3_MoralValueReordered');
                      if (saved) {
                        return JSON.parse(saved);
                      }
                    } catch (e) {}
                    return [];
                  })();

                  const scenario3InfeasibleOptions = (() => {
                    try {
                      const saved = localStorage.getItem('Scenario3_InfeasibleOptions');
                      if (saved) {
                        return JSON.parse(saved);
                      }
                    } catch (e) {}
                    return [];
                  })();

                  const allEvents = TrackingManager.getAllEvents();

                  return metrics.scenarioDetails.map((scenario, index) => {
                    const scenarioId = scenario.scenarioId;
                    const decisionLabel = scenariosFinalDecisionLabels[index] || 'N/A';
                    const alignmentStatus = checkingAlignmentList[index] || 'Unknown';

                    let scenarioSpecificList: string[] = [];
                    let scenarioSpecificListName = '';

                    if (scenarioId === 1) {
                      scenarioSpecificList = scenario1MoralValueReordered;
                      scenarioSpecificListName = 'Scenario1_MoralValueReordered';
                    } else if (scenarioId === 2) {
                      scenarioSpecificList = scenario2MoralValueReordered;
                      scenarioSpecificListName = 'Scenario2_MoralValueReordered';
                    } else if (scenarioId === 3) {
                      scenarioSpecificList = scenario3MoralValueReordered;
                      scenarioSpecificListName = 'Scenario3_MoralValueReordered';
                    }

                    const scenarioEvents = allEvents.filter(e => e.scenarioId === scenarioId);

                    const confirmationEvent = scenarioEvents.find(e => e.event === 'option_confirmed');
                    const flagsAtConfirmation = confirmationEvent?.flagsAtConfirmation;

                    const hadApaReorder = flagsAtConfirmation?.hasReorderedValues ?? false;
                    const hadCvrYes = flagsAtConfirmation?.cvrYesClicked ?? false;
                    const hadCvrNo = flagsAtConfirmation?.cvrNoClicked ?? false;
                    const hadSimulationMetricsReordering = flagsAtConfirmation?.simulationMetricsReorderingFlag ?? false;
                    const hadMoralValuesReordering = flagsAtConfirmation?.moralValuesReorderingFlag ?? false;

                    const cvrYesCount = scenarioEvents.filter(e => e.event === 'cvr_answered' && e.cvrAnswer === true).length;
                    const cvrNoCount = scenarioEvents.filter(e => e.event === 'cvr_answered' && e.cvrAnswer === false).length;
                    const apaReorderCount = scenarioEvents.filter(e => e.event === 'apa_reordered').length;
                    const alternativesAddedCount = scenarioEvents.filter(e => e.event === 'alternative_added').length;
                    const optionSwitches = Math.max(0, scenarioEvents.filter(e => e.event === 'option_selected').length - 1);

                    return (
                      <tr key={index} className="hover:bg-yellow-50">
                        <td className="px-3 py-4 whitespace-nowrap text-sm font-bold text-gray-900 border-r border-yellow-200">
                          Scenario {scenarioId}
                        </td>
                        <td className="px-3 py-4 text-xs border-r border-yellow-200">
                          <div className="space-y-2">
                            {scenarioSpecificList && (
                              <div className="bg-purple-50 p-2 rounded border-2 border-purple-400">
                                <p className="font-bold text-purple-900 mb-1">{scenarioSpecificListName}:</p>
                                <p className="text-purple-700 font-mono break-words">
                                  {scenarioSpecificList.length > 0
                                    ? `[${scenarioSpecificList.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(', ')}]`
                                    : '[ Empty ]'
                                  }
                                </p>
                              </div>
                            )}
                            <div className="bg-green-50 p-2 rounded border-2 border-green-400">
                              <p className="font-bold text-green-900 mb-1">FinalTopTwoValues:</p>
                              <p className="text-green-700 font-mono break-words">
                                {confirmationEvent?.finalTopTwoValuesBeforeUpdate && confirmationEvent.finalTopTwoValuesBeforeUpdate.length > 0
                                  ? `[${confirmationEvent.finalTopTwoValuesBeforeUpdate.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(', ')}]`
                                  : '[ Empty ]'
                                }
                              </p>
                            </div>
                            {scenarioId === 3 && scenario3InfeasibleOptions.length > 0 && (
                              <div className="bg-red-50 p-2 rounded border-2 border-red-400">
                                <p className="font-bold text-red-900 mb-2">Infeasible Options:</p>
                                <div className="space-y-1.5">
                                  {scenario3InfeasibleOptions.map((option: any, idx: number) => (
                                    <div key={idx} className="flex items-start gap-2 bg-white px-2 py-1.5 rounded border border-red-300">
                                      <div className={`flex-shrink-0 mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center ${
                                        option.checked
                                          ? 'bg-yellow-400 border-yellow-600'
                                          : 'bg-white border-gray-400'
                                      }`}>
                                        {option.checked && (
                                          <span className="text-yellow-900 text-xs font-bold leading-none">✓</span>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-xs font-semibold text-red-900 break-words">
                                          {option.title}
                                        </div>
                                        <div className="text-xs text-red-700 font-mono">
                                          ({option.label})
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm border-r border-yellow-200">
                          <div className="bg-cyan-50 px-3 py-2 rounded border border-cyan-300 inline-block">
                            <span className="font-bold text-cyan-900">
                              {decisionLabel.charAt(0).toUpperCase() + decisionLabel.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-center border-r border-yellow-200">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full font-bold text-sm ${
                            alignmentStatus === 'Aligned'
                              ? 'bg-green-100 text-green-800 border-2 border-green-400'
                              : 'bg-red-100 text-red-800 border-2 border-red-400'
                          }`}>
                            {alignmentStatus === 'Aligned' ? (
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-1" />
                            )}
                            {alignmentStatus}
                          </div>
                        </td>
                        <td className="px-3 py-4 border-r border-yellow-200">
                          {!flagsAtConfirmation ? (
                            <div className="bg-yellow-100 border-2 border-yellow-400 rounded p-2 text-xs text-yellow-900 font-bold">
                              No flag data captured at confirmation
                            </div>
                          ) : (
                            <div className="space-y-1 text-xs">
                              <div className={`flex items-center justify-between px-2 py-1 rounded ${
                                hadApaReorder ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                              }`}>
                                <span className="font-semibold">APA Reordered:</span>
                                <span className="ml-2 font-bold">{hadApaReorder ? '✓ Yes' : '✗ No'}</span>
                              </div>
                              <div className={`flex items-center justify-between px-2 py-1 rounded ${
                                hadCvrYes ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                              }`}>
                                <span className="font-semibold">CVR "Yes":</span>
                                <span className="ml-2 font-bold">{hadCvrYes ? '✓ Yes' : '✗ No'}</span>
                              </div>
                              <div className={`flex items-center justify-between px-2 py-1 rounded ${
                                hadCvrNo ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                              }`}>
                                <span className="font-semibold">CVR "No":</span>
                                <span className="ml-2 font-bold">{hadCvrNo ? '✓ Yes' : '✗ No'}</span>
                              </div>
                              <div className={`flex items-center justify-between px-2 py-1 rounded ${
                                hadSimulationMetricsReordering ? 'bg-cyan-100 text-cyan-800' : 'bg-gray-100 text-gray-600'
                              }`}>
                                <span className="font-semibold">Sim. Metrics Reord.:</span>
                                <span className="ml-2 font-bold">{hadSimulationMetricsReordering ? '✓ Yes' : '✗ No'}</span>
                              </div>
                              <div className={`flex items-center justify-between px-2 py-1 rounded ${
                                hadMoralValuesReordering ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                              }`}>
                                <span className="font-semibold">Moral Values Reord.:</span>
                                <span className="ml-2 font-bold">{hadMoralValuesReordering ? '✓ Yes' : '✗ No'}</span>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-4">
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-between px-2 py-1 bg-purple-50 rounded">
                              <span className="font-semibold text-purple-900">APA Reorders:</span>
                              <span className="ml-2 font-bold text-purple-700">{apaReorderCount}</span>
                            </div>
                            <div className="flex items-center justify-between px-2 py-1 bg-green-50 rounded">
                              <span className="font-semibold text-green-900">CVR "Yes":</span>
                              <span className="ml-2 font-bold text-green-700">{cvrYesCount}</span>
                            </div>
                            <div className="flex items-center justify-between px-2 py-1 bg-red-50 rounded">
                              <span className="font-semibold text-red-900">CVR "No":</span>
                              <span className="ml-2 font-bold text-red-700">{cvrNoCount}</span>
                            </div>
                            <div className="flex items-center justify-between px-2 py-1 bg-blue-50 rounded">
                              <span className="font-semibold text-blue-900">Alternatives:</span>
                              <span className="ml-2 font-bold text-blue-700">{alternativesAddedCount}</span>
                            </div>
                            <div className="flex items-center justify-between px-2 py-1 bg-orange-50 rounded">
                              <span className="font-semibold text-orange-900">Switches:</span>
                              <span className="ml-2 font-bold text-orange-700">{optionSwitches}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t-2 border-yellow-400">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg border border-yellow-300">
                <p className="text-xs font-semibold text-gray-600 mb-2">Session Totals</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total CVR Arrivals:</span>
                    <span className="font-bold text-blue-700">{metrics.cvrArrivals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total APA Reorderings:</span>
                    <span className="font-bold text-purple-700">{metrics.apaReorderings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total Switches:</span>
                    <span className="font-bold text-orange-700">{metrics.switchCountTotal}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-yellow-300">
                <p className="text-xs font-semibold text-gray-600 mb-2">CVR Response Summary</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-700">"Yes, I would" answers:</span>
                    <span className="font-bold text-green-700">{metrics.cvrYesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">"No, I would not" answers:</span>
                    <span className="font-bold text-red-700">{metrics.cvrNoCount}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-yellow-300">
                <p className="text-xs font-semibold text-gray-600 mb-2">Alignment Summary</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Aligned Decisions:</span>
                    <span className="font-bold text-green-700">
                      {metrics.finalAlignmentByScenario.filter(Boolean).length} / {metrics.finalAlignmentByScenario.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Value Consistency:</span>
                    <span className="font-bold text-blue-700">{(metrics.valueConsistencyIndex * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewResultsPage;
