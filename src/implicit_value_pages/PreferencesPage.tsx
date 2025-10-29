import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { scenarios } from '../data/ImplicitScenarios';
import type { UserResponse, DeepValue } from '../types/implicitPrefernce';
import ProgressTracker from '../components/ProgressTracker';

const PreferencesPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  useEffect(() => {
    // Clear previous responses when component mounts
    localStorage.removeItem('userResponses');
    setResponses([]);
    setCurrentScenarioIndex(0);
  }, []);

  useEffect(() => {
    if (shouldNavigate) {
      navigate('/completion');
    }
  }, [shouldNavigate, navigate]);

  const currentScenario = scenarios[currentScenarioIndex];

  const handleOptionSelect = (value: string) => {
    const newResponse: UserResponse = {
      scenarioId: currentScenario.id,
      selectedOption: value,
      followUpAnswer: null,
      deepValues: []
    };

    setResponses(prev => {
      const updated = [...prev];
      updated[currentScenarioIndex] = newResponse;
      localStorage.setItem('userResponses', JSON.stringify(updated));
      return updated;
    });
  };

  const handleFollowUpAnswer = (answer: boolean) => {
    setResponses(prev => {
      const updated = [...prev];
      const current = updated[currentScenarioIndex] = {
        ...updated[currentScenarioIndex],
        followUpAnswer: answer
      };

      const followUp = currentScenario.followUpQuestions[current.selectedOption];

      // If answer is No, make both values context-dependent
      if (!answer) {
        current.deepValues = [
          { name: followUp.valueIfNo[0].name, type: 'Context-Dependent' },
          { name: followUp.valueIfNo[1].name, type: 'Context-Dependent' }
        ];
      } else {
        current.deepValues = [followUp.valueIfYes];
      }

      // If this was the last scenario, collect all deep values and trigger navigation
      if (currentScenarioIndex === scenarios.length - 1) {
        // Include the current scenario's values in the collection
        const allDeepValues = [...updated].flatMap(r => r.deepValues);
        localStorage.setItem('deepValues', JSON.stringify(allDeepValues));
        localStorage.setItem('userResponses', JSON.stringify(updated));
        setShouldNavigate(true);
      } else {
        // Otherwise, move to the next scenario
        localStorage.setItem('userResponses', JSON.stringify(updated));
        setCurrentScenarioIndex(prev => prev + 1);
      }

      return updated;
    });
  };

  const getCurrentResponse = () => responses[currentScenarioIndex];

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
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Preference Selection & Implicit Value Revealing
            </h1>
          </div>
        </div>
      </header>

      <ProgressTracker currentStep={1 + currentScenarioIndex} steps={progressSteps} />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {currentScenario && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">{currentScenario.title}</h2>
              <p className="text-gray-600 mb-6">{currentScenario.scenario}</p>

              {/* MCQ Options */}
              {(!getCurrentResponse() || getCurrentResponse()?.followUpAnswer === null) && (
                <div className="space-y-4">
                  {currentScenario.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleOptionSelect(option.value)}
                      className={`w-full p-4 text-left rounded-lg border transition-all duration-200 ${getCurrentResponse()?.selectedOption === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              )}

              {/* Follow-up Question */}
              {getCurrentResponse()?.selectedOption && getCurrentResponse()?.followUpAnswer === null && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold mb-4">
                    {currentScenario.followUpQuestions[getCurrentResponse().selectedOption].question}
                  </h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleFollowUpAnswer(true)}
                      className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleFollowUpAnswer(false)}
                      className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      No
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PreferencesPage;