import mongoose, { Schema, Document } from 'mongoose';

export interface IValueEvolution extends Document {
  session_id: string;
  scenario_id?: number;
  value_list_snapshot: any;
  change_trigger?: string;
  change_type?: string;
  deviation_from_baseline?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ValueEvolutionSchema: Schema = new Schema(
  {
    session_id: { type: String, required: true, index: true },
    scenario_id: { type: Number },
    value_list_snapshot: { type: Schema.Types.Mixed, required: true },
    change_trigger: { type: String },
    change_type: { type: String },
    deviation_from_baseline: { type: Number }
  },
  {
    timestamps: true
  }
);

ValueEvolutionSchema.index({ session_id: 1, scenario_id: 1 });

export default mongoose.model<IValueEvolution>('ValueEvolution', ValueEvolutionSchema);
