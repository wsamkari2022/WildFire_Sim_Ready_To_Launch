import React, { useState, useEffect } from 'react';
import { ArrowLeft, MoveVertical, AlertCircle, Scale, Zap, Leaf, Shield, Ban, Calculator, Brain, ArrowRight, Sparkles, Target, Eye } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { DecisionOption, MainScenario } from '../types';
import RankedOptionsView from './RankedOptionsView';
import { TrackingManager } from '../utils/trackingUtils';

const valueIcons: { [key: string]: JSX.Element } = {
  'Safety': <Shield size={16} className="text-red-500" />,
  'Efficiency': <Zap size={16} className="text-yellow-500" />,
  'Sustainability': <Leaf size={16} className="text-green-500" />,
  'Fairness': <Scale size={16} className="text-blue-500" />,
  'Nonmaleficence': <Ban size={16} className="text-rose-500" />
};

interface AdaptivePreferenceViewProps {
  onBack: () => void;
  selectedOption: DecisionOption;
  mainScenario: MainScenario;
  onConfirm: (option: DecisionOption, isTop2: boolean) => void;
  scenarioId?: number;
  isLastScenario?: boolean;
}

const simulationMetrics = [
  { id: 'livesSaved', label: 'Lives Saved' },
  { id: 'casualties', label: 'Casualties' },
  { id: 'resources', label: 'Resources' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'biodiversity', label: 'Biodiversity' },
  { id: 'properties', label: 'Properties' },
  { id: 'nuclear', label: 'Nuclear Safety' }
];

const moralValues = [
  { id: 'safety', label: 'Safety' },
  { id: 'efficiency', label: 'Efficiency' },
  { id: 'sustainability', label: 'Sustainability' },
  { id: 'fairness', label: 'Fairness' },
  { id: 'nonmaleficence', label: 'Nonmaleficence' }
];

const AdaptivePreferenceView: React.FC<AdaptivePreferenceViewProps> = ({
  onBack,
  selectedOption,
  mainScenario,
  onConfirm,
  scenarioId = 1,
  isLastScenario = false
}) => {
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [valueOrder, setValueOrder] = useState([
    "Safety",
    "Efficiency",
    "Sustainability",
    "Fairness",
    "Nonmaleficence"
  ]);
  const [preferenceType, setPreferenceType] = useState<'metrics' | 'values' | null>(null);
  const [rankingItems, setRankingItems] = useState<Array<{ id: string; label: string }>>(simulationMetrics);
  const [showRankedOptions, setShowRankedOptions] = useState(false);
  const [showMetricTooltip, setShowMetricTooltip] = useState(true);
  const [hasClickedButton, setHasClickedButton] = useState(() => localStorage.getItem('hasClickedPreferenceButton') === 'true');
  const [showButtonTooltip, setShowButtonTooltip] = useState(() => localStorage.getItem('hasClickedPreferenceButton') !== 'true');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Get user's current stable values from localStorage
  const getStableValues = () => {
    try {
      const finalTopTwoValuesStr = localStorage.getItem('FinalTopTwoValues');
      if (finalTopTwoValuesStr) {
        const finalTopTwoValues = JSON.parse(finalTopTwoValuesStr);

        // FinalTopTwoValues is an array of lowercase strings like ["efficiency", "safety"]
        // Capitalize first letter of each value for display
        const firstValue = finalTopTwoValues[0]
          ? finalTopTwoValues[0].charAt(0).toUpperCase() + finalTopTwoValues[0].slice(1)
          : null;
        const secondValue = finalTopTwoValues[1]
          ? finalTopTwoValues[1].charAt(0).toUpperCase() + finalTopTwoValues[1].slice(1)
          : null;

        // If both values exist and are different, return both
        if (firstValue && secondValue && firstValue !== secondValue) {
          return [firstValue, secondValue];
        }
        // If only one value exists, return it with null for second
        return [firstValue || 'Safety', null];
      }
    } catch (error) {
      console.error('Error parsing FinalTopTwoValues:', error);
    }
    return ['Safety', null];
  };

  const [topStableValue, secondStableValue] = getStableValues();
  const hasMultipleStableValues = secondStableValue !== null;
  const selectedValueLabel = selectedOption.label || 'Unknown';

  const getReorderedMoralValues = (
    selectedLabel: string,
    topValue: string,
    secondValue: string | null,
    scenario: number
  ) => {
    if (scenario !== 1 && scenario !== 2) {
      return moralValues;
    }

    const normalizeValue = (value: string) => {
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    };

    const normalizedSelected = normalizeValue(selectedLabel);
    const normalizedTop = normalizeValue(topValue);
    const normalizedSecond = secondValue ? normalizeValue(secondValue) : null;

    const orderedLabels: string[] = [normalizedSelected];

    if (normalizedTop && !orderedLabels.includes(normalizedTop)) {
      orderedLabels.push(normalizedTop);
    }

    if (normalizedSecond && !orderedLabels.includes(normalizedSecond)) {
      orderedLabels.push(normalizedSecond);
    }

    const remainingValues = moralValues.filter(
      value => !orderedLabels.includes(value.label)
    );

    const reorderedValues = orderedLabels.map(label => {
      const matchingValue = moralValues.find(v => v.label === label);
      return matchingValue || { id: label.toLowerCase(), label: label };
    });

    return [...reorderedValues, ...remainingValues];
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(rankingItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setRankingItems(items);
  };

  const handleContinue = () => {
    if (!preferenceType || rankingItems.length === 0) return;

    // Track APA reordering with scenario context
    const valuesBefore = preferenceType === 'values' ? moralValues.map(v => v.id) : simulationMetrics.map(m => m.id);
    const valuesAfter = rankingItems.map((item: any) => item.id);
    TrackingManager.recordAPAReordering(
      mainScenario.id,
      valuesBefore,
      valuesAfter,
      preferenceType as 'metrics' | 'values'
    );

    localStorage.setItem('preferenceTypeFlag', preferenceType === 'metrics' ? 'true' : 'false');

    if (preferenceType === 'metrics') {
      localStorage.setItem('simulationMetricsRanking', JSON.stringify(rankingItems));
      localStorage.setItem('SimulationMetricsReorderList', JSON.stringify(rankingItems));

      // Set SimulationMetricsReorderingFlag to true and MoralValuesReorderingFlag to false
      localStorage.setItem('simulationMetricsReorderingFlag', 'true');
      localStorage.setItem('moralValuesReorderingFlag', 'false');

      // Increment counter for simulation metrics selection
      const currentCount = localStorage.getItem('simulationMetricsSelectedCount');
      const newCount = currentCount ? parseInt(currentCount) + 1 : 1;
      localStorage.setItem('simulationMetricsSelectedCount', newCount.toString());
    } else {
      localStorage.setItem('moralValuesRanking', JSON.stringify(rankingItems));
      localStorage.setItem('MoralValuesReorderList', JSON.stringify(rankingItems));

      // Set MoralValuesReorderingFlag to true and SimulationMetricsReorderingFlag to false
      localStorage.setItem('moralValuesReorderingFlag', 'true');
      localStorage.setItem('simulationMetricsReorderingFlag', 'false');

      // Increment counter for moral values selection
      const currentCount = localStorage.getItem('moralValuesSelectedCount');
      const newCount = currentCount ? parseInt(currentCount) + 1 : 1;
      localStorage.setItem('moralValuesSelectedCount', newCount.toString());
    }

    setShowRankedOptions(true);
  };

  if (showRankedOptions) {
    return (
      <RankedOptionsView
        scenario={mainScenario}
        onBack={() => {
          setShowRankedOptions(false);
          onBack();
        }}
        onConfirm={(option, isTop2) => onConfirm(option, isTop2)}
        currentMetrics={{
          livesSaved: 0,
          humanCasualties: 0,
          firefightingResource: 100,
          infrastructureCondition: 100,
          biodiversityCondition: 100,
          propertiesCondition: 100,
          nuclearPowerStation: 100,
        }}
        onReorderPriorities={() => {
          setShowRankedOptions(false);
        }}
      />
    );
  }

  const { comparisonTableColumnContent } = selectedOption;

  // Special case: Scenario 3 with CVR "No" response - show full content without reordering
  if (isLastScenario && scenarioId === 3) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen p-6 flex-1 flex flex-col">
        <div className="max-w-5xl mx-auto w-full">
          <button
            onClick={onBack}
            className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Scenario 3
          </button>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center tracking-tight leading-tight">
              Your Recent Choice Doesn't Fully Match Your Stated Priorities
            </h1>

            <div className="bg-gradient-to-r from-blue-50 to-teal-50 border-l-4 border-blue-500 p-6 rounded-r-xl mb-8 shadow-sm">
              <div className="space-y-4">
                <p className="text-slate-700 leading-7 text-[15px]">
                  In this scenario, you selected an option that reflects a specific moral value.
                </p>
                <p className="text-slate-700 leading-7 text-[15px]">
                  When we compare this value with the priorities you set earlier, we see a misalignment: the value embedded in this choice is not among the top values you said matter most to you.
                </p>
                <p className="text-slate-800 leading-7 text-[15px] font-semibold">
                  That's not a mistake, and it doesn't mean your choice is wrong.
                </p>
                <p className="text-slate-600 leading-7 text-[15px] italic bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                  It simply means that, in this moment, your action and your stated priorities are pulling in slightly different directions.
                </p>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-md">
                  <Eye className="text-white" size={22} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">What We Detected</h2>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-300 rounded-xl p-6 space-y-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Target className="text-blue-600" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] text-slate-600 mb-2 uppercase tracking-wider font-semibold">
                      Your recent choice emphasizes
                    </p>
                    <p className="text-lg font-bold text-blue-700 tracking-tight">
                      {selectedValueLabel}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="text-emerald-600" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] text-slate-600 mb-2 uppercase tracking-wider font-semibold">
                      Your current top value {hasMultipleStableValues ? 'priorities are' : 'priority is'}
                    </p>
                    <p className="text-lg font-bold text-emerald-700 tracking-tight">
                      {hasMultipleStableValues ? `${topStableValue} and ${secondStableValue}` : topStableValue}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-300">
                  <p className="text-[15px] text-slate-700 leading-7 mb-3">
                    This suggests that your decision in this scenario is not fully aligned with your previously expressed preferences.
                  </p>
                  <p className="text-[15px] text-slate-600 leading-7 italic bg-white px-4 py-3 rounded-lg border border-slate-200">
                    You might genuinely want to act differently than your earlier ranking suggested — or you might want your preferences to better match how you're actually choosing in these situations.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-md">
                  <AlertCircle className="text-white" size={22} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">This Is Completely Normal</h2>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 space-y-4 shadow-sm">
                <p className="text-slate-700 leading-7 text-[15px]">
                  Many people discover that their actions, when faced with concrete trade-offs, don't always match the values they listed as "most important" at the start.
                </p>
                <p className="text-slate-700 leading-7 text-[15px]">
                  This page is here to help you notice that gap and decide what, if anything, you'd like to adjust.
                </p>
                <p className="text-emerald-900 leading-7 text-[15px] font-semibold italic bg-white px-4 py-3 rounded-lg border border-emerald-200">
                  It is not telling you that your decision is right or wrong.
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-lg mb-8 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <p className="text-amber-900 font-bold mb-2 text-base tracking-tight">This is the last scenario</p>
                  <p className="text-amber-800 text-[14px] leading-7">
                    You don't need to reorder your values since there are no more scenarios after this one. You can review the information below and return to the simulation to make a different choice if needed.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onBack}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg tracking-tight transition-all duration-200 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <ArrowLeft size={22} />
              Return to Scenario 3
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal flow for scenarios 1 and 2
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen p-6 flex-1 flex flex-col">
      <div className="max-w-5xl mx-auto w-full">
        <button
          onClick={onBack}
          className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Simulation
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center tracking-tight leading-tight">
            Your Recent Choice Doesn't Fully Match Your Stated Priorities
          </h1>

          <div className="bg-gradient-to-r from-blue-50 to-teal-50 border-l-4 border-blue-500 p-6 rounded-r-xl mb-8 shadow-sm">
            <div className="space-y-4">
              <p className="text-slate-700 leading-7 text-[15px]">
                In this scenario, you selected an option that reflects a specific moral value.
              </p>
              <p className="text-slate-700 leading-7 text-[15px]">
                When we compare this value with the priorities you set earlier, we see a misalignment: the value embedded in this choice is not among the top values you said matter most to you.
              </p>
              <p className="text-slate-800 leading-7 text-[15px] font-semibold">
                That's not a mistake, and it doesn't mean your choice is wrong.
              </p>
              <p className="text-slate-600 leading-7 text-[15px] italic bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                It simply means that, in this moment, your action and your stated priorities are pulling in slightly different directions.
              </p>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-md">
                <Eye className="text-white" size={22} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">What We Detected</h2>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-300 rounded-xl p-6 space-y-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Target className="text-blue-600" size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] text-slate-600 mb-2 uppercase tracking-wider font-semibold">
                    Your recent choice emphasizes
                  </p>
                  <p className="text-lg font-bold text-blue-700 tracking-tight">
                    {selectedValueLabel}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Sparkles className="text-emerald-600" size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] text-slate-600 mb-2 uppercase tracking-wider font-semibold">
                    Your current top value {hasMultipleStableValues ? 'priorities are' : 'priority is'}
                  </p>
                  <p className="text-lg font-bold text-emerald-700 tracking-tight">
                    {hasMultipleStableValues ? `${topStableValue} and ${secondStableValue}` : topStableValue}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-300">
                <p className="text-[15px] text-slate-700 leading-7 mb-3">
                  This suggests that your decision in this scenario is not fully aligned with your previously expressed preferences.
                </p>
                <p className="text-[15px] text-slate-600 leading-7 italic bg-white px-4 py-3 rounded-lg border border-slate-200">
                  You might genuinely want to act differently than your earlier ranking suggested — or you might want your preferences to better match how you're actually choosing in these situations.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-md">
                <AlertCircle className="text-white" size={22} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">This Is Completely Normal</h2>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 space-y-4 shadow-sm">
              <p className="text-slate-700 leading-7 text-[15px]">
                Many people discover that their actions, when faced with concrete trade-offs, don't always match the values they listed as "most important" at the start.
              </p>
              <p className="text-slate-700 leading-7 text-[15px]">
                This page is here to help you notice that gap and decide what, if anything, you'd like to adjust.
              </p>
              <p className="text-emerald-900 leading-7 text-[15px] font-semibold italic bg-white px-4 py-3 rounded-lg border border-emerald-200">
                It is not telling you that your decision is right or wrong.
              </p>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-xl p-8 mb-6 shadow-lg">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Target className="text-white" size={26} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">What Matters More to You Going Forward?</h2>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Adjust Your Preferences</h3>
              <p className="text-slate-700 leading-7 mb-4 text-[15px]">
                If you feel your priorities should better reflect how you are deciding in these scenarios, you can update them.
              </p>
              <p className="text-slate-700 leading-7 mb-4 text-[15px]">
                <span className="font-semibold text-slate-800">Choose what matters more right now:</span> Simulation Metrics, or Moral Values.
              </p>
              <p className="text-slate-700 leading-7 mb-5 text-[15px]">
                Reorder your preferences within that focus by dragging and dropping values from most important to least important.
              </p>
              <p className="text-slate-600 text-[15px] italic bg-slate-50 px-4 py-3 rounded-lg border border-slate-200 leading-7">
                Updating your preferences will help future scenarios and recommendations become more aligned with how you actually want to decide.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <button
                onClick={() => {
                  setPreferenceType('metrics');
                  setRankingItems(simulationMetrics);
                  if (!hasClickedButton) {
                    setHasClickedButton(true);
                    setShowButtonTooltip(false);
                    localStorage.setItem('hasClickedPreferenceButton', 'true');
                  }
                }}
                className={`py-8 px-5 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-4 shadow-sm hover:shadow-lg relative transform hover:-translate-y-1 ${
                  preferenceType === 'metrics'
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg scale-105'
                    : showButtonTooltip
                    ? 'border-blue-400 bg-white hover:border-blue-500 hover:bg-blue-50 shadow-blue-300 shadow-lg animate-pulse'
                    : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                  preferenceType === 'metrics' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gray-200'
                }`}>
                  <Calculator className={preferenceType === 'metrics' ? 'text-white' : 'text-gray-600'} size={32} />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className={`font-bold text-xl tracking-tight ${
                    preferenceType === 'metrics' ? 'text-blue-700' : 'text-slate-800'
                  }`}>
                    Simulation Metrics
                  </span>
                  <span className={`text-[13px] text-center leading-relaxed ${
                    preferenceType === 'metrics' ? 'text-blue-600' : 'text-slate-600'
                  }`}>
                    Prioritize quantifiable outcomes and measurable impact
                  </span>
                  <span className={`text-[12px] text-center leading-relaxed italic font-medium ${
                    preferenceType === 'metrics' ? 'text-blue-500' : 'text-slate-500'
                  }`}>
                    (The Context of the Problem)
                  </span>
                </div>
                {preferenceType === 'metrics' && (
                  <span className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full font-medium shadow-sm">
                    Selected
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => {
                    setPreferenceType('values');
                    const reorderedValues = getReorderedMoralValues(
                      selectedValueLabel,
                      topStableValue,
                      secondStableValue,
                      scenarioId
                    );
                    setRankingItems(reorderedValues);
                    if (!hasClickedButton) {
                      setHasClickedButton(true);
                      setShowButtonTooltip(false);
                      localStorage.setItem('hasClickedPreferenceButton', 'true');
                    }
                  }}
                  className={`w-full py-8 px-5 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-4 shadow-sm hover:shadow-lg relative transform hover:-translate-y-1 ${
                    preferenceType === 'values'
                      ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-lg scale-105'
                      : showButtonTooltip
                      ? 'border-emerald-400 bg-white hover:border-emerald-500 hover:bg-emerald-50 shadow-emerald-300 shadow-lg animate-pulse'
                      : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50'
                  }`}
                >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                  preferenceType === 'values' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gray-200'
                }`}>
                  <Brain className={preferenceType === 'values' ? 'text-white' : 'text-gray-600'} size={32} />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className={`font-bold text-xl tracking-tight ${
                    preferenceType === 'values' ? 'text-emerald-700' : 'text-slate-800'
                  }`}>
                    Moral Values
                  </span>
                  <span className={`text-[13px] text-center leading-relaxed ${
                    preferenceType === 'values' ? 'text-emerald-600' : 'text-slate-600'
                  }`}>
                    Prioritize ethical principles and fundamental values
                  </span>
                   <span className={`text-[12px] text-center leading-relaxed italic font-medium ${
                    preferenceType === 'values' ? 'text-emerald-500' : 'text-slate-500'
                  }`}>
                    (Universal Morals)
                  </span>
                </div>
                  {preferenceType === 'values' && (
                    <span className="text-xs bg-emerald-500 text-white px-3 py-1 rounded-full font-medium shadow-sm">
                      Selected
                    </span>
                  )}
                </button>
                {showButtonTooltip && (
                  <div className="absolute -top-2 -right-4 transform translate-x-full z-10 animate-bounce">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[14px] px-5 py-3 rounded-xl shadow-xl whitespace-nowrap font-semibold flex items-center gap-2 tracking-tight">
                      <Sparkles size={16} className="flex-shrink-0" />
                      Click one of these buttons to continue
                      <div className="absolute top-4 right-full transform w-0 h-0 border-t-8 border-b-8 border-r-8 border-emerald-500 border-t-transparent border-b-transparent"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {preferenceType && (
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 p-7 rounded-xl mt-8 shadow-sm">
                <h4 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2 tracking-tight">
                  <MoveVertical size={22} className="text-blue-600" />
                  Rank from 1 (most important) to {rankingItems.length} (least important)
                </h4>

                {showMetricTooltip && (
                  <div className="mb-5 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg shadow-sm">
                    <p className="text-[14px] text-blue-800 flex items-center gap-2 font-medium">
                      <Sparkles size={16} className="flex-shrink-0" />
                      <strong className="font-bold">Tip:</strong> Drag and drop items to reorder them by importance
                    </p>
                  </div>
                )}

                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="rankingList">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {rankingItems.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white p-5 rounded-lg border flex items-center gap-4 transition-all duration-150 ${
                                  snapshot.isDragging
                                    ? 'border-slate-400 shadow-xl scale-102'
                                    : 'border-slate-300 shadow-sm hover:shadow-md hover:border-slate-400'
                                }`}
                              >
                                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-bold text-base shadow-sm">
                                  {index + 1}
                                </div>
                                <span className="flex-1 font-semibold text-slate-800 text-[15px] tracking-tight">{item.label}</span>
                                <MoveVertical size={20} className="text-slate-400" />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                <button
                  onClick={handleContinue}
                  disabled={!preferenceType}
                  className={`mt-7 w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-white font-bold text-lg tracking-tight transition-all duration-200 shadow-md ${
                    preferenceType
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl transform hover:-translate-y-0.5'
                      : 'bg-slate-400 cursor-not-allowed'
                  }`}
                >
                  Continue to Next Step
                  <ArrowRight size={24} />
                </button>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-lg shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
              <p className="text-[15px] text-amber-900 leading-7 font-medium">
                Your rankings will help us understand your decision-making priorities and improve future scenario recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdaptivePreferenceView;