import React, { useState } from 'react';
import { ArrowLeft, MoveVertical, AlertCircle, Scale, Zap, Leaf, Shield, Ban, Calculator, Brain, ArrowRight, Sparkles } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { DecisionOption, MainScenario } from '../types';
import RankedOptionsView from './RankedOptionsView';
import { TrackingManager } from '../utils/trackingUtils';

interface ComparisonTableProps {
  firstColumn: {
    title: string;
    selectedPreference: string;
    value: string;
    affected: number;
    risk: string;
    userChoice: string;
  };
  secondColumn: {
    title: string;
    selectedPreference: string;
    value: string;
    affected: number;
    risk: string;
    userChoice: string;
  };
}

const valueIcons: { [key: string]: JSX.Element } = {
  'Safety': <Shield size={16} className="text-red-500" />,
  'Efficiency': <Zap size={16} className="text-yellow-500" />,
  'Sustainability': <Leaf size={16} className="text-green-500" />,
  'Fairness': <Scale size={16} className="text-blue-500" />,
  'Nonmaleficence': <Ban size={16} className="text-purple-500" />
};

const ComparisonTable: React.FC<ComparisonTableProps> = ({ firstColumn, secondColumn }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50">
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Aspect</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-blue-600">Simulation Scenario</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-purple-600">CVR Scenario</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        <tr>
          <td className="px-4 py-3 text-sm font-medium text-gray-600">Scenario Title</td>
          <td className="px-4 py-3 text-sm text-gray-800">{firstColumn.title}</td>
          <td className="px-4 py-3 text-sm text-gray-800">{secondColumn.title}</td>
        </tr>
        <tr>
          <td className="px-4 py-3 text-sm font-medium text-gray-600">Selected Preference</td>
          <td className="px-4 py-3 text-sm text-gray-800">{firstColumn.selectedPreference}</td>
          <td className="px-4 py-3 text-sm text-gray-800">{secondColumn.selectedPreference}</td>
        </tr>
        <tr>
          <td className="px-4 py-3 text-sm font-medium text-gray-600">Affected Population</td>
          <td className="px-4 py-3 text-sm text-gray-800">{firstColumn.affected.toLocaleString()} residents</td>
          <td className="px-4 py-3 text-sm text-gray-800">{secondColumn.affected.toLocaleString()} residents</td>
        </tr>
        <tr>
          <td className="px-4 py-3 text-sm font-medium text-gray-600">Decision Trade-off</td>
          <td className="px-4 py-3 text-sm text-gray-800">{firstColumn.risk}</td>
          <td className="px-4 py-3 text-sm text-gray-800">{secondColumn.risk}</td>
        </tr>
        <tr>
          <td className="px-4 py-3 text-sm font-medium text-gray-600">Applied Moral Value</td>
          <td className="px-4 py-3 text-sm text-gray-800">{firstColumn.value}</td>
          <td className="px-4 py-3 text-sm text-gray-800">{secondColumn.value}</td>
        </tr>
        <tr>
          <td className="px-4 py-3 text-sm font-medium text-gray-600">User's Response</td>
          <td className={`px-4 py-3 text-sm font-medium ${
            firstColumn.userChoice === "Accepted" ? "text-green-600" : "text-red-600"
          }`}>
            {firstColumn.userChoice === "Accepted" ? "✅ Accepted" : "❌ Rejected"}
          </td>
          <td className={`px-4 py-3 text-sm font-medium ${
            secondColumn.userChoice === "Accepted" ? "text-green-600" : "text-red-600"
          }`}>
            {secondColumn.userChoice === "Accepted" ? "✅ Accepted" : "❌ Rejected"}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

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

  // Special case: Scenario 3 with CVR "No" response - show comparison table only
  if (isLastScenario && scenarioId === 3) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex-1 flex flex-col">
        <button
          onClick={onBack}
          className="self-start mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Back to Scenario 3
        </button>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Adaptive Preference Analysis
          </h2>

          <ComparisonTable
            firstColumn={{
              title: comparisonTableColumnContent.firstColumnTitle,
              selectedPreference: comparisonTableColumnContent.firstColumnSelectedPreference,
              value: comparisonTableColumnContent.firstValue,
              affected: comparisonTableColumnContent.firstColumnAffected,
              risk: comparisonTableColumnContent.firstColumnRisk,
              userChoice: comparisonTableColumnContent.firstColumnuserChoice
            }}
            secondColumn={{
              title: comparisonTableColumnContent.secondColumnTitle,
              selectedPreference: comparisonTableColumnContent.secondColumnSelectedPreference,
              value: comparisonTableColumnContent.secondValue,
              affected: comparisonTableColumnContent.secondColumnaffected,
              risk: comparisonTableColumnContent.secondColumnRisk,
              userChoice: comparisonTableColumnContent.secondColumnuserChoice
            }}
          />
        </div>

        <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-blue-500 mt-0.5" size={20} />
            <div>
              <p className="text-blue-900 font-medium mb-1">This is the last scenario</p>
              <p className="text-blue-800 text-sm">
                You don't need to reorder your values since there are no more scenarios after this one. You can review the comparison above and return to the simulation to make a different choice if needed.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onBack}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          Return to Scenario 3
        </button>
      </div>
    );
  }

  // Normal flow for scenarios 1 and 2
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex-1 flex flex-col">
      <button
        onClick={onBack}
        className="self-start mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
      >
        <ArrowLeft size={20} />
        Back to Simulation
      </button>

      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Adaptive Preference Analysis
        </h2>

        <ComparisonTable
          firstColumn={{
            title: comparisonTableColumnContent.firstColumnTitle,
            selectedPreference: comparisonTableColumnContent.firstColumnSelectedPreference,
            value: comparisonTableColumnContent.firstValue,
            affected: comparisonTableColumnContent.firstColumnAffected,
            risk: comparisonTableColumnContent.firstColumnRisk,
            userChoice: comparisonTableColumnContent.firstColumnuserChoice
          }}
          secondColumn={{
            title: comparisonTableColumnContent.secondColumnTitle,
            selectedPreference: comparisonTableColumnContent.secondColumnSelectedPreference,
            value: comparisonTableColumnContent.secondValue,
            affected: comparisonTableColumnContent.secondColumnaffected,
            risk: comparisonTableColumnContent.secondColumnRisk,
            userChoice: comparisonTableColumnContent.secondColumnuserChoice
          }}
        />
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Preference Alignment Focus
        </h3>
        <p className="text-gray-600 mb-6">
          Choose whether Simulation Metrics or Moral Values matter more in your decision-making process. Your selection will influence the options presented in current and future scenarios. Don't worry - you can always adjust your preference later if your priorities change.
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => {
              setPreferenceType('metrics');
              setRankingItems(simulationMetrics);
            }}
            className={`p-4 rounded-lg border transition-all duration-200 flex flex-col items-center gap-2
              ${preferenceType === 'metrics' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'}`}
          >
            <Calculator size={24} />
            <span className="font-medium">Simulation Metrics</span>
          </button>
          
          <button
            onClick={() => {
              setPreferenceType('values');
              setRankingItems(moralValues);
            }}
            className={`p-4 rounded-lg border transition-all duration-200 flex flex-col items-center gap-2
              ${preferenceType === 'values' 
                ? 'border-purple-500 bg-purple-50 text-purple-700' 
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700'}`}
          >
            <Brain size={24} />
            <span className="font-medium">Moral Values</span>
          </button>
        </div>

        {preferenceType && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-base font-medium text-gray-800 mb-4">
              Rank from 1 (most important) to {rankingItems.length} (least important)
            </h4>
            
            {showMetricTooltip && (
              <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <p className="text-sm text-blue-800">💡 <strong>Tip:</strong> Drag and drop items to reorder them by importance</p>
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
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4"
                          >
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                              {index + 1}
                            </div>
                            <span className="flex-1 font-medium text-gray-700">{item.label}</span>
                            <MoveVertical size={20} className="text-gray-400" />
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
              className={`mt-6 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-white font-medium transition-colors duration-200 ${
                preferenceType
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Continue
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="text-yellow-500 mt-0.5" size={16} />
          <p className="text-sm text-yellow-800">
            Your rankings will help us understand your decision-making priorities and improve future scenario recommendations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdaptivePreferenceView;