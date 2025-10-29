import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, X, Info } from 'lucide-react';

interface CollapsibleHelpMessageProps {
  id: string;
  title: string;
  children: React.ReactNode;
  variant?: 'info' | 'guidance' | 'important';
  defaultExpanded?: boolean;
}

const CollapsibleHelpMessage: React.FC<CollapsibleHelpMessageProps> = ({
  id,
  title,
  children,
  variant = 'info',
  defaultExpanded = false
}) => {
  const storageKey = `help-message-${id}-hidden`;
  const bubbleStorageKey = `help-message-bubble-dismissed`;
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isPermanentlyHidden, setIsPermanentlyHidden] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    const hidden = localStorage.getItem(storageKey) === 'true';
    setIsPermanentlyHidden(hidden);

    const bubbleDismissed = localStorage.getItem(bubbleStorageKey) === 'true';
    setShowBubble(!bubbleDismissed && !hidden);
  }, [storageKey, bubbleStorageKey]);

  const handlePermanentHide = () => {
    localStorage.setItem(storageKey, 'true');
    setIsPermanentlyHidden(true);
  };

  const handleDismissBubble = () => {
    localStorage.setItem(bubbleStorageKey, 'true');
    setShowBubble(false);
  };

  if (isPermanentlyHidden) {
    return null;
  }

  return (
    <div className="relative mb-4">
      {showBubble && (
        <div className="absolute -top-12 right-8 z-20 animate-bounce">
          <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap font-medium">
            Click the X below to hide this collapsible message permanently 
 
            <button
              onClick={handleDismissBubble}
              className="ml-2 hover:text-gray-200 transition-colors"
            >
              <X size={12} />
            </button>
            <div className="absolute top-full right-4 transform w-0 h-0 border-t-8 border-amber-400 border-x-8 border-x-transparent"></div>
          </div>
        </div>
      )}

      <div className="border-2 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-400 rounded-xl shadow-md overflow-hidden transition-all duration-300">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 flex-1 text-left group"
          >
            <div className="text-yellow-600 transition-colors">
              <Info size={20} />
            </div>
            <h4 className="font-semibold text-yellow-900 text-sm group-hover:opacity-75 transition-opacity">
              {title}
            </h4>
            <div className="ml-auto text-yellow-600">
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </button>
          <button
            onClick={handlePermanentHide}
            className="ml-2 text-yellow-600 hover:opacity-75 transition-opacity"
            title="Hide this message permanently"
          >
            <X size={18} />
          </button>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 text-yellow-900 text-sm leading-relaxed space-y-2 animate-in fade-in duration-200">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollapsibleHelpMessage;
