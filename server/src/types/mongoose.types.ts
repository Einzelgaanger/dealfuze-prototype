import { Document, Model, Schema, Types } from 'mongoose';

declare module 'mongoose' {
  interface Query<ResultType, DocType extends Document> {
    exec(): Promise<ResultType>;
    sort(arg: any): this;
    limit(n: number): this;
    skip(n: number): this;
    lean(): this;
    select(arg: any): this;
  }

  interface DocumentQuery<ResultType, DocType extends Document> {
    exec(): Promise<ResultType>;
    sort(arg: any): this;
    limit(n: number): this;
    skip(n: number): this;
    lean(): this;
    select(arg: any): this;
  }

  interface DeleteResult {
    deletedCount?: number;
  }

  interface UpdateResult {
    nModified: number;
  }

  interface Aggregate<R> {
    exec(): Promise<R>;
  }
}

// Add missing extension methods that TypeScript doesn't recognize
export interface ExtendedModel<T extends Document> extends Model<T> {
  aggregate(pipeline: any[]): mongoose.Aggregate<any[]>;
  bulkWrite(operations: any[]): Promise<any>;
  insertMany(docs: any[]): Promise<T[]>;
} 