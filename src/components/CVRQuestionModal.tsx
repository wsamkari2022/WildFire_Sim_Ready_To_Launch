import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { CVRQuestion } from '../types';
import { TrackingManager } from '../utils/trackingUtils';

interface CVRQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: CVRQuestion;
  onAnswer: (answer: boolean) => void;
}

const CVRQuestionModal: React.FC<CVRQuestionModalProps> = ({
  isOpen,
  onClose,
  question,
  onAnswer
}) => {
  // Note: CVR opening is tracked in SimulationMainPage when modal is opened

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-500\" size={24} />
            <h2 className="text-xl font-bold text-gray-900">
              Value Reflection Required
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {question.descriptionTile}
            </h3>
            <p className="text-gray-600 mb-4">
              {question.description}
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-yellow-800 font-medium">
                {question.question}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => onAnswer(true)}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Yes, I would
            </button>
            <button
              onClick={() => onAnswer(false)}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              No, I would not
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVRQuestionModal;