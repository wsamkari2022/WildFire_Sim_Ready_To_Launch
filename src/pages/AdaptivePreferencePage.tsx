import React from 'react';
import { Construction } from 'lucide-react';

const AdaptivePreferencePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <Construction className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Adaptive Preference Alignment
        </h2>
        <p className="text-gray-600">
          This feature is currently under development.
        </p>
      </div>
    </div>
  );
};

export default AdaptivePreferencePage;