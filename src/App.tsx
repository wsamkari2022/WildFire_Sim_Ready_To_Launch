import React, { useState, useEffect, useCallback } from 'react';
import { Flame, Check, BarChart2, Lightbulb } from 'lucide-react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import MetricsDisplay from './components/MetricsDisplay';
import DecisionOption from './components/DecisionOption';
import ExpertAnalysis from './components/ExpertAnalysis';
import RadarChart from './components/RadarChart';
import { SimulationMetrics, DecisionOption as DecisionOptionType, Scenario } from './types';
import { scenarios } from './data/scenarios';

// Register Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function App() {
  // Initial metrics state
  const [metrics, setMetrics] = useState<SimulationMetrics>({
    livesSaved: 0,
    humanCasualties: 0,
    firefightingResource: 100,
    infrastructureCondition: 100,
    biodiversityCondition: 100,
    propertiesCondition: 100,
    nuclearPowerStation: 100,
  });

  // State for animation of changing values
  const [animatingMetrics, setAnimatingMetrics] = useState<string[]>([]);
  
  // State for selected decision
  const [selectedDecision, setSelectedDecision] = useState<DecisionOptionType | null>(null);

  // Current scenario index
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);

  // State for radar chart modal
  const [showRadarChart, setShowRadarChart] = useState(false);

  // State for showing alternative options
  const [showAlternatives, setShowAlternatives] = useState(false);

  // State for toggled options in radar chart
  const [toggledOptions, setToggledOptions] = useState<{[key: string]: boolean}>({});

  // State for scenario transition animation
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get current scenario
  const currentScenario = scenarios[currentScenarioIndex];

  // Initialize toggled options when scenario changes
  useEffect(() => {
    const initialToggledOptions: {[key: string]: boolean} = {};
    const allOptions = [...currentScenario.options, ...(currentScenario.alternativeOptions || [])];
    allOptions.forEach(option => {
      initialToggledOptions[option.id] = true;
    });
    
    if (Object.keys(initialToggledOptions).some(
      key => toggledOptions[key] !== initialToggledOptions[key]
    ) || Object.keys(toggledOptions).length !== Object.keys(initialToggledOptions).length) {
      setToggledOptions(initialToggledOptions);
    }
  }, [currentScenarioIndex, currentScenario.options, currentScenario.alternativeOptions, toggledOptions]);

  // Handle decision selection
  const handleDecisionSelect = (decision: DecisionOptionType) => {
    setSelectedDecision(decision);
  };

  // Handle decision confirmation
  const handleConfirmDecision = () => {
    if (!selectedDecision) return;
    
    const newMetrics = {
      livesSaved: metrics.livesSaved + selectedDecision.impact.livesSaved,
      humanCasualties: metrics.humanCasualties + selectedDecision.impact.humanCasualties,
      firefightingResource: Math.max(0, metrics.firefightingResource + selectedDecision.impact.firefightingResource),
      infrastructureCondition: Math.max(0, metrics.infrastructureCondition + selectedDecision.impact.infrastructureCondition),
      biodiversityCondition: Math.max(0, metrics.biodiversityCondition + selectedDecision.impact.biodiversityCondition),
      propertiesCondition: Math.max(0, metrics.propertiesCondition + selectedDecision.impact.propertiesCondition),
      nuclearPowerStation: Math.max(0, metrics.nuclearPowerStation + selectedDecision.impact.nuclearPowerStation),
    };

    const changing = Object.keys(metrics).filter(
      (key) => metrics[key as keyof SimulationMetrics] !== newMetrics[key as keyof SimulationMetrics]
    );
    
    setAnimatingMetrics(changing);
    setMetrics(newMetrics);
    
    setTimeout(() => {
      setAnimatingMetrics([]);
    }, 1000);
    
    setSelectedDecision(null);
    setShowAlternatives(false);
    
    if (currentScenarioIndex < scenarios.length - 1) {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentScenarioIndex(currentScenarioIndex + 1);
      }, 1500);
    }
  };

  // Toggle option visibility in radar chart
  const toggleOption = (optionId: string) => {
    setToggledOptions(prev => ({
      ...prev,
      [optionId]: !prev[optionId]
    }));
  };

  // Prepare radar chart data
  const prepareRadarChartData = useCallback(() => {
    const labels = [
      'Fire Containment',
      'Firefighter Risk',
      'Resource Use',
      'Infrastructure Damage',
      'Biodiversity Impact',
      'Ethical Fairness'
    ];

    const allOptions = [...currentScenario.options, ...(currentScenario.alternativeOptions || [])];
    const datasets = allOptions
      .filter(option => toggledOptions[option.id])
      .map((option, index) => {
        const colors = [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ];

        const borderColors = [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ];

        return {
          label: option.title,
          data: option.radarData ? [
            option.radarData.fireContainment,
            option.radarData.firefighterRisk,
            option.radarData.resourceUse,
            option.radarData.infrastructureDamage,
            option.radarData.biodiversityImpact,
            option.radarData.ethicalFairness
          ] : [],
          backgroundColor: colors[index % colors.length],
          borderColor: borderColors[index % borderColors.length],
          borderWidth: 2,
        };
      });

    return {
      labels,
      datasets
    };
  }, [currentScenario, toggledOptions]);

  // Radar chart options
  const radarOptions = {
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          showLabelBackdrop: false,
          font: {
            size: 10
          }
        },
        pointLabels: {
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      },
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 12
          },
          padding: 20
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="h-screen bg-gray-50 p-4 flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold text-gray-800">
            Wildfire Crisis Simulation
          </h1>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Scenario {currentScenario.id} of {scenarios.length}
          </div>
        </div>
        
        <MetricsDisplay metrics={metrics} animatingMetrics={animatingMetrics} />
        
        {/* Scenario Section */}
        <div className="bg-white rounded-lg shadow-md p-4 flex-1 flex flex-col overflow-hidden">
          <h2 className="text-lg font-semibold mb-1 text-gray-700">Current Scenario</h2>
          <h3 className="text-base font-medium mb-1 text-gray-800">{currentScenario.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{currentScenario.description}</p>
          
          {!selectedDecision ? (
            <>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-medium text-gray-800">Select Your Decision</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowAlternatives(!showAlternatives)}
                    className="flex items-center text-center text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-md transition-colors duration-200"
                  >
                    <Lightbulb size={16} className="mr-1.5" />
                    {showAlternatives ? 'Hide Alternatives' : 'Show Alternatives'}
                  </button>
                  <button 
                    onClick={() => setShowRadarChart(true)}
                    className="flex items-center text-center text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md transition-colors duration-200"
                  >
                    <BarChart2 size={16} className="mr-1.5" />
                    View Trade-Off Comparison
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                {currentScenario.options.map((option) => (
                  <DecisionOption
                    key={option.id}
                    option={option}
                    onSelect={handleDecisionSelect}
                  />
                ))}
                {showAlternatives && currentScenario.alternativeOptions && (
                  currentScenario.alternativeOptions.map((option) => (
                    <DecisionOption
                      key={option.id}
                      option={option}
                      onSelect={handleDecisionSelect}
                    />
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center mb-3">
                <h3 className="text-base font-medium text-gray-800 mr-2">Selected Decision:</h3>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-medium">
                  {selectedDecision.title}
                </span>
                <button 
                  onClick={() => setSelectedDecision(null)}
                  className="ml-auto text-gray-500 hover:text-gray-700 text-sm underline"
                >
                  Change Selection
                </button>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg mb-3 flex-1 overflow-hidden">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Expert Analysis</h4>
                <ExpertAnalysis decision={selectedDecision} />
              </div>
              
              <button
                onClick={handleConfirmDecision}
                className="mt-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <Check size={16} className="mr-1" />
                Confirm Decision
              </button>
            </div>
          )}
        </div>
      </div>

      <RadarChart
        showRadarChart={showRadarChart}
        onClose={() => setShowRadarChart(false)}
        currentScenario={currentScenario}
        toggledOptions={toggledOptions}
        toggleOption={toggleOption}
        prepareRadarChartData={prepareRadarChartData}
        radarOptions={radarOptions}
      />

      {/* Scenario Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-pulse">
          <div className="text-center">
            <Flame className="mx-auto text-orange-500 mb-4" size={48} />
            <h2 className="text-white text-2xl font-bold mb-2">Scenario Complete</h2>
            <p className="text-gray-300">Preparing next challenge...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;