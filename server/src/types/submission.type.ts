import { Document, Types } from 'mongoose';

export enum SubmissionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  DELETED = 'DELETED'
}

export enum SubmissionType {
  FOUNDER = 'FOUNDER',
  INVESTOR = 'INVESTOR'
}

export type SubmissionDataType = Map<string, any>;

export interface Submission {
  _id: Types.ObjectId;
  formId: Types.ObjectId;
  type: SubmissionType;
  status: SubmissionStatus;
  data: SubmissionDataType;
  submittedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  name?: string;
  email?: string;
  linkedInProfileId?: string;
  isDeleted?: boolean;
  matchScore?: number;
  characterTraits?: {
    traits: string[];
    lastUpdated: Date;
  };
  familyInfo?: {
    members: string[];
    lastUpdated: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmissionDocument extends Omit<Submission, '_id'>, Document {}
