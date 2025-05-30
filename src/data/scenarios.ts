import { Scenario } from '../types';

export const scenarios: Scenario[] = [
  {
    id: 1,
    title: "Wildfire Approaching a Town",
    description:
      "A wildfire is rapidly approaching a town with 2,000 residents. Critical decisions must be made about resource allocation and evacuation priorities.",
    options: [
      {
        id: "safety-first",
        title: "Prioritize Safety Protocol 🛡️",
        label: "safety",
        description:
          "Deploy all available firefighters immediately to form defensive lines and evacuate population centers. This action will successfully evacuate all residents but exposes firefighters to intense danger, leading to casualties and resource depletion.",
        impact: {
          livesSaved: 2000,
          humanCasualties: 12,
          firefightingResource: -40,
          infrastructureCondition: -30,
          biodiversityCondition: -35,
          propertiesCondition: -25,
          nuclearPowerStation: 0
        },
        riskInfo: [
          "2,000 residents safely evacuated through rapid deployment",
          "12 firefighter casualties due to high exposure in intense zones",
          "Firefighter morale potentially impacted by losses",
          "Heavy short-term resource depletion may affect next emergency",
          "Major fire spread contained near residential areas"
        ],
        expertOpinions: {
          safety: {
            summary:
              "Ensures maximum civilian survival through aggressive intervention. However, the elevated firefighter risk could undermine future morale and readiness.",
            recommendation: "Accept",
            comparison:
              "Highest civilian survival (100%) among all options. Firefighter loss (12 personnel) introduces medium concern.",
            confidence: "High confidence based on historical evacuation efficiency in full-resource deployments."
          },
          efficiency: {
            summary:
              "Resource use is excessive relative to marginal gains over more targeted strategies.",
            recommendation: "Reject",
            comparison:
              "Uses 166% more resources than the efficiency-focused approach for a 42% increase in lives saved.",
            confidence: "Moderate confidence given modeled depletion thresholds and resource burn rates."
          },
          sustainability: {
            summary:
              "Environmental degradation is high due to aggressive fire suppression techniques.",
            recommendation: "Reject",
            comparison:
              "Causes 2.3x more environmental impact than the sustainability-focused approach.",
            confidence: "High confidence from ecological field data on containment burns."
          },
          fairness: {
            summary:
              "Effectively saves everyone, but accessible zones are disproportionately prioritized in execution.",
            recommendation: "Accept",
            comparison:
              "Outperforms all except fairness-focused plan in geographic equity.",
            confidence: "Moderate confidence based on standard evacuation route analysis."
          },
          nonmaleficence: {
            summary:
              "No civilian deaths, but responder harm remains ethically significant.",
            recommendation: "Accept",
            comparison:
              "Second-lowest total harm; only the nonmaleficence-focused strategy performs better.",
            confidence: "High confidence from harm-reduction comparative modeling."
          }
        },
        radarData: {
          fireContainment: 90,
          firefighterRisk: 60,
          resourceUse: 70,
          infrastructureDamage: 30,
          biodiversityImpact: 35,
          ethicalFairness: 75,
          populationSafety: 100
        },
        cvrQuestion: {
            descriptionTile: "🏥 Hospital Explosion Response",
            description: "A chemical explosion at a large city hospital endangers 2,000 people. Emergency responders must act immediately to extract patients and staff, but this exposes the rescue team to severe toxic exposure, resulting in 12 deaths.",
            question: "Would you authorize immediate full deployment of the emergency team, despite the risk of losing 12 responders, to ensure all 2,000 people inside are rescued?",
            value: "Safety"
          },
        comparisonTableColumnContent: {
            firstColumnTitle: "Wildfire Approaching a Town",
            firstColumnSelectedPreference: "Deploy all available firefighters immediately to form defensive lines and evacuate population centers",
            firstValue: "Safety",
            firstColumnAffected: 2000,
            firstColumnRisk: "12 firefighter casualties",
            firstColumnuserChoice: "Accepted",
            secondColumnTitle: "Hospital Explosion Response",
            secondColumnSelectedPreference: "Emergency responders must act immediately to extract patients and staff",
            secondValue: "Safety",
            secondColumnaffected: 2000,
            secondColumnRisk: "12 responder deaths",
            secondColumnuserChoice: "Rejected"
          }
      },
      {
        id: "efficiency-focused",
        title: "Resource Optimization Strategy ⚡",
        label: "efficiency",
        description:
          "Deploy firefighter teams only to the most critical zones, minimizing resource use while attempting to save as many lives as possible. However, limited coverage results in preventable resident deaths and minor firefighter casualties.",
        impact: {
          livesSaved: 1400,
          humanCasualties: 600,
          firefightingResource: -15,
          infrastructureCondition: -40,
          biodiversityCondition: -45,
          propertiesCondition: -35,
          nuclearPowerStation: 0
        },
        riskInfo: [
          "1,400 residents evacuated from high-priority zones",
          "600 casualties from areas not prioritized",
          "Firefighters remained mostly in low-risk sectors",
          "Minimal firefighter exposure and casualties (0)",
          "Resources preserved for future emergencies"
        ],
        expertOpinions: {
          safety: {
            summary:
              "Substantial lives are saved but at the cost of abandoning lower-priority areas.",
            recommendation: "Reject",
            comparison:
              "600 deaths preventable under safety or nonmaleficence strategies.",
            confidence: "Moderate confidence based on demographic prioritization models."
          },
          efficiency: {
            summary:
              "Exceptional performance in lives saved per resource expended.",
            recommendation: "Accept",
            comparison:
              "Best efficiency ratio with 60 lives saved per 1% resource used.",
            confidence: "High confidence from optimization-based simulations."
          },
          sustainability: {
            summary:
              "Resources preserved, but ecological damage left unchecked.",
            recommendation: "Accept",
            comparison:
              "Ecological triage limits short-term loss but sacrifices containment.",
            confidence: "Low confidence due to variable fire behavior in uncontrolled spread."
          },
          fairness: {
            summary:
              "Benefits skewed toward urban centers, ignoring rural zones.",
            recommendation: "Reject",
            comparison:
              "Most inequitable strategy from a geographic fairness perspective.",
            confidence: "Moderate confidence from spatial resource allocation studies."
          },
          nonmaleficence: {
            summary:
              "Large-scale civilian loss undermines core harm-minimization ethics.",
            recommendation: "Reject",
            comparison:
              "600 deaths exceed acceptable ethical thresholds by 400%.",
            confidence: "High confidence from casualty probability projections."
          }
        },
        radarData: {
          fireContainment: 60,
          firefighterRisk: 20,
          resourceUse: 25,
          infrastructureDamage: 40,
          biodiversityImpact: 45,
          ethicalFairness: 45,
          populationSafety: 70
        },
        cvrQuestion: {
            descriptionTile: "🚢 Sinking Cruise Ship Crisis",
            description: "A cruise ship with 2,000 people is sinking. You have limited lifeboats and supplies. By using an optimized strategy, 1,400 passengers can be saved using only 25% of total rescue resources. The remaining 600 will not survive.",
            question: "Would you choose to deploy only the most efficient rescue operations to save 1,400 people while preserving most resources, knowing that 600 lives will be lost?",
            value: "Efficiency"
          },
        comparisonTableColumnContent: {
          firstColumnTitle: "Wildfire Approaching a Town",
          firstColumnSelectedPreference: "Deploy firefighter teams only to the most critical zones",
          firstValue: "Efficiency",
          firstColumnAffected: 2000,
          firstColumnRisk: "600 civilian deaths",
          firstColumnuserChoice: "Accepted",
          secondColumnTitle: "Sinking Cruise Ship Crisis",
          secondColumnSelectedPreference: "Use optimized rescue strategy to save 1,400 passengers with limited lifeboats",
          secondValue: "Efficiency",
          secondColumnaffected: 2000,
          secondColumnRisk: "600 passenger deaths",
          secondColumnuserChoice: "Rejected"
        }
      },
      {
        id: "sustainability-focused",
        title: "Eco-Conscious Containment 🌱",
        label: "sustainability",
        description:
          "Limit intervention to protect natural ecosystems and endangered species. Firefighters engage only in environmentally sensitive zones. Most civilians are left vulnerable, and several firefighters perish in inaccessible terrain.",
        impact: {
          livesSaved: 900,
          humanCasualties: 1100,
          firefightingResource: -25,
          infrastructureCondition: -20,
          biodiversityCondition: -15,
          propertiesCondition: -30,
          nuclearPowerStation: 0
        },
        riskInfo: [
          "900 residents rescued through low-impact paths",
          "1,080 civilian casualties due to delayed evacuation",
          "20 firefighter deaths during defensive ecological operations",
          "Key wildlife corridors preserved and fire-resistant",
          "Natural firebreaks used instead of industrial tools"
        ],
        expertOpinions: {
          safety: {
            summary:
              "Unacceptably high casualty rate despite eco-priorities.",
            recommendation: "Reject",
            comparison:
              "Over 1,000 deaths make this the least protective of human life.",
            confidence: "High confidence from historical fire shelter failures."
          },
          efficiency: {
            summary:
              "Resources used for habitat protection, not for life-saving.",
            recommendation: "Reject",
            comparison:
              "33% fewer lives saved than efficiency plan with 60% more resource usage.",
            confidence: "Moderate confidence based on deployment logs."
          },
          sustainability: {
            summary:
              "Top-tier biodiversity preservation through minimal intrusion.",
            recommendation: "Accept",
            comparison:
              "85% lower impact on ecosystems than any other strategy.",
            confidence: "High confidence from ecological satellite assessments."
          },
          fairness: {
            summary:
              "Equitable if extended to non-human lives, ethically controversial otherwise.",
            recommendation: "Accept",
            comparison:
              "Reframes fairness beyond humanity but lacks population equity.",
            confidence: "Low confidence due to disputed ethical scope."
          },
          nonmaleficence: {
            summary:
              "Sacrifices too many for future benefits—ethically disproportionate.",
            recommendation: "Reject",
            comparison:
              "Highest total harm in the name of ecological restraint.",
            confidence: "High confidence based on life-cycle harm index."
          }
        },
        radarData: {
          fireContainment: 40,
          firefighterRisk: 50,
          resourceUse: 40,
          infrastructureDamage: 20,
          biodiversityImpact: 10,
          ethicalFairness: 55,
          populationSafety: 45
        },
        cvrQuestion: {
            descriptionTile: "🏞️ Dam Collapse Near Wildlife Sanctuary",
            description: "A collapsing dam near a small town of 2,000 residents threatens both human lives and a rare ecosystem. You can act to preserve the wildlife corridors and reduce ecological damage, but this results in 1,100 civilian deaths and 20 rescue worker fatalities.",
            question: "Would you prioritize preserving the endangered ecosystem and wildlife corridors, even if it means losing over half the town's residents and 20 responders?",
            value: "Sustainability"
          },
        comparisonTableColumnContent: {
          firstColumnTitle: "Wildfire Approaching a Town",
          firstColumnSelectedPreference: "Limit intervention to protect natural ecosystems and endangered species",
          firstValue: "Sustainability",
          firstColumnAffected: 2000,
          firstColumnRisk: "1,100 civilian deaths + 20 firefighters",
          firstColumnuserChoice: "Accepted",
          secondColumnTitle: "Dam Collapse Near Wildlife Sanctuary",
          secondColumnSelectedPreference: "Preserve wildlife corridors over immediate full-scale human evacuation",
          secondValue: "Sustainability",
          secondColumnaffected: 2000,
          secondColumnRisk: "1,100 civilian deaths + 20 responders",
          secondColumnuserChoice: "Rejected"
        }
      },
      {
        id: "fairness-focused",
        title: "Equitable Response Protocol ⚖️",
        label: "fairness",
        description:
          "Distribute protection equally across all neighborhoods regardless of socioeconomic or geographic differences. This equitable approach stretches resources thin, leading to moderate civilian and firefighter losses.",
        impact: {
          livesSaved: 1600,
          humanCasualties: 400,
          firefightingResource: -30,
          infrastructureCondition: -35,
          biodiversityCondition: -40,
          propertiesCondition: -30,
          nuclearPowerStation: 0
        },
        riskInfo: [
          "1,600 residents saved through balanced evacuation zones",
          "370 residents and 30 firefighters lost due to delayed response in all areas",
          "No neighborhood prioritized over others",
          "Fire spread difficult to contain due to thin coverage",
          "Moral clarity but logistical challenge"
        ],
        expertOpinions: {
          safety: {
            summary:
              "Saves a large number while ensuring equal effort across areas.",
            recommendation: "Accept",
            comparison:
              "Reasonable harm (400) with high geographic parity.",
            confidence: "Moderate confidence from area-distribution simulations."
          },
          efficiency: {
            summary:
              "Low strategic ROI from wide-spread deployment.",
            recommendation: "Reject",
            comparison:
              "Uses double the resources of efficient strategy with 14% more lives saved.",
            confidence: "High confidence based on resource-per-zone stats."
          },
          sustainability: {
            summary:
              "Moderate ecosystem protection at cost of uniformity.",
            recommendation: "Reject",
            comparison:
              "Less targeted response leads to higher net environmental loss.",
            confidence: "Moderate confidence due to fragmented zone support."
          },
          fairness: {
            summary:
              "Most ethically aligned with equal protection principles.",
            recommendation: "Accept",
            comparison:
              "Only option achieving full demographic impartiality.",
            confidence: "High confidence from population-based equity modeling."
          },
          nonmaleficence: {
            summary:
              "Moderate harm, ethically balanced, but preventable losses remain.",
            recommendation: "Accept",
            comparison:
              "Middle-of-the-road in harm scores, favors equity over efficiency.",
            confidence: "Moderate confidence based on weighted harm index."
          }
        },
        radarData: {
          fireContainment: 65,
          firefighterRisk: 55,
          resourceUse: 50,
          infrastructureDamage: 35,
          biodiversityImpact: 40,
          ethicalFairness: 90,
          populationSafety: 80
        },
        cvrQuestion: {
            descriptionTile: "🚨 Earthquake Across Divided Districts",
            description: "A 2,000-person metro region struck by an earthquake includes both wealthy and underserved districts. You can evenly divide rescue teams across all neighborhoods, saving 1,600 people but resulting in 400 deaths, including 30 rescuers.",
            question: "Would you equally distribute emergency aid across all districts, regardless of population density or risk, knowing this causes 400 deaths including responders due to slower response in all zones?",
            value: "Fairness"
          },
        comparisonTableColumnContent: {
          firstColumnTitle: "Wildfire Approaching a Town",
          firstColumnSelectedPreference: "Distribute protection equally across all neighborhoods",
          firstValue: "Fairness",
          firstColumnAffected: 2000,
          firstColumnRisk: "400 deaths including 30 firefighters",
          firstColumnuserChoice: "Accepted",
          secondColumnTitle: "Earthquake Across Divided Districts",
          secondColumnSelectedPreference: "Evenly divide rescue teams across all districts",
          secondValue: "Fairness",
          secondColumnaffected: 2000,
          secondColumnRisk: "400 deaths including 30 rescuers",
          secondColumnuserChoice: "Rejected"
        }
      },
      {
        id: "nonmaleficence-focused",
        title: "Harm Minimization Approach 🤲",
        label: "nonmaleficence",
        description:
          "Use every available strategy to minimize total harm—both human and ecological—by shielding vulnerable communities, preempting infrastructure collapse, and preserving firefighter life. All civilians are rescued, but some firefighter lives are lost in the process.",
        impact: {
          livesSaved: 2000,
          humanCasualties: 8,
          firefightingResource: -20,
          infrastructureCondition: -45,
          biodiversityCondition: -30,
          propertiesCondition: -40,
          nuclearPowerStation: 0
        },
        riskInfo: [
          "All 2,000 residents rescued using layered evacuation strategies",
          "8 firefighter deaths during containment in hazardous areas",
          "Focus on protecting both people and natural resources",
          "Infrastructure takes significant damage as a trade-off",
          "Lowest possible total harm achieved across all groups"
        ],
        expertOpinions: {
          safety: {
            summary:
              "Superior civilian protection, slight responder risk.",
            recommendation: "Accept",
            comparison:
              "Most balanced plan with 99.6% human survival.",
            confidence: "High confidence from full-protection model consensus."
          },
          efficiency: {
            summary:
              "High cost but justified by extraordinary outcomes.",
            recommendation: "Reject",
            comparison:
              "Uses 80% more resources than the efficient option for 43% more lives saved.",
            confidence: "Moderate confidence based on proportional expenditure models."
          },
          sustainability: {
            summary:
              "Moderate impact, carefully managed.",
            recommendation: "Reject",
            comparison:
              "Ecological footprint 2x higher than sustainability option.",
            confidence: "High confidence from scenario-based restoration data."
          },
          fairness: {
            summary:
              "Vulnerable groups prioritized ethically, but geographic balance is imperfect.",
            recommendation: "Accept",
            comparison:
              "Not equal, but ethically coherent with moral urgency framework.",
            confidence: "Moderate confidence based on tiered-vulnerability approach."
          },
          nonmaleficence: {
            summary:
              "Lowest overall harm—both to humans and environment.",
            recommendation: "Accept",
            comparison:
              "Most ethically consistent outcome across all domains.",
            confidence: "High confidence based on integrated harm-weighted scoring."
          }
        },
        radarData: {
          fireContainment: 80,
          firefighterRisk: 40,
          resourceUse: 45,
          infrastructureDamage: 45,
          biodiversityImpact: 30,
          ethicalFairness: 80,
          populationSafety: 100
        },
        cvrQuestion: {
          descriptionTile: "🧪 Bioterror Attack on University Campus",
          description: "A bioterror attack releases a gas on a campus with 2,000 people. You can launch a comprehensive evacuation and shielding operation that saves everyone but results in 8 first responder deaths and serious infrastructure damage.",
          question: "Would you initiate the operation that ensures zero civilian deaths while accepting the loss of 8 responders and severe infrastructure destruction as a trade-off?",
          value: "Nonmaleficence"
        },
        comparisonTableColumnContent: {
          firstColumnTitle: "Wildfire Approaching a Town",
          firstColumnSelectedPreference: "Use every available strategy to minimize total harm",
          firstValue: "Nonmaleficence",
          firstColumnAffected: 2000,
          firstColumnRisk: "8 firefighter deaths",
          firstColumnuserChoice: "Accepted",
          secondColumnTitle: "Bioterror Attack on University Campus",
          secondColumnSelectedPreference: "Comprehensive shielding and evacuation strategy to save everyone",
          secondValue: "Nonmaleficence",
          secondColumnaffected: 2000,
          secondColumnRisk: "8 responder deaths + infrastructure damage",
          secondColumnuserChoice: "Rejected"
        }
      }
    ]
  }
];