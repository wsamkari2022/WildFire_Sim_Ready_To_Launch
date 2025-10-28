import React from 'react';
import { BarChart2, Flame, AlertTriangle, Droplets, Building, Trees as Tree, Scale, X, Eye, EyeOff } from 'lucide-react';
import { Radar } from 'react-chartjs-2';
import { DecisionOption } from '../types';

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

const RadarChart: React.FC<RadarChartProps> = ({
  showRadarChart,
  onClose,
  currentScenario,
  toggledOptions,
  toggleOption,
  prepareRadarChartData,
  radarOptions
}) => {
  if (!showRadarChart) return null;

  const allOptions = [...currentScenario.options, ...(currentScenario.alternativeOptions || [])];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <BarChart2 className="mr-2 text-blue-600" size={20} />
            Decision Trade-Off Comparison
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-auto">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              This radar chart visualizes how each decision option impacts different aspects of the crisis response. 
              Larger values (further from center) indicate stronger impact in that area.
            </p>
            
            {/* Interactive Decision Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {allOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => toggleOption(option.id)}
                  className={`p-2 rounded-lg flex items-center justify-between transition-all duration-200 ${
                    toggledOptions[option.id] 
                      ? option.isAlternative 
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${
                      toggledOptions[option.id] 
                        ? option.isAlternative ? 'bg-blue-500' : 'bg-gray-500'
                        : 'bg-gray-300'
                    }`}></span>
                    <span className="text-sm font-medium">{option.title}</span>
                    {option.isAlternative && (
                      <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                        Alternative
                      </span>
                    )}
                  </div>
                  {toggledOptions[option.id] ? (
                    <Eye size={16} className="text-current" />
                  ) : (
                    <EyeOff size={16} className="text-current" />
                  )}
                </button>
              ))}
            </div>
            
            {/* Radar Chart */}
            <div className="h-[400px] w-full">
              <Radar data={prepareRadarChartData()} options={radarOptions} />
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Understanding the Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start">
                <Flame className="text-red-500 mr-1.5 mt-0.5 flex-shrink-0" size={14} />
                <div>
                  <p className="font-medium text-gray-700">Fire Containment</p>
                  <p className="text-gray-600">Higher values indicate better containment of the wildfire, reducing its spread and intensity.</p>
                </div>
              </div>
              <div className="flex items-start">
                <AlertTriangle className="text-orange-500 mr-1.5 mt-0.5 flex-shrink-0" size={14} />
                <div>
                  <p className="font-medium text-gray-700">Firefighter Risk</p>
                  <p className="text-gray-600">Higher values indicate greater danger to firefighting personnel.</p>
                </div>
              </div>
              <div className="flex items-start">
                <Droplets className="text-blue-500 mr-1.5 mt-0.5 flex-shrink-0" size={14} />
                <div>
                  <p className="font-medium text-gray-700">Resource Use</p>
                  <p className="text-gray-600">Higher values indicate more intensive use of available firefighting resources.</p>
                </div>
              </div>
              <div className="flex items-start">
                <Building className="text-gray-500 mr-1.5 mt-0.5 flex-shrink-0" size={14} />
                <div>
                  <p className="font-medium text-gray-700">Infrastructure Damage</p>
                  <p className="text-gray-600">Higher values indicate greater damage to roads, power lines, and other infrastructure.</p>
                </div>
              </div>
              <div className="flex items-start">
                <Tree className="text-green-500 mr-1.5 mt-0.5 flex-shrink-0" size={14} />
                <div>
                  <p className="font-medium text-gray-700">Biodiversity Impact</p>
                  <p className="text-gray-600">Higher values indicate greater negative impact on local ecosystems and wildlife.</p>
                </div>
              </div>
              <div className="flex items-start">
                <Scale className="text-blue-500 mr-1.5 mt-0.5 flex-shrink-0" size={14} />
                <div>
                  <p className="font-medium text-gray-700">Ethical Fairness</p>
                  <p className="text-gray-600">Higher values indicate decisions that distribute risks and benefits more equitably across stakeholders.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadarChart;