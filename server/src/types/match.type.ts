import { Document, Types } from 'mongoose';

export enum MatchType {
  FOUNDER_TO_INVESTOR = 'FOUNDER_TO_INVESTOR',
  INVESTOR_TO_FOUNDER = 'INVESTOR_TO_FOUNDER'
}

export interface Match {
  _id: Types.ObjectId;
  type: MatchType;
  founderId: Types.ObjectId;
  investorId: Types.ObjectId;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchDocument extends Omit<Match, '_id'>, Document {}
