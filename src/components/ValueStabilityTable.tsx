import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface ValueMatch {
  scenarioId: number;
  selectedValue: string;
  matchesExplicit: boolean;
  matchesImplicit: boolean;
  matchesSimulation: boolean;
  stabilityScore: number;
}

interface ValueStabilityTableProps {
  matches: ValueMatch[];
}

const ValueStabilityTable: React.FC<ValueStabilityTableProps> = ({ matches }) => {
  const getStabilityLabel = (match: ValueMatch) => {
    if (match.matchesImplicit) return 'Stable';
    if (match.matchesSimulation) return 'Context-Dependent';
    return 'Inconsistent';
  };

  const getStabilityColor = (match: ValueMatch) => {
    if (match.matchesImplicit) return 'text-green-600';
    if (match.matchesSimulation) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStabilityIcon = (match: ValueMatch) => {
    if (match.matchesImplicit) return <CheckCircle2 size={16} className="text-green-600" />;
    if (match.matchesSimulation) return <AlertTriangle size={16} className="text-orange-600" />;
    return <XCircle size={16} className="text-red-600" />;
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Scenario
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Selected Value
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Matches
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stability
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Score
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {matches.map((match) => (
            <tr key={match.scenarioId}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Scenario {match.scenarioId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {match.selectedValue}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="space-y-1">
                  <div className={match.matchesExplicit ? "text-green-600" : "text-gray-400"}>
                    {match.matchesExplicit ? "✓" : "×"} Explicit Values
                  </div>
                  <div className={match.matchesImplicit ? "text-green-600" : "text-gray-400"}>
                    {match.matchesImplicit ? "✓" : "×"} Implicit Values
                  </div>
                  <div className={match.matchesSimulation ? "text-orange-600" : "text-gray-400"}>
                    {match.matchesSimulation ? "✓" : "×"} Simulation Values
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center gap-1">
                  {getStabilityIcon(match)}
                  <span className={getStabilityColor(match)}>
                    {getStabilityLabel(match)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        match.stabilityScore >= 75 ? 'bg-green-600' :
                        match.stabilityScore >= 50 ? 'bg-orange-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${match.stabilityScore}%` }}
                    />
                  </div>
                  <span className="text-gray-600">{match.stabilityScore}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ValueStabilityTable;