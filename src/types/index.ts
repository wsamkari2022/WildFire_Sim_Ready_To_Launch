export interface SimulationMetrics {
  livesSaved: number;
  humanCasualties: number;
  firefightingResource: number;
  infrastructureCondition: number;
  biodiversityCondition: number;
  propertiesCondition: number;
  nuclearPowerStation: number;
}

export interface ExpertOpinion {
  summary: string;
  recommendation: "Accept" | "Reject";
  comparison: string;
}

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  isAlternative?: boolean;
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
    firefighterRisk: number;
    resourceUse: number;
    infrastructureDamage: number;
    biodiversityImpact: number;
    ethicalFairness: number;
  };
}

export interface Scenario {
  id: number;
  title: string;
  description: string;
  options: DecisionOption[];
  alternativeOptions?: DecisionOption[];
}