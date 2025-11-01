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
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isPermanentlyHidden, setIsPermanentlyHidden] = useState(false);

  useEffect(() => {
    const hidden = localStorage.getItem(storageKey) === 'true';
    setIsPermanentlyHidden(hidden);
  }, [storageKey]);

  const handlePermanentHide = () => {
    localStorage.setItem(storageKey, 'true');
    setIsPermanentlyHidden(true);
  };

  if (isPermanentlyHidden) {
    return null;
  }

  return (
    <div className="relative mb-4">
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
