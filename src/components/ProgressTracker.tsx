import React from 'react';

interface ProgressStep {
  id: string;
  label: string;
  isLarger?: boolean;
}

interface ProgressTrackerProps {
  currentStep: number;
  steps: ProgressStep[];
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ currentStep, steps }) => {
  const deepValuesStartIndex = 1;
  const deepValuesEndIndex = 5;
  const totalSteps = steps.length;

  const deepValuesStartPercent = (deepValuesStartIndex / (totalSteps - 1)) * 100;
  const deepValuesEndPercent = (deepValuesEndIndex / (totalSteps - 1)) * 100;
  const deepValuesWidth = deepValuesEndPercent - deepValuesStartPercent;

  return (
    <div className="w-full bg-gradient-to-r from-blue-50 to-green-50 py-6 mb-6">
      <div className="max-w-5xl mx-auto px-4">
        <div className="relative flex items-center justify-between">
          <div
            className="absolute rounded-3xl border-2 border-amber-300 bg-amber-50/30 backdrop-blur-sm shadow-lg"
            style={{
              left: `calc(${deepValuesStartPercent}% - 2%)`,
              width: `calc(${deepValuesWidth}% + 4%)`,
              top: '-20px',
              bottom: '-10px',
              zIndex: 0
            }}
          >
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-100 border-2 border-amber-300 px-4 py-1 rounded-full shadow-md">
              <span className="text-xs font-bold text-amber-800 tracking-wide">Implicit Values</span>
            </div>
          </div>

          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isUpcoming = index > currentStep;
            const isLastStep = step.isLarger;

            const nodeSize = isLastStep ? 'w-14 h-14' : 'w-10 h-10';
            const labelSize = isLastStep ? 'text-sm font-bold' : 'text-xs';

            return (
              <div key={step.id} className="relative flex flex-col items-center" style={{ flex: 1 }}>
                {index > 0 && (
                  <div
                    className={`absolute top-5 right-1/2 h-0.5 transition-all duration-500 ${
                      isCompleted || (index === currentStep && index > 0)
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                    style={{
                      width: '100%',
                      transform: 'translateY(-50%)'
                    }}
                  />
                )}

                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`${nodeSize} rounded-full border-4 transition-all duration-500 flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 shadow-lg shadow-green-300/50'
                        : isCurrent
                        ? 'bg-white border-blue-500 shadow-lg shadow-blue-300/50 animate-pulse'
                        : 'bg-white border-gray-300 shadow-md'
                    }`}
                  >
                    {isCompleted && (
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    {isCurrent && (
                      <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse"></div>
                    )}
                    {isUpcoming && (
                      <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    )}
                  </div>

                  <div
                    className={`mt-3 ${labelSize} text-center font-medium transition-all duration-500 ${
                      isCompleted
                        ? 'text-green-700'
                        : isCurrent
                        ? 'text-blue-700'
                        : 'text-gray-500'
                    }`}
                    style={{
                      minWidth: '60px',
                      maxWidth: isLastStep ? '80px' : '70px'
                    }}
                  >
                    {step.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
