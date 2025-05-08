import { Document, Types } from 'mongoose';

export interface IndustryFamily {
  _id: Types.ObjectId;
  code: string;
  name: string;
  description: string;
  industries: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IndustryFamilyDocument extends Omit<IndustryFamily, '_id'>, Document {} 