import { Document, Types } from 'mongoose';

export interface Submission {
  _id: Types.ObjectId;
  type: 'founder' | 'investor';
  data: Map<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmissionDocument extends Submission, Document {}
