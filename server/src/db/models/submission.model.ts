import mongoose, { Document, Schema } from 'mongoose';

export interface ISubmission extends Document {
  formId: mongoose.Types.ObjectId;
  pipelineId: mongoose.Types.ObjectId;
  userId: string;
  data: Record<string, any>;
  type: 'founder' | 'investor';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: 'Form',
      required: [true, 'Form ID is required'],
    },
    pipelineId: {
      type: Schema.Types.ObjectId,
      ref: 'Pipeline',
      required: [true, 'Pipeline ID is required'],
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
    },
    data: {
      type: Schema.Types.Mixed,
      required: [true, 'Submission data is required'],
    },
    type: {
      type: String,
      enum: ['founder', 'investor'],
      required: [true, 'Submission type is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export const Submission = mongoose.model<ISubmission>('Submission', submissionSchema);
