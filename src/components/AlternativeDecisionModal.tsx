import React, { useState } from 'react';
import { X, Shield, Zap, Leaf, Scale, Ban, ThumbsUp, ThumbsDown, Lightbulb, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
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
        return <Shield className="text-red-500" size={16} />;
      case 'efficiency':
        return <Zap className="text-yellow-500" size={16} />;
      case 'sustainability':
        return <Leaf className="text-green-500" size={16} />;
      case 'fairness':
        return <Scale className="text-blue-500" size={16} />;
      case 'nonmaleficence':
        return <Ban className="text-purple-500" size={16} />;
      default:
        return null;
    }
  };

  const getRecommendationIcon = (recommendation: "Accept" | "Reject" | "Neutral") => {
    return recommendation === "Accept" ?
      <ThumbsUp className="text-green-600" size={18} /> :
      recommendation === "Reject" ?
      <ThumbsDown className="text-red-600" size={18} /> :
      <Zap className="text-gray-600" size={18} />;
  };

  const getExpertTitle = (expertType: string) => {
    return expertType.charAt(0).toUpperCase() + expertType.slice(1) + ' Expert';
  };

  const getAcceptCount = (option: DecisionOption) => {
    return Object.values(option.expertOpinions).filter(o => o.recommendation === "Accept").length;
  };

  const handleClose = () => {
    setSelectedOption(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl max-w-7xl w-full h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <Lightbulb className="mr-2.5 text-purple-600" size={24} />
            Explore Alternative Decisions
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-white rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {!selectedOption ? (
            <>
              {alternativeOptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-full p-8 mb-6 shadow-lg">
                    <CheckCircle className="text-green-600" size={56} />
                  </div>

                  <h4 className="text-2xl font-bold text-gray-800 mb-3 text-center">
                    All Alternatives Explored!
                  </h4>

                  <p className="text-base text-gray-600 text-center max-w-md mb-8 leading-relaxed">
                    You've successfully reviewed and added all available alternative decisions for this scenario.
                    All options are now visible on the simulation page, ready for your evaluation.
                  </p>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-8 max-w-md">
                    <p className="text-sm text-blue-800 text-center">
                      <span className="font-semibold">Next Steps:</span> Return to the simulation page to compare all options,
                      review their metrics, and make your final decision.
                    </p>
                  </div>

                  <button
                    onClick={handleClose}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3.5 px-8 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <ArrowLeft size={20} />
                    Return to Simulation
                  </button>
                </div>
              ) : (
                <div className="p-8 h-full flex flex-col">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 p-5 rounded-2xl mb-6 shadow-sm">
                    <h4 className="text-base font-bold text-purple-900 mb-2 flex items-center">
                      <Lightbulb className="mr-2 text-purple-600" size={20} />
                      About Alternative Decisions
                    </h4>
                    <p className="text-sm text-purple-700 leading-relaxed">
                      Our experts have analyzed alternative strategies that might offer different trade-offs.
                      These options provide unique approaches to handling the crisis, potentially balancing various factors in innovative ways.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 flex-1 overflow-y-auto pr-2">
                    {alternativeOptions.map((option) => (
                      <div
                        key={option.id}
                        className="flex flex-col bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-2xl transition-all duration-300 h-fit"
                      >
                        <div className="p-5 flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <h5 className="font-bold text-gray-900 text-base leading-tight flex-1 mr-2">
                              {option.title}
                            </h5>
                            <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-3 py-1.5 rounded-full font-bold whitespace-nowrap shadow-sm">
                              <ThumbsUp size={14} />
                              <span className="text-xs">{getAcceptCount(option)}/5</span>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">
                            {option.description}
                          </p>

                          <div className="space-y-2 mb-4">
                            {option.riskInfo.slice(0, 2).map((risk, index) => (
                              <div key={index} className="flex items-start bg-gray-50 rounded-lg p-2">
                                <span className="text-purple-500 mr-2 mt-0.5 font-bold text-sm">•</span>
                                <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{risk}</p>
                              </div>
                            ))}
                            {option.riskInfo.length > 2 && (
                              <p className="text-xs text-purple-600 font-semibold pl-2">
                                +{option.riskInfo.length - 2} more details...
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-gray-50 to-purple-50 border-t-2 border-gray-100 rounded-b-2xl">
                          <button
                            onClick={() => setSelectedOption(option)}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                          >
                            <ArrowRight size={18} />
                            Select & View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col">
              <div className="px-6 pt-4 pb-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                <button
                  onClick={() => setSelectedOption(null)}
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center font-medium mb-3 hover:underline"
                >
                  <X size={16} className="mr-1" />
                  Back to alternatives
                </button>

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-blue-900 mb-1.5">Decision Overview</h4>
                    <p className="text-sm text-blue-800 leading-relaxed">{selectedOption.description}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border-2 border-blue-200 shadow-sm">
                    <ThumbsUp className="text-green-600" size={18} />
                    <span className="text-sm font-bold text-gray-800">{getAcceptCount(selectedOption)}/5</span>
                    <span className="text-xs text-gray-600">recommend</span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {selectedOption.riskInfo.map((risk, index) => (
                    <div key={index} className="flex items-start bg-white rounded-lg px-2 py-1.5">
                      <span className="text-blue-500 mr-1.5 mt-0.5 font-bold">•</span>
                      <p className="text-xs text-blue-800">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm mr-2">
                    Expert Evaluations
                  </span>
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {Object.entries(selectedOption.expertOpinions).map(([expertType, opinion]) => (
                    <div
                      key={expertType}
                      className={`rounded-xl p-4 border-2 transition-all duration-200 ${
                        opinion.recommendation === "Accept"
                          ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg"
                          : opinion.recommendation === "Reject"
                          ? "bg-gradient-to-br from-red-50 to-pink-50 border-red-200 hover:shadow-lg"
                          : "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getExpertIcon(expertType)}
                          <h5 className="text-sm font-bold text-gray-800">
                            {getExpertTitle(expertType)}
                          </h5>
                        </div>
                        <div className="flex items-center gap-2">
                          {getRecommendationIcon(opinion.recommendation)}
                          <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                            opinion.recommendation === "Accept"
                              ? "bg-green-600 text-white"
                              : opinion.recommendation === "Reject"
                              ? "bg-red-600 text-white"
                              : "bg-gray-600 text-white"
                          }`}>
                            {opinion.recommendation}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="bg-white bg-opacity-70 p-2.5 rounded-lg">
                          <p className="text-xs text-gray-800 leading-relaxed">
                            <span className="font-bold text-gray-900">Analysis:</span> {opinion.summary}
                          </p>
                        </div>

                        <div className="bg-blue-100 bg-opacity-50 p-2.5 rounded-lg">
                          <p className="text-xs text-blue-900 leading-relaxed">
                            <span className="font-bold">Comparison:</span> {opinion.comparison}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <button
                  onClick={() => {
                    onAddAlternative(selectedOption);
                    handleClose();
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl text-base"
                >
                  <Lightbulb size={20} />
                  Add Alternative to Decision List
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlternativeDecisionModal;
