import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Award, CheckCircle, ArrowRight } from 'lucide-react';

const ThankYouPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleContinue = () => {
    navigate('/feedback');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 flex items-center justify-center p-4">
      <div
        className={`max-w-3xl w-full transition-all duration-1000 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-full p-4 shadow-lg">
              <CheckCircle className="h-16 w-16 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
            Simulation Complete!
          </h1>

          <div className="flex justify-center items-center gap-4 mb-8">
            <Award className="h-8 w-8 text-yellow-500" />
            <p className="text-xl text-center text-gray-700 font-medium">
              Thank You for Your Participation
            </p>
            <Award className="h-8 w-8 text-yellow-500" />
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-6 mb-8 border-2 border-blue-200">
            <div className="flex items-start gap-3 mb-4">
              <Heart className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
              <p className="text-gray-800 leading-relaxed">
                <strong>We deeply appreciate your time, effort, and thoughtful consideration</strong> throughout this simulation.
                Your decisions and engagement provide invaluable insights into value-driven decision-making under pressure.
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed ml-9">
              You navigated complex scenarios, balanced competing priorities, and demonstrated the challenges of ethical
              decision-making in crisis situations. Your contribution helps advance our understanding of how people align
              their values with their choices.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="bg-green-100 rounded-full p-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-lg">All scenarios completed successfully</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <div className="bg-blue-100 rounded-full p-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-lg">Your decisions have been recorded</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <div className="bg-purple-100 rounded-full p-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-lg">Final analysis is ready for your review</span>
            </div>
          </div>

          <div className="border-t-2 border-gray-200 pt-6">
            <p className="text-center text-gray-600 mb-6 text-lg">
              Please proceed to provide your feedback about the simulation experience
            </p>

            <button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold text-lg py-4 px-6 rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
            >
              Continue to Feedback
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
