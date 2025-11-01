import React, { useState, useEffect } from 'react';
import { BarChart2, Flame, AlertTriangle, Droplets, Building, Trees as Tree, Scale, X, Eye, EyeOff, Star, BarChart, GitCompare, Radar as RadarIcon, Shield } from 'lucide-react';
import { DecisionOption } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

interface RadarChartProps {
  showRadarChart: boolean;
  onClose: () => void;
  currentScenario: {
    options: DecisionOption[];
    alternativeOptions?: DecisionOption[];
  };
  toggledOptions: {[key: string]: boolean};
  toggleOption: (optionId: string) => void;
  prepareRadarChartData: () => any;
  radarOptions: any;
}

type ComparisonView = 'radar' | 'bar' | 'differences';

// Metric mapping for data access
const metricMapping = {
  'Fire Containment': 'fireContainment',
  'Population Safety': 'populationSafety',
  'Ethical Fairness': 'ethicalFairness',
  'Firefighter Risk': 'firefighterRisk',
  'Resource Use': 'resourceUse',
  'Infrastructure Damage': 'infrastructureDamage',
  'Biodiversity Impact': 'biodiversityImpact'
};

const RadarChart: React.FC<RadarChartProps> = ({
  showRadarChart,
  onClose,
  currentScenario,
  toggledOptions,
  toggleOption,
  prepareRadarChartData,
  radarOptions
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('Fire Containment');
  const [comparisonView, setComparisonView] = useState<ComparisonView>('radar');
  const [hasClickedBar, setHasClickedBar] = useState(() => localStorage.getItem('hasClickedBar') === 'true');
  const [hasClickedDifferences, setHasClickedDifferences] = useState(() => localStorage.getItem('hasClickedDifferences') === 'true');
  const [hasClickedIdealOutcome, setHasClickedIdealOutcome] = useState(() => localStorage.getItem('hasClickedIdealOutcome') === 'true');

  if (!showRadarChart) return null;

  const allOptions = [...currentScenario.options];
  const activeOptionsCount = Object.values(toggledOptions).filter(Boolean).length;

  // Best case scenario data - Positive metrics at 100, negative at 0
  const bestCaseData = {
    fireContainment: 100,
    populationSafety: 100,
    ethicalFairness: 100,
    firefighterRisk: 0,
    resourceUse: 0,
    infrastructureDamage: 0,
    biodiversityImpact: 0
  };

  const metrics = [
    'Fire Containment',
    'Population Safety',
    'Ethical Fairness',
    'Firefighter Risk',
    'Resource Use',
    'Infrastructure Damage',
    'Biodiversity Impact'
  ];

  const isPositiveMetric = (metric: string) => {
    return ['Fire Containment', 'Population Safety', 'Ethical Fairness'].includes(metric);
  };

  // Define color palette for different options
  const optionColors = {
    standard: [
      'rgba(239, 68, 68, 0.7)',   // red
      'rgba(59, 130, 246, 0.7)',  // blue
      'rgba(16, 185, 129, 0.7)',  // green
      'rgba(245, 158, 11, 0.7)',  // amber
      'rgba(139, 92, 246, 0.7)'   // purple
    ],
    border: [
      'rgb(239, 68, 68)',   // red
      'rgb(59, 130, 246)',  // blue
      'rgb(16, 185, 129)',  // green
      'rgb(245, 158, 11)',  // amber
      'rgb(139, 92, 246)'   // purple
    ]
  };

  // Prepare radar chart data with proper metric order
  const prepareRadarChartDataWithIdeal = () => {
    const datasets = allOptions
      .filter(option => toggledOptions[option.id])
      .map((option, index) => ({
        label: option.title,
        data: metrics.map(metric => 
          option.radarData?.[metricMapping[metric as keyof typeof metricMapping]] || 0
        ),
        backgroundColor: optionColors.standard[index % optionColors.standard.length],
        borderColor: optionColors.border[index % optionColors.border.length],
        borderWidth: 2
      }));

    // Add ideal outcome if toggled
    if (toggledOptions['ideal-outcome']) {
      datasets.push({
        label: 'Ideal Outcome',
        data: metrics.map(metric => bestCaseData[metricMapping[metric as keyof typeof metricMapping]]),
        backgroundColor: 'rgba(138, 43, 226, 0.2)',
        borderColor: 'rgba(138, 43, 226, 1)',
        borderWidth: 2,
        borderDash: [5, 5]
      });
    }

    return { labels: metrics, datasets };
  };

  // Prepare bar chart data for selected metric
  const prepareBarChartData = () => {
    const activeOptions = allOptions.filter(option => toggledOptions[option.id]);
    const metricKey = metricMapping[selectedMetric as keyof typeof metricMapping];

    return {
      labels: activeOptions.map(option => option.title),
      datasets: [
        {
          label: selectedMetric,
          data: activeOptions.map(option => option.radarData?.[metricKey] || 0),
          backgroundColor: activeOptions.map((_, index) => optionColors.standard[index % optionColors.standard.length]),
          borderColor: activeOptions.map((_, index) => optionColors.border[index % optionColors.border.length]),
          borderWidth: 2,
        },
        {
          label: 'Ideal',
          data: Array(activeOptions.length).fill(bestCaseData[metricKey]),
          type: 'line' as const,
          borderColor: 'rgba(138, 43, 226, 1)',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
        }
      ]
    };
  };

  // Calculate differences between options for selected metric
  const calculateDifferences = () => {
    const activeOptions = allOptions.filter(option => toggledOptions[option.id]);
    const metricKey = metricMapping[selectedMetric as keyof typeof metricMapping];
    const differences = [];

    for (let i = 0; i < activeOptions.length; i++) {
      for (let j = i + 1; j < activeOptions.length; j++) {
        const value1 = activeOptions[i].radarData?.[metricKey] || 0;
        const value2 = activeOptions[j].radarData?.[metricKey] || 0;
        const diff = Math.abs(value1 - value2);
        
        const better = isPositiveMetric(selectedMetric)
          ? value1 > value2 ? activeOptions[i].title : activeOptions[j].title
          : value1 < value2 ? activeOptions[i].title : activeOptions[j].title;

        differences.push({
          option1: activeOptions[i].title,
          option2: activeOptions[j].title,
          difference: diff,
          better
        });
      }
    }

    return differences.sort((a, b) => b.difference - a.difference);
  };

  const handleViewChange = (view: ComparisonView) => {
    setComparisonView(view);
    if (view === 'bar' && !hasClickedBar) {
      setHasClickedBar(true);
      localStorage.setItem('hasClickedBar', 'true');
    }
    if (view === 'differences' && !hasClickedDifferences) {
      setHasClickedDifferences(true);
      localStorage.setItem('hasClickedDifferences', 'true');
    }
  };

  const handleMetricClick = (metric: string) => {
    setSelectedMetric(metric);
  };

  const handleToggleClick = (optionId: string) => {
    toggleOption(optionId);
    if (optionId === 'ideal-outcome' && !hasClickedIdealOutcome) {
      setHasClickedIdealOutcome(true);
      localStorage.setItem('hasClickedIdealOutcome', 'true');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <BarChart2 className="mr-2 text-blue-600" size={20} />
            Decision Trade-Off Comparison
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewChange('radar')}
              className={`px-3 py-1.5 rounded-md text-sm transition-all duration-200 ${
                comparisonView === 'radar'
                  ? 'bg-blue-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <RadarIcon size={16} className="inline mr-1" />
              Radar
            </button>
            <button
              onClick={() => handleViewChange('bar')}
              className={`px-3 py-1.5 rounded-md text-sm transition-all duration-200 relative ${
                comparisonView === 'bar'
                  ? 'bg-green-500 text-white shadow-lg scale-105'
                  : hasClickedBar
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 animate-pulse'
              }`}
            >
              <BarChart size={16} className="inline mr-1" />
              Bar
              {!hasClickedBar && comparisonView !== 'bar' && (
                <>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-ping"></span>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full"></span>
                </>
              )}
            </button>
            <button
              onClick={() => handleViewChange('differences')}
              className={`px-3 py-1.5 rounded-md text-sm transition-all duration-200 relative ${
                comparisonView === 'differences'
                  ? 'bg-purple-500 text-white shadow-lg scale-105'
                  : hasClickedDifferences
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 animate-pulse'
              }`}
            >
              <GitCompare size={16} className="inline mr-1" />
              Differences
              {!hasClickedDifferences && comparisonView !== 'differences' && (
                <>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-ping"></span>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full"></span>
                </>
              )}
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-auto">
          {/* Metric Selection - Grouped */}
          {comparisonView !== 'radar' && (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Positive Impact Metrics Group */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-4 shadow-sm">
                  <h5 className="text-sm font-bold text-emerald-800 mb-3 flex items-center">
                    <span className="bg-emerald-200 rounded-full w-2 h-2 mr-2"></span>
                    Positive Impact (Higher is Better)
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {['Fire Containment', 'Population Safety', 'Ethical Fairness'].map((metric) => (
                      <button
                        key={metric}
                        onClick={() => handleMetricClick(metric)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedMetric === metric
                            ? 'bg-emerald-600 text-white shadow-lg scale-105'
                            : 'bg-white text-emerald-700 hover:bg-emerald-100 border border-emerald-300'
                        }`}
                      >
                        {metric}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Negative Impact Metrics Group */}
                <div className="bg-gradient-to-br from-rose-50 to-red-50 border-2 border-rose-200 rounded-xl p-4 shadow-sm">
                  <h5 className="text-sm font-bold text-rose-800 mb-3 flex items-center">
                    <span className="bg-rose-200 rounded-full w-2 h-2 mr-2"></span>
                    Negative Impact (Lower is Better)
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {['Firefighter Risk', 'Resource Use', 'Infrastructure Damage', 'Biodiversity Impact'].map((metric) => (
                      <button
                        key={metric}
                        onClick={() => handleMetricClick(metric)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedMetric === metric
                            ? 'bg-rose-600 text-white shadow-lg scale-105'
                            : 'bg-white text-rose-700 hover:bg-rose-100 border border-rose-300'
                        }`}
                      >
                        {metric}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* View Content */}
          {comparisonView === 'radar' && (
            <>
              {/* Decision Option Toggle Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 mt-4">
                {allOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleToggleClick(option.id)}
                    className={`w-full p-2 rounded-lg flex items-center justify-between transition-all duration-200 ${
                      toggledOptions[option.id]
                        ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-2 ${
                        toggledOptions[option.id]
                          ? 'bg-gray-500'
                          : 'bg-gray-300'
                      }`}></span>
                      <span className="text-sm font-medium">{option.title}</span>
                    </div>
                    {toggledOptions[option.id] ? (
                      <Eye size={16} className="text-current" />
                    ) : (
                      <EyeOff size={16} className="text-current" />
                    )}
                  </button>
                ))}
              </div>

              {/* Ideal Outcome Toggle */}
              <div className="mb-4">
                <button
                  onClick={() => handleToggleClick('ideal-outcome')}
                  className={`w-full p-3 rounded-lg flex items-center justify-between transition-all duration-200 relative ${
                    toggledOptions['ideal-outcome']
                      ? 'bg-purple-200 text-purple-900 shadow-lg scale-105'
                      : hasClickedIdealOutcome
                      ? 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 animate-pulse'
                  }`}
                >
                  <div className="flex items-center">
                    <Star size={16} className="mr-2" />
                    <span className="font-medium">Show Ideal Outcome</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {toggledOptions['ideal-outcome'] ? <Eye size={16} /> : <EyeOff size={16} />}
                    {!hasClickedIdealOutcome && !toggledOptions['ideal-outcome'] && (
                      <>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-ping"></span>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full"></span>
                      </>
                    )}
                  </div>
                </button>
              </div>

              <div className="h-[500px]">
                <Radar data={prepareRadarChartDataWithIdeal()} options={radarOptions} />
              </div>

              {/* Metrics Legend - Radar View Only */}
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Metrics Legend</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h5 className="text-sm font-medium text-green-800 mb-2">Positive Impact Metrics (Higher is Better)</h5>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Flame size={16} className="text-red-500 mr-2" />
                        <span className="text-sm">Fire Containment</span>
                      </div>
                      <div className="flex items-center">
                        <Shield size={16} className="text-blue-500 mr-2" />
                        <span className="text-sm">Population Safety</span>
                      </div>
                      <div className="flex items-center">
                        <Scale size={16} className="text-purple-500 mr-2" />
                        <span className="text-sm">Ethical Fairness</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <h5 className="text-sm font-medium text-red-800 mb-2">Negative Impact Metrics (Lower is Better)</h5>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <AlertTriangle size={16} className="text-orange-500 mr-2" />
                        <span className="text-sm">Firefighter Risk</span>
                      </div>
                      <div className="flex items-center">
                        <Droplets size={16} className="text-blue-500 mr-2" />
                        <span className="text-sm">Resource Use</span>
                      </div>
                      <div className="flex items-center">
                        <Building size={16} className="text-gray-500 mr-2" />
                        <span className="text-sm">Infrastructure Damage</span>
                      </div>
                      <div className="flex items-center">
                        <Tree size={16} className="text-green-500 mr-2" />
                        <span className="text-sm">Biodiversity Impact</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {comparisonView === 'bar' && (
            <div className="h-[500px]">
              <Bar data={prepareBarChartData()} options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                      display: true,
                      text: selectedMetric
                    }
                  }
                },
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                    labels: {
                      filter: function(legendItem: any) {
                        return legendItem.text === 'Ideal';
                      }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: (context: any) => {
                        const value = context.raw;
                        return `${context.dataset.label}: ${value} (${isPositiveMetric(selectedMetric) ? 'Higher is better' : 'Lower is better'})`;
                      }
                    }
                  }
                }
              }} />
            </div>
          )}

          {comparisonView === 'differences' && (
            <div className="space-y-3">
              {calculateDifferences().map((diff, index) => (
                <div key={index} className="bg-white border-2 border-gray-200 hover:border-blue-300 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{diff.option1}</span>
                      <span className="text-gray-400 font-medium">vs</span>
                      <span className="font-semibold text-gray-800">{diff.option2}</span>
                    </div>
                    <span className="font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-lg">
                      Δ {diff.difference.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded">{diff.better}</span> <span className="text-gray-500">performs better in this metric</span>
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RadarChart;