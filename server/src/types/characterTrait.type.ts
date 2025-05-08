import { Document, Types } from 'mongoose';

export interface CharacterTraitSchool {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterTraitSchoolDocument extends Document, Omit<CharacterTraitSchool, '_id'> {}

export interface CharacterTrait {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  schoolId: Types.ObjectId;
  index?: number;
  weight: number;
  compatibleTraits: Types.ObjectId[];
  incompatibleTraits: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterTraitDocument extends Document, Omit<CharacterTrait, '_id'> {}

export interface CharacterTraitIndex {
  _id: Types.ObjectId;
  traitId: Types.ObjectId;
  index: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterTraitIndexDocument extends Omit<CharacterTraitIndex, '_id'>, Document {}

export interface CharacterTraitRelationship {
  _id: Types.ObjectId;
  traitId1: Types.ObjectId;
  traitId2: Types.ObjectId;
  similarity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterTraitRelationshipDocument extends Omit<CharacterTraitRelationship, '_id'>, Document {} 