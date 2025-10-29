
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
        title: "Prioritize Safety Protocol",
        label: "safety",
        description:
          "Deploy all available firefighters immediately to form defensive lines and evacuate population centers. This action will successfully evacuate all residents but exposes firefighters to intense danger, leading to casualties and resource depletion.",
        impact: {
          livesSaved: 2000,
          humanCasualties: 12,
          firefightingResource: -38,
          infrastructureCondition: -15,
          biodiversityCondition: -12,
          propertiesCondition: -12,
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
          resourceUse: 84,
          infrastructureDamage: 40,
          biodiversityImpact: 35,
          ethicalFairness: 75,
          populationSafety: 100
        },
        // BRIDGE DILEMMA (direct sacrifice)
        cvrQuestion: {
          descriptionTile: "🏥 Forced Medical Sacrifice",
          description: "A chemical plant explosion has filled a city hospital with toxic fumes. To save 2,000 trapped patients, you can order a small team of 12 medical staff to enter the most contaminated zone to open sealed exits. Those 12 will certainly die, but everyone else will be evacuated safely.",
          question: "Would you order 12 medical staff to certain death so that 2,000 patients can be rescued?",
          value: "Safety"
        },
        comparisonTableColumnContent: {
          firstColumnTitle: "Wildfire Approaching a Town",
          firstColumnSelectedPreference: "Deploy all available firefighters immediately to form defensive lines and evacuate population centers",
          firstValue: "Safety",
          firstColumnAffected: 2000,
          firstColumnRisk: "12 firefighter casualties",
          firstColumnuserChoice: "Accepted",
          secondColumnTitle: "Forced Medical Sacrifice",
          secondColumnSelectedPreference: "Order 12 medical staff into a lethal zone to unlock exits and save 2,000 patients",
          secondValue: "Safety",
          secondColumnaffected: 2000,
          secondColumnRisk: "12 medical staff deaths",
          secondColumnuserChoice: "Rejected"
        }
      },
      {
        id: "efficiency-focused",
        title: "Resource Optimization Strategy",
        label: "efficiency",
        description:
          "Deploy firefighter teams only to the most critical zones, minimizing resource use while attempting to save as many lives as possible. However, limited coverage results in preventable resident deaths and minor firefighter casualties.",
        impact: {
          livesSaved: 1400,
          humanCasualties: 600,
          firefightingResource: -22,
          infrastructureCondition: -14,
          biodiversityCondition: -16,
          propertiesCondition: -12,
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
          resourceUse: 50,
          infrastructureDamage: 38,
          biodiversityImpact: 45,
          ethicalFairness: 45,
          populationSafety: 70
        },
        // BRIDGE DILEMMA (direct sacrifice)
        cvrQuestion: {
          descriptionTile: "🛳️ Lifeboat Bulkhead Order",
          description: "A cruise ship with 2,000 people is taking on water. To keep the ship afloat long enough to save 1,400 people using only 25% of rescue resources, you must order the sealing of six lower-deck bulkheads, deliberately trapping 600 passengers below.",
          question: "Would you seal the bulkheads—condemning 600 people—so that 1,400 can be saved with minimal resources?",
          value: "Efficiency"
        },
        comparisonTableColumnContent: {
          firstColumnTitle: "Wildfire Approaching a Town",
          firstColumnSelectedPreference: "Deploy firefighter teams only to the most critical zones",
          firstValue: "Efficiency",
          firstColumnAffected: 2000,
          firstColumnRisk: "600 civilian deaths",
          firstColumnuserChoice: "Accepted",
          secondColumnTitle: "Lifeboat Bulkhead Order",
          secondColumnSelectedPreference: "Seal lower-deck bulkheads to preserve buoyancy and save 1,400 with limited resources",
          secondValue: "Efficiency",
          secondColumnaffected: 2000,
          secondColumnRisk: "600 passenger deaths",
          secondColumnuserChoice: "Rejected"
        }
      },
      {
        id: "sustainability-focused",
        title: "Eco-Conscious Containment",
        label: "sustainability",
        description:
          "Limit intervention to protect natural ecosystems and endangered species. Firefighters engage only in environmentally sensitive zones. Most civilians are left vulnerable, and several firefighters perish in inaccessible terrain.",
        impact: {
          livesSaved: 900,
          humanCasualties: 1100,
          firefightingResource: -26,
          infrastructureCondition: -12,
          biodiversityCondition: -8,
          propertiesCondition: -12,
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
          resourceUse: 56,
          infrastructureDamage: 32,
          biodiversityImpact: 24,
          ethicalFairness: 55,
          populationSafety: 45
        },
        // BRIDGE DILEMMA (direct sacrifice)
        cvrQuestion: {
          descriptionTile: "💧 Operate the Floodgates",
          description: "A collapsing dam threatens a rare wetland. To save the ecosystem, you can detonate a levee that will divert the torrent into low-lying neighborhoods. This will preserve the habitat but will kill 1,100 people, including 20 responders positioned to execute the operation, while 900 are rescued via low-impact routes.",
          question: "Would you deliberately breach the levee—knowing 1,100 people including 20 responders will die—to preserve the ecosystem?",
          value: "Sustainability"
        },
        comparisonTableColumnContent: {
          firstColumnTitle: "Wildfire Approaching a Town",
          firstColumnSelectedPreference: "Limit intervention to protect natural ecosystems and endangered species",
          firstValue: "Sustainability",
          firstColumnAffected: 2000,
          firstColumnRisk: "1,100 civilian deaths + 20 firefighters",
          firstColumnuserChoice: "Accepted",
          secondColumnTitle: "Operate the Floodgates",
          secondColumnSelectedPreference: "Breach a levee to save the wetland, sacrificing 1,100 people (incl. 20 responders)",
          secondValue: "Sustainability",
          secondColumnaffected: 2000,
          secondColumnRisk: "1,100 civilian deaths + 20 responder deaths",
          secondColumnuserChoice: "Rejected"
        }
      },
      {
        id: "fairness-focused",
        title: "Equitable Response Protocol",
        label: "fairness",
        description:
          "Distribute protection equally across all neighborhoods regardless of socioeconomic or geographic differences. This equitable approach stretches resources thin, leading to moderate civilian and firefighter losses.",
        impact: {
          livesSaved: 1600,
          humanCasualties: 400,
          firefightingResource: -32,
          infrastructureCondition: -14,
          biodiversityCondition: -14,
          propertiesCondition: -12,
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
          resourceUse: 68,
          infrastructureDamage: 36,
          biodiversityImpact: 40,
          ethicalFairness: 90,
          populationSafety: 80
        },
        // BRIDGE DILEMMA (direct sacrifice)
        cvrQuestion: {
          descriptionTile: "🏚️ Hold the Beams",
          description: "After a major earthquake, rescue teams face collapsing corridors across rich and poor districts alike. To ensure equal access, you order teams to advance in lockstep across all districts. In several buildings, 30 rescuers must physically brace failing beams so that 1,600 people can pass—those 30 will certainly die, and 370 residents still perish due to system-wide delays.",
          question: "Would you enforce perfectly equal deployment even if it requires 30 rescuers to accept certain death and results in 370 resident deaths due to slower aid?",
          value: "Fairness"
        },
        comparisonTableColumnContent: {
          firstColumnTitle: "Wildfire Approaching a Town",
          firstColumnSelectedPreference: "Distribute protection equally across all neighborhoods",
          firstValue: "Fairness",
          firstColumnAffected: 2000,
          firstColumnRisk: "400 deaths including 30 firefighters",
          firstColumnuserChoice: "Accepted",
          secondColumnTitle: "Hold the Beams",
          secondColumnSelectedPreference: "Maintain equal deployment; 30 rescuers brace failing structures to let 1,600 pass",
          secondValue: "Fairness",
          secondColumnaffected: 2000,
          secondColumnRisk: "370 civilian deaths + 30 rescuer deaths",
          secondColumnuserChoice: "Rejected"
        }
      },
      {
        id: "nonmaleficence-focused",
        title: "Harm Minimization Approach",
        label: "nonmaleficence",
        description:
          "Use every available strategy to minimize total harm—both human and ecological—by shielding vulnerable communities, preempting infrastructure collapse, and preserving firefighter life. All civilians are rescued, but some firefighter lives are lost in the process.",
        impact: {
          livesSaved: 2000,
          humanCasualties: 8,
          firefightingResource: -30,
          infrastructureCondition: -16,
          biodiversityCondition: -12,
          propertiesCondition: -16,
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
          resourceUse: 64,
          infrastructureDamage: 42,
          biodiversityImpact: 35,
          ethicalFairness: 80,
          populationSafety: 100
        },
        // BRIDGE DILEMMA (direct sacrifice)
        cvrQuestion: {
          descriptionTile: "🧪 Manual Valve Shutdown",
          description: "A bioterror gas release spreads through a university complex. To guarantee the rescue of all 2,000 civilians, you must order an 8‑person hazmat team to enter a saturated zone and manually shut the final valves. The team will certainly die; everyone else survives, and infrastructure suffers heavy damage.",
          question: "Would you order 8 hazmat responders to certain death to ensure zero civilian fatalities (2,000 saved) despite severe infrastructure loss?",
          value: "Nonmaleficence"
        },
        comparisonTableColumnContent: {
          firstColumnTitle: "Wildfire Approaching a Town",
          firstColumnSelectedPreference: "Use every available strategy to minimize total harm",
          firstValue: "Nonmaleficence",
          firstColumnAffected: 2000,
          firstColumnRisk: "8 firefighter deaths",
          firstColumnuserChoice: "Accepted",
          secondColumnTitle: "Manual Valve Shutdown",
          secondColumnSelectedPreference: "Order 8 hazmat responders into a lethal zone to save 2,000 civilians",
          secondValue: "Nonmaleficence",
          secondColumnaffected: 2000,
          secondColumnRisk: "8 responder deaths + severe infrastructure damage",
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
        title: 'Shield the Reactor at All Costs',
        label: 'safety',
        description:
          'Deploy all firefighting forces to fortify the nuclear facility perimeter. This prevents catastrophic radiation release but leaves most of the population unprotected, leading to severe civilian casualties.',
        impact: {
          livesSaved: 400,
          humanCasualties: 1600,
          firefightingResource: -42,
          infrastructureCondition: -16,
          biodiversityCondition: -16,
          propertiesCondition: -14,
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
          secondColumnTitle: 'Seal the Community Gates',
          secondColumnSelectedPreference: 'Close flood/contamination gates to protect reactor, trapping residents inside',
          secondValue: 'Safety',
          secondColumnaffected: 2000,
          secondColumnRisk: '1600 residents lost, reactor secured',
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
          resourceUse: 96,
          infrastructureDamage: 42,
          biodiversityImpact: 45,
          ethicalFairness: 25,
          populationSafety: 20
        },
        // BRIDGE DILEMMA (direct sacrifice)
        cvrQuestion: {
          descriptionTile: '🧱 Seal the Community Gates',
          description:
            'A toxic plume is advancing toward a nuclear facility and nearby town. To prevent a reactor breach, you can shut the community flood/contamination gates, sealing neighborhoods in place. This will save the facility but condemn 1,600 residents while 400 are evacuated.',
          question:
            'Would you deliberately seal the neighborhood gates—condemning 1,600 people—to prevent a catastrophic reactor failure?',
          value: 'Safety'
        }
      },
      {
        id: 'evacuation-priority',
        title: 'Evacuate Every Civilian',
        label: 'fairness',
        description:
          'Redirect all resources to evacuate residents as quickly as possible. While this saves the majority of the population, the nuclear plant is left vulnerable, increasing the risk of partial radioactive leakage and infrastructure collapse.',
        impact: {
          livesSaved: 1800,
          humanCasualties: 200,
          firefightingResource: -40,
          infrastructureCondition: -18,
          biodiversityCondition: -18,
          propertiesCondition: -16,
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
          secondColumnTitle: 'Controlled Vent for Evacuation',
          secondColumnSelectedPreference: 'Order a controlled vent to the atmosphere to buy evacuation time',
          secondValue: 'Fairness',
          secondColumnaffected: 2000,
          secondColumnRisk: '200 deaths from acute exposure (incl. 3 responders)',
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
          resourceUse: 90,
          infrastructureDamage: 48,
          biodiversityImpact: 50,
          ethicalFairness: 95,
          populationSafety: 85
        },
        // BRIDGE DILEMMA (direct sacrifice)
        cvrQuestion: {
          descriptionTile: '🌬️ Controlled Vent for Evacuation',
          description:
            'To clear evacuation routes for 1,800 civilians, engineers can perform a controlled venting of radioactive steam. This action will directly cause 200 deaths from acute exposure, including 3 responders, while preventing a wider catastrophe.',
          question:
            'Would you order a controlled vent—causing 200 deaths (incl. 3 responders)—to evacuate 1,800 civilians in time?',
          value: 'Fairness'
        }
      },
      {
        id: 'divided-response-strategy',
        title: 'Split Response Strategy',
        label: 'efficiency',
        description:
          'Divide firefighting units between civilian evacuation and securing the nuclear facility. This approach aims to minimize both civilian and infrastructure loss, but spreading resources may reduce overall effectiveness and increase complexity.',
        impact: {
          livesSaved: 1500,
          humanCasualties: 500,
          firefightingResource: -38,
          infrastructureCondition: -16,
          biodiversityCondition: -18,
          propertiesCondition: -16,
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
          secondColumnTitle: 'Dual Mission with Sacrifice',
          secondColumnSelectedPreference: 'Assign 10 responders to manual core venting while evacuations proceed',
          secondValue: 'Efficiency',
          secondColumnaffected: 2000,
          secondColumnRisk: '500 deaths total (incl. 10 responders)',
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
          resourceUse: 84,
          infrastructureDamage: 42,
          biodiversityImpact: 50,
          ethicalFairness: 70,
          populationSafety: 75
        },
        // BRIDGE DILEMMA (direct sacrifice)
        cvrQuestion: {
          descriptionTile: '🔧 Dual Mission with Sacrifice',
          description:
            'To both evacuate civilians and stabilize the reactor, 10 technicians must enter a breached chamber to manually vent pressure. Those 10 will certainly die; 1,500 civilians are evacuated and the reactor holds with only a minor breach.',
          question:
            'Would you order 10 technicians to certain death so you can split teams and still prevent a major reactor failure?',
          value: 'Efficiency'
        }
      },
      {
        id: 'ecosystem-defense-priority',
        title: 'Protect Ecosystems First',
        label: 'sustainability',
        description:
          'Redirect major resources toward halting wildfire spread through key biodiversity corridors. This protects sensitive ecosystems and prevents long-term environmental collapse but limits evacuation and increases casualties among both civilians and responders.',
        impact: {
          livesSaved: 800,
          humanCasualties: 1200,
          firefightingResource: -40,
          infrastructureCondition: -16,
          biodiversityCondition: -8,
          propertiesCondition: -16,
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
          secondColumnTitle: 'Last Stand Firebreak',
          secondColumnSelectedPreference: 'Ignite barrier fires and order 80 rangers to hold lines so corridors survive',
          secondValue: 'Sustainability',
          secondColumnaffected: 2000,
          secondColumnRisk: '1,200 deaths total (incl. 80 responders)',
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
          resourceUse: 92,
          infrastructureDamage: 42,
          biodiversityImpact: 22,
          ethicalFairness: 45,
          populationSafety: 35
        },
        // BRIDGE DILEMMA (direct sacrifice)
        cvrQuestion: {
          descriptionTile: '🔥 Last Stand Firebreak',
          description:
            'To keep ancient biodiversity corridors alive, commanders can ignite barrier fires and order 80 rangers to hold the lines until overrun. Their deaths will buy time to save the ecosystems, but only 800 civilians will be rescued; 1,120 others will perish.',
          question:
            'Would you order 80 rangers to certain death and accept 1,120 civilian deaths to prevent ecosystem collapse?',
          value: 'Sustainability'
        }
      },
      {
        id: 'nonmaleficence-response',
        title: 'Minimize Harm, Avoid Irreversible Fallout',
        label: 'nonmaleficence',
        description:
          'Choose a restrained approach that avoids high-risk maneuvers and minimizes irreversible harm. Firefighters will only secure defensible zones and allow natural containment. This reduces unnecessary loss of life among responders but increases the risk of radiation release and major regional damage.',
        impact: {
          livesSaved: 1000,
          humanCasualties: 1000,
          firefightingResource: -34,
          infrastructureCondition: -18,
          biodiversityCondition: -18,
          propertiesCondition: -18,
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
          secondColumnTitle: 'Lockdown Doctrine',
          secondColumnSelectedPreference: 'Lock down red zones to avoid responder risk, barring rescue attempts',
          secondValue: 'Nonmaleficence',
          secondColumnaffected: 2000,
          secondColumnRisk: '1,000 deaths, responders unharmed',
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
          resourceUse: 76,
          infrastructureDamage: 48,
          biodiversityImpact: 50,
          ethicalFairness: 40,
          populationSafety: 50
        },
        // BRIDGE DILEMMA (direct sacrifice)
        cvrQuestion: {
          descriptionTile: '🚫 Lockdown Doctrine',
          description:
            'To avoid risking responders, command can order hard lockdowns of unstable zones, physically preventing rescue attempts. This action directly condemns 1,000 people who cannot be reached, while responders remain unharmed.',
          question:
            'Would you impose a hard lockdown that bars rescue attempts—knowingly condemning 1,000 people—to avoid responder deaths and escalation?',
          value: 'Nonmaleficence'
        }
      }
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
        title: 'Evacuate All Nearby Villages',
        label: 'safety',
        description:
          'Mobilize all available forces to evacuate human populations near the biodiversity reserve. This ensures minimal civilian casualties but risks severe damage to the ecosystem and critical research stations.',
        impact: {
          livesSaved: 1900,
          humanCasualties: 100,
          firefightingResource: -30,
          infrastructureCondition: -20,
          biodiversityCondition: -50,
          propertiesCondition: -22,
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
          secondColumnTitle: 'Bridge Bracing Line',
          secondColumnSelectedPreference: 'Order 20 firefighters to hold a collapsing fire-bridge so 1,900 villagers can pass',
          secondValue: 'Safety',
          secondColumnaffected: 2000,
          secondColumnRisk: '100 deaths total (incl. 20 firefighters)',
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
          resourceUse: 60,
          infrastructureDamage: 40,
          biodiversityImpact: 100,
          ethicalFairness: 55,
          populationSafety: 90
        },
        // BRIDGE DILEMMA (direct sacrifice)
        cvrQuestion: {
          descriptionTile: '🌉 Bridge Bracing Line',
          description:
            'Smoke and fire trap villagers at a narrow canyon bridge. To allow 1,900 people to pass, 20 firefighters must physically brace failing beams in lethal heat until evacuations are complete. Those 20 will certainly die; the reserve will burn.',
          question:
            'Would you order 20 firefighters to hold the bridge—accepting their certain deaths—to evacuate 1,900 people?',
          value: 'Safety'
        }
      },
      {
        id: 'logistics-balance-deployment',
        title: 'Balance Fire Suppression with Evacuation',
        label: 'efficiency',
        description:
          'Split emergency resources between containment efforts around the reserve and limited village evacuations. This approach minimizes overall destruction but risks moderate casualties and partial loss of biodiversity.',
        impact: {
          livesSaved: 1400,
          humanCasualties: 600,
          firefightingResource: -22,
          infrastructureCondition: -16,
          biodiversityCondition: -35,
          propertiesCondition: -18,
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
          secondColumnTitle: 'Cut Line in the Flames',
          secondColumnSelectedPreference: 'Order 30 dozer crews to cut a fireline in lethal conditions to buy time for split ops',
          secondValue: 'Efficiency',
          secondColumnaffected: 2000,
          secondColumnRisk: '600 deaths total (incl. 30 responders)',
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
          resourceUse: 44,
          infrastructureDamage: 32,
          biodiversityImpact: 70,
          ethicalFairness: 65,
          populationSafety: 70
        },
        // BRIDGE DILEMMA (direct sacrifice)
        cvrQuestion: {
          descriptionTile: '🪓 Cut Line in the Flames',
          description:
            'To run a split operation, 30 dozer crews must cut a critical fireline through a flashover zone. They will not survive, but the line buys time to evacuate 1,400 people and hold parts of the reserve.',
          question:
            'Would you order 30 responders to cut a lethal fireline so that 1,400 can be saved and habitats partially preserved?',
          value: 'Efficiency'
        }
      },
      {
        id: 'preserve-ecological-integrity',
        title: 'Prioritize Ecological Defense',
        label: 'sustainability',
        description:
          'Deploy firefighting resources to defend biodiversity hotspots and natural heritage areas. This decision limits damage to the ecosystem but delays human evacuation and increases casualties.',
        impact: {
          livesSaved: 800,
          humanCasualties: 1200,
          firefightingResource: -24,
          infrastructureCondition: -12,
          biodiversityCondition: -15,
          propertiesCondition: -14,
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
          secondColumnTitle: 'Backburn the Villages',
          secondColumnSelectedPreference: 'Ignite backburns to save the reserve, overrunning villages',
          secondValue: 'Sustainability',
          secondColumnaffected: 2000,
          secondColumnRisk: '1200 casualties (incl. 45 responders)',
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
          resourceUse: 48,
          infrastructureDamage: 24,
          biodiversityImpact: 30,
          ethicalFairness: 40,
          populationSafety: 40
        },
        // BRIDGE DILEMMA (direct sacrifice)
        cvrQuestion: {
          descriptionTile: '🔥 Backburn the Villages',
          description:
            'Commanders can ignite broad backburns to shield the reserve’s core. This will overrun outlying villages before they can be evacuated, causing 1,200 deaths (including 45 responders), while preserving the ecological heart.',
          question:
            'Would you deliberately ignite backburns that will overrun villages—causing 1,200 deaths—to save the biodiversity reserve?',
          value: 'Sustainability'
        }
      },
      {
        id: 'equitable-response-allocation',
        title: 'Ensure Equitable Protection Across Communities',
        label: 'fairness',
        description:
          'Distribute firefighting and evacuation efforts evenly between small rural villages and ecological assets, ensuring no community or habitat is deprioritized. This leads to moderate outcomes across all dimensions but avoids ethical favoritism.',
        impact: {
          livesSaved: 1200,
          humanCasualties: 800,
          firefightingResource: -26,
          infrastructureCondition: -18,
          biodiversityCondition: -28,
          propertiesCondition: -18,
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
          secondColumnTitle: 'Equal Sacrifice Mandate',
          secondColumnSelectedPreference: 'Assign equal high-risk posts across regions; 35 responders hold until overrun',
          secondValue: 'Fairness',
          secondColumnaffected: 2000,
          secondColumnRisk: '800 deaths total (incl. 35 responders)',
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
          resourceUse: 52,
          infrastructureDamage: 36,
          biodiversityImpact: 56,
          ethicalFairness: 90,
          populationSafety: 60
        },
        // BRIDGE DILEMMA (direct sacrifice)
        cvrQuestion: {
          descriptionTile: '🟰 Equal Sacrifice Mandate',
          description:
            'To guarantee parity, commanders assign equal numbers of high-risk posts across all regions. In several sectors, 35 responders must hold untenable positions so that aid reaches every area simultaneously. Those 35 will die; 1,200 civilians are saved and 800 perish.',
          question:
            'Would you require equal high-risk postings—knowing 35 responders will certainly die—to keep aid perfectly unbiased?',
          value: 'Fairness'
        }
      },
      {
        id: 'do-no-harm-doctrine',
        title: 'Minimize Harm Across All Fronts',
        label: 'nonmaleficence',
        description:
          'Adopt a conservative approach that aims to avoid irreversible damage in any single area. Focus efforts on minimizing harm to humans, firefighters, ecosystems, and infrastructure, even if this results in moderate damage across all dimensions.',
        impact: {
          livesSaved: 1000,
          humanCasualties: 1000,
          firefightingResource: -20,
          infrastructureCondition: -16,
          biodiversityCondition: -22,
          propertiesCondition: -16,
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
          secondColumnTitle: 'Guides in the Smoke',
          secondColumnSelectedPreference: 'Order 25 guides to lead routes through lethal smoke to prevent catastrophic loss elsewhere',
          secondValue: 'Nonmaleficence',
          secondColumnaffected: 2000,
          secondColumnRisk: '1000 deaths total (incl. 25 responders)',
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
          resourceUse: 40,
          infrastructureDamage: 32,
          biodiversityImpact: 44,
          ethicalFairness: 85,
          populationSafety: 50
        },
        // BRIDGE DILEMMA (direct sacrifice)
        cvrQuestion: {
          descriptionTile: '🧭 Guides in the Smoke',
          description:
            'To avoid catastrophic losses in any single domain, commanders direct 25 veteran guides to lead evacuees through a toxic smoke corridor. The guides will certainly die, but this prevents a worst‑case collapse elsewhere, saving 1,000 people while 1,000 still perish.',
          question:
            'Would you order 25 guides to certain death to prevent any single area from total collapse, accepting 1,000 total deaths?',
          value: 'Nonmaleficence'
        }
      }
    ]
  }
];
