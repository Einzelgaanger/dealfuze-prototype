import { Document, ObjectId } from "mongodb";

export type SubmissionDataType = Record<string, any>;

export enum SubmissionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface ISubmission {
  formId: ObjectId;
  data: SubmissionDataType;
  submittedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  name: string;
  email: string;
  linkedInProfileId?: ObjectId;
  status: SubmissionStatus;
}

export interface CreateSubmission extends Omit<ISubmission, "submittedAt"> {}

export interface SubmissionDocument extends ISubmission, Document {}
