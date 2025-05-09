import mongoose, { Document, Schema } from 'mongoose';

export interface IMatch extends Document {
  pipelineId: mongoose.Types.ObjectId;
  founderSubmissionId: mongoose.Types.ObjectId;
  investorSubmissionId: mongoose.Types.ObjectId;
  score: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const matchSchema = new Schema<IMatch>(
  {
    pipelineId: {
      type: Schema.Types.ObjectId,
      ref: 'Pipeline',
      required: [true, 'Pipeline ID is required'],
    },
    founderSubmissionId: {
      type: Schema.Types.ObjectId,
      ref: 'Submission',
      required: [true, 'Founder submission ID is required'],
    },
    investorSubmissionId: {
      type: Schema.Types.ObjectId,
      ref: 'Submission',
      required: [true, 'Investor submission ID is required'],
    },
    score: {
      type: Number,
      required: [true, 'Match score is required'],
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export const Match = mongoose.model<IMatch>('Match', matchSchema);
