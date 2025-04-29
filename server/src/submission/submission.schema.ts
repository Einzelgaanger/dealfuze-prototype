import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SubmissionType, SubmissionStatus, SubmissionDataType } from '../types/submission.type';

@Schema({ timestamps: true })
export class Submission extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Form' })
  formId!: Types.ObjectId;

  @Prop({ type: String, enum: SubmissionType, required: true })
  type!: SubmissionType;

  @Prop({ type: Object, required: true })
  data!: SubmissionDataType;

  @Prop({ type: Date, required: true })
  submittedAt!: Date;

  @Prop({ type: String })
  ipAddress?: string;

  @Prop({ type: String })
  userAgent?: string;

  @Prop({ type: String })
  name?: string;

  @Prop({ type: String })
  email?: string;

  @Prop({ type: Types.ObjectId, ref: 'LinkedInProfile' })
  linkedInProfileId?: Types.ObjectId;

  @Prop({ type: String, enum: SubmissionStatus, default: SubmissionStatus.PENDING })
  status!: SubmissionStatus;

  @Prop({ type: Object })
  characterTraits?: {
    personalityType?: string;
    leadershipStyle?: string;
    communicationStyle?: string;
    decisionMaking?: string;
    riskTolerance?: string;
    workEthic?: string;
    lastUpdated?: Date;
  };

  @Prop({ type: Object })
  familyInfo?: {
    familyBackground?: string;
    familyInvolvement?: string;
    familyValues?: string[];
    lastUpdated?: Date;
  };

  @Prop({ type: Boolean, default: false })
  isDeleted!: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Number, default: 0 })
  matchScore!: number;

  @Prop({ type: Date })
  lastMatchUpdate?: Date;
}

export type SubmissionDocument = Submission & Document;
export const SubmissionSchema = SchemaFactory.createForClass(Submission);

// Create indexes
SubmissionSchema.index({ formId: 1, submittedAt: -1 });
SubmissionSchema.index({ type: 1, status: 1 });
SubmissionSchema.index({ email: 1 });
SubmissionSchema.index({ name: 1 });
SubmissionSchema.index({ matchScore: -1 }); 