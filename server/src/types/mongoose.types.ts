import { Document, Model, Types } from 'mongoose';

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

export interface ExtendedDeleteResult {
  deletedCount?: number;
}

export interface ExtendedUpdateResult {
  nModified: number;
}

// Custom extension helper for models
export interface ExtendedModel<T extends Document> {
  aggregate(pipeline: any[]): ExtendedAggregate;
  bulkWrite(operations: any[]): Promise<any>;
  insertMany(docs: any[]): Promise<T[]>;
  findById(id: string | Types.ObjectId): ExtendedQuery<T | null, T>;
  findOne(conditions: any): ExtendedQuery<T | null, T>;
  find(conditions?: any): ExtendedQuery<T[], T>;
  deleteMany(conditions: any): ExtendedQuery<ExtendedDeleteResult, T>;
  findByIdAndUpdate(id: string | Types.ObjectId, update: any, options?: any): ExtendedQuery<T | null, T>;
  updateMany(conditions: any, update: any, options?: any): ExtendedQuery<ExtendedUpdateResult, T>;
  countDocuments(conditions: any): ExtendedQuery<number, T>;
} 