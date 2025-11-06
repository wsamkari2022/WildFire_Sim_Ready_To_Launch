import mongoose, { Schema, Document } from 'mongoose';

export interface ISessionMetrics extends Document {
  session_id: string;
  cvr_arrivals: number;
  cvr_yes_count: number;
  cvr_no_count: number;
  apa_reorderings: number;
  misalign_after_cvr_apa_count: number;
  realign_after_cvr_apa_count: number;
  switch_count_total: number;
  avg_decision_time: number;
  decision_times: number[];
  value_consistency_index: number;
  performance_composite: number;
  balance_index: number;
  final_alignment_by_scenario: boolean[];
  value_order_trajectories: Array<{
    scenarioId: number;
    values: string[];
    preferenceType: string;
  }>;
  scenario_details: Array<{
    scenarioId: number;
    finalChoice: string;
    aligned: boolean;
    switches: number;
    timeSeconds: number;
    cvrVisited: boolean;
    cvrVisitCount: number;
    cvrYesAnswers: number;
    apaReordered: boolean;
    apaReorderCount: number;
  }>;
  scenarios_final_decision_labels?: string[];
  checking_alignment_list?: string[];
  final_values?: string[];
  moral_values_reorder_list?: string[];
  scenario1_moral_value_reordered?: any[];
  scenario2_moral_value_reordered?: any[];
  scenario3_moral_value_reordered?: any[];
  scenario3_infeasible_options?: any[];
  calculated_at: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionMetricsSchema: Schema = new Schema(
  {
    session_id: { type: String, required: true, unique: true, index: true },
    cvr_arrivals: { type: Number, required: true, default: 0 },
    cvr_yes_count: { type: Number, required: true, default: 0 },
    cvr_no_count: { type: Number, required: true, default: 0 },
    apa_reorderings: { type: Number, required: true, default: 0 },
    misalign_after_cvr_apa_count: { type: Number, required: true, default: 0 },
    realign_after_cvr_apa_count: { type: Number, required: true, default: 0 },
    switch_count_total: { type: Number, required: true, default: 0 },
    avg_decision_time: { type: Number, required: true, default: 0 },
    decision_times: [{ type: Number }],
    value_consistency_index: { type: Number, required: true, default: 0 },
    performance_composite: { type: Number, required: true, default: 0 },
    balance_index: { type: Number, required: true, default: 0 },
    final_alignment_by_scenario: [{ type: Boolean }],
    value_order_trajectories: [{
      scenarioId: { type: Number },
      values: [{ type: String }],
      preferenceType: { type: String }
    }],
    scenario_details: [{
      scenarioId: { type: Number },
      finalChoice: { type: String },
      aligned: { type: Boolean },
      switches: { type: Number },
      timeSeconds: { type: Number },
      cvrVisited: { type: Boolean },
      cvrVisitCount: { type: Number },
      cvrYesAnswers: { type: Number },
      apaReordered: { type: Boolean },
      apaReorderCount: { type: Number }
    }],
    scenarios_final_decision_labels: [{ type: String }],
    checking_alignment_list: [{ type: String }],
    final_values: [{ type: String }],
    moral_values_reorder_list: [{ type: String }],
    scenario1_moral_value_reordered: [{ type: Schema.Types.Mixed }],
    scenario2_moral_value_reordered: [{ type: Schema.Types.Mixed }],
    scenario3_moral_value_reordered: [{ type: Schema.Types.Mixed }],
    scenario3_infeasible_options: [{ type: Schema.Types.Mixed }],
    calculated_at: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<ISessionMetrics>('SessionMetrics', SessionMetricsSchema);
