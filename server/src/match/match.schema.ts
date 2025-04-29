import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum MatchStatus {
  PENDING = 'pending',
  VIEWED = 'viewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  ARCHIVED = 'archived'
}

export enum RejectionReason {
  NOT_INTERESTED = 'not_interested',
  BAD_FIT = 'bad_fit', 
  TIMING_ISSUE = 'timing_issue',
  OTHER = 'other'
}

export interface MatchCriteria {
  industryMatch?: number;
  fundingStageMatch?: number;
  investmentSizeMatch?: number;
  geographyMatch?: number;
  businessModelMatch?: number;
}

export type MatchDocument = Match & Document;

@Schema({ timestamps: true })
export class Match {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Submission' })
  founderSubmissionId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Submission' })
  investorSubmissionId: string;

  @Prop({ required: true, type: Number })
  score: number;

  @Prop({ required: true, enum: MatchStatus, default: MatchStatus.PENDING })
  status: MatchStatus;

  @Prop({ type: Date })
  viewedAt?: Date;
  
  @Prop({ type: Date })
  acceptedAt?: Date;
  
  @Prop({ type: Date })
  rejectedAt?: Date;
  
  @Prop({ enum: RejectionReason })
  rejectionReason?: RejectionReason;

  @Prop({ type: Date })
  archivedAt?: Date;

  @Prop({ type: Object })
  matchDetails?: Record<string, any>;

  @Prop({ type: Object, default: {} })
  matchCriteria: MatchCriteria;

  @Prop({ type: Boolean, default: false })
  isHighPriority: boolean;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const MatchSchema = SchemaFactory.createForClass(Match);

// Create indexes for efficient querying
MatchSchema.index({ founderSubmissionId: 1 });
MatchSchema.index({ investorSubmissionId: 1 });
MatchSchema.index({ score: -1 }); // Index scores in descending order
MatchSchema.index({ status: 1 });

// Create compound indexes
MatchSchema.index({ founderSubmissionId: 1, investorSubmissionId: 1 }, { unique: true });
MatchSchema.index({ createdAt: -1 });
MatchSchema.index({ status: 1, score: -1 }); 