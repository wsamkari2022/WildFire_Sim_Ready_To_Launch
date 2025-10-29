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
  Lightbulb
} from 'lucide-react';
import { SessionDVs } from '../types/tracking';
import { SimulationMetrics } from '../types';
import { TrackingManager } from '../utils/trackingUtils';
import { DatabaseService } from '../lib/databaseService';

interface FeedbackData {
  cvrHelpfulness: number;
  cvrClarity: number;
  cvrImpact: number;
  cvrComments: string;
  apaComparisonUsefulness: number;
  apaReorderingEffectiveness: number;
  apaPerspectiveValue: number;
  apaComments: string;
  vizExpertUsefulness: number;
  vizChartClarity: number;
  vizTradeoffValue: number;
  vizComments: string;
  decisionSatisfaction: number;
  processSatisfaction: number;
  perceivedTransparency: number;
  notesFreeText: string;
}

const FeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<FeedbackData>({
    cvrHelpfulness: 4,
    cvrClarity: 4,
    cvrImpact: 4,
    cvrComments: '',
    apaComparisonUsefulness: 4,
    apaReorderingEffectiveness: 4,
    apaPerspectiveValue: 4,
    apaComments: '',
    vizExpertUsefulness: 4,
    vizChartClarity: 4,
    vizTradeoffValue: 4,
    vizComments: '',
    decisionSatisfaction: 4,
    processSatisfaction: 4,
    perceivedTransparency: 4,
    notesFreeText: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExport, setShowExport] = useState(false);
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

    const scenariosFinalDecisionLabels = JSON.parse(localStorage.getItem('ScenariosFinalDecisionLabels') || '[]');
    const checkingAlignmentList = JSON.parse(localStorage.getItem('CheckingAlignmentList') || '[]');

    await DatabaseService.insertSessionFeedback({
      session_id: sessionId,
      cvr_helpfulness: feedback.cvrHelpfulness,
      cvr_clarity: feedback.cvrClarity,
      cvr_impact: feedback.cvrImpact,
      cvr_comments: feedback.cvrComments,
      apa_comparison_usefulness: feedback.apaComparisonUsefulness,
      apa_reordering_effectiveness: feedback.apaReorderingEffectiveness,
      apa_perspective_value: feedback.apaPerspectiveValue,
      apa_comments: feedback.apaComments,
      viz_expert_usefulness: feedback.vizExpertUsefulness,
      viz_chart_clarity: feedback.vizChartClarity,
      viz_tradeoff_value: feedback.vizTradeoffValue,
      viz_comments: feedback.vizComments,
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

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Eye className="h-5 w-5 mr-2 text-blue-600" />
              Value Reflection Mechanism (CVR)
            </h3>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
              <span className="text-xs font-medium text-blue-700">Total CVR Interactions:</span>
              <span className="text-sm font-bold text-blue-900">{metrics.cvrArrivals}</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            The CVR (Cognitive Value Recontextulization) mechanism presented you with alternative scenarios to help understand your chosen options from different contexts and perspectives. Please rate how this feature impacted your decision-making process.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How helpful were CVR questions in reconsidering your decisions?
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500 w-4">1</span>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={feedback.cvrHelpfulness}
                  onChange={(e) => handleSliderChange('cvrHelpfulness', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  disabled={isSubmitted}
                />
                <span className="text-xs text-gray-500 w-4">7</span>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-base font-bold text-blue-600">{feedback.cvrHelpfulness}</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                <span>Not Helpful</span>
                <span>Very Helpful</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How clear was the CVR question presentation?
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500 w-4">1</span>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={feedback.cvrClarity}
                  onChange={(e) => handleSliderChange('cvrClarity', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  disabled={isSubmitted}
                />
                <span className="text-xs text-gray-500 w-4">7</span>
                <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                  <span className="text-base font-bold text-cyan-600">{feedback.cvrClarity}</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                <span>Very Unclear</span>
                <span>Very Clear</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What was the impact of CVR scenarios on your final decisions?
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500 w-4">1</span>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={feedback.cvrImpact}
                  onChange={(e) => handleSliderChange('cvrImpact', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  disabled={isSubmitted}
                />
                <span className="text-xs text-gray-500 w-4">7</span>
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-base font-bold text-teal-600">{feedback.cvrImpact}</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                <span>No Impact</span>
                <span>High Impact</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                Comments about CVR Experience (Optional)
              </label>
              <textarea
                value={feedback.cvrComments}
                onChange={(e) => setFeedback(prev => ({ ...prev, cvrComments: e.target.value }))}
                rows={3}
                disabled={isSubmitted}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Share your thoughts about the Value Reflection mechanism..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <RefreshCcw className="h-5 w-5 mr-2 text-green-600" />
              Adaptive Preference Analysis (APA)
            </h3>
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
              <span className="text-xs font-medium text-green-700">Total APA Reorderings:</span>
              <span className="text-sm font-bold text-green-900">{metrics.apaReorderings}</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            The APA (Adaptive Preference Alignment) feature allowed you to compare your chosen options with CVR scenarios and reorder your values based on new insights. This helped you understand options from different perspectives and align future choices with your reordered values.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How useful was comparing your simulation choices with CVR scenarios?
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
                <span>Not Useful</span>
                <span>Very Useful</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How effective was the value reordering feature?
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500 w-4">1</span>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={feedback.apaReorderingEffectiveness}
                  onChange={(e) => handleSliderChange('apaReorderingEffectiveness', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  disabled={isSubmitted}
                />
                <span className="text-xs text-gray-500 w-4">7</span>
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-base font-bold text-emerald-600">{feedback.apaReorderingEffectiveness}</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                <span>Not Effective</span>
                <span>Very Effective</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How valuable was understanding options from different perspectives through APA?
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
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-base font-bold text-teal-600">{feedback.apaPerspectiveValue}</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                <span>Not Valuable</span>
                <span>Very Valuable</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                Comments about APA Experience (Optional)
              </label>
              <textarea
                value={feedback.apaComments}
                onChange={(e) => setFeedback(prev => ({ ...prev, apaComments: e.target.value }))}
                rows={3}
                disabled={isSubmitted}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Share your thoughts about the Adaptive Preference Analysis feature..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-orange-600" />
              Decision Support Tools
            </h3>
            <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full">
              <Lightbulb className="h-4 w-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-700">Visualization & Analysis</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Throughout the simulation, you had access to expert recommendations, trade-off visualizations (radar and bar charts), and comparison tools to help you understand the implications of different choices.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How useful were the expert analyses and recommendations?
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
                <span>Not Useful</span>
                <span>Very Useful</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How clear were the radar and bar chart visualizations?
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500 w-4">1</span>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={feedback.vizChartClarity}
                  onChange={(e) => handleSliderChange('vizChartClarity', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  disabled={isSubmitted}
                />
                <span className="text-xs text-gray-500 w-4">7</span>
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-base font-bold text-amber-600">{feedback.vizChartClarity}</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                <span>Very Unclear</span>
                <span>Very Clear</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How valuable were the trade-off comparisons and differences view?
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500 w-4">1</span>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={feedback.vizTradeoffValue}
                  onChange={(e) => handleSliderChange('vizTradeoffValue', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  disabled={isSubmitted}
                />
                <span className="text-xs text-gray-500 w-4">7</span>
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-base font-bold text-yellow-600">{feedback.vizTradeoffValue}</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1 px-8">
                <span>Not Valuable</span>
                <span>Very Valuable</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                Comments about Visualization Tools (Optional)
              </label>
              <textarea
                value={feedback.vizComments}
                onChange={(e) => setFeedback(prev => ({ ...prev, vizComments: e.target.value }))}
                rows={3}
                disabled={isSubmitted}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Share your thoughts about the visualization and analysis tools..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-500" />
            Overall Experience Feedback
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
              <div className="flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-500 mr-3" />
                <span className="text-green-800 font-semibold text-lg">Feedback submitted successfully!</span>
              </div>
              {showExport && (
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => handleExportData('json')}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Download size={16} className="mr-2" />
                    Export JSON
                  </button>
                  <button
                    onClick={() => handleExportData('csv')}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    <Download size={16} className="mr-2" />
                    Export CSV
                  </button>
                </div>
              )}
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

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Explore Your Results
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/final-analysis')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
            >
              <FileText className="h-6 w-6" />
              <span>View Final Analysis Report</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/view-results')}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
            >
              <BarChart2 className="h-6 w-6" />
              <span>View Results</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
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

export default FeedbackPage;
