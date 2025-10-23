import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, AlertCircle, FileCheck, Brain, BarChart2, ArrowLeft, ArrowRight } from 'lucide-react';
import type { DeepValue } from '../types/implicitPrefernce';
import type { ExplicitValue } from '../types/explicitValues';
import { explicitQuestions } from '../data/explicitQuestions';
import { scenarios } from '../data/ImplicitScenarios';
import { DatabaseService } from '../lib/databaseService';
import ProgressTracker from '../components/ProgressTracker';

// Interface for tracking value frequency in explicit choices
interface ValueFrequency {
    value: string;
    count: number;
    percentage: number;
}

// Interface for organizing values by their stability type
interface GroupedValues {
    stable: Array<{ scenarioId: string; value: DeepValue }>;
    contextDependent: Array<{ scenarioId: string; values: DeepValue[] }>;
}

// Interface for matched stable values with their match percentage
interface MatchedStableValue {
    name: string;
    matchPercentage: number;
}

/**
 * ValuesPage Component
 * 
 * This component displays the results of both explicit and implicit value assessments,
 * showing how a user's direct choices align with their deeper value patterns.
 * 
 * Key features:
 * - Displays explicit value choices from scenario responses
 * - Shows identified deep values from implicit assessment
 * - Calculates and displays value alignment statistics
 * - Orders matched stable values by match percentage
 */
const ValuesPage: React.FC = () => {
    const navigate = useNavigate();

    // State management for various value types and calculations
    const [deepValues, setDeepValues] = useState<DeepValue[]>([]);
    const [groupedValues, setGroupedValues] = useState<GroupedValues>({ stable: [], contextDependent: [] });
    const [explicitValues, setExplicitValues] = useState<ExplicitValue[]>([]);
    const [valueFrequencies, setValueFrequencies] = useState<ValueFrequency[]>([]);
    const [matchPercentage, setMatchPercentage] = useState({ stable: 0, contextDependent: 0 });
    const [showError, setShowError] = useState(false);
    const [matchedStableValues, setMatchedStableValues] = useState<MatchedStableValue[]>([]);
    const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

    useEffect(() => {
        // Retrieve saved assessment data from localStorage
        const savedDeepValues = localStorage.getItem('deepValues');
        const savedExplicitValues = localStorage.getItem('explicitValues');
        const savedResponses = localStorage.getItem('userResponses');

        if (!savedDeepValues || !savedExplicitValues || !savedResponses) {
            setShowError(true);
            return;
        }

        try {
            const parsedDeepValues = JSON.parse(savedDeepValues);
            const parsedResponses = JSON.parse(savedResponses);
            const parsedExplicitValues = JSON.parse(savedExplicitValues);
            
            setDeepValues(parsedDeepValues);
            setExplicitValues(parsedExplicitValues);

            // Group values by stability and scenario
            const grouped: GroupedValues = { stable: [], contextDependent: [] };
            parsedResponses.forEach((response: any, index: number) => {
                const scenarioId = response.scenarioId;
                const scenario = scenarios.find(s => s.id === scenarioId);
                const scenarioTitle = scenario ? scenario.title : `Scenario ${index + 1}`;

                if (response.deepValues.length === 1) {
                    grouped.stable.push({
                        scenarioId: scenarioTitle,
                        value: response.deepValues[0]
                    });
                } else if (response.deepValues.length === 2) {
                    grouped.contextDependent.push({
                        scenarioId: scenarioTitle,
                        values: response.deepValues
                    });
                }
            });
            setGroupedValues(grouped);

            // Calculate value frequencies from explicit choices
            const frequencies: { [key: string]: number } = {};
            parsedExplicitValues.forEach((value: ExplicitValue) => {
                frequencies[value.value_selected] = (frequencies[value.value_selected] || 0) + 1;
            });

            const totalValues = parsedExplicitValues.length;
            const frequencyArray = Object.entries(frequencies).map(([value, count]) => ({
                value,
                count,
                percentage: (count / totalValues) * 100
            })).sort((a, b) => b.count - a.count);

            setValueFrequencies(frequencyArray);

            // Get unique stable values and calculate their match percentages
            const uniqueStableValues = Array.from(new Set(
                parsedDeepValues
                    .filter((v: DeepValue) => v.type === 'Stable')
                    .map((v: DeepValue) => v.name)
            ));

            const contextDependentValues = parsedDeepValues
                .filter((v: DeepValue) => v.type === 'Context-Dependent')
                .map((v: DeepValue) => v.name);

            // Calculate matches for unique stable values and filter out zero matches
            const matchedValues: MatchedStableValue[] = uniqueStableValues
                .map(value => {
                    const matchingFreq = frequencyArray.find(freq => freq.value === value);
                    return {
                        name: value,
                        matchPercentage: matchingFreq ? matchingFreq.percentage : 0
                    };
                })
                .filter(value => value.matchPercentage > 0)
                .sort((a, b) => b.matchPercentage - a.matchPercentage);

            setMatchedStableValues(matchedValues);

            // Calculate overall match percentages
            let stableMatches = 0;
            let contextMatches = 0;

            frequencyArray.forEach(freq => {
                if (uniqueStableValues.includes(freq.value)) stableMatches++;
                if (contextDependentValues.includes(freq.value)) contextMatches++;
            });

            setMatchPercentage({
                stable: uniqueStableValues.length ? (stableMatches / uniqueStableValues.length) * 100 : 0,
                contextDependent: contextDependentValues.length ? (contextMatches / contextDependentValues.length) * 100 : 0
            });

        } catch (error) {
            console.error('Error parsing saved values:', error);
            setShowError(true);
        }
    }, []);

    // Handler for starting the simulation
    const handleStartSimulation = async () => {
        try {
            const sessionId = DatabaseService.getSessionId();

            const userValues = {
                explicit: explicitValues.map(v => v.value_selected),
                implicit: deepValues.map(v => v.name)
            };
            localStorage.setItem('userValues', JSON.stringify(userValues));

            // Only pass the first two top values to the simulation
            const topTwoValues = matchedStableValues.slice(0, 2);
            localStorage.setItem('finalValues', JSON.stringify(topTwoValues));

            const baselineValues = topTwoValues.map((value, index) => ({
                session_id: sessionId,
                value_name: value.name,
                match_percentage: value.matchPercentage,
                rank_order: index + 1,
                value_type: 'stable'
            }));

            await DatabaseService.insertBaselineValues(baselineValues);

            await DatabaseService.insertValueEvolution({
                session_id: sessionId,
                scenario_id: 0,
                value_list_snapshot: topTwoValues,
                change_trigger: 'baseline_established',
                change_type: 'initial'
            });

            navigate('/simulation');
        } catch (error) {
            console.error('Failed to save values:', error);
        }
    };

    // Helper function to get question text from ID
    const getQuestionText = (questionId: number) => {
        const question = explicitQuestions.find(q => q.id === questionId);
        return question ? question.scenario : 'Unknown Question';
    };

    // Helper function to get selected option label
    const getSelectedOptionLabel = (questionId: number, value: string) => {
        const question = explicitQuestions.find(q => q.id === questionId);
        if (!question) return value;
        const option = question.options.find(opt => opt.value === value);
        return option ? `${option.icon} ${option.value} - ${option.label}` : value;
    };

    // Error state display
    if (showError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <p className="ml-3 text-red-700">
                            Please complete both the explicit and implicit value assessments first.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/explicitvaluepage')}
                        className="mt-2 text-red-600 hover:text-red-800 font-medium"
                    >
                        Start from the beginning
                    </button>
                </div>
            </div>
        );
    }

    const progressSteps = [
        { id: 'explicit', label: 'Explicit Values' },
        { id: 'hospital', label: 'Hospital' },
        { id: 'environment', label: 'Environment' },
        { id: 'safety', label: 'Safety' },
        { id: 'resources', label: 'Resources' },
        { id: 'medical', label: 'Medical' },
        { id: 'results', label: 'Results' },
        { id: 'simulation', label: 'Simulation', isLarger: true }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center space-x-3">
                        <Scale className="h-8 w-8 text-purple-600" />
                        <h1 className="text-2xl font-bold text-gray-900">
                            Value Assessment Results
                        </h1>
                    </div>
                </div>
            </header>

            <ProgressTracker currentStep={6} steps={progressSteps} />

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {!showDetailedAnalysis ? (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-lg p-8 mb-8 border border-blue-100">
                            <div className="flex items-center justify-center mb-6">
                                <div className="bg-white rounded-full p-4 shadow-md">
                                    <Brain className="h-12 w-12 text-blue-600" />
                                </div>
                            </div>

                            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
                                Your Value Analysis is Complete
                            </h2>

                            <p className="text-center text-gray-700 text-lg mb-8 max-w-2xl mx-auto">
                                Thank you for completing both assessments. Based on your responses to explicit and implicit value questions,
                                we've identified {matchedStableValues.length === 1 ? 'your' : 'your top'} matched stable {matchedStableValues.length === 1 ? 'value' : 'values'}:
                            </p>

                            <div className="space-y-4 mb-8">
                                {matchedStableValues.slice(0, 2).map((value, index) => (
                                    <div key={index} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 transform transition-all duration-300 hover:shadow-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-2xl font-bold text-gray-900">{value.name}</h3>
                                            <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full">
                                                {value.matchPercentage.toFixed(1)}% Match
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm">
                                            This value consistently appeared across your responses, indicating it's a core part of your decision-making.
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {matchedStableValues.length === 0 && (
                                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                                    <p className="text-center text-gray-700">
                                        We're still analyzing your responses. Your value patterns will be used in the upcoming simulation.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
                            <div className="max-w-2xl mx-auto mb-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    Want to understand how we identified these values?
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    We used a comprehensive analysis comparing your explicit choices with patterns from implicit scenarios.
                                    If you're curious about the methodology and detailed breakdown, you can explore the full analysis below.
                                </p>
                                <p className="text-sm text-gray-500 mt-3 italic">
                                    Exploring the detailed analysis is completely optional
                                </p>
                            </div>

                            <button
                                onClick={() => setShowDetailedAnalysis(true)}
                                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
                            >
                                <BarChart2 className="h-5 w-5" />
                                Explore Why
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="mb-6 flex justify-center">
                            <button
                                onClick={() => setShowDetailedAnalysis(false)}
                                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-300 font-medium flex items-center gap-2 border border-gray-300"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Summary
                            </button>
                        </div>

                        {/* Matched Stable Values Section */}
                        {matchedStableValues.length > 0 && (
                            <div className="bg-white rounded-lg shadow p-6 mb-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Brain className="h-6 w-6 text-blue-600" />
                                    <h2 className="text-xl font-bold text-gray-900">Matched Stable Values</h2>
                                </div>
                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
                                    <p className="text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">What are Matched Stable Values?</span> These values appeared consistently across your implicit scenarios and align with your explicit value choices. The match percentage indicates how frequently each stable value appeared in your explicit responses, demonstrating the strength of alignment between your conscious choices and underlying decision patterns. Higher percentages suggest these values are deeply integrated into your decision-making framework.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    {matchedStableValues.map((value, index) => (
                                        <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-blue-900">{value.name}</span>
                                                <span className="text-blue-700">
                                                    Match: {value.matchPercentage.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="mt-2 bg-blue-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${value.matchPercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Explicit Values Section */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <FileCheck className="h-6 w-6 text-blue-600" />
                                    <h2 className="text-xl font-bold text-gray-900">Explicit Values</h2>
                                </div>
                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded-r-lg">
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">Understanding Explicit Values:</span> These are the values you consciously selected when presented with straightforward ethical scenarios. Your direct choices provide insight into your stated value preferences and help us understand what you believe guides your decisions. Each scenario below shows the specific value you prioritized.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    {explicitValues.map((value, index) => (
                                        <div key={index} className="bg-blue-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-600 mb-2">
                                                Scenario: {getQuestionText(value.question_id)}
                                            </p>
                                            <p className="text-sm font-medium text-blue-800">
                                                Your Choice: {getSelectedOptionLabel(value.question_id, value.value_selected)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Deep Values Section */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Brain className="h-6 w-6 text-green-600" />
                                    <h2 className="text-xl font-bold text-gray-900">Implicit Values</h2>
                                </div>
                                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4 rounded-r-lg">
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-gray-900">Understanding Implicit Values:</span> These values emerged from analyzing your preference patterns in complex scenarios where you ranked multiple options. Unlike explicit choices, these reflect the underlying values that guide your decision-making when faced with nuanced trade-offs. Stable values appeared consistently, while context-dependent values varied based on situational factors.
                                    </p>
                                </div>

                                {/* Stable Values */}
                                {groupedValues.stable.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Stable Values</h3>
                                        <div className="space-y-3">
                                            {groupedValues.stable.map((item, index) => (
                                                <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">{item.scenarioId}</span>
                                                        <span className="font-medium text-green-700">{item.value.name}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Context-Dependent Values */}
                                {groupedValues.contextDependent.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Context-Dependent Values</h3>
                                        <div className="space-y-3">
                                            {groupedValues.contextDependent.map((item, index) => (
                                                <div key={index} className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                                    <div className="mb-2 text-sm text-gray-600">{item.scenarioId}</div>
                                                    <div className="flex items-center gap-3">
                                                        {item.values.map((value, vIndex) => (
                                                            <span key={vIndex} className="px-3 py-1 bg-yellow-100 rounded-full text-yellow-800 text-sm">
                                                                {value.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Value Comparison Section */}
                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart2 className="h-6 w-6 text-teal-600" />
                                <h2 className="text-xl font-bold text-gray-900">Value Alignment Analysis</h2>
                            </div>
                            <div className="bg-teal-50 border-l-4 border-teal-400 p-4 mb-6 rounded-r-lg">
                                <p className="text-gray-700 leading-relaxed">
                                    <span className="font-semibold text-gray-900">How Value Alignment Works:</span> This section compares your explicit value choices with your implicit values to measure consistency. The frequency analysis shows which values you chose most often in explicit scenarios, while the alignment metrics reveal how well your stated preferences match your underlying decision patterns. Strong alignment suggests coherent value integration across different decision contexts.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Most Common Explicit Values */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Most Common Explicit Values</h3>
                                    <p className="text-sm text-gray-600 mb-3">
                                        These bars show how frequently each value appeared in your explicit choices. Higher percentages indicate values you consistently prioritized across different scenarios.
                                    </p>
                                    {valueFrequencies.map((freq, index) => (
                                        <div key={index} className="bg-teal-50 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-teal-900">{freq.value}</span>
                                                <span className="text-teal-700">
                                                    {freq.percentage.toFixed(1)}% ({freq.count} times)
                                                </span>
                                            </div>
                                            <div className="mt-2 bg-teal-200 rounded-full h-2">
                                                <div
                                                    className="bg-teal-600 h-2 rounded-full"
                                                    style={{ width: `${freq.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Value Alignment Stats */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Value Alignment</h3>
                                    <p className="text-sm text-gray-600 mb-3">
                                        These metrics measure how well your explicit choices align with your implicit values. Higher alignment percentages indicate greater consistency between what you consciously choose and what your decision patterns reveal.
                                    </p>

                                    {/* Stable Values Match */}
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-green-900">Match with Stable Values</span>
                                            <span className="text-green-700">{matchPercentage.stable.toFixed(1)}%</span>
                                        </div>
                                        <div className="bg-green-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{ width: `${matchPercentage.stable}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Context-Dependent Values Match */}
                                    <div className="bg-yellow-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-yellow-900">Match with Context-Dependent Values</span>
                                            <span className="text-yellow-700">{matchPercentage.contextDependent.toFixed(1)}%</span>
                                        </div>
                                        <div className="bg-yellow-200 rounded-full h-2">
                                            <div
                                                className="bg-yellow-600 h-2 rounded-full"
                                                style={{ width: `${matchPercentage.contextDependent}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                                        <p className="text-sm text-gray-600">
                                            {matchPercentage.stable > matchPercentage.contextDependent
                                                ? "Your explicit choices align more strongly with your stable deep values, suggesting consistent ethical decision-making patterns."
                                                : "Your explicit choices show more alignment with context-dependent values, indicating flexibility in your decision-making approach."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between">
                    <button
                        onClick={() => navigate('/preferences')}
                        className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors duration-300 flex items-center gap-2"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Back to Preferences
                    </button>
                    <button
                        onClick={handleStartSimulation}
                        className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors duration-300 flex items-center gap-2"
                    >
                        Start Simulation
                        <ArrowRight className="h-5 w-5" />
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ValuesPage;