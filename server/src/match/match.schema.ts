import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IMatchCriteria } from '../types/matchCriteria.type';

export enum MatchStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  VIEWED = 'viewed',
  ARCHIVED = 'archived'
}

export enum RejectionReason {
  NOT_INTERESTED = 'not_interested',
  WRONG_INDUSTRY = 'wrong_industry',
  WRONG_STAGE = 'wrong_stage',
  WRONG_LOCATION = 'wrong_location',
  OTHER = 'other'
}

@Schema({ timestamps: true })
export class Match extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Submission' })
  founderSubmissionId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Submission' })
  investorSubmissionId!: Types.ObjectId;

  @Prop({ type: Number, required: true })
  score!: number;

  @Prop({ type: Object, required: true })
  matchCriteria!: IMatchCriteria;

  @Prop({ type: String, enum: MatchStatus, default: MatchStatus.PENDING })
  status!: MatchStatus;

  @Prop({ type: String, enum: RejectionReason })
  rejectionReason?: RejectionReason;

  @Prop({ type: String })
  rejectionNotes?: string;

  @Prop({ type: Date })
  acceptedAt?: Date;

  @Prop({ type: Date })
  rejectedAt?: Date;

  @Prop({ type: Date })
  expiredAt?: Date;

  @Prop({ type: Date })
  viewedAt?: Date;

  @Prop({ type: Date })
  archivedAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export type MatchDocument = Match & Document;
export const MatchSchema = SchemaFactory.createForClass(Match);

// Create indexes
MatchSchema.index({ founderSubmissionId: 1, investorSubmissionId: 1 }, { unique: true });
MatchSchema.index({ status: 1 });
MatchSchema.index({ score: -1 });
MatchSchema.index({ createdAt: -1 }); 