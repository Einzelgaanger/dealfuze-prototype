import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SubmissionStatus, SubmissionDataType } from '../types/submission.type';

export type SubmissionDocument = Document & {
  formId: Types.ObjectId;
  type: 'founder' | 'investor';
  data: SubmissionDataType;
  submittedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  name: string;
  email: string;
  linkedInProfileId?: Types.ObjectId;
  status: SubmissionStatus;
};

@Schema({ timestamps: true })
export class Submission {
  @Prop({ type: Types.ObjectId, ref: 'Form', required: true, index: true })
  formId!: Types.ObjectId;

  @Prop({ type: String, required: true, enum: ['founder', 'investor'] })
  type!: 'founder' | 'investor';

  @Prop({ type: Object, required: true })
  data!: SubmissionDataType;

  @Prop({ type: Date, default: Date.now })
  submittedAt!: Date;

  @Prop({ type: String })
  ipAddress?: string;

  @Prop({ type: String })
  userAgent?: string;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: String, required: true })
  email!: string;

  @Prop({ type: Types.ObjectId, ref: 'LinkedInProfile' })
  linkedInProfileId?: Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: Object.values(SubmissionStatus),
    default: SubmissionStatus.PENDING,
    required: true 
  })
  status!: SubmissionStatus;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
SubmissionSchema.index({ formId: 1, submittedAt: -1 }); 