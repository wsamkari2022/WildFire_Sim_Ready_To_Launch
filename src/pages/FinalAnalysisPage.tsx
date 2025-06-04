import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart2,
  TrendingUp,
  AlertTriangle,
  RefreshCcw,
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

const FinalAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [explicitValueCounts, setExplicitValueCounts] = useState<ValueCount>({});
  const [implicitValueCounts, setImplicitValueCounts] = useState<ValueCount>({});
  const [valueMatches, setValueMatches] = useState<ValueMatch[]>([]);
  const [finalMetrics, setFinalMetrics] = useState<SimulationMetrics | null>(null);
  const [overallStabilityScore, setOverallStabilityScore] = useState<number>(0);
  const [showError, setShowError] = useState(false);
  const [consistencyTrend, setConsistencyTrend] = useState<number[]>([]);

  useEffect(() => {
    try {
      // Load all required data
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
        const normalizedValue = value.value_selected.toLowerCase();
        explicitCounts[normalizedValue] = (explicitCounts[normalizedValue] || 0) + 1;
      });
      setExplicitValueCounts(explicitCounts);

      // Process implicit values
      const implicitCounts: ValueCount = {};
      deepValues.forEach((value: any) => {
        const normalizedValue = value.name.toLowerCase();
        implicitCounts[normalizedValue] = (implicitCounts[normalizedValue] || 0) + 1;
      });
      setImplicitValueCounts(implicitCounts);

      // Process simulation outcomes and calculate matches
      const matches: ValueMatch[] = simulationOutcomes.map((outcome: any) => {
        const selectedValue = outcome.decision.label.toLowerCase();
        const matchesExplicit = Object.keys(explicitCounts).includes(selectedValue);
        const matchesImplicit = Object.keys(implicitCounts).includes(selectedValue);
        const matchesSimulation = true; // Since this is from simulation outcomes
        
        // Calculate stability score for this decision
        const stabilityScore = (
          (matchesExplicit ? 40 : 0) +
          (matchesImplicit ? 60 : 0)
        );

        return {
          scenarioId: outcome.scenarioId,
          selectedValue: outcome.decision.label,
          matchesExplicit,
          matchesImplicit,
          matchesSimulation,
          stabilityScore
        };
      });

      setValueMatches(matches);

      // Calculate overall stability score
      const avgStabilityScore = matches.reduce((acc, match) => acc + match.stabilityScore, 0) / matches.length;
      setOverallStabilityScore(avgStabilityScore);

      // Set consistency trend
      setConsistencyTrend(matches.map(match => match.stabilityScore));

      // Set final metrics
      setFinalMetrics(metrics);

    } catch (error) {
      console.error('Error loading analysis data:', error);
      setShowError(true);
    }
  }, []);

  const handleRestart = () => {
    const demographics = localStorage.getItem('userDemographics');
    localStorage.clear();
    if (demographics) {
      localStorage.setItem('userDemographics', demographics);
    }
    navigate('/demographics');
  };

  const prepareValueDistributionData = () => {
    const values = ['Safety', 'Efficiency', 'Sustainability', 'Fairness', 'Nonmaleficence'];
    
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
            valueMatches.filter(match => match.selectedValue.toLowerCase() === value.toLowerCase()).length
          ),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  const prepareConsistencyTrendData = () => {
    return {
      labels: valueMatches.map(match => `Scenario ${match.scenarioId}`),
      datasets: [{
        label: 'Value Consistency',
        data: consistencyTrend,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      }]
    };
  };

  if (showError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
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
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }}
              />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">High Consistency (75-100%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-sm text-gray-600">Medium Consistency (50-74%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
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