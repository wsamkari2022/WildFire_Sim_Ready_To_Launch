import mongoose, { Schema, Document } from 'mongoose';

export interface IAPAReordering extends Document {
  session_id: string;
  scenario_id: number;
  preference_type: string;
  values_before: any;
  values_after: any;
  time_spent_ms?: number;
  triggered_by_option?: string;
  subsequent_option_selected?: string;
  was_from_top_two?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const APAReorderingSchema: Schema = new Schema(
  {
    session_id: { type: String, required: true, index: true },
    scenario_id: { type: Number, required: true },
    preference_type: { type: String, required: true },
    values_before: { type: Schema.Types.Mixed, required: true },
    values_after: { type: Schema.Types.Mixed, required: true },
    time_spent_ms: { type: Number },
    triggered_by_option: { type: String },
    subsequent_option_selected: { type: String },
    was_from_top_two: { type: Boolean }
  },
  {
    timestamps: true
  }
);

APAReorderingSchema.index({ session_id: 1, scenario_id: 1 });

export default mongoose.model<IAPAReordering>('APAReordering', APAReorderingSchema);
