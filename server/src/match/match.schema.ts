import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Submission } from '../submission/submission.schema';

export type MatchDocument = Match & Document;

@Schema()
export class Match {
  @Prop({ type: Types.ObjectId, ref: 'Submission', required: true })
  founderSubmission!: Submission;

  @Prop({ type: Types.ObjectId, ref: 'Submission', required: true })
  investorSubmission!: Submission;

  @Prop({ required: true })
  score!: number;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const MatchSchema = SchemaFactory.createForClass(Match); 