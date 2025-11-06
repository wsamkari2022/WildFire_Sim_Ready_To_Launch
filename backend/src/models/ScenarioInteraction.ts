import mongoose, { Schema, Document } from 'mongoose';

export interface IScenarioInteraction extends Document {
  session_id: string;
  scenario_id: number;
  scenario_title: string;
  event_type: string;
  option_id?: string;
  option_label?: string;
  option_title?: string;
  is_aligned?: boolean;
  time_since_scenario_start?: number;
  switch_count?: number;
  alternatives_explored?: boolean;
  radar_chart_viewed?: boolean;
  event_data?: any;
  createdAt: Date;
  updatedAt: Date;
}

const ScenarioInteractionSchema: Schema = new Schema(
  {
    session_id: { type: String, required: true, index: true },
    scenario_id: { type: Number, required: true },
    scenario_title: { type: String, required: true },
    event_type: { type: String, required: true },
    option_id: { type: String },
    option_label: { type: String },
    option_title: { type: String },
    is_aligned: { type: Boolean },
    time_since_scenario_start: { type: Number },
    switch_count: { type: Number },
    alternatives_explored: { type: Boolean },
    radar_chart_viewed: { type: Boolean },
    event_data: { type: Schema.Types.Mixed }
  },
  {
    timestamps: true
  }
);

ScenarioInteractionSchema.index({ session_id: 1, scenario_id: 1 });

export default mongoose.model<IScenarioInteraction>('ScenarioInteraction', ScenarioInteractionSchema);
