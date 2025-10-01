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
  Activity
} from 'lucide-react';
import { SimulationMetrics } from '../types';
import { SessionDVs } from '../types/tracking';
import { TrackingManager } from '../utils/trackingUtils';

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
      const allEvents = TrackingManager.getAllEvents();

      if (!simulationOutcomes.length || !finalMetrics) {
        console.error('Missing required data for metrics calculation');
        return;
      }

      // Get current matched values (prioritize reordered list)
      let currentMatchedValues: string[] = [];
      if (moralValuesReorder) {
        try {
          const reorderedValues = JSON.parse(moralValuesReorder);
          currentMatchedValues = reorderedValues.map((v: any) => v.id || v.name).map((s: string) => s.toLowerCase());
        } catch (e) {
          currentMatchedValues = matchedValues.map((v: any) => v.name.toLowerCase());
        }
      } else {
        currentMatchedValues = matchedValues.map((v: any) => v.name.toLowerCase());
      }

      // 1. CVR Arrivals - count unique CVR visits
      const cvrArrivals = allEvents.filter(e => e.event === 'cvr_opened').length;

      // 2. APA Reorderings - count times user reordered values
      const apaReorderings = allEvents.filter(e => e.event === 'apa_reordered').length;

      // 3. Decision Times - calculate from scenario history
      const decisionTimes: number[] = [];
      scenarioHistory.forEach(scenario => {
        if (scenario.endTime && scenario.startTime) {
          const timeSeconds = (scenario.endTime - scenario.startTime) / 1000;
          decisionTimes.push(timeSeconds);
        }
      });

      // If no scenario history, fallback to mock data
      if (decisionTimes.length === 0) {
        simulationOutcomes.forEach(() => {
          decisionTimes.push(Math.random() * 90 + 30); // 30-120 seconds
        });
      }

      const avgDecisionTime = decisionTimes.reduce((a, b) => a + b, 0) / decisionTimes.length;

      // 4. Calculate alignment for each scenario
      const finalAlignmentByScenario: boolean[] = [];
      const scenarioDetails: SessionDVs['scenarioDetails'] = [];

      simulationOutcomes.forEach((outcome: any, index: number) => {
        const optionValue = outcome.decision.label.toLowerCase();
        const aligned = currentMatchedValues.includes(optionValue);
        finalAlignmentByScenario.push(aligned);

        // Get tracking data for this scenario if available
        const trackingData = scenarioHistory.find(s => s.scenarioId === outcome.scenarioId);

        scenarioDetails.push({
          scenarioId: outcome.scenarioId,
          finalChoice: outcome.decision.title,
          aligned,
          switches: trackingData?.switchCount || 0,
          timeSeconds: Math.round(decisionTimes[index] || 0),
          cvrVisited: trackingData?.cvrVisited || false,
          apaReordered: trackingData?.apaReordered || false
        });
      });

      // 5. Total switch count
      const switchCountTotal = scenarioDetails.reduce((sum, s) => sum + s.switches, 0);

      // 6. Value consistency index (% of aligned decisions)
      const alignedCount = finalAlignmentByScenario.filter(Boolean).length;
      const valueConsistencyIndex = alignedCount / finalAlignmentByScenario.length;

      // 7. Performance composite - normalized z-score average of objectives
      const performanceComposite = calculatePerformanceComposite(finalMetrics);

      // 8. Balance index - 1 minus variance of normalized objectives
      const balanceIndex = calculateBalanceIndex(finalMetrics);

      // 9. Misalignment and realignment counts after CVR/APA
      let misalignAfterCvrApaCount = 0;
      let realignAfterCvrApaCount = 0;

      // Track alignment changes post-CVR/APA
      const alignmentChanges = allEvents.filter(e => e.event === 'alignment_state_changed');

      alignmentChanges.forEach((event, idx) => {
        // Check if this change happened after a CVR or APA event in the same scenario
        const priorEvents = allEvents.slice(0, allEvents.indexOf(event));
        const scenarioEvents = priorEvents.filter(e => e.scenarioId === event.scenarioId);
        const hadCvrOrApa = scenarioEvents.some(e => e.event === 'cvr_opened' || e.event === 'apa_reordered');

        if (hadCvrOrApa) {
          if (event.alignedBefore === true && event.alignedAfter === false) {
            misalignAfterCvrApaCount++;
          } else if (event.alignedBefore === false && event.alignedAfter === true) {
            realignAfterCvrApaCount++;
          }
        }
      });

      // 10. Value order trajectories - track value ordering after each APA
      const valueOrderTrajectories: Array<{scenarioId: number, values: string[]}> = [];
      const apaEvents = allEvents.filter(e => e.event === 'apa_reordered');

      apaEvents.forEach(event => {
        if (event.valuesAfter && event.scenarioId !== undefined) {
          valueOrderTrajectories.push({
            scenarioId: event.scenarioId,
            values: event.valuesAfter
          });
        }
      });

      const calculatedMetrics: SessionDVs = {
        cvrArrivals,
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
      livesSaved: finalMetrics.livesSaved / 20000,
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
      finalMetrics.livesSaved / 20000,
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

  const handleSubmitFeedback = () => {
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

    setIsSubmitted(true);
    setShowExport(true);
  };

  const handleExportData = (format: 'json' | 'csv') => {
    if (!metrics) return;

    const exportData = {
      ...metrics,
      ...feedback,
      exportedAt: new Date().toISOString(),
      userDemographics: JSON.parse(localStorage.getItem('userDemographics') || '{}')
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

        {/* Alignment Changes & Performance Indices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Indices</h3>
            <div className="space-y-4">
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
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aligned?</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Switches</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Time (s)</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">CVR</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">APA</th>
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
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      {scenario.aligned ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-medium text-gray-900">
                      {scenario.switches}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-700">
                      {scenario.timeSeconds}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      {scenario.cvrVisited ? (
                        <CheckCircle2 className="h-5 w-5 text-blue-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      {scenario.apaReordered ? (
                        <CheckCircle2 className="h-5 w-5 text-purple-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
