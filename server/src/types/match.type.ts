import { Document, ObjectId } from "mongodb";

export interface IMatch {
  pipelineId: ObjectId;
  investorId: ObjectId;
  founderId: ObjectId;
  totalMatchPercentage: number;
  formMatchPercentage: number;
  personalityMatchPercentage?: number;
  formMatch: Map<string, number>; // map of match criteria id to match percentage
}

export interface MatchDocument extends IMatch, Document {}
