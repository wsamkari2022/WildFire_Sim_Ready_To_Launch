import { SimulationMetrics } from './metrics';

export interface ExpertOpinion {
  summary: string;
  recommendation: "Accept" | "Reject";
  comparison: string;
  confidence: string;
}

export interface CVRQuestion {
  descriptionTile: string;
  description: string;
  question: string;
  value: string;
}

export interface ComparisonTableColumnContent {
  firstColumnTitle: string;
  firstColumnSelectedPreference: string;
  firstValue: string;
  firstColumnAffected: number;
  firstColumnRisk: string;
  firstColumnuserChoice: string;
  secondColumnTitle: string;
  secondColumnSelectedPreference: string;
  secondValue: string;
  secondColumnaffected: number;
  secondColumnRisk: string;
  secondColumnuserChoice: string;
}

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  isAlternative?: boolean;
  label: string;
  impact: {
    livesSaved: number;
    humanCasualties: number;
    firefightingResource: number;
    infrastructureCondition: number;
    biodiversityCondition: number;
    propertiesCondition: number;
    nuclearPowerStation: number;
  };
  riskInfo: string[];
  expertOpinions: {
    safety: ExpertOpinion;
    efficiency: ExpertOpinion;
    sustainability: ExpertOpinion;
    fairness: ExpertOpinion;
    nonmaleficence: ExpertOpinion;
  };
  radarData?: {
    fireContainment: number;
    ethicalFairness: number;
    populationSafety: number;
    firefighterRisk: number;
    resourceUse: number;
    infrastructureDamage: number;
    biodiversityImpact: number;
  };
  cvrQuestion?: CVRQuestion;
  comparisonTableColumnContent?: ComparisonTableColumnContent;
}

export interface MainScenario {
  id: number;
  title: string;
  domain: string;
  affected: number;
  risk: string;
  description: string;
  options: DecisionOption[];
  alternativeOptions?: DecisionOption[];
}

export interface Scenario extends MainScenario {}