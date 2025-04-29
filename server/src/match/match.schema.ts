import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SubmissionStatus } from '../types/submission.type';
import { IMatchCriteria } from '../types/matchCriteria.type';

export enum MatchStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum RejectionReason {
  NOT_INTERESTED = 'not_interested',
  WRONG_INDUSTRY = 'wrong_industry',
  WRONG_STAGE = 'wrong_stage',
  WRONG_MARKET_SIZE = 'wrong_market_size',
  WRONG_INVESTMENT_RANGE = 'wrong_investment_range',
  WRONG_LOCATION = 'wrong_location',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class Match extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Submission' })
  founderSubmissionId: Types.ObjectId = new Types.ObjectId();

  @Prop({ type: Types.ObjectId, required: true, ref: 'Submission' })
  investorSubmissionId: Types.ObjectId = new Types.ObjectId();

  @Prop({ type: Number, required: true, min: 0, max: 100 })
  score: number = 0;

  @Prop({ type: String, enum: MatchStatus, default: MatchStatus.PENDING })
  status: MatchStatus = MatchStatus.PENDING;

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

  @Prop({ type: Object, required: true })
  matchCriteria: IMatchCriteria = {
    industry: 0,
    fundingStage: 0,
    marketSize: 0,
    investmentRange: 0,
    location: 0,
    personality: 0,
    total: 0
  };

  @Prop({ type: Boolean, default: false })
  isHighPriority: boolean = false;

  @Prop({ type: Object })
  metadata: Record<string, any> = {};
}

export const MatchSchema = SchemaFactory.createForClass(Match);

// Create indexes for efficient querying
MatchSchema.index({ founderSubmissionId: 1, investorSubmissionId: 1 }, { unique: true });
MatchSchema.index({ status: 1, score: -1 });
MatchSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // 30 days TTL 