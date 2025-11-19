import React, { useState } from 'react';
import { ArrowLeft, MoveVertical, AlertCircle, Scale, Zap, Leaf, Shield, Ban, Calculator, Brain, ArrowRight, Sparkles, Target, Lightbulb, Eye } from 'lucide-react';
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

  // Special case: Scenario 3 with CVR "No" response - show simplified view only
  if (isLastScenario && scenarioId === 3) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen p-6 flex-1 flex flex-col">
        <div className="max-w-5xl mx-auto w-full">
          <button
            onClick={onBack}
            className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Scenario 3
          </button>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              We Noticed a Contradiction in Your Recent Choices
            </h1>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-r-lg mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={22} />
                <div>
                  <p className="text-amber-900 font-medium mb-2">This is the last scenario</p>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    You don't need to reorder your values since there are no more scenarios after this one. You can review the information below and return to the simulation to make a different choice if needed.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Scale className="text-blue-600" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900">Your Simulation Scenario Choice</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Scenario Title</p>
                    <p className="text-sm text-gray-800 font-medium">{comparisonTableColumnContent.firstColumnTitle}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Affected Population</p>
                    <p className="text-sm text-gray-800">{comparisonTableColumnContent.firstColumnAffected.toLocaleString()} residents</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Decision Trade-off</p>
                    <p className="text-sm text-gray-800">{comparisonTableColumnContent.firstColumnRisk}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Applied Moral Value</p>
                    <p className="text-sm text-gray-800 font-medium">{comparisonTableColumnContent.firstValue}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Your Response</p>
                    <p className={`text-sm font-semibold ${
                      comparisonTableColumnContent.firstColumnuserChoice === "Accepted" ? "text-green-600" : "text-red-600"
                    }`}>
                      {comparisonTableColumnContent.firstColumnuserChoice === "Accepted" ? "✓ Accepted" : "✗ Rejected"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-white border-2 border-teal-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                    <Eye className="text-teal-600" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-teal-900">Your Value-Reflection Scenario Choice</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Scenario Title</p>
                    <p className="text-sm text-gray-800 font-medium">{comparisonTableColumnContent.secondColumnTitle}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Affected Population</p>
                    <p className="text-sm text-gray-800">{comparisonTableColumnContent.secondColumnaffected.toLocaleString()} residents</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Decision Trade-off</p>
                    <p className="text-sm text-gray-800">{comparisonTableColumnContent.secondColumnRisk}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Applied Moral Value</p>
                    <p className="text-sm text-gray-800 font-medium">{comparisonTableColumnContent.secondValue}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Your Response</p>
                    <p className={`text-sm font-semibold ${
                      comparisonTableColumnContent.secondColumnuserChoice === "Accepted" ? "text-green-600" : "text-red-600"
                    }`}>
                      {comparisonTableColumnContent.secondColumnuserChoice === "Accepted" ? "✓ Accepted" : "✗ Rejected"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onBack}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <ArrowLeft size={20} />
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
          className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Simulation
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            We Noticed a Contradiction in Your Recent Choices
          </h1>

          <div className="bg-gradient-to-r from-blue-50 to-teal-50 border-l-4 border-blue-500 p-6 rounded-r-xl mb-8 shadow-sm">
            <p className="text-gray-800 leading-relaxed mb-4">
              Earlier in the simulation, you selected an option that reflected a certain value.
            </p>
            <p className="text-gray-800 leading-relaxed mb-4">
              A moment later, when you were shown a very similar scenario designed to reflect your chosen value-based option, you reacted differently and rejected the same value-based option you had previously accepted in a different scenario.
            </p>
            <p className="text-gray-700 leading-relaxed italic">
              This happens to many people — especially when the same moral values appear in new or stressful contexts.
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-md">
                <Eye className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Here's What You Chose Before</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Scale className="text-blue-600" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900">Your Simulation Scenario Choice</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Scenario Title</p>
                    <p className="text-sm text-gray-800 font-medium">{comparisonTableColumnContent.firstColumnTitle}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Affected Population</p>
                    <p className="text-sm text-gray-800">{comparisonTableColumnContent.firstColumnAffected.toLocaleString()} residents</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Decision Trade-off</p>
                    <p className="text-sm text-gray-800">{comparisonTableColumnContent.firstColumnRisk}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Applied Moral Value</p>
                    <p className="text-sm text-gray-800 font-medium">{comparisonTableColumnContent.firstValue}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Your Response</p>
                    <p className={`text-sm font-semibold ${
                      comparisonTableColumnContent.firstColumnuserChoice === "Accepted" ? "text-green-600" : "text-red-600"
                    }`}>
                      {comparisonTableColumnContent.firstColumnuserChoice === "Accepted" ? "✓ Accepted" : "✗ Rejected"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-white border-2 border-teal-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                    <Eye className="text-teal-600" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-teal-900">Your Value-Reflection Scenario Choice</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Scenario Title</p>
                    <p className="text-sm text-gray-800 font-medium">{comparisonTableColumnContent.secondColumnTitle}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Affected Population</p>
                    <p className="text-sm text-gray-800">{comparisonTableColumnContent.secondColumnaffected.toLocaleString()} residents</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Decision Trade-off</p>
                    <p className="text-sm text-gray-800">{comparisonTableColumnContent.secondColumnRisk}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Applied Moral Value</p>
                    <p className="text-sm text-gray-800 font-medium">{comparisonTableColumnContent.secondValue}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Your Response</p>
                    <p className={`text-sm font-semibold ${
                      comparisonTableColumnContent.secondColumnuserChoice === "Accepted" ? "text-green-600" : "text-red-600"
                    }`}>
                      {comparisonTableColumnContent.secondColumnuserChoice === "Accepted" ? "✓ Accepted" : "✗ Rejected"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p className="text-amber-900 font-medium">
                Both scenarios affected the same number of residents and carried nearly the same consequences, yet your reactions were different.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                <Lightbulb className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Why You're Seeing This Page</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-800 leading-relaxed">
                This section is here to simply help you reflect — not to tell you what you should have chosen.
              </p>
              <p className="text-gray-800 leading-relaxed">
                The purpose of the value-reflection scenario is to show how the same core values feel when they appear in a different storyline.
              </p>
              <p className="text-gray-800 leading-relaxed">
                Sometimes people respond differently without realizing it. This page helps you think about which part of your decision-making matters most to you right now.
              </p>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-xl p-6 mb-6 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                <Target className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">What Matters More to You Going Forward?</h2>
            </div>

            <p className="text-gray-700 leading-relaxed mb-6">
              Because we noticed a contradiction, this step helps you clarify what should guide your decisions in the current and upcoming scenarios.
            </p>

            <p className="text-gray-600 text-sm mb-6 italic">
              You can choose whichever matters more to you right now—Simulation Metrics or Moral Values—and you can always adjust this preference later if your priorities change.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => {
                  setPreferenceType('metrics');
                  setRankingItems(simulationMetrics);
                }}
                className={`py-6 px-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3 shadow-sm hover:shadow-md ${
                  preferenceType === 'metrics'
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg scale-105'
                    : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  preferenceType === 'metrics' ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                  <Calculator className={preferenceType === 'metrics' ? 'text-white' : 'text-gray-600'} size={32} />
                </div>
                <span className={`font-semibold text-lg ${
                  preferenceType === 'metrics' ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  Simulation Metrics
                </span>
                {preferenceType === 'metrics' && (
                  <span className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full font-medium">
                    Selected
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setPreferenceType('values');
                  setRankingItems(moralValues);
                }}
                className={`py-6 px-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3 shadow-sm hover:shadow-md ${
                  preferenceType === 'values'
                    ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-lg scale-105'
                    : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50'
                }`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  preferenceType === 'values' ? 'bg-emerald-500' : 'bg-gray-200'
                }`}>
                  <Brain className={preferenceType === 'values' ? 'text-white' : 'text-gray-600'} size={32} />
                </div>
                <span className={`font-semibold text-lg ${
                  preferenceType === 'values' ? 'text-emerald-700' : 'text-gray-700'
                }`}>
                  Moral Values
                </span>
                {preferenceType === 'values' && (
                  <span className="text-xs bg-emerald-500 text-white px-3 py-1 rounded-full font-medium">
                    Selected
                  </span>
                )}
              </button>
            </div>

            {preferenceType && (
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-200 p-6 rounded-xl mt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MoveVertical size={20} className="text-blue-600" />
                  Rank from 1 (most important) to {rankingItems.length} (least important)
                </h4>

                {showMetricTooltip && (
                  <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                    <p className="text-sm text-blue-800 flex items-center gap-2">
                      <Sparkles size={16} className="flex-shrink-0" />
                      <strong>Tip:</strong> Drag and drop items to reorder them by importance
                    </p>
                  </div>
                )}

                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="rankingList">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3"
                      >
                        {rankingItems.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white p-4 rounded-lg border-2 flex items-center gap-4 transition-all ${
                                  snapshot.isDragging
                                    ? 'border-blue-400 shadow-lg scale-105'
                                    : 'border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md'
                                }`}
                              >
                                <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg ${
                                  index === 0 ? 'bg-green-100 text-green-700' :
                                  index === 1 ? 'bg-blue-100 text-blue-700' :
                                  index === 2 ? 'bg-amber-100 text-amber-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {index + 1}
                                </div>
                                <span className="flex-1 font-medium text-gray-800 text-lg">{item.label}</span>
                                <MoveVertical size={22} className="text-gray-400" />
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
                  className={`mt-6 w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-white font-semibold text-lg transition-all duration-200 shadow-md ${
                    preferenceType
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-lg'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue to Next Step
                  <ArrowRight size={24} />
                </button>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
              <p className="text-sm text-amber-900 leading-relaxed">
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