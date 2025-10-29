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
    <div
      className="fixed inset-0"
      style={{
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: -1
      }}
    >
      <div className="bg-white text-[6px] rounded-sm shadow-sm max-w-[60px] w-full p-[1px]">
        <div className="flex items-center justify-between border-b border-gray-200 p-[1px]">
          <h3 className="font-semibold text-gray-800 truncate">{option.title}</h3>
          <button onClick={onClose} className="text-gray-400 p-[1px]">
            <X size={8} />
          </button>
        </div>

        <div className="p-[1px]">
          <div className="flex justify-center">
            <button
              onClick={onKeepChoice}
              disabled={!hasExploredAlternatives}
              className={`px-[2px] py-[1px] rounded-sm text-[5px] transition-all duration-200 font-medium ${
                hasExploredAlternatives
                  ? 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
              }`}
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
