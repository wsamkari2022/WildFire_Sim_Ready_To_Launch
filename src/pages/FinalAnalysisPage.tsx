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
  Target
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
    // Only include values that were actually selected in scenarios
    const selectedValues = Object.keys(valueTrends);
    
    return {
      labels: ['Explicit Choices', 'Implicit Choices', 'Scenario 1', 'Scenario 2', 'Scenario 3'],
      datasets: selectedValues.map((value, index) => {
        const colors = [
          { line: 'rgb(239, 68, 68)', fill: 'rgba(239, 68, 68, 0.1)' },   // red
          { line: 'rgb(59, 130, 246)', fill: 'rgba(59, 130, 246, 0.1)' }, // blue
          { line: 'rgb(16, 185, 129)', fill: 'rgba(16, 185, 129, 0.1)' }, // green
          { line: 'rgb(245, 158, 11)', fill: 'rgba(245, 158, 11, 0.1)' }, // amber
          { line: 'rgb(139, 92, 246)', fill: 'rgba(139, 92, 246, 0.1)' }  // purple
        ];

        // Calculate explicit and implicit scores based on actual selections
        const explicitScore = explicitValueCounts[value] ? 100 : 0;
        const implicitScore = implicitValueCounts[value] ? 100 : 0;

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
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
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

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Value Distribution Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Value Distribution Analysis</h2>
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
                      text: 'Frequency'
                    }
                  }
                },
                plugins: {
                  legend: {
                    position: 'bottom' as const
                  },
                  title: {
                    display: true,
                    text: 'Value Distribution Across Assessment Types'
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Value Stability Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Value Stability Analysis</h2>
            </div>
            
            <div className="mb-6">
              <div className="text-center mb-6">
                <div className={`text-4xl font-bold mb-2 ${
                  overallStabilityScore >= 75 ? 'text-green-600' :
                  overallStabilityScore >= 50 ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  {overallStabilityScore.toFixed(1)}%
                </div>
                <p className="text-gray-600">Overall Value Stability Score</p>
                <p className="text-sm text-gray-500 mt-1">
                  (Weighted: 40% Explicit, 60% Implicit Values)
                </p>
              </div>

              <ValueStabilityTable matches={valueMatches} />
            </div>
          </div>

          {/* Value Consistency Trend */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Value Consistency Trend</h2>
            </div>
            <div className="h-[400px]">
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
                        text: 'Consistency Score (%)'
                      },
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                          size: 12
                        }
                      }
                    },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      titleColor: '#1f2937',
                      bodyColor: '#1f2937',
                      borderColor: '#e5e7eb',
                      borderWidth: 1,
                      padding: 12,
                      bodyFont: {
                        size: 12
                      },
                      titleFont: {
                        size: 14,
                        weight: 'bold'
                      }
                    }
                  },
                  interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                  }
                }}
              />
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">High Consistency (75-100%)</h3>
                <p className="text-xs text-gray-600">
                  Values consistently align with explicit and implicit preferences
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Medium Consistency (50-74%)</h3>
                <p className="text-xs text-gray-600">
                  Values show moderate alignment with stated preferences
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Low Consistency (0-49%)</h3>
                <p className="text-xs text-gray-600">
                  Values demonstrate significant deviation from preferences
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final Metrics Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Final Simulation Metrics</h2>
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
        </div>
      </main>
    </div>
  );
};

export default FinalAnalysisPage;