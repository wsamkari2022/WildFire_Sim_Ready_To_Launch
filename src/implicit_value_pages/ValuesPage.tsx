import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, AlertCircle, FileCheck, Brain, BarChart2, ArrowLeft, ArrowRight } from 'lucide-react';
import type { DeepValue } from '../types/implicitPrefernce';
import type { ExplicitValue } from '../types/explicitValues';
import { explicitQuestions } from '../data/explicitQuestions';
import { scenarios } from '../data/ImplicitScenarios';
import { DatabaseService } from '../lib/databaseService';

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

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Matched Stable Values Section */}
                {matchedStableValues.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Brain className="h-6 w-6 text-purple-600" />
                            <h2 className="text-xl font-bold text-gray-900">Matched Stable Values</h2>
                        </div>
                        <div className="space-y-3">
                            {matchedStableValues.map((value, index) => (
                                <div key={index} className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-purple-900">{value.name}</span>
                                        <span className="text-purple-700">
                                            Match: {value.matchPercentage.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="mt-2 bg-purple-200 rounded-full h-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full"
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
                        <p className="text-gray-600 mb-4">
                            Your direct responses to everyday ethical scenarios reveal these value preferences:
                        </p>
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
                            <Brain className="h-6 w-6 text-purple-600" />
                            <h2 className="text-xl font-bold text-gray-900">Implicit Values</h2>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Through analysis of your decision patterns, these deeper values were identified:
                        </p>
                        
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
                        <BarChart2 className="h-6 w-6 text-indigo-600" />
                        <h2 className="text-xl font-bold text-gray-900">Value Alignment Analysis</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Most Common Explicit Values */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">Most Common Explicit Values</h3>
                            {valueFrequencies.map((freq, index) => (
                                <div key={index} className="bg-indigo-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-indigo-900">{freq.value}</span>
                                        <span className="text-indigo-700">
                                            {freq.percentage.toFixed(1)}% ({freq.count} times)
                                        </span>
                                    </div>
                                    <div className="mt-2 bg-indigo-200 rounded-full h-2">
                                        <div
                                            className="bg-indigo-600 h-2 rounded-full"
                                            style={{ width: `${freq.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Value Alignment Stats */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">Value Alignment</h3>
                            
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