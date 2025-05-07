import { Schema, model } from 'mongoose';
import { MatchDocument } from '../../types/match.type';

const matchSchema = new Schema<MatchDocument>({
  founderId: { type: Schema.Types.ObjectId, ref: 'Submission', required: true },
  investorId: { type: Schema.Types.ObjectId, ref: 'Submission', required: true },
  score: { type: Number, required: true, min: 0, max: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
matchSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default model<MatchDocument>('Match', matchSchema);
