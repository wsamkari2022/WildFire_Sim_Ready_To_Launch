import mongoose, { Schema, Document } from 'mongoose';

export interface IFinalDecision extends Document {
  session_id: string;
  scenario_id: number;
  scenario_title: string;
  option_id: string;
  option_label: string;
  option_title: string;
  is_aligned: boolean;
  from_top_two_ranked?: boolean;
  total_switches?: number;
  total_time_seconds: number;
  cvr_visited?: boolean;
  cvr_visit_count?: number;
  cvr_yes_answers?: number;
  apa_reordered?: boolean;
  apa_reorder_count?: number;
  alternatives_explored?: boolean;
  final_metrics?: any;
  infeasible_options_checked?: any;
  createdAt: Date;
  updatedAt: Date;
}

const FinalDecisionSchema: Schema = new Schema(
  {
    session_id: { type: String, required: true, index: true },
    scenario_id: { type: Number, required: true },
    scenario_title: { type: String, required: true },
    option_id: { type: String, required: true },
    option_label: { type: String, required: true },
    option_title: { type: String, required: true },
    is_aligned: { type: Boolean, required: true },
    from_top_two_ranked: { type: Boolean },
    total_switches: { type: Number, default: 0 },
    total_time_seconds: { type: Number, required: true },
    cvr_visited: { type: Boolean, default: false },
    cvr_visit_count: { type: Number, default: 0 },
    cvr_yes_answers: { type: Number, default: 0 },
    apa_reordered: { type: Boolean, default: false },
    apa_reorder_count: { type: Number, default: 0 },
    alternatives_explored: { type: Boolean, default: false },
    final_metrics: { type: Schema.Types.Mixed },
    infeasible_options_checked: { type: Schema.Types.Mixed }
  },
  {
    timestamps: true
  }
);

FinalDecisionSchema.index({ session_id: 1, scenario_id: 1 });

export default mongoose.model<IFinalDecision>('FinalDecision', FinalDecisionSchema);
