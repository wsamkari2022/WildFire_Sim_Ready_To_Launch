export interface TelemetryEvent {
  event: 'scenario_started' | 'option_selected' | 'option_confirmed' | 'cvr_opened' | 'cvr_answered' | 'apa_reordered' | 'alternatives_explored' | 'alignment_state_changed' | 'scenario_completed' | 'feedback_submitted';
  timestamp: string;
  scenarioId?: number;
  optionId?: string;
  optionLabel?: string;
  alignedBefore?: boolean;
  alignedAfter?: boolean;
  timeSinceScenarioOpen?: number;
  objectivesSnapshot?: any;
  data?: any;
  finalMetrics?: any;
  valuesBefore?: string[];
  valuesAfter?: string[];
  cvrAnswer?: boolean;
  preferenceType?: 'metrics' | 'values';
  question?: string;
  flagsAtConfirmation?: {
    hasReorderedValues: boolean;
    cvrYesClicked: boolean;
    cvrNoClicked: boolean;
    simulationMetricsReorderingFlag: boolean;
    moralValuesReorderingFlag: boolean;
  };
  finalTopTwoValuesBeforeUpdate?: string[];
}

export interface ScenarioTracking {
  scenarioId: number;
  startTime: number;
  endTime?: number;
  optionSelections: Array<{
    optionId: string;
    optionLabel: string;
    timestamp: number;
    aligned: boolean;
  }>;
  finalChoice?: {
    optionId: string;
    optionLabel: string;
    aligned: boolean;
  };
  cvrVisited: boolean;
  cvrVisitCount: number;
  cvrYesAnswers: number;
  cvrNoAnswers: number;
  apaReordered: boolean;
  apaReorderCount: number;
  alternativesExplored: boolean;
  alternativesExploredCount: number;
  switchCount: number;
}

export interface SessionDVs {
  cvrArrivals: number;
  cvrYesCount: number;
  cvrNoCount: number;
  apaReorderings: number;
  misalignAfterCvrApaCount: number;
  realignAfterCvrApaCount: number;
  switchCountTotal: number;
  avgDecisionTime: number;
  decisionTimes: number[];
  valueConsistencyIndex: number;
  performanceComposite: number;
  balanceIndex: number;
  finalAlignmentByScenario: boolean[];
  valueOrderTrajectories: Array<{scenarioId: number, values: string[], preferenceType: string}>;
  scenarioDetails: Array<{
    scenarioId: number;
    finalChoice: string;
    aligned: boolean;
    switches: number;
    timeSeconds: number;
    cvrVisited: boolean;
    cvrVisitCount: number;
    cvrYesAnswers: number;
    apaReordered: boolean;
    apaReorderCount: number;
  }>;
  scenariosFinalDecisionLabels?: string[];
  checkingAlignmentList?: string[];
  decisionSatisfaction?: number;
  processSatisfaction?: number;
  perceivedTransparency?: number;
  notesFreeText?: string;
}
