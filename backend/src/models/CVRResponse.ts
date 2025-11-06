import mongoose, { Schema, Document } from 'mongoose';

export interface ICVRResponse extends Document {
  session_id: string;
  scenario_id: number;
  option_id: string;
  option_label: string;
  cvr_question: string;
  user_answer: boolean;
  response_time_ms?: number;
  decision_changed_after?: boolean;
  comparison_data?: any;
  createdAt: Date;
  updatedAt: Date;
}

const CVRResponseSchema: Schema = new Schema(
  {
    session_id: { type: String, required: true, index: true },
    scenario_id: { type: Number, required: true },
    option_id: { type: String, required: true },
    option_label: { type: String, required: true },
    cvr_question: { type: String, required: true },
    user_answer: { type: Boolean, required: true },
    response_time_ms: { type: Number },
    decision_changed_after: { type: Boolean },
    comparison_data: { type: Schema.Types.Mixed }
  },
  {
    timestamps: true
  }
);

CVRResponseSchema.index({ session_id: 1, scenario_id: 1 });

export default mongoose.model<ICVRResponse>('CVRResponse', CVRResponseSchema);
