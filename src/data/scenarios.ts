import { Scenario } from '../types';

export const scenarios: Scenario[] = [
  {
    id: 1,
    title: "Wildfire Approaching a Town",
    description: "A wildfire is rapidly approaching a town with 2,000 residents. You must decide how to respond while balancing firefighter safety and civilian protection.",
    options: [
      {
        id: "send-firefighters",
        title: "Deploy Firefighters Immediately 🚒",
        description: "Firefighters engage immediately, saving 300 people before the fire spreads further.",
        impact: {
          livesSaved: 300,
          humanCasualties: 3,
          firefightingResource: -30,
          infrastructureCondition: -10,
          biodiversityCondition: -15,
          propertiesCondition: -10,
          nuclearPowerStation: 0,
        },
        riskInfo: [
          "Firefighter Fatality Risk: 85% for 3 firefighters → 3 firefighters die",
          "Firefighter resources decrease by 30% (due to lost personnel)",
          "Lives Saved: +300",
          "Human Casualties: +3 (Firefighters lost)",
          "Minimal infrastructure damage (-10%)"
        ],
        expertOpinions: {
          safety: {
            summary: "Deploying firefighters puts them in immediate danger, with an 85% fatality probability resulting in 3 firefighter deaths, but prevents wider fire spread.",
            recommendation: "Reject",
            comparison: "Compared to waiting for air support, this option has fewer civilian casualties (0 vs 100) but guarantees firefighter deaths (3). From a safety perspective, the total casualty count is lower (3 vs 100)."
          },
          efficiency: {
            summary: "Immediate deployment is resource-intensive and puts personnel at high risk, reducing future response capability by 30% due to lost firefighters.",
            recommendation: "Reject",
            comparison: "Compared to air support, this option uses 30% more resources and loses trained personnel. Air support preserves 95% of resources but allows more property damage."
          },
          sustainability: {
            summary: "Early intervention prevents widespread environmental damage, with only 15% biodiversity loss compared to 50% with delayed response.",
            recommendation: "Accept",
            comparison: "This option results in 35% less biodiversity loss than waiting for air support (15% vs 50%), making it significantly better for long-term ecosystem recovery."
          },
          fairness: {
            summary: "This approach prioritizes immediate civilian protection over firefighter safety, raising ethical questions about sacrificing 3 firefighters to save 300 civilians.",
            recommendation: "Accept",
            comparison: "While both options involve casualties, this approach distributes risk to trained professionals who accepted this risk as part of their job, rather than civilians who have no choice."
          },
          nonmaleficence: {
            summary: "Risking firefighter lives results in 3 casualties and compromises future emergency responses due to loss of trained personnel.",
            recommendation: "Reject",
            comparison: "This option causes less total harm (3 deaths vs 100), but the loss of trained firefighters may impact future emergency response capabilities, potentially causing more harm long-term."
          }
        },
        radarData: {
          fireContainment: 85,
          firefighterRisk: 70,
          resourceUse: 60,
          infrastructureDamage: 20,
          biodiversityImpact: 30,
          ethicalFairness: 65
        }
      },
      {
        id: "wait-air-support",
        title: "Wait for Air Support ✈️",
        description: "Air tankers arrive after a delay, successfully saving 1,900 people. However, the fire spreads in the meantime.",
        impact: {
          livesSaved: 1900,
          humanCasualties: 100,
          firefightingResource: -5,
          infrastructureCondition: -40,
          biodiversityCondition: -50,
          propertiesCondition: -45,
          nuclearPowerStation: 0,
        },
        riskInfo: [
          "The fire spreads, causing severe infrastructure damage (-40%)",
          "Biodiversity and ecosystems suffer significant loss (-50%)",
          "No firefighter casualties",
          "Human Casualties: +100 (residents lost due to delayed action)",
          "Lives Saved: +1,900"
        ],
        expertOpinions: {
          safety: {
            summary: "Waiting for air support reduces risk to firefighters but allows the fire to spread further, resulting in 100 civilian casualties despite saving 1,900 people overall.",
            recommendation: "Accept",
            comparison: "This option results in higher total casualties (100 vs 3) but protects firefighters completely. From a first responder safety perspective, this is preferable to risking firefighter lives."
          },
          efficiency: {
            summary: "Air support is a more effective use of resources, preserving 95% of firefighting capacity but introducing unavoidable delays that lead to preventable property damage.",
            recommendation: "Accept",
            comparison: "This approach preserves 25% more resources than immediate deployment (95% vs 70% remaining), allowing for better response to future incidents, despite causing more immediate property damage."
          },
          sustainability: {
            summary: "Delayed response allows the fire to cause extensive environmental damage (-50% biodiversity), though firefighting resources are preserved.",
            recommendation: "Reject",
            comparison: "This option causes 35% more biodiversity loss than immediate firefighter deployment (50% vs 15%), resulting in significantly worse long-term environmental outcomes."
          },
          fairness: {
            summary: "This approach prioritizes firefighter safety over immediate civilian protection, raising ethical questions about sacrificing 100 civilians to protect firefighters.",
            recommendation: "Reject",
            comparison: "While saving more lives overall (1,900 vs 300), this option places the burden of risk entirely on civilians who have no choice, rather than on firefighters who accepted risk as part of their profession."
          },
          nonmaleficence: {
            summary: "While protecting firefighters, the delay results in 100 civilian deaths and greater overall damage to the community and environment.",
            recommendation: "Reject",
            comparison: "This option causes more total harm (100 deaths vs 3) and significantly more environmental and property damage, violating the principle of minimizing harm to the greatest extent possible."
          }
        },
        radarData: {
          fireContainment: 50,
          firefighterRisk: 10,
          resourceUse: 30,
          infrastructureDamage: 80,
          biodiversityImpact: 60,
          ethicalFairness: 40
        }
      }
    ],
    alternativeOptions: [
      {
        id: "combined-approach",
        title: "Combined Ground-Air Operation 🚁",
        isAlternative: true,
        description: "Coordinate a limited ground team with immediate air support, maximizing both immediate response and resource preservation.",
        impact: {
          livesSaved: 1500,
          humanCasualties: 1,
          firefightingResource: -15,
          infrastructureCondition: -20,
          biodiversityCondition: -25,
          propertiesCondition: -20,
          nuclearPowerStation: 0,
        },
        riskInfo: [
          "Limited ground team deployment with 1 firefighter casualty",
          "Moderate resource consumption (-15%)",
          "Lives Saved: +1,500",
          "Balanced damage to infrastructure and environment",
          "Improved coordination between ground and air units"
        ],
        expertOpinions: {
          safety: {
            summary: "This balanced approach reduces both civilian and firefighter casualties while maintaining effective fire control.",
            recommendation: "Accept",
            comparison: "Achieves better overall safety outcomes than either extreme option, with only 1 firefighter casualty and higher civilian survival rates."
          },
          efficiency: {
            summary: "Optimal resource utilization through coordinated ground-air operations maximizes impact while minimizing losses.",
            recommendation: "Accept",
            comparison: "More efficient than either pure ground or air operations, achieving better results with moderate resource consumption."
          },
          sustainability: {
            summary: "Moderate environmental impact balanced against effective fire control and resource preservation.",
            recommendation: "Accept",
            comparison: "Environmental damage is significantly less than waiting for air support while achieving better containment than ground-only approach."
          },
          fairness: {
            summary: "Balanced distribution of risk between firefighters and civilians, with improved outcomes for both groups.",
            recommendation: "Accept",
            comparison: "Most equitable distribution of risk and benefits among all stakeholders compared to other options."
          },
          nonmaleficence: {
            summary: "Minimizes overall harm while maintaining effective response capabilities.",
            recommendation: "Accept",
            comparison: "Achieves the best balance of minimizing immediate casualties while preserving long-term response capabilities."
          }
        },
        radarData: {
          fireContainment: 75,
          firefighterRisk: 40,
          resourceUse: 45,
          infrastructureDamage: 40,
          biodiversityImpact: 45,
          ethicalFairness: 80
        }
      },
      {
        id: "preventive-evacuation",
        title: "Early Evacuation Protocol 🚗",
        isAlternative: true,
        description: "Implement immediate evacuation before fire arrival, prioritizing civilian safety over property protection.",
        impact: {
          livesSaved: 1950,
          humanCasualties: 0,
          firefightingResource: -10,
          infrastructureCondition: -60,
          biodiversityCondition: -70,
          propertiesCondition: -65,
          nuclearPowerStation: 0,
        },
        riskInfo: [
          "No human casualties",
          "Maximum civilian evacuation success",
          "Severe property and environmental damage",
          "Minimal resource consumption (-10%)",
          "Complete focus on evacuation logistics"
        ],
        expertOpinions: {
          safety: {
            summary: "Maximizes human safety by prioritizing evacuation over fire containment.",
            recommendation: "Accept",
            comparison: "Achieves the best human safety outcomes with zero casualties, though at the cost of increased property and environmental damage."
          },
          efficiency: {
            summary: "Low resource consumption but high property damage makes this efficient for life preservation but costly in terms of infrastructure.",
            recommendation: "Accept",
            comparison: "Most efficient for preserving human life and firefighting resources, though with higher property damage costs."
          },
          sustainability: {
            summary: "Significant environmental damage due to uncontrolled fire spread during evacuation.",
            recommendation: "Reject",
            comparison: "Worst environmental outcomes among all options, though with perfect human safety record."
          },
          fairness: {
            summary: "Equitable protection of human life but at significant cost to property owners and environment.",
            recommendation: "Accept",
            comparison: "Most equitable in terms of human safety but creates uneven distribution of property damage impact."
          },
          nonmaleficence: {
            summary: "Minimizes direct harm to human life but maximizes environmental and property damage.",
            recommendation: "Accept",
            comparison: "Best option for preventing human casualties but worst for environmental and property protection."
          }
        },
        radarData: {
          fireContainment: 20,
          firefighterRisk: 5,
          resourceUse: 20,
          infrastructureDamage: 90,
          biodiversityImpact: 85,
          ethicalFairness: 70
        }
      }
    ]
  },
  {
    id: 2,
    title: "Wildfire Threatening Nuclear Power Plant",
    description: "The wildfire has changed direction and is now approaching a nuclear power plant. You must decide whether to prioritize evacuating nearby communities or defending the plant itself.",
    options: [
      {
        id: "evacuate-areas",
        title: "Evacuate Surrounding Areas 🚗",
        description: "Focus resources on evacuating all residents within a 20-mile radius of the plant, potentially saving 15,000 lives.",
        impact: {
          livesSaved: 15000,
          humanCasualties: 0,
          firefightingResource: -15,
          infrastructureCondition: -5,
          biodiversityCondition: -10,
          propertiesCondition: -20,
          nuclearPowerStation: -40,
        },
        riskInfo: [
          "Nuclear plant integrity decreases by 40% due to reduced defense",
          "Potential for radiation leakage if plant is severely damaged",
          "All 15,000 residents in danger zone evacuated safely",
          "Moderate resource consumption (-15%)",
          "Limited property damage outside evacuation zone (-20%)"
        ],
        expertOpinions: {
          safety: {
            summary: "Prioritizing evacuation ensures civilian safety but leaves the nuclear plant vulnerable to fire damage, creating potential for widespread radiation exposure.",
            recommendation: "Accept",
            comparison: "This option guarantees zero immediate casualties compared to the plant defense option which risks 5 firefighter deaths. However, radiation risks from plant damage could affect a much larger population long-term."
          },
          efficiency: {
            summary: "Evacuation is resource-efficient for immediate life-saving but may create greater long-term costs if the nuclear plant is compromised.",
            recommendation: "Reject",
            comparison: "While using 10% fewer resources than plant defense, the potential long-term costs of nuclear contamination far outweigh the immediate resource savings."
          },
          sustainability: {
            summary: "Nuclear plant damage poses severe long-term environmental risks that could render large areas uninhabitable for decades.",
            recommendation: "Reject",
            comparison: "The potential radiation release from a 40% damaged nuclear plant would cause environmental damage orders of magnitude greater than the additional 10% biodiversity loss from the plant defense option."
          },
          fairness: {
            summary: "This approach distributes immediate risk away from current residents but potentially creates greater risk for a much larger population in the future.",
            recommendation: "Reject",
            comparison: "While appearing fair by protecting all current residents equally, this option shifts an enormous burden of risk to future generations who have no say in the decision."
          },
          nonmaleficence: {
            summary: "The potential for catastrophic harm from nuclear radiation exposure violates the principle of 'first, do no harm' on a massive scale.",
            recommendation: "Reject",
            comparison: "The risk of nuclear contamination affecting hundreds of thousands of people over generations represents a far greater harm than the loss of 5 firefighters, despite the tragedy of those deaths."
          }
        },
        radarData: {
          fireContainment: 30,
          firefighterRisk: 20,
          resourceUse: 40,
          infrastructureDamage: 70,
          biodiversityImpact: 80,
          ethicalFairness: 35
        }
      },
      {
        id: "defend-plant",
        title: "Defend the Nuclear Plant 🛡️",
        description: "Concentrate all available resources on protecting the nuclear facility, risking firefighter lives but preventing potential radiation release.",
        impact: {
          livesSaved: 0,
          humanCasualties: 5,
          firefightingResource: -25,
          infrastructureCondition: -15,
          biodiversityCondition: -20,
          propertiesCondition: -30,
          nuclearPowerStation: -5,
        },
        riskInfo: [
          "Firefighter Fatality Risk: 90% for 5 firefighters → 5 firefighters die",
          "Nuclear plant integrity preserved (only 5% damage)",
          "No immediate civilian casualties",
          "Heavy resource consumption (-25%)",
          "Moderate property damage in surrounding areas (-30%)"
        ],
        expertOpinions: {
          safety: {
            summary: "Defending the plant puts firefighters at extreme risk with 5 expected casualties, but prevents potential radiation exposure that could affect thousands.",
            recommendation: "Accept",
            comparison: "This option accepts 5 immediate firefighter deaths to prevent potential radiation exposure that could affect thousands or millions of people over generations."
          },
          efficiency: {
            summary: "Plant defense requires 25% of remaining resources but prevents incalculable long-term costs associated with nuclear contamination.",
            recommendation: "Accept",
            comparison: "Despite using 10% more resources than evacuation, this option prevents the astronomical economic and social costs of nuclear contamination, making it far more efficient overall."
          },
          sustainability: {
            summary: "Preventing nuclear contamination is essential for long-term environmental sustainability, despite immediate biodiversity losses from the fire.",
            recommendation: "Accept",
            comparison: "The 20% biodiversity loss from this option is significantly preferable to the multi-generational environmental catastrophe that would result from nuclear contamination."
          },
          fairness: {
            summary: "This approach places extreme risk on a small number of firefighters to protect a much larger population from future harm.",
            recommendation: "Accept",
            comparison: "While placing a heavy burden on firefighters who have chosen this profession, this option distributes the benefits (prevention of radiation exposure) equally across current and future generations."
          },
          nonmaleficence: {
            summary: "The sacrifice of 5 firefighters, while tragic, prevents potential harm to hundreds of thousands through radiation exposure.",
            recommendation: "Accept",
            comparison: "From a utilitarian perspective, the harm of 5 deaths is vastly outweighed by preventing radiation exposure that could cause cancer and genetic damage across generations."
          }
        },
        radarData: {
          fireContainment: 75,
          firefighterRisk: 90,
          resourceUse: 70,
          infrastructureDamage: 30,
          biodiversityImpact: 40,
          ethicalFairness: 60
        }
      }
    ],
    alternativeOptions: [
      {
        id: "phased-response",
        title: "Phased Defense-Evacuation 🔄",
        isAlternative: true,
        description: "Implement a coordinated defense of the plant while conducting systematic evacuation in phases, maximizing both safety and protection.",
        impact: {
          livesSaved: 14000,
          humanCasualties: 2,
          firefightingResource: -20,
          infrastructureCondition: -10,
          biodiversityCondition: -15,
          propertiesCondition: -25,
          nuclearPowerStation: -15,
        },
        riskInfo: [
          "Balanced approach with moderate nuclear plant damage (-15%)",
          "Most residents evacuated successfully (14,000 saved)",
          "Limited firefighter casualties (2)",
          "Efficient resource utilization (-20%)",
          "Controlled property and environmental damage"
        ],
        expertOpinions: {
          safety: {
            summary: "Achieves high civilian evacuation success while maintaining reasonable nuclear plant safety with minimal firefighter casualties.",
            recommendation: "Accept",
            comparison: "Better overall safety outcomes than either extreme option, balancing immediate and long-term risks effectively."
          },
          efficiency: {
            summary: "Optimal resource allocation between evacuation and plant defense maximizes overall effectiveness.",
            recommendation: "Accept",
            comparison: "Most efficient use of resources, achieving near-optimal outcomes in both evacuation and plant protection."
          },
          sustainability: {
            summary: "Moderate environmental impact with significantly reduced risk of nuclear contamination.",
            recommendation: "Accept",
            comparison: "Best balance of immediate environmental impact versus long-term radiation risk."
          },
          fairness: {
            summary: "Equitable distribution of risk and protection across all stakeholder groups.",
            recommendation: "Accept",
            comparison: "Most balanced approach to protecting current and future generations while respecting firefighter choice."
          },
          nonmaleficence: {
            summary: "Minimizes overall harm across all dimensions while maintaining effective response.",
            recommendation: "Accept",
            comparison: "Achieves the best balance of preventing immediate casualties and long-term radiation risks."
          }
        },
        radarData: {
          fireContainment: 65,
          firefighterRisk: 45,
          resourceUse: 55,
          infrastructureDamage: 35,
          biodiversityImpact: 30,
          ethicalFairness: 85
        }
      },
      {
        id: "automated-defense",
        title: "Automated Defense Systems 🤖",
        isAlternative: true,
        description: "Deploy automated firefighting systems and drones to protect the plant while conducting full evacuation.",
        impact: {
          livesSaved: 15000,
          humanCasualties: 0,
          firefightingResource: -40,
          infrastructureCondition: -20,
          biodiversityCondition: -25,
          propertiesCondition: -35,
          nuclearPowerStation: -20,
        },
        riskInfo: [
          "Zero human casualties",
          "High resource consumption (-40%) for automated systems",
          "Moderate nuclear plant damage (-20%)",
          "Complete evacuation success",
          "Technology-dependent approach with potential system failures"
        ],
        expertOpinions: {
          safety: {
            summary: "Eliminates human risk while providing moderate plant protection through technology.",
            recommendation: "Accept",
            comparison: "Best human safety outcomes among all options, though with higher resource costs and moderate plant risk."
          },
          efficiency: {
            summary: "High initial resource cost but eliminates human risk and achieves good overall protection.",
            recommendation: "Accept",
            comparison: "Most expensive option in terms of resources but achieves optimal human safety outcomes."
          },
          sustainability: {
            summary: "Moderate environmental impact with reasonable nuclear safety measures.",
            recommendation: "Accept",
            comparison: "Better environmental outcomes than evacuation-only approach with improved nuclear safety."
          },
          fairness: {
            summary: "Equitable protection of all human life while maintaining reasonable plant safety.",
            recommendation: "Accept",
            comparison: "Most equitable in terms of risk distribution, though at higher resource cost."
          },
          nonmaleficence: {
            summary: "Minimizes direct harm to humans while providing adequate plant protection.",
            recommendation: "Accept",
            comparison: "Best option for preventing human casualties while maintaining acceptable plant safety."
          }
        },
        radarData: {
          fireContainment: 60,
          firefighterRisk: 5,
          resourceUse: 85,
          infrastructureDamage: 40,
          biodiversityImpact: 45,
          ethicalFairness: 90
        }
      }
    ]
  }
];