export type DeepValue = {
  name: string;
  type: 'Stable' | 'Context-Dependent';
  matchPercentage?: string; // Add match percentage
};

export type PreferenceScenario = {
  id: string;
  title: string;
  scenario: string;
  options: {
    text: string;
    value: string;
  }[];
  followUpQuestions: {
    [key: string]: {
      question: string;
      valueIfYes: DeepValue;
      valueIfNo: DeepValue[];
    };
  };
};

export type UserResponse = {
  scenarioId: string;
  selectedOption: string;
  followUpAnswer: boolean | null;
  deepValues: DeepValue[];
};