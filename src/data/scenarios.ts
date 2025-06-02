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
  },
  {
    id: 2,
    title: 'Nuclear Facility Under Threat',
    description:
      'A wildfire is spreading rapidly toward a nuclear power plant located near a residential area. If the facility is breached, the resulting radioactive fallout could endanger hundreds of thousands. You must prioritize decisions that balance local evacuation, plant protection, and firefighter safety.',
    options: [
      {
        id: 'nuclear-safety-priority',
        title: 'Shield the Reactor at All Costs ☢️',
        label: 'safety',
        description:
          'Deploy all firefighting forces to fortify the nuclear facility perimeter. This prevents catastrophic radiation release but leaves most of the population unprotected, leading to severe civilian casualties.',
        impact: {
          livesSaved: 400,
          humanCasualties: 1600,
          firefightingResource: -50,
          infrastructureCondition: -30,
          biodiversityCondition: -35,
          propertiesCondition: -25,
          nuclearPowerStation: -5
        },
        riskInfo: [
          'Reactor secured and meltdown prevented',
          '1,600 residents perish due to lack of evacuation resources',
          'Firefighters suffer minimal casualties',
          'Long-term regional fallout avoided',
          'Severe public backlash and ethical scrutiny'
        ],
        comparisonTableColumnContent: {
          firstColumnTitle: 'Nuclear Facility Under Threat',
          firstColumnSelectedPreference: 'Shield the Reactor at All Costs',
          firstValue: 'Safety',
          firstColumnAffected: 2000,
          firstColumnRisk: '1600 residents dead, minor firefighter casualties',
          firstColumnuserChoice: 'Accepted',
          secondColumnTitle: 'Critical Infrastructure Dilemma',
          secondColumnSelectedPreference: 'Protect the chemical weapons base, sacrificing residential evacuation',
          secondValue: 'Safety',
          secondColumnaffected: 2000,
          secondColumnRisk: '1600 residents lost, strategic military site preserved',
          secondColumnuserChoice: 'Rejected'
        },
        expertOpinions: {
          safety: {
            summary: 'Eliminates the highest-risk global hazard, but sacrifices local population safety.',
            recommendation: 'Accept',
            comparison: 'Best long-term safety outcome, worst immediate human cost.',
            confidence: 'High confidence based on reactor shielding precedent (≈ 85%–100%)'
          },
          efficiency: {
            summary: 'Heavy resource usage on a single target with poor civilian ROI.',
            recommendation: 'Reject',
            comparison: 'Most resource-intensive with lowest lives saved per unit.',
            confidence: 'Moderate confidence from facility defense efficiency models (≈ 65%–80%)'
          },
          sustainability: {
            summary: 'Protects reactor but ignores biodiversity corridors and burns vast land.',
            recommendation: 'Reject',
            comparison: 'Third worst outcome in biodiversity loss.',
            confidence: 'High confidence from environmental spread simulations (≈ 85%–100%)'
          },
          fairness: {
            summary: 'Neglects vulnerable residential areas in favor of infrastructure.',
            recommendation: 'Reject',
            comparison: 'Fails basic equity standards.',
            confidence: 'High confidence from response ethics research (≈ 85%–100%)'
          },
          nonmaleficence: {
            summary: 'Avoids global harm but causes extreme localized suffering.',
            recommendation: 'Reject',
            comparison: 'Most ethically controversial trade-off.',
            confidence: 'Moderate confidence from trade-off harm matrix (≈ 65%–80%)'
          }
        },
        radarData: {
          fireContainment: 80,
          firefighterRisk: 15,
          resourceUse: 85,
          infrastructureDamage: 30,
          biodiversityImpact: 60,
          ethicalFairness: 25,
          populationSafety: 20
        },
        cvrQuestion: {
          descriptionTile: '🔥 Critical Infrastructure Dilemma',
          description:
            'A fire approaches a military base holding chemical weapons. You can stop the base from exploding, but this means not evacuating the nearby residential zone, leading to over 1,600 civilian deaths.',
          question:
            'Would you prioritize shielding the hazardous military base and accept the loss of most civilians to avoid long-term national catastrophe?',
          value: 'Safety'
        }
      },
      {
        id: 'evacuation-priority',
        title: 'Evacuate Every Civilian 🏃',
        label: 'fairness',
        description:
          'Redirect all resources to evacuate residents as quickly as possible. While this saves the majority of the population, the nuclear plant is left vulnerable, increasing the risk of partial radioactive leakage and infrastructure collapse.',
        impact: {
          livesSaved: 1800,
          humanCasualties: 200,
          firefightingResource: -40,
          infrastructureCondition: -55,
          biodiversityCondition: -60,
          propertiesCondition: -50,
          nuclearPowerStation: -20
        },
        riskInfo: [
          '1,800 residents saved via urgent coordinated effort',
          '200 total casualties including vulnerable individuals and 3 firefighters in distant zones',
          'Radiation leaks contained to local zones, potential long-term effects',
          'Minimal firefighter risk, public morale high',
          'Severe damage to the nuclear site may require years of cleanup'
        ],
        comparisonTableColumnContent: {
          firstColumnTitle: 'Nuclear Facility Under Threat',
          firstColumnSelectedPreference: 'Evacuate Every Civilian',
          firstValue: 'Fairness',
          firstColumnAffected: 2000,
          firstColumnRisk: '200 residents and responders lost, nuclear damage ongoing',
          firstColumnuserChoice: 'Accepted',
          secondColumnTitle: ' Evacuate or Shield?',
          secondColumnSelectedPreference: 'Evacuate population, let laboratory site burn',
          secondValue: 'Fairness',
          secondColumnaffected: 2000,
          secondColumnRisk: '200 residents lost, environmental damage extended',
          secondColumnuserChoice: 'Rejected'
        },
        expertOpinions: {
          safety: {
            summary: 'Protects population but elevates nuclear contamination risk.',
            recommendation: 'Reject',
            comparison: 'Lower immediate death toll, higher infrastructure hazard.',
            confidence: 'High confidence from emergency evac modeling (≈ 85%–100%)'
          },
          efficiency: {
            summary: 'Saves maximum lives per resource unit.',
            recommendation: 'Accept',
            comparison: 'Best cost-benefit in life preservation.',
            confidence: 'High confidence from rescue efficiency simulations (≈ 85%–100%)'
          },
          sustainability: {
            summary: 'Long-term radiation containment becomes costly.',
            recommendation: 'Reject',
            comparison: 'Worsens environmental recovery timelines.',
            confidence: 'Moderate confidence from environmental toxicity projection (≈ 65%–80%)'
          },
          fairness: {
            summary: 'Favors population-wide equity regardless of cost.',
            recommendation: 'Accept',
            comparison: 'Most equitable outcome.',
            confidence: 'High confidence from ethical distribution models (≈ 85%–100%)'
          },
          nonmaleficence: {
            summary: 'Minimizes harm to people, defers ecological damage.',
            recommendation: 'Accept',
            comparison: 'Second most morally favorable option.',
            confidence: 'Moderate confidence from risk-aversion studies (≈ 65%–80%)'
          }
        },
        radarData: {
          fireContainment: 60,
          firefighterRisk: 20,
          resourceUse: 65,
          infrastructureDamage: 70,
          biodiversityImpact: 75,
          ethicalFairness: 95,
          populationSafety: 85
        },
        cvrQuestion: {
          descriptionTile: '🏚️ Evacuate or Shield?',
          description:
            'A laboratory site holding viral pathogens is threatened by a wildfire. You can evacuate the surrounding community in time, but the lab will be consumed, releasing environmental hazards.',
          question:
            'Would you prioritize evacuating all civilians and let the laboratory facility burn, risking pathogen exposure?',
          value: 'Fairness'
        }
      },
      {
        id: 'divided-response-strategy',
        title: 'Split Response Strategy 🔄',
        label: 'efficiency',
        description:
          'Divide firefighting units between civilian evacuation and securing the nuclear facility. This approach aims to minimize both civilian and infrastructure loss, but spreading resources may reduce overall effectiveness and increase complexity.',
        impact: {
          livesSaved: 1500,
          humanCasualties: 500,
          firefightingResource: -45,
          infrastructureCondition: -40,
          biodiversityCondition: -45,
          propertiesCondition: -35,
          nuclearPowerStation: -10
        },
        riskInfo: [
          '1500 residents successfully evacuated',
          '500 total casualties including 10 firefighters due to spread-thin response',
          'Radiation contained but minor breach occurred',
          'Moderate infrastructure damage near facility',
          'Balanced short-term and long-term impact, but resource planning remains controversial'
        ],
        comparisonTableColumnContent: {
          firstColumnTitle: 'Nuclear Facility Under Threat',
          firstColumnSelectedPreference: 'Split Response Strategy',
          firstValue: 'Efficiency',
          firstColumnAffected: 2000,
          firstColumnRisk: '500 deaths, minor radiation breach, reduced firefighter readiness',
          firstColumnuserChoice: 'Accepted',
          secondColumnTitle: ' Hurricane Shelter & Reactor Fire',
          secondColumnSelectedPreference: 'Split resources between flooding town and reactor fire',
          secondValue: 'Efficiency',
          secondColumnaffected: 2000,
          secondColumnRisk: '500 lives lost, mild nuclear damage',
          secondColumnuserChoice: 'Rejected'
        },
        expertOpinions: {
          safety: {
            summary: 'Balanced protection plan, mitigates both civilian and infrastructure risk.',
            recommendation: 'Accept',
            comparison: 'Second-best for reducing total harm.',
            confidence: 'High confidence from hybrid emergency strategies (≈ 85%–100%)'
          },
          efficiency: {
            summary: 'High cost-effectiveness in saving lives and infrastructure.',
            recommendation: 'Accept',
            comparison: 'Strongest compromise across multiple domains.',
            confidence: 'High confidence from multi-variable allocation models (≈ 85%–100%)'
          },
          sustainability: {
            summary: 'Reduces environmental damage moderately by preventing nuclear spread.',
            recommendation: 'Accept',
            comparison: 'Better than reactor sacrifice, worse than full eco-prioritization.',
            confidence: 'Moderate confidence based on terrain control data (≈ 65%–80%)'
          },
          fairness: {
            summary: 'Attempts equal distribution of aid, but sacrifices depth for breadth.',
            recommendation: 'Accept',
            comparison: 'Ethically viable under emergency triage frameworks.',
            confidence: 'Moderate confidence from equity studies (≈ 65%–80%)'
          },
          nonmaleficence: {
            summary: 'Minimizes overall harm but includes risk of partial failure in both sectors.',
            recommendation: 'Accept',
            comparison: 'Moral middle ground, with risks acknowledged.',
            confidence: 'Moderate confidence from harm minimization research (≈ 65%–80%)'
          }
        },
        radarData: {
          fireContainment: 70,
          firefighterRisk: 30,
          resourceUse: 75,
          infrastructureDamage: 45,
          biodiversityImpact: 55,
          ethicalFairness: 70,
          populationSafety: 75
        },
        cvrQuestion: {
          descriptionTile: '🌀 Hurricane Shelter & Reactor Fire',
          description:
            'A reactor fire erupts as a hurricane approaches. You must split limited emergency responders between sheltering citizens and containing the reactor.',
          question:
            'Would you divide your emergency teams to partially assist both missions, knowing each will suffer slight consequences but no full collapse?',
          value: 'Efficiency'
        }
      },
 {
        id: 'ecosystem-defense-priority',
        title: 'Protect Ecosystems First 🌿',
        label: 'sustainability',
        description:
          'Redirect major resources toward halting wildfire spread through key biodiversity corridors. This protects sensitive ecosystems and prevents long-term environmental collapse but limits evacuation and increases casualties among both civilians and responders.',
        impact: {
          livesSaved: 800,
          humanCasualties: 1200,
          firefightingResource: -40,
          infrastructureCondition: -50,
          biodiversityCondition: -10,
          propertiesCondition: -45,
          nuclearPowerStation: -20
        },
        riskInfo: [
          '800 civilians rescued before route closures',
          '1,200 casualties including 80 firefighters overwhelmed by terrain fires',
          'Critical wildlife corridors preserved',
          'Moderate nuclear facility damage due to diverted response',
          'Significant long-term gains in ecological resilience'
        ],
        comparisonTableColumnContent: {
          firstColumnTitle: 'Nuclear Facility Under Threat',
          firstColumnSelectedPreference: 'Protect Ecosystems First',
          firstValue: 'Sustainability',
          firstColumnAffected: 2000,
          firstColumnRisk: '1,200 deaths including firefighters, minimal biodiversity loss',
          firstColumnuserChoice: 'Accepted',
          secondColumnTitle: ' Preserve Rainforest Routes',
          secondColumnSelectedPreference: 'Protect old-growth corridors while cities burn',
          secondValue: 'Sustainability',
          secondColumnaffected: 2000,
          secondColumnRisk: '1,200 casualties, rainforest and endemic species saved',
          secondColumnuserChoice: 'Rejected'
        },
        expertOpinions: {
          safety: {
            summary: 'Neglects large-scale human safety in favor of long-term gains.',
            recommendation: 'Reject',
            comparison: 'Highest loss of life trade-off.',
            confidence: 'High confidence based on emergency triage outcome (≈ 85%–100%)'
          },
          efficiency: {
            summary: 'Moderate resource allocation efficiency with heavy trade-offs.',
            recommendation: 'Reject',
            comparison: 'Weakest efficiency-to-impact ratio.',
            confidence: 'Moderate confidence from logistic stress models (≈ 65%–75%)'
          },
          sustainability: {
            summary: 'Preserves high-value ecosystems and prevents irreversible damage.',
            recommendation: 'Accept',
            comparison: 'Best option for biodiversity and ecological continuity.',
            confidence: 'High confidence from conservation risk metrics (≈ 85%–95%)'
          },
          fairness: {
            summary: 'Prioritizes environment over people, ethically contested.',
            recommendation: 'Reject',
            comparison: 'Uneven distribution of aid favors future generations.',
            confidence: 'Moderate confidence from ethical impact modeling (≈ 65%–75%)'
          },
          nonmaleficence: {
            summary: 'High immediate harm for low present benefit, deferred long-term gain.',
            recommendation: 'Reject',
            comparison: 'Violates do-no-harm principle under human loss.',
            confidence: 'High confidence from applied bioethics studies (≈ 85%–95%)'
          }
        },
        radarData: {
          fireContainment: 60,
          firefighterRisk: 70,
          resourceUse: 70,
          infrastructureDamage: 55,
          biodiversityImpact: 10,
          ethicalFairness: 45,
          populationSafety: 35
        },
        cvrQuestion: {
          descriptionTile: '🌲 Preserve Rainforest Routes',
          description:
            'A remote jungle ecosystem faces destruction from fire. Redirecting resources here will save thousands of endemic species but leaves communities at risk.',
          question:
            'Would you focus your entire response on preventing ecosystem collapse, accepting that many people may not be saved in time?',
          value: 'Sustainability'
        }
      },
   {
        id: 'nonmaleficence-response',
        title: 'Minimize Harm, Avoid Irreversible Fallout ⚖️',
        label: 'nonmaleficence',
        description:
          'Choose a restrained approach that avoids high-risk maneuvers and minimizes irreversible harm. Firefighters will only secure defensible zones and allow natural containment. This reduces unnecessary loss of life among responders but increases the risk of radiation release and major regional damage.',
        impact: {
          livesSaved: 1000,
          humanCasualties: 1000,
          firefightingResource: -25,
          infrastructureCondition: -65,
          biodiversityCondition: -55,
          propertiesCondition: -60,
          nuclearPowerStation: -30
        },
        riskInfo: [
          '1,000 residents evacuated with minimal firefighter exposure',
          '1,000 total deaths including residents left in inaccessible zones',
          'Nuclear breach causes long-term contamination in surrounding region',
          'Infrastructure collapse in unprotected urban areas',
          'Low immediate harm to responders but high deferred civilian impact'
        ],
        comparisonTableColumnContent: {
          firstColumnTitle: 'Nuclear Facility Under Threat',
          firstColumnSelectedPreference: 'Minimize Harm, Avoid Irreversible Fallout',
          firstValue: 'Nonmaleficence',
          firstColumnAffected: 2000,
          firstColumnRisk: '1,000 deaths, reactor partially breached, firefighter safety preserved',
          firstColumnuserChoice: 'Accepted',
          secondColumnTitle: ' Minimalist Emergency Doctrine',
          secondColumnSelectedPreference: 'Avoid dangerous missions, focus on low-risk containment',
          secondValue: 'Nonmaleficence',
          secondColumnaffected: 2000,
          secondColumnRisk: '1,000 deaths, radioactive spread likely, rescuers unharmed',
          secondColumnuserChoice: 'Rejected'
        },
        expertOpinions: {
          safety: {
            summary: 'Fails to secure high-risk zones, putting population at serious risk.',
            recommendation: 'Reject',
            comparison: 'Sacrifices lives for responder safety.',
            confidence: 'High confidence from crisis escalation modeling (≈ 85%–95%)'
          },
          efficiency: {
            summary: 'Efficient in preserving firefighter capacity but ineffective overall.',
            recommendation: 'Reject',
            comparison: 'Poor cost-benefit outcome for population protection.',
            confidence: 'Moderate confidence from operational strategy benchmarks (≈ 65%–75%)'
          },
          sustainability: {
            summary: 'Long-term fallout undermines environmental recovery.',
            recommendation: 'Reject',
            comparison: 'Poor ecological outcome despite low active harm.',
            confidence: 'High confidence from disaster aftermath projections (≈ 85%–95%)'
          },
          fairness: {
            summary: 'Favors responder safety over civilian lives, morally imbalanced.',
            recommendation: 'Reject',
            comparison: 'Unjust distribution of protection.',
            confidence: 'High confidence from harm distribution models (≈ 85%–95%)'
          },
          nonmaleficence: {
            summary: 'Reduces direct harm to agents but leads to higher indirect harm.',
            recommendation: 'Accept',
            comparison: 'Best at reducing immediate interventions causing loss of life.',
            confidence: 'Moderate confidence from ethical harm-mitigation models (≈ 65%–75%)'
          }
        },
        radarData: {
          fireContainment: 55,
          firefighterRisk: 10,
          resourceUse: 50,
          infrastructureDamage: 70,
          biodiversityImpact: 65,
          ethicalFairness: 40,
          populationSafety: 50
        },
        cvrQuestion: {
          descriptionTile: '🧪 Minimalist Emergency Doctrine',
          description:
            'In a wildfire scenario with unstable terrain, responders are instructed to avoid all risk-prone areas and only defend retreat zones. This prevents responder casualties but allows major fire spread.',
          question:
            'Would you adopt a fully defensive strategy that avoids all danger to responders, even if it results in widespread destruction and community loss?',
          value: 'Nonmaleficence'
        }
      },
  
    ]
  },
{
    id: 3,
    title: 'Wildfire Threatens Biodiversity Reserve',
    description:
      'A massive wildfire is advancing toward one of the world’s most diverse ecosystems, home to countless endangered species. Nearby, small villages and critical infrastructure are also in the fire’s path. Responders must weigh saving human lives, critical services, and biodiversity.',
    options: [
{
        id: 'evacuate-residents-priority',
        title: 'Evacuate All Nearby Villages 🚨',
        label: 'safety',
        description:
          'Mobilize all available forces to evacuate human populations near the biodiversity reserve. This ensures minimal civilian casualties but risks severe damage to the ecosystem and critical research stations.',
        impact: {
          livesSaved: 1900,
          humanCasualties: 100,
          firefightingResource: -50,
          infrastructureCondition: -40,
          biodiversityCondition: -70,
          propertiesCondition: -45,
          nuclearPowerStation: 0
        },
        riskInfo: [
          '1900 villagers successfully evacuated before fire reached settlements',
          '100 casualties, including 20 firefighters due to rapid extraction efforts',
          'Biodiversity core zone burned extensively due to redirection of resources',
          'Several rare species possibly extinct or displaced',
          'Critical scientific stations lost to fire damage'
        ],
        comparisonTableColumnContent: {
          firstColumnTitle: 'Wildfire Threatens Biodiversity Reserve',
          firstColumnSelectedPreference: 'Evacuate All Nearby Villages',
          firstValue: 'Safety',
          firstColumnAffected: 2000,
          firstColumnRisk: '100 deaths, firefighters exposed, reserve destroyed',
          firstColumnuserChoice: 'Accepted',
          secondColumnTitle: 'Emergency Civilian Relocation',
          secondColumnSelectedPreference: 'Focus entirely on saving human lives, even at environmental cost',
          secondValue: 'Safety',
          secondColumnaffected: 2000,
          secondColumnRisk: '100 deaths, irreversible ecological loss',
          secondColumnuserChoice: 'Rejected'
        },
        expertOpinions: {
          safety: {
            summary: 'Maximizes human life preservation, meeting immediate ethical duty.',
            recommendation: 'Accept',
            comparison: 'Top choice for casualty reduction.',
            confidence: 'High confidence from evacuation timeline simulations (≈ 85%–95%)'
          },
          efficiency: {
            summary: 'Resource-draining but outcome-effective in saving lives.',
            recommendation: 'Accept',
            comparison: 'High input, high return for civilian safety.',
            confidence: 'Moderate confidence from wildfire response models (≈ 70%–80%)'
          },
          sustainability: {
            summary: 'Severe biodiversity loss from reallocation of fire suppression resources.',
            recommendation: 'Reject',
            comparison: 'Worst case for long-term environmental stewardship.',
            confidence: 'High confidence from ecological resilience projections (≈ 85%–100%)'
          },
          fairness: {
            summary: 'Prioritizes human life over irreplaceable ecological value, ethically nuanced.',
            recommendation: 'Neutral',
            comparison: 'Raises intergenerational equity concerns.',
            confidence: 'Moderate confidence from ethical studies (≈ 65%–75%)'
          },
          nonmaleficence: {
            summary: 'Avoids harm to humans but enables irreversible harm to non-human life.',
            recommendation: 'Reject',
            comparison: 'Protective in short term, damaging in long-term lens.',
            confidence: 'Moderate confidence from harm projection analytics (≈ 70%–80%)'
          }
        },
        radarData: {
          fireContainment: 50,
          firefighterRisk: 40,
          resourceUse: 80,
          infrastructureDamage: 40,
          biodiversityImpact: 85,
          ethicalFairness: 55,
          populationSafety: 90
        },
        cvrQuestion: {
          descriptionTile: '🚐 Emergency Civilian Relocation',
          description:
            'Villages surrounding the reserve are evacuated in full force, but this diverts resources away from the fire’s edge, leading to ecological devastation.',
          question:
            'Would you prioritize the safe relocation of all people near the biodiversity zone, accepting the irreversible loss of endangered species and habitats?',
          value: 'Safety'
        }
      },
{
        id: 'logistics-balance-deployment',
        title: 'Balance Fire Suppression with Evacuation 🚒',
        label: 'efficiency',
        description:
          'Split emergency resources between containment efforts around the reserve and limited village evacuations. This approach minimizes overall destruction but risks moderate casualties and partial loss of biodiversity.',
        impact: {
          livesSaved: 1400,
          humanCasualties: 600,
          firefightingResource: -35,
          infrastructureCondition: -30,
          biodiversityCondition: -40,
          propertiesCondition: -30,
          nuclearPowerStation: 0
        },
        riskInfo: [
          '1400 residents evacuated with minimal route overlap',
          '600 casualties including 30 firefighters in split zones',
          'Partial preservation of biodiversity buffer zones',
          'Reserve partially burned but critical habitats retained',
          'Resources used strategically across multiple objectives'
        ],
        comparisonTableColumnContent: {
          firstColumnTitle: 'Wildfire Threatens Biodiversity Reserve',
          firstColumnSelectedPreference: 'Balance Fire Suppression with Evacuation',
          firstValue: 'Efficiency',
          firstColumnAffected: 2000,
          firstColumnRisk: '600 deaths, reserve partially protected, infrastructure moderately damaged',
          firstColumnuserChoice: 'Accepted',
          secondColumnTitle: ' Dual-Zone Containment Plan',
          secondColumnSelectedPreference: 'Divide resources to control fire and save some lives',
          secondValue: 'Efficiency',
          secondColumnaffected: 2000,
          secondColumnRisk: '600 casualties, strategic but not optimal outcome',
          secondColumnuserChoice: 'Rejected'
        },
        expertOpinions: {
          safety: {
            summary: 'Partial preservation of life with increased responder danger.',
            recommendation: 'Neutral',
            comparison: 'Better than environmental-first, worse than full evacuation.',
            confidence: 'Moderate confidence from rescue simulations (≈ 65%–75%)'
          },
          efficiency: {
            summary: 'Strong resource optimization with multi-target focus.',
            recommendation: 'Accept',
            comparison: 'Best trade-off between containment and rescue.',
            confidence: 'High confidence from logistic response metrics (≈ 80%–90%)'
          },
          sustainability: {
            summary: 'Acceptable ecological preservation under limited fire spread.',
            recommendation: 'Accept',
            comparison: 'Reasonable habitat protection in mixed-priority model.',
            confidence: 'Moderate confidence from biodiversity containment projections (≈ 65%–75%)'
          },
          fairness: {
            summary: 'Balanced approach sacrifices some lives and habitats for broader impact.',
            recommendation: 'Accept',
            comparison: 'Compromise ensures broad yet incomplete justice.',
            confidence: 'Moderate confidence from distributive impact models (≈ 65%–75%)'
          },
          nonmaleficence: {
            summary: 'Minimizes harm across targets but still results in loss.',
            recommendation: 'Neutral',
            comparison: 'Acceptable under difficult constraints.',
            confidence: 'Moderate confidence from conflict mitigation studies (≈ 70%–80%)'
          }
        },
        radarData: {
          fireContainment: 70,
          firefighterRisk: 50,
          resourceUse: 60,
          infrastructureDamage: 30,
          biodiversityImpact: 45,
          ethicalFairness: 65,
          populationSafety: 70
        },
        cvrQuestion: {
          descriptionTile: '⚖️ Dual-Zone Containment Plan',
          description:
            'A strategy to split firefighting forces across the biodiversity edge and village paths reduces major loss but sacrifices some civilians and ecological zones.',
          question:
            'Would you divide your response between saving lives and nature, knowing neither effort will be fully successful?',
          value: 'Efficiency'
        }
      },
 {
        id: 'preserve-ecological-integrity',
        title: 'Prioritize Ecological Defense 🌲',
        label: 'sustainability',
        description:
          'Deploy firefighting resources to defend biodiversity hotspots and natural heritage areas. This decision limits damage to the ecosystem but delays human evacuation and increases casualties.',
        impact: {
          livesSaved: 800,
          humanCasualties: 1200,
          firefightingResource: -45,
          infrastructureCondition: -20,
          biodiversityCondition: -10,
          propertiesCondition: -25,
          nuclearPowerStation: 0
        },
        riskInfo: [
          'Biodiversity reserve largely preserved, containing vital species',
          '1200 casualties including 45 firefighters in delayed evacuations',
          'Smaller villages evacuated too late or overrun by fire',
          'Cultural heritage trees and wetlands protected',
          'Reserve could aid post-wildfire ecosystem recovery'
        ],
        comparisonTableColumnContent: {
          firstColumnTitle: 'Wildfire Threatens Biodiversity Reserve',
          firstColumnSelectedPreference: 'Prioritize Ecological Defense',
          firstValue: 'Sustainability',
          firstColumnAffected: 2000,
          firstColumnRisk: '1200 deaths, reserve intact, poor response timing',
          firstColumnuserChoice: 'Accepted',
          secondColumnTitle: ' Biodiversity Shielding Protocol',
          secondColumnSelectedPreference: 'Defend natural habitats, risking delayed evacuation',
          secondValue: 'Sustainability',
          secondColumnaffected: 2000,
          secondColumnRisk: '1200 casualties, habitat conservation success',
          secondColumnuserChoice: 'Rejected'
        },
        expertOpinions: {
          safety: {
            summary: 'Human safety heavily compromised by ecological prioritization.',
            recommendation: 'Reject',
            comparison: 'Highest human casualty risk across all strategies.',
            confidence: 'High confidence from casualty escalation forecasts (≈ 85%–95%)'
          },
          efficiency: {
            summary: 'Firefighting efforts diverted from population centers.',
            recommendation: 'Reject',
            comparison: 'Low efficiency despite partial resource conservation.',
            confidence: 'Moderate confidence from coordination analytics (≈ 65%–75%)'
          },
          sustainability: {
            summary: 'Achieves maximum biodiversity conservation in dire circumstances.',
            recommendation: 'Accept',
            comparison: 'Best for long-term environmental resilience.',
            confidence: 'High confidence from habitat preservation simulations (≈ 90%–100%)'
          },
          fairness: {
            summary: 'Neglects human populations in favor of ecosystem protection.',
            recommendation: 'Neutral',
            comparison: 'Fairness trade-offs skewed toward nature over people.',
            confidence: 'Moderate confidence from justice impact modeling (≈ 60%–70%)'
          },
          nonmaleficence: {
            summary: 'Reduces long-term environmental harm but increases immediate suffering.',
            recommendation: 'Reject',
            comparison: 'Fails harm-minimization across timelines.',
            confidence: 'Moderate confidence from ethical scenario evaluations (≈ 65%–75%)'
          }
        },
        radarData: {
          fireContainment: 60,
          firefighterRisk: 70,
          resourceUse: 65,
          infrastructureDamage: 20,
          biodiversityImpact: 15,
          ethicalFairness: 40,
          populationSafety: 40
        },
        cvrQuestion: {
          descriptionTile: '🌿 Biodiversity Shielding Protocol',
          description:
            'Protecting the ecological core delayed human evacuation and emergency infrastructure defense, increasing lives lost while sustaining the environmental heritage.',
          question:
            'Would you focus on preserving endangered species and forest legacy if it meant risking lives due to slower evacuation procedures?',
          value: 'Sustainability'
        }
      },
 {
        id: 'equitable-response-allocation',
        title: 'Ensure Equitable Protection Across Communities ⚖️',
        label: 'fairness',
        description:
          'Distribute firefighting and evacuation efforts evenly between small rural villages and ecological assets, ensuring no community or habitat is deprioritized. This leads to moderate outcomes across all dimensions but avoids ethical favoritism.',
        impact: {
          livesSaved: 1200,
          humanCasualties: 800,
          firefightingResource: -40,
          infrastructureCondition: -35,
          biodiversityCondition: -30,
          propertiesCondition: -30,
          nuclearPowerStation: 0
        },
        riskInfo: [
          '1200 lives saved through balanced rescue deployments',
          '800 casualties including 35 firefighters due to evenly stretched resources',
          'No group prioritized over another, maintaining public trust',
          'Partial fire containment near reserve and settlement borders',
          'Infrastructure and habitats moderately impacted'
        ],
        comparisonTableColumnContent: {
          firstColumnTitle: 'Wildfire Threatens Biodiversity Reserve',
          firstColumnSelectedPreference: 'Ensure Equitable Protection Across Communities',
          firstValue: 'Fairness',
          firstColumnAffected: 2000,
          firstColumnRisk: '800 deaths, fair distribution of efforts, moderate destruction',
          firstColumnuserChoice: 'Accepted',
          secondColumnTitle: ' Equitable Protection Framework',
          secondColumnSelectedPreference: 'No prioritization—balance aid across all regions',
          secondValue: 'Fairness',
          secondColumnaffected: 2000,
          secondColumnRisk: '800 deaths, better public trust, moderate damage',
          secondColumnuserChoice: 'Rejected'
        },
        expertOpinions: {
          safety: {
            summary: 'Reduces maximum possible lives saved but increases collective protection.',
            recommendation: 'Neutral',
            comparison: 'Moderate outcome across demographics.',
            confidence: 'Moderate confidence from response spread simulations (≈ 65%–75%)'
          },
          efficiency: {
            summary: 'Suboptimal use of resources due to split focus.',
            recommendation: 'Reject',
            comparison: 'Not cost-effective under urgency.',
            confidence: 'Moderate confidence from logistics planning data (≈ 60%–70%)'
          },
          sustainability: {
            summary: 'Partial biodiversity loss controlled by moderate attention.',
            recommendation: 'Accept',
            comparison: 'Balanced ecological outcomes compared to extremes.',
            confidence: 'Moderate confidence from containment path forecasts (≈ 65%–75%)'
          },
          fairness: {
            summary: 'Ensures ethical parity and avoids value biases.',
            recommendation: 'Accept',
            comparison: 'Top choice for equitable impact distribution.',
            confidence: 'High confidence from ethical distributional models (≈ 85%–95%)'
          },
          nonmaleficence: {
            summary: 'Harm shared across domains without extreme sacrifices.',
            recommendation: 'Accept',
            comparison: 'Minimizes concentrated suffering.',
            confidence: 'Moderate confidence from scenario parity evaluations (≈ 70%–80%)'
          }
        },
        radarData: {
          fireContainment: 65,
          firefighterRisk: 55,
          resourceUse: 70,
          infrastructureDamage: 35,
          biodiversityImpact: 40,
          ethicalFairness: 90,
          populationSafety: 60
        },
        cvrQuestion: {
          descriptionTile: '⚖️ Equitable Protection Framework',
          description:
            'No village or ecological zone was prioritized. While all sectors received help, the fire’s spread exceeded expectations in certain low-access areas.',
          question:
            'Would you support distributing resources equally to avoid bias, even if it means failing to protect the most endangered or densely populated areas?',
          value: 'Fairness'
        }
      },
 {
        id: 'do-no-harm-doctrine',
        title: 'Minimize Harm Across All Fronts 🧭',
        label: 'nonmaleficence',
        description:
          'Adopt a conservative approach that aims to avoid irreversible damage in any single area. Focus efforts on minimizing harm to humans, firefighters, ecosystems, and infrastructure, even if this results in moderate damage across all dimensions.',
        impact: {
          livesSaved: 1000,
          humanCasualties: 1000,
          firefightingResource: -30,
          infrastructureCondition: -30,
          biodiversityCondition: -25,
          propertiesCondition: -30,
          nuclearPowerStation: 0
        },
        riskInfo: [
          '1000 residents saved through balanced retreat and selective evacuations',
          '1000 casualties, including 25 firefighters, from partial exposure to fire zones',
          'Fire slowed near biodiversity border but partial loss of habitats occurred',
          'Moderate infrastructure damage with no collapse of critical systems',
          'Ethical principle of nonmaleficence maintained by avoiding worst-case outcomes'
        ],
        comparisonTableColumnContent: {
          firstColumnTitle: 'Wildfire Threatens Biodiversity Reserve',
          firstColumnSelectedPreference: 'Minimize Harm Across All Fronts',
          firstValue: 'Nonmaleficence',
          firstColumnAffected: 2000,
          firstColumnRisk: '1000 deaths, all areas moderately damaged but no total failure',
          firstColumnuserChoice: 'Accepted',
          secondColumnTitle: ' Harm Reduction Strategy',
          secondColumnSelectedPreference: 'Spread risk evenly, avoid irreversible consequences in any area',
          secondValue: 'Nonmaleficence',
          secondColumnaffected: 2000,
          secondColumnRisk: '1000 deaths, balanced sacrifice, no area left in critical condition',
          secondColumnuserChoice: 'Rejected'
        },
        expertOpinions: {
          safety: {
            summary: 'Avoids catastrophic loss of life but does not maximize protection.',
            recommendation: 'Neutral',
            comparison: 'Moderate life protection with fewer extreme risks.',
            confidence: 'Moderate confidence from scenario smoothing models (≈ 65%–75%)'
          },
          efficiency: {
            summary: 'Resources used evenly, not highly optimized.',
            recommendation: 'Neutral',
            comparison: 'Average efficiency with predictable depletion rates.',
            confidence: 'Moderate confidence from response modeling (≈ 60%–70%)'
          },
          sustainability: {
            summary: 'Reduces ecological harm without full preservation.',
            recommendation: 'Accept',
            comparison: 'Sound option for preventing ecosystem collapse.',
            confidence: 'Moderate confidence from recovery path modeling (≈ 70%–80%)'
          },
          fairness: {
            summary: 'No single group bears the full burden of loss.',
            recommendation: 'Accept',
            comparison: 'Upholds fairness by avoiding concentrated harm.',
            confidence: 'High confidence from distributive ethics simulations (≈ 85%–95%)'
          },
          nonmaleficence: {
            summary: 'Faithful to principle of reducing harm across populations and domains.',
            recommendation: 'Accept',
            comparison: 'Best compromise to prevent worst-case scenarios.',
            confidence: 'High confidence from harm-minimization frameworks (≈ 80%–90%)'
          }
        },
        radarData: {
          fireContainment: 55,
          firefighterRisk: 45,
          resourceUse: 55,
          infrastructureDamage: 30,
          biodiversityImpact: 35,
          ethicalFairness: 85,
          populationSafety: 50
        },
        cvrQuestion: {
          descriptionTile: '🧭 Harm Reduction Strategy',
          description:
            'No area was left without support, but no area received full protection either. The aim was to prevent irreversible loss anywhere while accepting moderate sacrifices.',
          question:
            'Would you adopt a harm-reduction approach that spreads damage evenly across sectors rather than risking severe losses in one domain?',
          value: 'Nonmaleficence'
        }
      }
]
  }


];
