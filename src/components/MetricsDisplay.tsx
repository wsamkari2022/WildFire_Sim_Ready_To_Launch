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
        <div className={`bg-gray-50 p-2 rounded ${getAnimationClass('livesSaved')}`}>
          <div className="flex items-center mb-1">
            <Users className="mr-1 text-blue-500" size={14} />
            <h3 className="text-xs font-medium text-gray-700">Lives Saved</h3>
          </div>
          <p className="text-sm font-bold text-green-600">
            {metrics.livesSaved}
          </p>
        </div>
        
        {/* Human Casualties */}
        <div className={`bg-gray-50 p-2 rounded ${getAnimationClass('humanCasualties')}`}>
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
        </div>
        
        {/* Firefighting Resource */}
        <div className={`bg-gray-50 p-2 rounded ${getAnimationClass('firefightingResource')}`}>
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
        </div>
        
        {/* Infrastructure Condition */}
        <div className={`bg-gray-50 p-2 rounded ${getAnimationClass('infrastructureCondition')}`}>
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
        </div>
        
        {/* Biodiversity Condition */}
        <div className={`bg-gray-50 p-2 rounded ${getAnimationClass('biodiversityCondition')}`}>
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
        </div>
        
        {/* Properties Condition */}
        <div className={`bg-gray-50 p-2 rounded ${getAnimationClass('propertiesCondition')}`}>
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
        </div>
        
        {/* Nuclear Power Station */}
        <div className={`bg-gray-50 p-2 rounded ${getAnimationClass('nuclearPowerStation')}`}>
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
        </div>
      </div>
    </div>
  );
};

export default MetricsDisplay;