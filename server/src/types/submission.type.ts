import { Document, Types } from 'mongoose';

export enum SubmissionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum SubmissionType {
  FOUNDER = 'founder',
  INVESTOR = 'investor'
}

export type SubmissionDataType = Map<string, any>;

export interface Submission {
  _id: Types.ObjectId;
  type: SubmissionType;
  status: SubmissionStatus;
  formId: Types.ObjectId;
  linkedInProfileId?: string;
  data: SubmissionDataType;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmissionDocument extends Omit<Submission, '_id'>, Document {}
