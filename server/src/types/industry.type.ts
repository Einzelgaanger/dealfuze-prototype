import { Document, ObjectId } from "mongodb";

export interface IndustryFamily {
  _id: ObjectId;
  name: string;
  index: number;
  relatedFamilies: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IndustryFamilyDocument extends IndustryFamily, Document {}

export interface IndustryFamilyIndex {
  _id: ObjectId;
  familyId: ObjectId;
  index: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IndustryFamilyIndexDocument extends IndustryFamilyIndex, Document {}

export interface IndustryFamilyRelationship {
  _id: ObjectId;
  familyId1: ObjectId;
  familyId2: ObjectId;
  similarity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IndustryFamilyRelationshipDocument extends IndustryFamilyRelationship, Document {} 