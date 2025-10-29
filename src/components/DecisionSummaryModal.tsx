import React, { useState, useEffect, useRef } from 'react';
import { X, Check, ThumbsUp, ThumbsDown, Users, Skull, Droplets, Building, Trees as Tree, Factory, AlertTriangle, ChevronDown, ChevronUp, Info, RefreshCcw } from 'lucide-react';
import { DecisionOption } from '../types';

interface DecisionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  option: DecisionOption;
  onConfirmDecision: () => void;
  canConfirm: boolean;
  onReviewAlternatives: () => void;
}

const DecisionSummaryModal: React.FC<DecisionSummaryModalProps> = ({
  isOpen,
  onClose,
  option,
  onConfirmDecision,
  canConfirm,
  onReviewAlternatives
}) => {
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [isImpactExpanded, setIsImpactExpanded] = useState(true);
  const [showScrollBubble, setShowScrollBubble] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const hasScroll = container.scrollHeight > container.clientHeight;
      setShowScrollBubble(hasScroll);

      const handleScroll = () => {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
        if (isNearBottom) {
          setShowScrollBubble(false);
        }
      };

      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCloseOrReview = (action: 'close' | 'review') => {
    const hasReordered = localStorage.getItem('hasReorderedValues') === 'true';
    const cvrYesClicked = localStorage.getItem('cvrYesClicked') === 'true';
    const cvrNoClicked = localStorage.getItem('cvrNoClicked') === 'true';
    const hasCVRFlags = cvrYesClicked || cvrNoClicked;

    if (hasReordered || hasCVRFlags) {
      setShowWarningPopup(true);

      // Store the action to execute after confirmation and CVR state
      if (action === 'close') {
        (window as any).pendingAction = 'close';
      } else {
        (window as any).pendingAction = 'review';
      }
      (window as any).cvrYesClicked = cvrYesClicked;
    } else {
      // No reordering and no CVR flags, proceed normally
      if (action === 'close') {
        onClose();
      } else {
        onClose();
        onReviewAlternatives();
      }
    }
  };

  const handleWarningConfirm = () => {
    // Empty the MoralValuesReorderList
    localStorage.removeItem('MoralValuesReorderList');
    localStorage.removeItem('moralValuesRanking');
    localStorage.setItem('hasReorderedValues', 'false');

    // Reset CVR flags
    localStorage.setItem('cvrYesClicked', 'false');
    localStorage.setItem('cvrNoClicked', 'false');

    setShowWarningPopup(false);

    // Execute the pending action
    const pendingAction = (window as any).pendingAction;
    if (pendingAction === 'close') {
      onClose();
    } else {
      onClose();
      onReviewAlternatives();
    }

    // Clean up
    delete (window as any).pendingAction;
    delete (window as any).cvrYesClicked;
  };

  const handleWarningCancel = () => {
    setShowWarningPopup(false);
    delete (window as any).pendingAction;
    delete (window as any).cvrYesClicked;
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

  const getExpertRecommendations = () => {
    const recommendations = Object.values(option.expertOpinions);
    const accepts = recommendations.filter(r => r.recommendation === "Accept").length;
    const rejects = recommendations.filter(r => r.recommendation === "Reject").length;
    
    return { accepts, rejects, total: recommendations.length };
  };

  const { accepts, rejects, total } = getExpertRecommendations();

  // Check if we should show CVR-specific message
  const showCVRMessage = (window as any).cvrYesClicked === true;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-800">Decision Summary</h3>
          <button
            onClick={() => handleCloseOrReview('close')}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div ref={scrollContainerRef} className="p-6 flex-1 overflow-auto relative">
          {/* Informative Message */}
          <div className="mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-400 rounded-xl shadow-md p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <Info className="text-yellow-600" size={24} />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-yellow-900 text-base mb-2">Why You're Seeing This Page</h5>
                <p className="text-yellow-800 text-sm leading-relaxed mb-3">
                  This is your <strong>final review</strong> before committing to this decision. You're seeing a summary of what you've chosen and how it will affect your mission.
                </p>
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded-r-lg">
                  <p className="text-yellow-900 text-sm font-semibold mb-1">
                    Important: What Happens When You Click "Confirm Decision"
                  </p>
                  <ul className="text-yellow-800 text-sm space-y-1 ml-4 list-disc">
                    <li>This option's impacts will be <strong>permanently applied</strong> to your cumulative simulation scores</li>
                    <li>All metrics (lives saved, resources, infrastructure, etc.) will be <strong>updated immediately</strong></li>
                    <li>These changes will <strong>carry forward</strong> to the next scenario, affecting your future options</li>
                    <li>You <strong>cannot undo</strong> this decision once confirmed</li>
                  </ul>
                </div>
                <p className="text-yellow-800 text-xs mt-2 italic">
                  Take your time to review the expert consensus and impact summary below before confirming.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-800 mb-2">{option.title}</h4>
            <p className="text-gray-600 text-sm">{option.description}</p>
          </div>

          {/* Expert Consensus */}
          <div className="mb-6">
            <h5 className="font-medium text-gray-700 mb-3">Expert Consensus</h5>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <ThumbsUp className="text-green-500" size={20} />
                <span className="font-medium text-green-700">{accepts} Recommend</span>
              </div>
              <div className="flex items-center gap-2">
                <ThumbsDown className="text-red-500" size={20} />
                <span className="font-medium text-red-700">{rejects} Do Not Recommend</span>
              </div>
              <div className="ml-auto text-sm text-gray-600">
                {accepts}/{total} experts support this decision
              </div>
            </div>
          </div>

          {/* Impact Summary - Collapsible */}
          <div className="mb-6">
            <button
              onClick={() => setIsImpactExpanded(!isImpactExpanded)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors mb-3 group"
            >
              <h5 className="font-medium text-gray-700">Impact Summary</h5>
              <div className="text-gray-600">
                {isImpactExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>

            {isImpactExpanded && (
              <div className="space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded border-l-4 border-green-400">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-green-600" />
                  <span className="text-sm font-medium">Lives Saved</span>
                </div>
                <span className="font-bold text-green-600">
                  {formatImpactValue(option.impact.livesSaved, true)}
                </span>
              </div>
              
              {option.impact.humanCasualties > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded border-l-4 border-red-400">
                  <div className="flex items-center gap-2">
                    <Skull size={16} className="text-red-600" />
                    <span className="text-sm font-medium">Casualties</span>
                  </div>
                  <span className="font-bold text-red-600">
                    {formatImpactValue(option.impact.humanCasualties, false, true)}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <div className="flex items-center gap-1">
                    <Droplets size={14} className="text-blue-600" />
                    <span className="text-xs font-medium">Resources</span>
                  </div>
                  <span className="text-sm font-bold text-blue-600">
                    {formatImpactValue(option.impact.firefightingResource)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-1">
                    <Building size={14} className="text-gray-600" />
                    <span className="text-xs font-medium">Infrastructure</span>
                  </div>
                  <span className="text-sm font-bold text-gray-600">
                    {formatImpactValue(option.impact.infrastructureCondition)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <div className="flex items-center gap-1">
                    <Tree size={14} className="text-green-600" />
                    <span className="text-xs font-medium">Biodiversity</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    {formatImpactValue(option.impact.biodiversityCondition)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                  <div className="flex items-center gap-1">
                    <Factory size={14} className="text-purple-600" />
                    <span className="text-xs font-medium">Nuclear</span>
                  </div>
                  <span className="text-sm font-bold text-purple-600">
                    {formatImpactValue(option.impact.nuclearPowerStation)}
                  </span>
                </div>
              </div>
            </div>
            )}
          </div>

          {!canConfirm && (
            <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg relative">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-sm font-bold">!</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-800 mb-1">
                    Action Required
                  </p>
                  <p className="text-xs text-orange-700">
                    Please review alternatives before confirming your decision.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Scroll Indicator Bubble */}
          {showScrollBubble && (
            <div className="sticky bottom-0 left-0 right-0 flex justify-center pb-4">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs px-4 py-2 rounded-full shadow-lg animate-bounce">
                <div className="flex items-center gap-2">
                  <ChevronDown size={16} />
                  <span>Scroll down to see more</span>
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex flex-col gap-3 max-w-md mx-auto">
            <button
              onClick={() => handleCloseOrReview('close')}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl transition-all duration-300 bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-base group"
            >
              <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
              Change My Mind
            </button>

            <button
              onClick={onConfirmDecision}
              disabled={!canConfirm}
              className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl transition-all duration-300 font-semibold text-base shadow-lg ${
                canConfirm
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={!canConfirm ? "Review alternatives to enable confirmation" : ""}
            >
              <Check size={20} />
              Confirm Decision
            </button>

            {!canConfirm && (
              <p className="text-xs text-center text-orange-600 italic">
                You must view all alternatives before confirming
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Warning Popup */}
      {showWarningPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-orange-500" size={32} />
                </div>
              </div>

              {showCVRMessage ? (
                <>
                  <h3 className="text-xl font-bold text-gray-800 text-center mb-3">
                    Your Value Reflection Will Be Cleared
                  </h3>

                  <p className="text-gray-600 text-center mb-6">
                    You confirmed your decision in the value reflection scenario. If you go back now, your response to that reflection question will be cleared, and the value prioritization you established will be reset.
                  </p>

                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-6">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> Consider confirming your current decision to preserve your value reflection response, or continue if you'd like to reconsider your choice from the beginning.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-gray-800 text-center mb-3">
                    Your Preference Changes Will Be Lost
                  </h3>

                  <p className="text-gray-600 text-center mb-6">
                    You recently reordered your values to help guide this decision. If you go back now, these personalized rankings will be cleared and you'll need to set them up again if you want to use them.
                  </p>

                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-6">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> Consider confirming your current decision to preserve your preference settings, or continue if you'd like to explore other options from scratch.
                    </p>
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleWarningCancel}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Stay Here
                </button>
                <button
                  onClick={handleWarningConfirm}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Continue Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DecisionSummaryModal;