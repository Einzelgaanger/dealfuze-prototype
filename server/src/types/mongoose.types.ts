import { Document, Model, Types } from 'mongoose';
import { DeleteResult, UpdateResult } from 'mongodb';

// Add missing methods that TypeScript doesn't recognize
export interface ExtendedQuery<ResultType, DocType extends Document> {
  exec(): Promise<ResultType>;
  sort(arg: any): ExtendedQuery<ResultType, DocType>;
  limit(n: number): ExtendedQuery<ResultType, DocType>;
  skip(n: number): ExtendedQuery<ResultType, DocType>;
  lean(): ExtendedQuery<ResultType, DocType>;
  select(arg: any): ExtendedQuery<ResultType, DocType>;
}

export interface ExtendedAggregate<ResultType = any[]> {
  exec(): Promise<ResultType>;
}

// Custom extension helper for models
export interface ExtendedModel<T extends Document> {
  aggregate(pipeline: any[]): ExtendedAggregate;
  bulkWrite(operations: any[]): Promise<any>;
  insertMany(docs: any[]): Promise<T[]>;
  findById(id: string | Types.ObjectId): ExtendedQuery<T | null, T>;
  findOne(conditions: any): ExtendedQuery<T | null, T>;
  find(conditions?: any): ExtendedQuery<T[], T>;
  deleteMany(conditions: any): ExtendedQuery<DeleteResult, T>;
  findByIdAndUpdate(id: string | Types.ObjectId, update: any, options?: any): ExtendedQuery<T | null, T>;
  updateMany(conditions: any, update: any, options?: any): ExtendedQuery<UpdateResult, T>;
  countDocuments(conditions: any): ExtendedQuery<number, T>;
}
