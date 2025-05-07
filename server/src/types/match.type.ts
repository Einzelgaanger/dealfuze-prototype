import { Document, Types } from 'mongoose';

export interface Match {
  _id: Types.ObjectId;
  founderId: Types.ObjectId;
  investorId: Types.ObjectId;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchDocument extends Match, Document {}
