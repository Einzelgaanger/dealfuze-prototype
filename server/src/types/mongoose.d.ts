import { Document, Model } from 'mongoose';

export interface Model<T extends Document> {
  findByIdAndUpdate(
    id: any,
    update: any,
    options?: any
  ): Promise<T | null>;

  findById(id: any): Promise<T | null>;

  find(conditions?: any): Promise<T[]>;

  deleteMany(conditions?: any): Promise<{ deletedCount?: number }>;

  create(doc: any): Promise<T>;

  updateOne(conditions: any, update: any): Promise<{ nModified: number }>;

  findOne(conditions?: any): Promise<T | null>;

  findOneAndUpdate(
    conditions: any,
    update: any,
    options?: any
  ): Promise<T | null>;

  findOneAndDelete(conditions: any): Promise<T | null>;

  countDocuments(conditions?: any): Promise<number>;
}

export { Document }; 