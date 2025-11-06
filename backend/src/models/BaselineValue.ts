import mongoose, { Schema, Document } from 'mongoose';

export interface IBaselineValue extends Document {
  session_id: string;
  value_name: string;
  match_percentage: number;
  rank_order: number;
  value_type?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BaselineValueSchema: Schema = new Schema(
  {
    session_id: { type: String, required: true, index: true },
    value_name: { type: String, required: true },
    match_percentage: { type: Number, required: true, min: 0, max: 100 },
    rank_order: { type: Number, required: true, min: 0 },
    value_type: { type: String }
  },
  {
    timestamps: true
  }
);

BaselineValueSchema.index({ session_id: 1, value_name: 1 });

export default mongoose.model<IBaselineValue>('BaselineValue', BaselineValueSchema);
