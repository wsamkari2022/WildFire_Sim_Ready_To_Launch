import React from 'react';
import { X } from 'lucide-react';
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
  React.useEffect(() => {
    if (isOpen && hasExploredAlternatives) {
      setTimeout(() => {
        onKeepChoice();
      }, 100);
    }
  }, [isOpen, hasExploredAlternatives, onKeepChoice]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-1 z-50 text-[8px]">
      <div className="bg-white rounded-md shadow-md max-w-[180px] w-full scale-[0.6]">
        <div className="flex items-center justify-between p-1 border-b border-gray-200">
          <h3 className="text-[8px] font-semibold text-gray-800 truncate">{option.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100"
          >
            <X size={10} />
          </button>
        </div>

        <div className="p-1">
          <div className="flex justify-center">
            <button
              onClick={onKeepChoice}
              disabled={!hasExploredAlternatives}
              className={`px-1.5 py-0.5 rounded-sm text-[7px] transition-all duration-200 font-medium shadow-sm ${
                hasExploredAlternatives
                  ? 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white hover:from-blue-500 hover:to-indigo-500'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
              }`}
              title={!hasExploredAlternatives ? "Review alternatives to enable this option" : ""}
            >
              Keep
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertAnalysisModal;
