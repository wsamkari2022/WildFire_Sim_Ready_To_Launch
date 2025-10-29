import React from 'react';
import { X, Shield, Zap, Leaf, Scale, Ban, ThumbsUp, ThumbsDown, Minus, Users, Skull, Droplets, Building, Trees as Tree, Factory, ChevronDown, AlertCircle } from 'lucide-react';
import { DecisionOption } from '../types';

interface ExpertAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  option: DecisionOption;
  onKeepChoice: () => void;
  onReviewAlternatives: () => void;
  isAligned: boolean;
  hasExploredAlternatives: boolean;
}

const ExpertAnalysisModal: React.FC<ExpertAnalysisModalProps> = ({
  isOpen,
  onClose,
  option,
  onKeepChoice,
  onReviewAlternatives,
  isAligned,
  hasExploredAlternatives
}) => {
  const [showScrollIndicator, setShowScrollIndicator] = React.useState(true);
  const [scrollContainerRef, setScrollContainerRef] = React.useState<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef;
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
        
        // Hide indicator when user has scrolled 80% or more
        if (scrollPercentage >= 0.8) {
          setShowScrollIndicator(false);
        }
      }
    };

    if (scrollContainerRef) {
      scrollContainerRef.addEventListener('scroll', handleScroll);
      return () => scrollContainerRef.removeEventListener('scroll', handleScroll);
    }
  }, [scrollContainerRef]);

  React.useEffect(() => {
    // Reset scroll indicator when modal opens
    if (isOpen) {
      setShowScrollIndicator(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getExpertIcon = (expertType: string) => {
    switch (expertType) {
      case 'safety':
        return <Shield className="text-red-500" size={20} />;
      case 'efficiency':
        return <Zap className="text-yellow-500" size={20} />;
      case 'sustainability':
        return <Leaf className="text-green-500" size={20} />;
      case 'fairness':
        return <Scale className="text-blue-500" size={20} />;
      case 'nonmaleficence':
        return <Ban className="text-purple-500" size={20} />;
      default:
        return null;
    }
  };

  const getRecommendationIcon = (recommendation: "Accept" | "Reject" | "Neutral") => {
    return recommendation === "Accept" ?
      <ThumbsUp className="text-green-500" size={18} /> :
      recommendation === "Reject" ?
      <ThumbsDown className="text-red-500" size={18} /> :
      <Minus className="text-gray-500" size={18} />;
  };

  const getExpertTitle = (expertType: string) => {
    return expertType.charAt(0).toUpperCase() + expertType.slice(1) + ' Expert';
  };

  const formatImpactValue = (value: number, isLivesSaved: boolean = false, isCasualties: boolean = false) => {
    if (isLivesSaved) {
      return `+${value}`;
    }
    if (isCasualties) {
      return `+${value}`;
    }
    return `${value}%`;
  };

  const getRecommendationCount = () => {
    const recommendations = Object.values(option.expertOpinions);
    const accepts = recommendations.filter(r => r.recommendation === "Accept").length;
    return { accepts, total: recommendations.length };
  };

  const { accepts, total } = getRecommendationCount();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h3 className="text-2xl font-bold text-gray-800">{option.title}</h3>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                  {accepts}/{total} Experts Recommend
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div
          className="p-6 flex-1 overflow-auto relative"
          ref={setScrollContainerRef}
        >
          <div className="space-y-4">
            {/* Impact Summary & Key Considerations - Linear Layout at Top */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Impact Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Impact Summary
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-lg p-2 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Users size={14} className="text-green-600" />
                        <span className="text-xs font-medium text-gray-700">Lives Saved</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        {formatImpactValue(option.impact.livesSaved, true)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-2 border border-red-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Skull size={14} className="text-red-600" />
                        <span className="text-xs font-medium text-gray-700">Casualties</span>
                      </div>
                      <span className="text-sm font-bold text-red-600">
                        {formatImpactValue(option.impact.humanCasualties, false, true)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-2 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Droplets size={14} className="text-blue-600" />
                        <span className="text-xs font-medium text-gray-700">Resources</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">
                        {formatImpactValue(option.impact.firefightingResource)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Building size={14} className="text-gray-600" />
                        <span className="text-xs font-medium text-gray-700">Infrastructure</span>
                      </div>
                      <span className="text-sm font-bold text-gray-600">
                        {formatImpactValue(option.impact.infrastructureCondition)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-2 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Tree size={14} className="text-green-600" />
                        <span className="text-xs font-medium text-gray-700">Biodiversity</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        {formatImpactValue(option.impact.biodiversityCondition)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-2 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Factory size={14} className="text-purple-600" />
                        <span className="text-xs font-medium text-gray-700">Nuclear</span>
                      </div>
                      <span className="text-sm font-bold text-purple-600">
                        {formatImpactValue(option.impact.nuclearPowerStation)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Considerations */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Key Considerations
                </h4>
                <div className="space-y-2">
                  {option.riskInfo.map((risk, index) => (
                    <div key={index} className="flex items-start gap-2 bg-white rounded-lg p-2 border border-orange-200">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      <p className="text-xs text-gray-700 leading-relaxed">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Expert Recommendations - Grid Layout */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Expert Recommendations
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {Object.entries(option.expertOpinions).map(([expertType, opinion]) => (
                  <div key={expertType} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    {/* Expert Header */}
                    <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getExpertIcon(expertType)}
                          <h5 className="font-semibold text-sm text-gray-800">{getExpertTitle(expertType)}</h5>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            opinion.recommendation === "Accept"
                              ? "bg-green-100 text-green-800"
                              : opinion.recommendation === "Reject"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {opinion.recommendation}
                          </span>
                          {getRecommendationIcon(opinion.recommendation)}
                        </div>
                      </div>
                    </div>

                    {/* Expert Content */}
                    <div className="p-3 space-y-2">
                      <div className="bg-blue-50 rounded-lg p-2 border-l-4 border-blue-400">
                        <p className="text-xs font-medium text-blue-900 mb-1">Analysis</p>
                        <p className="text-xs text-blue-800">{opinion.summary}</p>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-2 border-l-4 border-purple-400">
                        <p className="text-xs font-medium text-purple-900 mb-1">Comparison</p>
                        <p className="text-xs text-purple-800">{opinion.comparison}</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-2 border-l-4 border-gray-400">
                        <p className="text-xs font-medium text-gray-900 mb-1">Confidence Level</p>
                        <p className="text-xs text-gray-700">{opinion.confidence}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll Indicator Bubble */}
          {showScrollIndicator && (
            <div className="fixed bottom-32 right-8 z-50">
              <div className="relative">
                {/* Main bubble */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-full shadow-lg animate-bounce flex items-center gap-2 border-2 border-white">
                  <ChevronDown size={20} className="animate-pulse" />
                  <span className="font-medium text-sm whitespace-nowrap">
                    Scroll to read all expert analyses!
                  </span>
                  <ChevronDown size={20} className="animate-pulse" />
                </div>
                
                {/* Pulsing ring effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping opacity-20"></div>
                
                {/* Arrow pointing to scroll area */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-purple-500 animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gradient-to-r from-gray-50 to-white rounded-b-xl">
          {/* Warning message when alternatives not explored */}
          {!hasExploredAlternatives && (
            <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg relative">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center animate-pulse">
                    <AlertCircle className="text-white" size={18} />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-800 mb-1">
                    Action Required
                  </p>
                  <p className="text-xs text-orange-700">
                    Please review the alternative options before you can keep this choice. This helps ensure you're making an informed decision.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4">
            {hasExploredAlternatives && (
              <button
                onClick={onReviewAlternatives}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium flex items-center gap-2"
              >
                <span>Review Alternatives</span>
              </button>
            )}

            {!hasExploredAlternatives && (
              <button
                onClick={onReviewAlternatives}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center gap-2 animate-pulse border-2 border-purple-300"
              >
                <span>Review Alternatives</span>
              </button>
            )}

            <button
              onClick={onKeepChoice}
              disabled={!hasExploredAlternatives}
              className={`px-6 py-3 rounded-lg transition-all duration-200 font-medium shadow-lg flex items-center gap-2 ${
                hasExploredAlternatives
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
              }`}
              title={!hasExploredAlternatives ? "Review alternatives to enable this option" : ""}
            >
              <span>Keep My Choice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertAnalysisModal;