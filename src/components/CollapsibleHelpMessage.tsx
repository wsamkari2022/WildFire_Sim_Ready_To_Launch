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
  defaultExpanded = true
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

  const variantStyles = {
    info: {
      container: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300',
      icon: 'text-blue-600',
      header: 'text-blue-900',
      text: 'text-blue-800'
    },
    guidance: {
      container: 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300',
      icon: 'text-emerald-600',
      header: 'text-emerald-900',
      text: 'text-emerald-800'
    },
    important: {
      container: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300',
      icon: 'text-amber-600',
      header: 'text-amber-900',
      text: 'text-amber-800'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={`border-2 ${styles.container} rounded-xl shadow-md mb-4 overflow-hidden transition-all duration-300`}>
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 flex-1 text-left group"
        >
          <div className={`${styles.icon} transition-colors`}>
            <Info size={20} />
          </div>
          <h4 className={`font-semibold ${styles.header} text-sm group-hover:opacity-75 transition-opacity`}>
            {title}
          </h4>
          <div className={`ml-auto ${styles.icon}`}>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </button>
        <button
          onClick={handlePermanentHide}
          className={`ml-2 ${styles.icon} hover:opacity-75 transition-opacity`}
          title="Hide this message permanently"
        >
          <X size={18} />
        </button>
      </div>

      {isExpanded && (
        <div className={`px-4 pb-4 ${styles.text} text-sm leading-relaxed space-y-2 animate-in fade-in duration-200`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleHelpMessage;
