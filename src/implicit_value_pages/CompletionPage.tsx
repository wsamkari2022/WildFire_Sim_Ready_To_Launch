import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const CompletionPage: React.FC = () => {
  const navigate = useNavigate();
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Start animation after component mounts
    setShowAnimation(true);
    
    // Auto-navigate after 3 seconds
    const timer = setTimeout(() => {
      navigate('/values');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className={`text-center transform transition-all duration-500 ${
        showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Preferences Selection Complete!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Thank you for completing the preferences selection. You'll be redirected to review your values in a moment.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <span>Proceeding to Values Review</span>
            <ArrowRight className="h-5 w-5 animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionPage;