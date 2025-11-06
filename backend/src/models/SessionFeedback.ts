import mongoose, { Schema, Document } from 'mongoose';

export interface ISessionFeedback extends Document {
  session_id: string;
  cvr_initial_reconsideration?: boolean | null;
  cvr_final_reconsideration?: boolean | null;
  cvr_purpose_clarity?: number;
  cvr_confidence_change?: number;
  cvr_helpfulness?: number;
  cvr_clarity?: number;
  cvr_comfort_level?: number;
  cvr_perceived_value?: number;
  cvr_overall_impact?: number;
  cvr_comments?: string;
  apa_purpose_clarity?: number;
  apa_ease_of_use?: number;
  apa_control_understanding?: number;
  apa_decision_reflection?: boolean | null;
  apa_scenario_alignment?: boolean | null;
  apa_comparison_usefulness?: number;
  apa_perspective_value?: number;
  apa_confidence_after_reordering?: number;
  apa_perceived_value?: number;
  apa_tradeoff_challenge?: number;
  apa_reflection_depth?: number;
  apa_comments?: string;
  viz_clarity?: number;
  viz_helpfulness?: boolean | null;
  viz_usefulness?: number;
  viz_tradeoff_evaluation?: number;
  viz_tradeoff_justification?: number;
  viz_expert_usefulness?: number;
  viz_expert_confidence_impact?: boolean | null;
  viz_comments?: string;
  overall_scenario_alignment?: boolean | null;
  overall_decision_satisfaction?: number;
  overall_process_satisfaction?: number;
  overall_confidence_consistency?: number;
  overall_learning_insight?: number;
  overall_comments?: string;
  value_consistency_index?: number;
  performance_composite?: number;
  balance_index?: number;
  cvr_arrivals?: number;
  cvr_yes_count?: number;
  cvr_no_count?: number;
  apa_reorderings?: number;
  total_switches?: number;
  avg_decision_time?: number;
  scenarios_final_decision_labels?: string[];
  checking_alignment_list?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SessionFeedbackSchema: Schema = new Schema(
  {
    session_id: { type: String, required: true, unique: true, index: true },
    cvr_initial_reconsideration: { type: Boolean },
    cvr_final_reconsideration: { type: Boolean },
    cvr_purpose_clarity: { type: Number },
    cvr_confidence_change: { type: Number },
    cvr_helpfulness: { type: Number },
    cvr_clarity: { type: Number },
    cvr_comfort_level: { type: Number },
    cvr_perceived_value: { type: Number },
    cvr_overall_impact: { type: Number },
    cvr_comments: { type: String },
    apa_purpose_clarity: { type: Number },
    apa_ease_of_use: { type: Number },
    apa_control_understanding: { type: Number },
    apa_decision_reflection: { type: Boolean },
    apa_scenario_alignment: { type: Boolean },
    apa_comparison_usefulness: { type: Number },
    apa_perspective_value: { type: Number },
    apa_confidence_after_reordering: { type: Number },
    apa_perceived_value: { type: Number },
    apa_tradeoff_challenge: { type: Number },
    apa_reflection_depth: { type: Number },
    apa_comments: { type: String },
    viz_clarity: { type: Number },
    viz_helpfulness: { type: Boolean },
    viz_usefulness: { type: Number },
    viz_tradeoff_evaluation: { type: Number },
    viz_tradeoff_justification: { type: Number },
    viz_expert_usefulness: { type: Number },
    viz_expert_confidence_impact: { type: Boolean },
    viz_comments: { type: String },
    overall_scenario_alignment: { type: Boolean },
    overall_decision_satisfaction: { type: Number },
    overall_process_satisfaction: { type: Number },
    overall_confidence_consistency: { type: Number },
    overall_learning_insight: { type: Number },
    overall_comments: { type: String },
    value_consistency_index: { type: Number },
    performance_composite: { type: Number },
    balance_index: { type: Number },
    cvr_arrivals: { type: Number },
    cvr_yes_count: { type: Number },
    cvr_no_count: { type: Number },
    apa_reorderings: { type: Number },
    total_switches: { type: Number },
    avg_decision_time: { type: Number },
    scenarios_final_decision_labels: [{ type: String }],
    checking_alignment_list: [{ type: String }]
  },
  {
    timestamps: true
  }
);

export default mongoose.model<ISessionFeedback>('SessionFeedback', SessionFeedbackSchema);
