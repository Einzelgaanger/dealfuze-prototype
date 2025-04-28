import { Document } from 'mongoose';

declare module 'mongoose' {
  interface Model<T extends Document> {
    findById(id: string): Promise<T | null>;
    findOne(conditions: any): Promise<T | null>;
    find(conditions: any): Promise<T[]>;
    create(doc: any): Promise<T>;
    updateOne(conditions: any, update: any): Promise<any>;
    deleteOne(conditions: any): Promise<any>;
  }
}

export { Document }; 