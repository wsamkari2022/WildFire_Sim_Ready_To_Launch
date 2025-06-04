import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart2, 
  PieChart, 
  TrendingUp, 
  AlertTriangle, 
  RefreshCcw,
  ArrowLeft,
  CheckCircle2,
  XCircle,
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
  ArcElement,
  PointElement,
  ScatterController
} from 'chart.js';
import { Bar, Pie, Scatter } from 'react-chartjs-2';
import { SimulationMetrics, DecisionOption } from '../types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  ScatterController
);

interface ValueCount {
  [key: string]: number;
}

interface ValueStabilityAnalysis {
  scenarioId: number;
  selectedValue: string;
  matchesStableValue: boolean;
  stableValue: string;
  contextValue: string;
}

interface SimulationOutcome {
  scenarioId: number;
  decision: DecisionOption;
}

const FinalAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [explicitValueCounts, setExplicitValueCounts] = useState<ValueCount>({});
  const [implicitStableValues, setImplicitStableValues] = useState<string[]>([]);
  const [implicitContextValues, setImplicitContextValues] = useState<string[]>([]);
  const [simulationValues, setSimulationValues] = useState<string[]>([]);
  const [valueStability, setValueStability] = useState<ValueStabilityAnalysis[]>([]);
  const [finalMetrics, setFinalMetrics] = useState<SimulationMetrics | null>(null);
  const [stabilityScore, setStabilityScore] = useState<number>(0);
  const [showError, setShowError] = useState(false);
  const [valueConsistencyData, setValueConsistencyData] = useState<Array<{x: number, y: number}>>([]);

  useEffect(() => {
    try {
      // Load data from localStorage
      const explicitValues = JSON.parse(localStorage.getItem('explicitValues') || '[]');
      const deepValues = JSON.parse(localStorage.getItem('deepValues') || '[]');
      const simulationOutcomes = JSON.parse(localStorage.getItem('simulationScenarioOutcomes') || '[]');
      const metrics = JSON.parse(localStorage.getItem('finalSimulationMetrics') || 'null');

      if (!explicitValues.length || !deepValues.length || !simulationOutcomes.length || !metrics) {
        setShowError(true);
        return;
      }

      // Process explicit values
      const explicitCounts: ValueCount = {};
      explicitValues.forEach((value: any) => {
        explicitCounts[value.value_selected] = (explicitCounts[value.value_selected] || 0) + 1;
      });
      setExplicitValueCounts(explicitCounts);

      // Process implicit values
      const stableValues = deepValues
        .filter((value: any) => value.type === 'Stable')
        .map((value: any) => value.name);
      const contextValues = deepValues
        .filter((value: any) => value.type === 'Context-Dependent')
        .map((value: any) => value.name);
      
      setImplicitStableValues(stableValues);
      setImplicitContextValues(contextValues);

      // Process simulation outcomes
      const simValues = simulationOutcomes.map((outcome: SimulationOutcome) => outcome.decision.label);
      setSimulationValues(simValues);

      // Calculate value consistency data for scatter plot
      const consistencyData = simulationOutcomes.map((outcome: SimulationOutcome, index: number) => {
        const selectedValue = outcome.decision.label;
        const matchesExplicit = Object.keys(explicitCounts).includes(selectedValue);
        const matchesStable = stableValues.includes(selectedValue);
        
        return {
          x: index + 1, // Scenario number
          y: (matchesExplicit ? 50 : 0) + (matchesStable ? 50 : 0) // Consistency score
        };
      });
      
      setValueConsistencyData(consistencyData);

      // Calculate stability score with weighted components
      const explicitMatch = simulationValues.filter(value => 
        Object.keys(explicitCounts).includes(value)
      ).length / simulationValues.length;
      
      const stableMatch = simulationValues.filter(value =>
        stableValues.includes(value)
      ).length / simulationValues.length;
      
      const score = ((explicitMatch * 40) + (stableMatch * 60));
      setStabilityScore(score);

      // Analyze value stability
      const stabilityAnalysis = simulationOutcomes.map((outcome: SimulationOutcome) => {
        const selectedValue = outcome.decision.label;
        const matchesStable = stableValues.includes(selectedValue);
        
        return {
          scenarioId: outcome.scenarioId,
          selectedValue,
          matchesStableValue: matchesStable,
          stableValue: stableValues[0] || 'N/A',
          contextValue: contextValues[0] || 'N/A'
        };
      });

      setValueStability(stabilityAnalysis);

      // Set final metrics
      setFinalMetrics(metrics);

    } catch (error) {
      console.error('Error loading analysis data:', error);
      setShowError(true);
    }
  }, []);

  const handleRestart = () => {
    // Clear localStorage except for user demographics
    const demographics = localStorage.getItem('userDemographics');
    localStorage.clear();
    if (demographics) {
      localStorage.setItem('userDemographics', demographics);
    }
    navigate('/demographics');
  };

  const prepareValueComparisonData = () => {
    const values = ['Safety', 'Efficiency', 'Sustainability', 'Fairness', 'Nonmaleficence'];
    
    return {
      labels: values,
      datasets: [
        {
          label: 'Explicit Choices',
          data: values.map(value => explicitValueCounts[value] || 0),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Simulation Decisions',
          data: values.map(value => 
            simulationValues.filter(v => v === value).length
          ),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  const prepareStabilityData = () => {
    const explicitMatch = simulationValues.filter(value => 
      Object.keys(explicitValueCounts).includes(value)
    ).length / simulationValues.length * 100;

    const stableMatch = simulationValues.filter(value =>
      implicitStableValues.includes(value)
    ).length / simulationValues.length * 100;

    const contextMatch = simulationValues.filter(value =>
      implicitContextValues.includes(value)
    ).length / simulationValues.length * 100;

    return {
      labels: ['Matches Explicit Values', 'Matches Stable Values', 'Matches Context-Dependent Values'],
      datasets: [{
        data: [explicitMatch, stableMatch, contextMatch],
        backgroundColor: [
          'rgba(54, 162, 235, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 206, 86, 0.5)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1
      }]
    };
  };

  const prepareConsistencyData = () => {
    return {
      datasets: [{
        label: 'Value Consistency',
        data: valueConsistencyData,
        backgroundColor: valueConsistencyData.map(point => 
          point.y >= 75 ? 'rgba(75, 192, 192, 0.5)' :
          point.y >= 50 ? 'rgba(255, 206, 86, 0.5)' :
          'rgba(255, 99, 132, 0.5)'
        ),
        borderColor: valueConsistencyData.map(point =>
          point.y >= 75 ? 'rgba(75, 192, 192, 1)' :
          point.y >= 50 ? 'rgba(255, 206, 86, 1)' :
          'rgba(255, 99, 132, 1)'
        ),
        borderWidth: 1,
        pointRadius: 8,
        pointHoverRadius: 10
      }]
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BarChart2 className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Final Analysis Report
              </h1>
            </div>
            <button
              onClick={handleRestart}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <RefreshCcw size={16} className="mr-2" />
              Start New Simulation
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Value Comparison Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Value Distribution Analysis</h2>
          </div>
          <div className="h-[400px]">
            <Bar
              data={prepareValueComparisonData()}
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
            <div className="mb-4">
              <div className="h-[300px] flex items-center justify-center">
                <Pie
                  data={prepareStabilityData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom' as const
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.label}: ${context.raw.toFixed(1)}%`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
              <div className="text-center mt-4">
                <p className="text-2xl font-bold text-gray-900">{stabilityScore.toFixed(1)}%</p>
                <p className="text-gray-600">Overall Value Stability Score</p>
                <p className="text-sm text-gray-500 mt-1">
                  (Weighted: 40% Explicit, 60% Stable Values)
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {valueStability.map((analysis, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">Scenario {analysis.scenarioId}</span>
                    {analysis.matchesStableValue ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle2 size={16} className="mr-1" />
                        Stable
                      </span>
                    ) : (
                      <span className="flex items-center text-orange-600">
                        <XCircle size={16} className="mr-1" />
                        Context-Dependent
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Selected Value: <span className="font-medium">{analysis.selectedValue}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Value Consistency Scatter Plot */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">Value Consistency Trend</h2>
            </div>
            <div className="h-[400px]">
              <Scatter
                data={prepareConsistencyData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Scenario Number'
                      },
                      ticks: {
                        stepSize: 1
                      }
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'Consistency Score'
                      },
                      min: 0,
                      max: 100,
                      ticks: {
                        stepSize: 25
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context: any) {
                          return `Scenario ${context.parsed.x}: ${context.parsed.y}% consistent`;
                        }
                      }
                    },
                    legend: {
                      display: false
                    }
                  }
                }}
              />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[rgba(75,192,192,0.5)] border border-[rgba(75,192,192,1)]"></div>
                <span className="text-sm text-gray-600">High Consistency (75-100%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[rgba(255,206,86,0.5)] border border-[rgba(255,206,86,1)]"></div>
                <span className="text-sm text-gray-600">Medium Consistency (50-74%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[rgba(255,99,132,0.5)] border border-[rgba(255,99,132,1)]"></div>
                <span className="text-sm text-gray-600">Low Consistency (0-49%)</span>
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