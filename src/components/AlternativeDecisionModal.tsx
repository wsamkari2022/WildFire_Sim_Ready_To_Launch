import React, { useState } from 'react';
import { X, Shield, Zap, Leaf, Scale, Ban, ThumbsUp, ThumbsDown, Lightbulb, CheckCircle, ArrowLeft } from 'lucide-react';
import { DecisionOption } from '../types';

interface AlternativeDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  alternativeOptions: DecisionOption[];
  onAddAlternative: (option: DecisionOption) => void;
}

const AlternativeDecisionModal: React.FC<AlternativeDecisionModalProps> = ({
  isOpen,
  onClose,
  alternativeOptions,
  onAddAlternative,
}) => {
  const [selectedOption, setSelectedOption] = useState<DecisionOption | null>(null);

  if (!isOpen) return null;

  const getExpertIcon = (expertType: string) => {
    switch (expertType) {
      case 'safety':
        return <Shield className="text-red-500" size={14} />;
      case 'efficiency':
        return <Zap className="text-yellow-500" size={14} />;
      case 'sustainability':
        return <Leaf className="text-green-500" size={14} />;
      case 'fairness':
        return <Scale className="text-blue-500" size={14} />;
      case 'nonmaleficence':
        return <Ban className="text-purple-500" size={14} />;
      default:
        return null;
    }
  };

  const getRecommendationIcon = (recommendation: "Accept" | "Reject") => {
    return recommendation === "Accept" ? 
      <ThumbsUp className="text-green-500" size={14} /> : 
      <ThumbsDown className="text-red-500" size={14} />;
  };

  const getExpertTitle = (expertType: string) => {
    return expertType.charAt(0).toUpperCase() + expertType.slice(1) + ' Expert';
  };

  const getAcceptCount = (option: DecisionOption) => {
    return Object.values(option.expertOpinions).filter(o => o.recommendation === "Accept").length;
  };

  // Reset selected option when modal closes
  const handleClose = () => {
    setSelectedOption(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Lightbulb className="mr-2 text-purple-500" size={20} />
            Explore Alternative Decisions
          </h3>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-auto">
          {!selectedOption ? (
            <>
              {alternativeOptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-full p-6 mb-6 shadow-sm">
                    <CheckCircle className="text-green-600" size={48} />
                  </div>

                  <h4 className="text-xl font-semibold text-gray-800 mb-3 text-center">
                    All Alternatives Explored!
                  </h4>

                  <p className="text-sm text-gray-600 text-center max-w-md mb-6 leading-relaxed">
                    You've successfully reviewed and added all available alternative decisions for this scenario.
                    All options are now visible on the simulation page, ready for your evaluation.
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md">
                    <p className="text-sm text-blue-800 text-center">
                      <span className="font-semibold">Next Steps:</span> Return to the simulation page to compare all options,
                      review their metrics, and make your final decision.
                    </p>
                  </div>

                  <button
                    onClick={handleClose}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <ArrowLeft size={18} />
                    Return to Simulation
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-purple-50 p-4 rounded-lg mb-4">
                    <h4 className="text-sm font-medium text-purple-800 mb-2">About Alternative Decisions</h4>
                    <p className="text-sm text-purple-700">
                      Our experts have analyzed alternative strategies that might offer different trade-offs.
                      These options provide unique approaches to handling the crisis, potentially balancing various factors in innovative ways.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {alternativeOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedOption(option)}
                        className="text-left p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-800">{option.title}</h5>
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                            {getAcceptCount(option)}/5 experts recommend
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                        <div className="space-y-1">
                          {option.riskInfo.slice(0, 2).map((risk, index) => (
                            <div key={index} className="flex items-start">
                              <span className="text-purple-500 mr-1 mt-0.5">•</span>
                              <p className="text-xs text-gray-700">{risk}</p>
                            </div>
                          ))}
                          {option.riskInfo.length > 2 && (
                            <p className="text-xs text-purple-600 group-hover:underline">
                              +{option.riskInfo.length - 2} more details...
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => setSelectedOption(null)}
                className="mb-4 text-sm text-purple-600 hover:text-purple-700 flex items-center"
              >
                <X size={16} className="mr-1" />
                Back to alternatives
              </button>

              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Decision Overview</h4>
                <p className="text-sm text-blue-700">{selectedOption.description}</p>
                
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedOption.riskInfo.map((risk, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-blue-500 mr-1 mt-0.5">•</span>
                      <p className="text-xs text-blue-700">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Expert Evaluations</h4>
                
                {Object.entries(selectedOption.expertOpinions).map(([expertType, opinion]) => (
                  <div key={expertType} className="bg-white p-3 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getExpertIcon(expertType)}
                        <h5 className="text-sm font-semibold text-gray-700">
                          {getExpertTitle(expertType)}
                        </h5>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          opinion.recommendation === "Accept" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {opinion.recommendation}
                        </span>
                        {getRecommendationIcon(opinion.recommendation)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-700">
                          <span className="font-semibold">Analysis:</span> {opinion.summary}
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-xs text-blue-900">
                          <span className="font-semibold">Comparison:</span> {opinion.comparison}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    onAddAlternative(selectedOption);
                    handleClose();
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors duration-200"
                >
                  Add Alternative to Decision List
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlternativeDecisionModal;