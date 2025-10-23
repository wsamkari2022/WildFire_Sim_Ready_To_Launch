import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { explicitQuestions } from '../data/explicitQuestions';
import type { ExplicitValue } from '../types/explicitValues';
import axios from 'axios';
import ProgressTracker from '../components/ProgressTracker';

const ExplicitValuesPage: React.FC = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);

  const handleOptionSelect = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 100 && !hasScrolled) {
        setHasScrolled(true);
        setShowScrollIndicator(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasScrolled]);

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== explicitQuestions.length) {
      alert('Please answer all questions before continuing.');
      return;
    }

    setIsSubmitting(true);

    const explicitValues: ExplicitValue[] = Object.entries(answers).map(([questionId, value]) => ({
      question_id: parseInt(questionId),
      value_selected: value,
      timestamp: new Date().toISOString()
    }));

    try {
     // await axios.post('http://localhost:4000/api/explicit-values', { explicitValues });
      
      // Store in localStorage for later comparison
      localStorage.setItem('explicitValues', JSON.stringify(explicitValues));
      
      setShowConfirmation(true);
      setTimeout(() => {
        navigate('/preferences');
      }, 2000);
    } catch (error) {
      console.error('Failed to save explicit values:', error);
      setIsSubmitting(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle2 className="mx-auto text-green-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600">Your responses have been recorded. Proceeding to the next stage...</p>
        </div>
      </div>
    );
  }

  const progressSteps = [
    { id: 'explicit', label: 'Explicit Values' },
    { id: 'hospital', label: 'Hospital' },
    { id: 'environment', label: 'Environment' },
    { id: 'safety', label: 'Safety' },
    { id: 'resources', label: 'Resources' },
    { id: 'medical', label: 'Medical' },
    { id: 'results', label: 'Results' },
    { id: 'simulation', label: 'Simulation', isLarger: true }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <Compass className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Explicit Value Identification – Benchmark Questionnaire
            </h1>
          </div>
        </div>
      </header>

      <ProgressTracker currentStep={0} steps={progressSteps} />

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mb-8">
          <p className="text-blue-700">
            Please answer the following simple everyday dilemmas. Select the value that best reflects your personal beliefs.
            Your selections will serve as a baseline for later comparison.
          </p>
        </div>

        {showScrollIndicator && (
          <div className="fixed top-1/2 right-8 transform -translate-y-1/2 z-50 animate-bounce">
            <div className="relative">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-2xl shadow-2xl max-w-xs">
                <p className="text-sm font-semibold mb-1 flex items-center">
                  <ChevronDown size={20} className="mr-2 animate-pulse" />
                  Scroll Down!
                </p>
                <p className="text-xs opacity-90">
                  Answer all five questions below
                </p>
              </div>
              <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-purple-600"></div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {explicitQuestions.map((question) => (
            <div key={question.id} className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {question.scenario}
              </h3>
              <div className="grid gap-3">
                {question.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleOptionSelect(question.id, option.value)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                      answers[question.id] === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-xl mr-3">{option.icon}</span>
                      <div>
                        <span className="font-medium text-gray-900">{option.value}</span>
                        <p className="text-sm text-gray-600 mt-1">{option.label}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-8 mt-8">
          <div className="bg-white bg-opacity-90 backdrop-blur supports-[backdrop-filter]:bg-opacity-50 border rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {Object.keys(answers).length} of {explicitQuestions.length} questions answered
              </div>
              <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== explicitQuestions.length || isSubmitting}
                className={`flex items-center px-6 py-2 rounded-md text-white font-medium transition-colors duration-200 ${
                  Object.keys(answers).length === explicitQuestions.length && !isSubmitting
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Submit Answers & Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExplicitValuesPage;