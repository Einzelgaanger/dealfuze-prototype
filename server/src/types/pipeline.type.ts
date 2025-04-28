import { Document, ObjectId } from "mongodb";

export interface PipelineDocument extends Document {
  userId: string;
  name: string;
  description?: string;
}
