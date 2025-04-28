import { Document, ObjectId } from "mongodb";

export interface MatchField {
  founderField: string;
  investorField: string;
  weight?: number;
  matchType: MatchType;
  required: boolean;
}

export interface IMatchCriteria {
  pipelineId: ObjectId;
  matchCriteria: Array<MatchField>;
  useLinkedinPersonality: boolean;
}

export enum MatchType {
  EXACT = "exact", // Values must match exactly
  SOFT = "soft", // The closer the values, the higher the compatibility
}

interface _BaseMatchCriteriaRequest {
  founderField: string;
  investorField: string;
}

interface _AdvancedMatchCriteriaRequest extends _BaseMatchCriteriaRequest {
  matchType: MatchType;
  weight?: number;
  required?: boolean;
}

export type BaseMatchCriteriaRequest = _BaseMatchCriteriaRequest[];
export type AdvancedMatchCriteriaRequest = _AdvancedMatchCriteriaRequest[];

interface MatchFieldDoc extends MatchField {
  id: ObjectId;
}
export interface MatchCriteriaDocument extends IMatchCriteria, Document {
  matchCriteria: MatchFieldDoc[];
}
