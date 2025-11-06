import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSession extends Document {
  session_id: string;
  user_id?: string;
  demographics?: any;
  age?: number;
  gender?: string;
  ai_experience?: string;
  moral_reasoning_experience?: string;
  consent_agreed?: boolean;
  consent_timestamp?: string;
  is_completed?: boolean;
  completed_at?: string;
  status?: string;
  study_fully_completed?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSessionSchema: Schema = new Schema(
  {
    session_id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String },
    demographics: { type: Schema.Types.Mixed },
    age: { type: Number, min: 18, max: 120 },
    gender: { type: String },
    ai_experience: { type: String },
    moral_reasoning_experience: { type: String },
    consent_agreed: { type: Boolean },
    consent_timestamp: { type: String },
    is_completed: { type: Boolean, default: false },
    completed_at: { type: String },
    status: { type: String, default: 'in_progress' },
    study_fully_completed: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IUserSession>('UserSession', UserSessionSchema);
