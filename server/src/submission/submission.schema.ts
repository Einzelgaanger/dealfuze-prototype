import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SubmissionStatus, SubmissionDataType } from '../types/submission.type';

export type SubmissionDocument = Submission & Document;

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

export const SubmissionSchema = SchemaFactory.createForClass(Submission);

// Create indexes for efficient querying
SubmissionSchema.index({ formId: 1, submittedAt: -1 });
SubmissionSchema.index({ type: 1, status: 1 });
SubmissionSchema.index({ isDeleted: 1 });
SubmissionSchema.index({ matchScore: -1 }); 