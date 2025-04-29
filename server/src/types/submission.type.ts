import { Document, ObjectId } from "mongodb";

export type SubmissionDataType = Record<string, any>;

export enum SubmissionType {
  FOUNDER = 'founder',
  INVESTOR = 'investor'
}

export enum SubmissionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DELETED = 'deleted',
  ARCHIVED = 'archived'
}

export interface ISubmission {
  formId: ObjectId;
  type: SubmissionType;
  data: SubmissionDataType;
  submittedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  name: string;
  email: string;
  linkedInProfileId?: ObjectId;
  status: SubmissionStatus;
  characterTraits?: {
    personalityType?: string;
    leadershipStyle?: string;
    communicationStyle?: string;
    decisionMaking?: string;
    riskTolerance?: string;
    workEthic?: string;
    lastUpdated?: Date;
  };
  familyInfo?: {
    familyBackground?: string;
    familyInvolvement?: string;
    familyValues?: string[];
    lastUpdated?: Date;
  };
  isDeleted: boolean;
  deletedAt?: Date;
  matchScore: number;
  lastMatchUpdate?: Date;
}

export interface CreateSubmission extends Omit<ISubmission, "submittedAt"> {}

export interface SubmissionDocument extends ISubmission, Document {}
