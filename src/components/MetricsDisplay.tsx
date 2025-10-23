import React from 'react';
import { AlertTriangle, Flame, Droplets, Building, Trees as Tree, Factory, Users, Skull } from 'lucide-react';

interface SimulationMetrics {
  livesSaved: number;
  humanCasualties: number;
  firefightingResource: number;
  infrastructureCondition: number;
  biodiversityCondition: number;
  propertiesCondition: number;
  nuclearPowerStation: number;
}

interface MetricsDisplayProps {
  metrics: SimulationMetrics;
  animatingMetrics: string[];
}

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ metrics, animatingMetrics }) => {
  const getColorClass = (value: number, isNuclear: boolean = false) => {
    if (isNuclear) {
      if (value < 30) return "text-red-600 font-bold";
      if (value < 50) return "text-orange-500 font-bold";
      if (value < 70) return "text-yellow-500";
      return "text-green-500";
    }
    
    if (value < 30) return "text-red-600 font-bold";
    if (value < 50) return "text-orange-500 font-bold";
    if (value < 70) return "text-yellow-500";
    return "text-green-500";
  };

  const getAnimationClass = (metricName: string) => {
    if (animatingMetrics.includes(metricName)) {
      if (metricName === 'livesSaved') {
        return "animate-pulse text-green-600";
      } else if (metricName === 'humanCasualties') {
        return "animate-pulse text-red-600";
      }
      return "animate-pulse text-red-500";
    }
    return "";
  };

  const getTooltipText = (metricName: string, value: number) => {
    switch(metricName) {
      case 'livesSaved':
        return `${value} people saved from immediate danger`;
      case 'humanCasualties':
        return `${value} lives lost in the crisis`;
      case 'firefightingResource':
        return `${value}% of firefighting resources remaining`;
      case 'infrastructureCondition':
        return `${value}% of infrastructure intact`;
      case 'biodiversityCondition':
        return `${value}% of local ecosystem preserved`;
      case 'propertiesCondition':
        return `${value}% of properties protected`;
      case 'nuclearPowerStation':
        return `${value}% of nuclear facility integrity maintained`;
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center">
          <Flame className="mr-1 text-orange-500" size={18} />
          Simulation Metrics
        </h2>
        
        {/* Critical Warnings */}
        {(metrics.nuclearPowerStation < 50 || metrics.firefightingResource < 30) && (
          <div className="px-2 py-1 bg-red-50 border border-red-200 rounded-md flex items-center">
            <AlertTriangle className="text-red-500 mr-1" size={16} />
            <p className="text-red-700 text-sm font-medium">
              {metrics.nuclearPowerStation < 50 ? "Nuclear risk!" : "Critical resource shortage!"}
            </p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
        {/* Lives Saved */}
        <div 
          className={`bg-gray-50 p-2 rounded ${getAnimationClass('livesSaved')} group relative cursor-help transition-all duration-200 hover:bg-gray-100`}
          title={getTooltipText('livesSaved', metrics.livesSaved)}
        >
          <div className="flex items-center mb-1">
            <Users className="mr-1 text-blue-500" size={14} />
            <h3 className="text-xs font-medium text-gray-700">Lives Saved</h3>
          </div>
          <p className="text-sm font-bold text-green-600">
            {metrics.livesSaved}
          </p>
          <div className="absolute inset-0 bg-black bg-opacity-75 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs pointer-events-none">
            {getTooltipText('livesSaved', metrics.livesSaved)}
          </div>
        </div>
        
        {/* Human Casualties */}
        <div 
          className={`bg-gray-50 p-2 rounded ${getAnimationClass('humanCasualties')} group relative cursor-help transition-all duration-200 hover:bg-gray-100`}
          title={getTooltipText('humanCasualties', metrics.humanCasualties)}
        >
          <div className="flex items-center mb-1">
            <Skull className="mr-1 text-red-500" size={14} />
            <h3 className="text-xs font-medium text-gray-700">Casualties</h3>
            {metrics.humanCasualties > 0 && (
              <AlertTriangle className="ml-1 text-red-500" size={12} />
            )}
          </div>
          <p className="text-sm font-bold text-red-600">
            {metrics.humanCasualties}
          </p>
          <div className="absolute inset-0 bg-black bg-opacity-75 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs pointer-events-none">
            {getTooltipText('humanCasualties', metrics.humanCasualties)}
          </div>
        </div>
        
        {/* Firefighting Resource */}
        <div 
          className={`bg-gray-50 p-2 rounded ${getAnimationClass('firefightingResource')} group relative cursor-help transition-all duration-200 hover:bg-gray-100`}
          title={getTooltipText('firefightingResource', metrics.firefightingResource)}
        >
          <div className="flex items-center mb-1">
            <Droplets className="mr-1 text-blue-500" size={14} />
            <h3 className="text-xs font-medium text-gray-700">Resources</h3>
            {metrics.firefightingResource < 50 && (
              <AlertTriangle className="ml-1 text-orange-500" size={12} />
            )}
          </div>
          <p className={`text-sm font-bold ${getColorClass(metrics.firefightingResource)}`}>
            {metrics.firefightingResource}%
          </p>
          <div className="absolute inset-0 bg-black bg-opacity-75 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs pointer-events-none">
            {getTooltipText('firefightingResource', metrics.firefightingResource)}
          </div>
        </div>
        
        {/* Infrastructure Condition */}
        <div 
          className={`bg-gray-50 p-2 rounded ${getAnimationClass('infrastructureCondition')} group relative cursor-help transition-all duration-200 hover:bg-gray-100`}
          title={getTooltipText('infrastructureCondition', metrics.infrastructureCondition)}
        >
          <div className="flex items-center mb-1">
            <Building className="mr-1 text-gray-500" size={14} />
            <h3 className="text-xs font-medium text-gray-700">Infrastructure</h3>
            {metrics.infrastructureCondition < 50 && (
              <AlertTriangle className="ml-1 text-orange-500" size={12} />
            )}
          </div>
          <p className={`text-sm font-bold ${getColorClass(metrics.infrastructureCondition)}`}>
            {metrics.infrastructureCondition}%
          </p>
          <div className="absolute inset-0 bg-black bg-opacity-75 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs pointer-events-none">
            {getTooltipText('infrastructureCondition', metrics.infrastructureCondition)}
          </div>
        </div>
        
        {/* Biodiversity Condition */}
        <div 
          className={`bg-gray-50 p-2 rounded ${getAnimationClass('biodiversityCondition')} group relative cursor-help transition-all duration-200 hover:bg-gray-100`}
          title={getTooltipText('biodiversityCondition', metrics.biodiversityCondition)}
        >
          <div className="flex items-center mb-1">
            <Tree className="mr-1 text-green-500" size={14} />
            <h3 className="text-xs font-medium text-gray-700">Biodiversity</h3>
            {metrics.biodiversityCondition < 50 && (
              <AlertTriangle className="ml-1 text-orange-500" size={12} />
            )}
          </div>
          <p className={`text-sm font-bold ${getColorClass(metrics.biodiversityCondition)}`}>
            {metrics.biodiversityCondition}%
          </p>
          <div className="absolute inset-0 bg-black bg-opacity-75 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs pointer-events-none">
            {getTooltipText('biodiversityCondition', metrics.biodiversityCondition)}
          </div>
        </div>
        
        {/* Properties Condition */}
        <div 
          className={`bg-gray-50 p-2 rounded ${getAnimationClass('propertiesCondition')} group relative cursor-help transition-all duration-200 hover:bg-gray-100`}
          title={getTooltipText('propertiesCondition', metrics.propertiesCondition)}
        >
          <div className="flex items-center mb-1">
            <Building className="mr-1 text-blue-500" size={14} />
            <h3 className="text-xs font-medium text-gray-700">Properties</h3>
            {metrics.propertiesCondition < 50 && (
              <AlertTriangle className="ml-1 text-orange-500" size={12} />
            )}
          </div>
          <p className={`text-sm font-bold ${getColorClass(metrics.propertiesCondition)}`}>
            {metrics.propertiesCondition}%
          </p>
          <div className="absolute inset-0 bg-black bg-opacity-75 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs pointer-events-none">
            {getTooltipText('propertiesCondition', metrics.propertiesCondition)}
          </div>
        </div>
        
        {/* Nuclear Power Station */}
        <div 
          className={`bg-gray-50 p-2 rounded ${getAnimationClass('nuclearPowerStation')} group relative cursor-help transition-all duration-200 hover:bg-gray-100`}
          title={getTooltipText('nuclearPowerStation', metrics.nuclearPowerStation)}
        >
          <div className="flex items-center mb-1">
            <Factory className="mr-1 text-purple-500" size={14} />
            <h3 className="text-xs font-medium text-gray-700">Nuclear</h3>
            {metrics.nuclearPowerStation < 50 && (
              <AlertTriangle className="ml-1 text-red-500" size={12} />
            )}
          </div>
          <p className={`text-sm font-bold ${getColorClass(metrics.nuclearPowerStation, true)}`}>
            {metrics.nuclearPowerStation}%
          </p>
          <div className="absolute inset-0 bg-black bg-opacity-75 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs pointer-events-none">
            {getTooltipText('nuclearPowerStation', metrics.nuclearPowerStation)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDisplay;