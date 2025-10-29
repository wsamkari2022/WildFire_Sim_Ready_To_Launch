export interface ExplicitQuestion {
  id: number;
  scenario: string;
  options: {
    value: string;
    label: string;
    icon: string;
  }[];
}

export interface ExplicitValue {
  question_id: number;
  value_selected: string;
  timestamp: string;
}

export type ExplicitUserValues = ExplicitValue[];