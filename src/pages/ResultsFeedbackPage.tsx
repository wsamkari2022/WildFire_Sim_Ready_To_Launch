import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Download,
  Clock,
  RotateCcw,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Star,
  Eye,
  MessageSquare,
  RefreshCcw,
  Activity,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { SimulationMetrics } from '../types';
import { SessionDVs, TelemetryEvent } from '../types/tracking';
import { TrackingManager } from '../utils/trackingUtils';
import { DatabaseService } from '../lib/databaseService';

interface FeedbackData {
  decisionSatisfaction: number;
  processSatisfaction: number;
  perceivedTransparency: number;
  notesFreeText: string;
}

const ResultsFeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<SessionDVs | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData>({
    decisionSatisfaction: 4,
    processSatisfaction: 4,
    perceivedTransparency: 4,
    notesFreeText: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExport, setShowExport] = useState(false);

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

      // Get matched stable values (original from implicit preference)
      const matchedStableValues: string[] = matchedValues.map((v: any) => (v.name || v).toString().toLowerCase());

      // Get moral values reorder list (used for scenarios 2 & 3)
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

      // 1. CVR Arrivals - count all CVR opens from events
      const cvrOpenEvents = allEvents.filter(e => e.event === 'cvr_opened');
      const cvrArrivals = cvrOpenEvents.length;

      // 2. CVR Yes/No Answers - count from cvr_answered events
      const cvrAnswerEvents = allEvents.filter(e => e.event === 'cvr_answered');
      const cvrYesCount = cvrAnswerEvents.filter(e => e.cvrAnswer === true).length;
      const cvrNoCount = cvrAnswerEvents.filter(e => e.cvrAnswer === false).length;

      // 3. APA Reorderings - count from apa_reordered events
      const apaEvents = allEvents.filter(e => e.event === 'apa_reordered');
      const apaReorderings = apaEvents.length;

      // 4. Decision Times - calculate from scenario history with actual timestamps
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

      // Fallback: if no scenario history timing, estimate from events
      if (decisionTimes.length === 0) {
        const scenarioStarts = new Map<number, number>();
        const scenarioEnds = new Map<number, number>();

        allEvents.forEach(event => {
          if (event.scenarioId !== undefined) {
            const eventTime = new Date(event.timestamp).getTime();

            if (event.event === 'scenario_started') {
              scenarioStarts.set(event.scenarioId, eventTime);
            } else if (event.event === 'option_confirmed' || event.event === 'scenario_completed') {
              scenarioEnds.set(event.scenarioId, eventTime);
            }
          }
        });

        simulationOutcomes.forEach((outcome: any) => {
          const startTime = scenarioStarts.get(outcome.scenarioId);
          const endTime = scenarioEnds.get(outcome.scenarioId);

          if (startTime && endTime) {
            const timeSeconds = (endTime - startTime) / 1000;
            decisionTimes.push(timeSeconds);
          } else {
            // Final fallback
            decisionTimes.push(75);
          }
        });
      }

      const avgDecisionTime = decisionTimes.length > 0
        ? decisionTimes.reduce((a, b) => a + b, 0) / decisionTimes.length
        : 0;

      // 5. Calculate alignment for each scenario and create scenario details
      const finalAlignmentByScenario: boolean[] = [];
      const scenarioDetails: SessionDVs['scenarioDetails'] = [];

      simulationOutcomes.forEach((outcome: any, index: number) => {
        const optionValue = (outcome.decision.label || '').toLowerCase();
        const scenarioId = outcome.scenarioId;

        // Count CVR visits and answers for this scenario first
        const scenarioCvrVisits = cvrOpenEvents.filter(e => e.scenarioId === outcome.scenarioId);
        const scenarioCvrYesAnswers = cvrAnswerEvents.filter(
          e => e.scenarioId === outcome.scenarioId && e.cvrAnswer === true
        );

        // Check if the selected option exists in the appropriate value list
        let valueExistsInList = false;
        if (scenarioId === 1) {
          // Scenario 1: Check against matchedStableValues
          valueExistsInList = matchedStableValues.includes(optionValue);
        } else if (scenarioId === 2 || scenarioId === 3) {
          // Scenarios 2 & 3: Check against moralValuesReorderList
          valueExistsInList = moralValuesReorderList.includes(optionValue);
        }

        // Aligned = value exists in list AND no CVR "Yes" answer
        // Not Aligned = value does NOT exist in list OR CVR "Yes" answer
        const aligned = valueExistsInList && scenarioCvrYesAnswers.length === 0;

        finalAlignmentByScenario.push(aligned);

        // Get detailed tracking data if available
        const trackingData = scenarioDetailsMap.get(outcome.scenarioId) || {
          timeSeconds: Math.round(decisionTimes[index] || 0),
          switches: 0,
          cvrVisited: false,
          cvrVisitCount: 0,
          cvrYesAnswers: 0,
          apaReordered: false,
          apaReorderCount: 0
        };

        // Count switches from option_selected events for this scenario
        const scenarioOptionSelections = allEvents.filter(
          e => e.event === 'option_selected' && e.scenarioId === outcome.scenarioId
        );
        const switchCount = Math.max(0, scenarioOptionSelections.length - 1);

        // Count APA reorderings for this scenario
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

      // 6. Total switch count - sum from all scenarios
      const switchCountTotal = scenarioDetails.reduce((sum, s) => sum + s.switches, 0);

      // 7. Value consistency index (% of aligned decisions)
      const alignedCount = finalAlignmentByScenario.filter(Boolean).length;
      const valueConsistencyIndex = finalAlignmentByScenario.length > 0
        ? alignedCount / finalAlignmentByScenario.length
        : 0;

      // 8. Performance composite - normalized z-score average of objectives
      const performanceComposite = calculatePerformanceComposite(finalMetrics);

      // 9. Balance index - 1 minus variance of normalized objectives
      const balanceIndex = calculateBalanceIndex(finalMetrics);

      // 10. Misalignment and realignment counts after CVR/APA
      let misalignAfterCvrApaCount = 0;
      let realignAfterCvrApaCount = 0;

      // For each scenario, check realignment and misalignment
      scenarioDetails.forEach((scenario, index) => {
        const outcome = simulationOutcomes[index];
        const scenarioId = outcome.scenarioId;
        const scenarioEvents = allEvents.filter(e => e.scenarioId === scenario.scenarioId);

        // Get the confirmation event to check the reordering flags
        const confirmationEvent = scenarioEvents.find(e => e.event === 'option_confirmed');
        const flagsAtConfirmation = confirmationEvent?.flagsAtConfirmation;

        // Realignment Switch: Count if user reordered via simulation metrics OR moral values in APA modal
        if (flagsAtConfirmation) {
          const hadSimulationMetricsReordering = flagsAtConfirmation.simulationMetricsReorderingFlag ?? false;
          const hadMoralValuesReordering = flagsAtConfirmation.moralValuesReorderingFlag ?? false;

          // Increment if EITHER reordering flag is true
          if (hadSimulationMetricsReordering || hadMoralValuesReordering) {
            realignAfterCvrApaCount++;
          }
        }

        // Misalignment: Final choice is not aligned (either not in list OR CVR Yes)
        if (!scenario.aligned) {
          misalignAfterCvrApaCount++;
        }
      });

      // 11. Value order trajectories - track value ordering after each APA
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

    const sessionId = DatabaseService.getSessionId();

    // Retrieve the tracking lists from localStorage
    const scenariosFinalDecisionLabels = JSON.parse(localStorage.getItem('ScenariosFinalDecisionLabels') || '[]');
    const checkingAlignmentList = JSON.parse(localStorage.getItem('CheckingAlignmentList') || '[]');

    await DatabaseService.insertSessionFeedback({
      session_id: sessionId,
      decision_satisfaction: feedback.decisionSatisfaction,
      process_satisfaction: feedback.processSatisfaction,
      perceived_transparency: feedback.perceivedTransparency,
      notes_free_text: feedback.notesFreeText,
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

    await DatabaseService.updateUserSession(sessionId, {
      is_completed: true,
      completed_at: new Date().toISOString()
    });

    await DatabaseService.syncFallbackData();

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

  const handleRestart = () => {
    const demographics = localStorage.getItem('userDemographics');
    localStorage.clear();
    if (demographics) {
      localStorage.setItem('userDemographics', demographics);
    }
    navigate('/demographics');
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Results & Feedback
              </h1>
            </div>
            <div className="flex gap-3">
              {showExport && (
                <>
                  <button
                    onClick={() => handleExportData('json')}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Download size={16} className="mr-2" />
                    JSON
                  </button>
                  <button
                    onClick={() => handleExportData('csv')}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    <Download size={16} className="mr-2" />
                    CSV
                  </button>
                </>
              )}
              <button
                onClick={handleRestart}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <RefreshCcw size={16} className="mr-2" />
                Restart
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Summary Cards */}
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

        {/* CVR Answers & Alignment Changes */}
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

        {/* Performance Indices */}
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

        {/* Scenario Details Table */}
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

        {/* Debug Tracking Table */}
        <div className="bg-yellow-50 rounded-lg shadow-lg p-6 mb-8 border-2 border-yellow-400">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            🐛 Debug Tracking - Comprehensive Scenario Behavior
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

                  // Get scenario-specific moral value reordered lists
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

                  return metrics.scenarioDetails.map((scenario, index) => {
                    const scenarioId = scenario.scenarioId;
                    const decisionLabel = scenariosFinalDecisionLabels[index] || 'N/A';
                    const alignmentStatus = checkingAlignmentList[index] || 'Unknown';

                    // Get the scenario-specific value list
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

                    const valueListUsed = scenarioId === 1 ? finalValues : moralValuesReorder;
                    const valueListName = scenarioId === 1 ? 'finalValues' : 'MoralValuesReorderList';

                    const allEvents = TrackingManager.getAllEvents();
                    const scenarioEvents = allEvents.filter(e => e.scenarioId === scenarioId);

                    const confirmationEvent = scenarioEvents.find(e => e.event === 'option_confirmed');
                    const flagsAtConfirmation = confirmationEvent?.flagsAtConfirmation;

                    console.log(`[Debug] Scenario ${scenarioId} - Confirmation event:`, confirmationEvent);
                    console.log(`[Debug] Scenario ${scenarioId} - Flags at confirmation:`, flagsAtConfirmation);

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

                    console.log(`[Debug] Scenario ${scenarioId} - Counters - CVR Yes: ${cvrYesCount}, CVR No: ${cvrNoCount}, APA: ${apaReorderCount}, Alternatives: ${alternativesAddedCount}, Switches: ${optionSwitches}`);

                    if (!confirmationEvent) {
                      console.warn(`[Warning] No confirmation event found for Scenario ${scenarioId}`);
                    }
                    if (confirmationEvent && !flagsAtConfirmation) {
                      console.warn(`[Warning] No flags captured at confirmation for Scenario ${scenarioId}`);
                    }

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
                              ⚠️ No flag data captured at confirmation
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

          {/* Summary Footer */}
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

        {/* Feedback Sliders */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-500" />
            Your Feedback
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Decision Satisfaction
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500 w-4">1</span>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={feedback.decisionSatisfaction}
                  onChange={(e) => handleSliderChange('decisionSatisfaction', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  disabled={isSubmitted}
                />
                <span className="text-xs text-gray-500 w-4">7</span>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-base font-bold text-blue-600">{feedback.decisionSatisfaction}</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                <span>Very Dissatisfied</span>
                <span>Very Satisfied</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Process Satisfaction
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500 w-4">1</span>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={feedback.processSatisfaction}
                  onChange={(e) => handleSliderChange('processSatisfaction', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  disabled={isSubmitted}
                />
                <span className="text-xs text-gray-500 w-4">7</span>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-base font-bold text-green-600">{feedback.processSatisfaction}</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                <span>Very Poor</span>
                <span>Excellent</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Perceived Transparency
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500 w-4">1</span>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={feedback.perceivedTransparency}
                  onChange={(e) => handleSliderChange('perceivedTransparency', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  disabled={isSubmitted}
                />
                <span className="text-xs text-gray-500 w-4">7</span>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-base font-bold text-purple-600">{feedback.perceivedTransparency}</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                <span>Not Transparent</span>
                <span>Very Transparent</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                Additional Comments (Optional)
              </label>
              <textarea
                value={feedback.notesFreeText}
                onChange={(e) => setFeedback(prev => ({ ...prev, notesFreeText: e.target.value }))}
                rows={4}
                disabled={isSubmitted}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Share any additional thoughts about your experience..."
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

export default ResultsFeedbackPage;
