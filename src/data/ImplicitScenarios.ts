import { PreferenceScenario } from '../types/implicitPrefernce';

export const scenarios: PreferenceScenario[] = [
    {
        id: 'hospital-triage',
        title: '🏥 Hospital Emergency Triage',
        scenario: 'A hospital has limited resources during a crisis. Should they prioritize treating many patients with moderate injuries or focus on fewer patients with severe conditions?',
        options: [
            { text: 'Treat many moderate injuries (maximizing efficiency)', value: 'efficiency' },
            { text: 'Focus on severe cases (prioritizing individual care)', value: 'nonmaleficence' }
        ],
        followUpQuestions: {
            efficiency: {
                question: 'In a different scenario, if a company needs to cut costs, would you prefer laying off a few high-salary employees or implementing smaller pay cuts across the entire workforce?',
                valueIfYes: { name: 'Efficiency', type: 'Stable' },
                valueIfNo: [
                    { name: 'Efficiency', type: 'Context-Dependent' },
                    { name: 'Nonmaleficence', type: 'Context-Dependent' }
                ]
            },
            nonmaleficence: {
                question: 'If you were developing a new medication, would you also prioritize thoroughly testing for rare but severe side effects, even if it delays helping many patients with moderate conditions?',
                valueIfYes: { name: 'Nonmaleficence', type: 'Stable' },
                valueIfNo: [
                    { name: 'Nonmaleficence', type: 'Context-Dependent' },
                    { name: 'Efficiency', type: 'Context-Dependent' }
                ]
            }
        }
    },
    {
        id: 'environmental-project',
        title: '🌍 Environmental Project Decision',
        scenario: 'A city must choose between implementing immediate but temporary pollution controls or a longer-term sustainable solution that takes more time to show results.',
        options: [
            { text: 'Quick temporary solution (immediate impact)', value: 'efficiency' },
            { text: 'Long-term sustainable approach (future impact)', value: 'sustainability' }
        ],
        followUpQuestions: {
            efficiency: {
                question: 'In managing a wildlife conservation project, would you also choose quick-fix solutions over more comprehensive but time-consuming approaches?',
                valueIfYes: { name: 'Efficiency', type: 'Stable' },
                valueIfNo: [
                    { name: 'Efficiency', type: 'Context-Dependent' },
                    { name: 'Sustainability', type: 'Context-Dependent' }
                ]
            },
            sustainability: {
                question: 'Would you support higher taxes to fund long-term environmental projects, even if it means slower economic growth in the short term?',
                valueIfYes: { name: 'Sustainability', type: 'Stable' },
                valueIfNo: [
                    { name: 'Sustainability', type: 'Context-Dependent' },
                    { name: 'Efficiency', type: 'Context-Dependent' }
                ]
            }
        }
    },
    {
        id: 'safety-protocol',
        title: '🛡️ Workplace Safety Protocol',
        scenario: 'A manufacturing plant must decide between maintaining current production levels with standard safety measures or reducing output to implement enhanced safety protocols.',
        options: [
            { text: 'Maintain production with current safety', value: 'efficiency' },
            { text: 'Reduce output for enhanced safety', value: 'safety' }
        ],
        followUpQuestions: {
            efficiency: {
                question: 'In a different context, would you also prioritize meeting project deadlines over implementing additional safety measures in construction work?',
                valueIfYes: { name: 'Efficiency', type: 'Stable' },
                valueIfNo: [
                    { name: 'Efficiency', type: 'Context-Dependent' },
                    { name: 'Safety', type: 'Context-Dependent' }
                ]
            },
            safety: {
                question: 'Would you support mandatory safety training in all industries, even if it significantly increases operational costs and reduces productivity?',
                valueIfYes: { name: 'Safety', type: 'Stable' },
                valueIfNo: [
                    { name: 'Safety', type: 'Context-Dependent' },
                    { name: 'Efficiency', type: 'Context-Dependent' }
                ]
            }
        }
    },
    {
        id: 'resource-distribution',
        title: '⚖️ Resource Distribution',
        scenario: 'A community must decide how to distribute limited educational resources: either equally across all schools or based on individual school needs and performance.',
        options: [
            { text: 'Equal distribution', value: 'fairness' },
            { text: 'Need-based distribution', value: 'efficiency' }
        ],
        followUpQuestions: {
            fairness: {
                question: 'In healthcare resource allocation, would you also support equal distribution of resources regardless of population density or specific community needs?',
                valueIfYes: { name: 'Fairness', type: 'Stable' },
                valueIfNo: [
                    { name: 'Fairness', type: 'Context-Dependent' },
                    { name: 'Efficiency', type: 'Context-Dependent' }
                ]
            },
            efficiency: {
                question: 'Would you support allocating more resources to high-performing schools to maximize overall educational outcomes?',
                valueIfYes: { name: 'Efficiency', type: 'Stable' },
                valueIfNo: [
                    { name: 'Efficiency', type: 'Context-Dependent' },
                    { name: 'Fairness', type: 'Context-Dependent' }
                ]
            }
        }
    },
    {
        id: 'medical-research',
        title: '🔬 Medical Research Ethics',
        scenario: 'A research institution must decide between fast-tracking a promising treatment with unknown long-term effects or conducting extended trials to ensure complete safety.',
        options: [
            { text: 'Fast-track the treatment', value: 'efficiency' },
            { text: 'Conduct extended trials', value: 'nonmaleficence' }
        ],
        followUpQuestions: {
            efficiency: {
                question: 'In drug development, would you also support accelerated approval processes for potentially life-saving medications, even with limited long-term safety data?',
                valueIfYes: { name: 'Efficiency', type: 'Stable' },
                valueIfNo: [
                    { name: 'Efficiency', type: 'Context-Dependent' },
                    { name: 'Nonmaleficence', type: 'Context-Dependent' }
                ]
            },
            nonmaleficence: {
                question: 'Would you maintain the same cautious approach in testing new technologies that could immediately improve quality of life but might have unknown long-term impacts?',
                valueIfYes: { name: 'Nonmaleficence', type: 'Stable' },
                valueIfNo: [
                    { name: 'Nonmaleficence', type: 'Context-Dependent' },
                    { name: 'Efficiency', type: 'Context-Dependent' }
                ]
            }
        }
    }
];