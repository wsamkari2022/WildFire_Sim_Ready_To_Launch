/**
 * FINAL ANALYSIS PAGE - VALUE ASSESSMENT ANALYSIS (KEY PAGE #1)
 *
 * Purpose:
 * - Comprehensive value consistency analysis across all phases
 * - One of the 4 key analysis pages you specifically requested documentation for
 * - Displays value distribution across explicit, implicit, and simulation phases
 * - Shows value stability scores and alignment analysis
 * - Visualizes consistency trends over time
 * - Presents final simulation metrics
 *
 * Dependencies:
 * - react-router-dom: Navigation
 * - lucide-react: UI icons
 * - chart.js, react-chartjs-2: Bar and Line charts
 * - SimulationMetrics, DecisionOption types: Data structures
 * - ValueStabilityTable component: Detailed stability breakdown
 *
 * Direct Database Calls:
 * - None (reads from localStorage only for display)
 * - This is an analysis/visualization page
 *
 * Data Read from localStorage:
 * - 'explicitValues': Baseline explicit value choices
 * - 'deepValues': Implicit value assessment results
 * - 'simulationScenarioOutcomes': Simulation decisions
 * - 'finalSimulationMetrics': Cumulative metrics
 * - 'ExplicitValueFrequencies': Frequency analysis of explicit values
 * - 'ImplicitValueFrequencies': Frequency analysis of implicit values
 * - 'ScenariosFinalDecisionLabels': Decision labels per scenario
 * - 'CheckingAlignmentList': Alignment status per scenario
 * - 'sessionEventLogs': Event logs for flag analysis
 *
 * Key Data Displayed: 
 * 
 * 1. Value Distribution Analysis (Bar Chart): 
 *    - Compares value frequencies across 3 phases: 
 *      - Explicit Choices (from explicit assessment) 
 *      - Implicit Choices (from implicit assessment) 
 *      - Simulation Decisions (from 3 scenarios) 
 *    - Shows how often each of 5 values appeared in each phase 
 *    - Visualizes shifts in value priorities 
 * 
 * 2. Value Stability Analysis: 
 *    - Overall Stability Score (weighted: 40% explicit, 60% implicit) 
 *    - Per-scenario stability scores 
 *    - Matches between selected values and baseline preferences 
 *    - Detailed stability table with: 
 *      - Scenario ID 
 *      - Selected Value 
 *      - Matches Explicit (boolean) 
 *      - Matches Implicit (boolean) 
 *      - Stability Score (0-100) 
 * 
 * 3. Decision Alignment Overview: 
 *    - Overall alignment rate (X/3 scenarios) 
 *    - Per-scenario alignment cards showing: 
 *      - Final decision label 
 *      - Aligned/Not Aligned status 
 *      - Interaction flags: CVR responses, APA reorderings 
 * 
 * 4. Value Consistency Trend (Line Chart): 
 *    - Tracks consistency scores across phases 
 *    - X-axis: Explicit Choices → Implicit Choices → Scenario 1 → Scenario 2 → Scenario 3 
 *    - Y-axis: Consistency Score (0-100%) 
 *    - Separate line for each value selected in scenarios 
 *    - Shows value priority evolution over time 
 * 
 * 5. Final Simulation Metrics: 
 *    - Lives Saved 
 *    - Casualties 
 *    - Resource remaining percentages 
 *    - Infrastructure, biodiversity, properties, nuclear station conditions 
 * 
 * Flow Position: Step 10 of 13 (accessed from /feedback) 
 * Previous Page: /feedback 
 * Next Page: Back to /feedback 
 * 
 * Calculation Details: 
 * 
 * Stability Score Calculation: 
 * - If value matches explicit choices: +40 points 
 * - If value matches implicit choices: +60 points 
 * - Maximum score: 100 (matches both) 
 * - Used to assess value-decision consistency 
 * 
 * Alignment Determination: 
 * - Aligned: Selected option's value is in top-2 matched values AND no CVR \"yes\" answers 
 * - Not Aligned: Otherwise 
 * 
 * Consistency Trend Scores: 
 * - Explicit Phase: % of times value appeared in explicit choices 
 * - Implicit Phase: % of times value appeared in implicit choices 
 * - Scenario Phases: 
 *   - 100 if value was selected in that scenario 
 *   - 50 if value was in top-2 but not selected 
 *   - 0 otherwise 
 * 
 * Notes: 
 * - Critical analysis page for research insights 
 * - All data comes from localStorage (no database calls) 
 * - Provides visual feedback on value consistency 
 * - Helps participants understand their decision patterns 
 * - Charts use Chart.js for interactive visualizations 
 * - Color-coded alignment status for quick interpretation 
 * - Includes interaction flags from CVR and APA mechanisms
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart2, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight, 
  Scale, 
  Brain, 
  Flame, 
  Target, 
  CheckCircle2, 
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
import { SimulationMetrics, DecisionOption } from '../types';
import ValueStabilityTable from '../components/ValueStabilityTable';

// Register Chart.js components
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

// Initialize value trends with empty arrays for each moral value
const initializeValueTrends = (): ValueTrend => {
  const trends: ValueTrend = {};
  MORAL_VALUES.forEach(value => {
    trends[value.toLowerCase()] = [];
  });
  return trends;
};

const FinalAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [explicitValueCounts, setExplicitValueCounts] = useState<ValueCount>({});
  const [implicitValueCounts, setImplicitValueCounts] = useState<ValueCount>({});
  const [valueMatches, setValueMatches] = useState<ValueMatch[]>([]);
  const [finalMetrics, setFinalMetrics] = useState<SimulationMetrics | null>(null);
  const [overallStabilityScore, setOverallStabilityScore] = useState<number>(0);
  const [showError, setShowError] = useState(false);
  const [valueTrends, setValueTrends] = useState<ValueTrend>(initializeValueTrends());
  const [explicitValueFrequencies, setExplicitValueFrequencies] = useState<Array<{value: string, count: number, percentage: number}>>([]);
  const [implicitValueFrequencies, setImplicitValueFrequencies] = useState<Array<{value: string, count: number, percentage: number}>>([]);

  useEffect(() => {
    try {
      // Load all required data
      const explicitValues = JSON.parse(localStorage.getItem('explicitValues') || '[]');
      const implicitValues = JSON.parse(localStorage.getItem('deepValues') || '[]');
      const simulationOutcomes = JSON.parse(localStorage.getItem('simulationScenarioOutcomes') || '[]');
      const metrics = JSON.parse(localStorage.getItem('finalSimulationMetrics') || 'null');

      if (!explicitValues.length || !implicitValues.length || !simulationOutcomes.length || !metrics) {
        setShowError(true);
        return;
      }

      // Load value frequency data
      const explicitFreqs = JSON.parse(localStorage.getItem('ExplicitValueFrequencies') || '[]');
      const implicitFreqs = JSON.parse(localStorage.getItem('ImplicitValueFrequencies') || '[]');
      setExplicitValueFrequencies(explicitFreqs);
      setImplicitValueFrequencies(implicitFreqs);

      // Process explicit values
      const explicitCounts: ValueCount = {};
      explicitValues.forEach((value: any) => {
        const normalizedValue = value.value_selected.toLowerCase();
        explicitCounts[normalizedValue] = (explicitCounts[normalizedValue] || 0) + 1;
      });
      setExplicitValueCounts(explicitCounts);

      // Process implicit values
      const implicitCounts: ValueCount = {};
      implicitValues.forEach((value: any) => {
        const normalizedValue = value.name.toLowerCase();
        implicitCounts[normalizedValue] = (implicitCounts[normalizedValue] || 0) + 1;
      });
      setImplicitValueCounts(implicitCounts);

      // Initialize trends with only the values that appear in decisions
      const selectedValues = new Set(simulationOutcomes.map((outcome: any) => 
        outcome.decision.label.toLowerCase()
      ));
      
      const trends: ValueTrend = {};
      selectedValues.forEach(value => {
        trends[value] = [];
      });

      // Calculate consistency scores only for selected values
      simulationOutcomes.forEach((outcome: any) => {
        const selectedValue = outcome.decision.label.toLowerCase();
        selectedValues.forEach(value => {
          const isSelected = value === selectedValue;
          const matchesExplicit = explicitCounts[value] > 0;
          const matchesImplicit = implicitCounts[value] > 0;
          
          let consistencyScore = 0;
          if (isSelected) {
            consistencyScore = (
              (matchesExplicit ? 40 : 0) +
              (matchesImplicit ? 60 : 0)
            );
          }
          
          trends[value].push(consistencyScore);
        });
      });

      setValueTrends(trends);

      // Process simulation outcomes and calculate matches
      const matches: ValueMatch[] = simulationOutcomes.map((outcome: any) => {
        const selectedValue = outcome.decision.label.toLowerCase();
        const matchesExplicit = explicitCounts[selectedValue] > 0;
        const matchesImplicit = implicitCounts[selectedValue] > 0;
        
        const stabilityScore = (
          (matchesExplicit ? 40 : 0) +
          (matchesImplicit ? 60 : 0)
        );

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
      setFinalMetrics(metrics);

    } catch (error) {
      console.error('Error loading analysis data:', error);
      setShowError(true);
    }
  }, []);


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
    const colors = [
      { line: 'rgb(239, 68, 68)', fill: 'rgba(239, 68, 68, 0.1)' },   // red
      { line: 'rgb(59, 130, 246)', fill: 'rgba(59, 130, 246, 0.1)' }, // blue
      { line: 'rgb(16, 185, 129)', fill: 'rgba(16, 185, 129, 0.1)' }, // green
      { line: 'rgb(245, 158, 11)', fill: 'rgba(245, 158, 11, 0.1)' }, // amber
      { line: 'rgb(139, 92, 246)', fill: 'rgba(139, 92, 246, 0.1)' }  // purple
    ];

    // Only include values that were actually selected in scenarios
    const selectedValues = Object.keys(valueTrends);

    return {
      labels: ['Explicit Choices', 'Implicit Choices', 'Scenario 1', 'Scenario 2', 'Scenario 3'],
      datasets: selectedValues.map((value, index) => {
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

  if (showError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <AlertTriangle className="mx-auto text-red-500 mb-4\" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Data Not Found</h2>
          <p className="text-gray-600 text-center mb-6">
            Please complete the simulation before accessing the final analysis.
          </p>
          <button
            onClick={() => navigate('/demographics')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Start New Simulation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Final Analysis Report
            </h1>
          </div>
          <button
            onClick={() => navigate('/feedback')}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-lg py-4 px-6 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
          >
            <ArrowRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Feedback</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Value Distribution Section */}
        <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Scale className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Value Distribution Analysis</h2>
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
        <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Value Stability Analysis</h2>
              <p className="text-sm text-gray-600 mt-1">How consistently your stated values aligned with your decisions</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
              <div className={`text-6xl font-bold mb-2 ${
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
        <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Decision Alignment Overview</h2>
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
                      <p className="text-4xl font-bold text-gray-900">{alignedCount} / {totalScenarios}</p>
                      <p className="text-sm text-gray-600 mt-1">scenarios aligned with your values</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-5xl font-bold ${
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
                        className={`p-6 rounded-xl border-2 transition-all ${
                          isAligned
                            ? 'bg-green-50 border-green-300'
                            : 'bg-red-50 border-red-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-lg font-bold text-gray-900">Scenario {match.scenarioId}</span>
                              <div className={`flex items-center gap-2 px-3 py-1 rounded-full font-bold text-sm ${
                                isAligned
                                  ? 'bg-green-100 text-green-800 border border-green-300'
                                  : 'bg-red-100 text-red-800 border border-red-300'
                              }`}>
                                {isAligned ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                                {alignmentStatus}
                              </div>
                            </div>
                            <div className="bg-white rounded-lg px-4 py-3 border border-gray-200">
                              <p className="text-sm text-gray-600 mb-1">Final Decision</p>
                              <p className="text-lg font-bold text-gray-900">
                                {decisionLabel.charAt(0).toUpperCase() + decisionLabel.slice(1)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {(hadCvrYes || hadCvrNo || hadApaReorder) && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 mb-2">Interaction Flags</p>
                            <div className="flex flex-wrap gap-2">
                              {hadCvrYes && (
                                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full border border-orange-300">
                                  CVR: Would Change Decision
                                </span>
                              )}
                              {hadCvrNo && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full border border-blue-300">
                                  CVR: Confirmed Decision
                                </span>
                              )}
                              {hadApaReorder && (
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full border border-purple-300">
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
        <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Value Consistency Trend</h2>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="text-sm font-bold text-green-800">High Consistency</h3>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                Values consistently align with both explicit and implicit preferences (75-100%)
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border-2 border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h3 className="text-sm font-bold text-orange-800">Medium Consistency</h3>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                Values show moderate alignment with stated preferences (50-74%)
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-xl border-2 border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <h3 className="text-sm font-bold text-red-800">Low Consistency</h3>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                Values demonstrate significant deviation from preferences (0-49%)
              </p>
            </div>
          </div>
        </section>

        {/* Final Metrics Section */}
        <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Flame className="h-7 w-7 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Final Simulation Metrics</h2>
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
      </main>
    </div>
  );
};

export default FinalAnalysisPage;