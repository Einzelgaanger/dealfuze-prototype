import mongoose, { Document, Schema } from 'mongoose';

export interface IPipeline extends Document {
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

const pipelineSchema = new Schema<IPipeline>(
  {
    name: {
      type: String,
      required: [true, 'Pipeline name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Pipeline description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'completed'],
      default: 'active',
    },
    createdBy: {
      type: String,
      required: [true, 'Creator ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

export const Pipeline = mongoose.model<IPipeline>('Pipeline', pipelineSchema);
