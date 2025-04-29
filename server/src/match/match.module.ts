import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Match, MatchSchema } from './match.schema';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { MatchCalculationService } from './match-calculation.service';
import { SubmissionModule } from '../submission/submission.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }]),
    SubmissionModule
  ],
  controllers: [MatchController],
  providers: [MatchService, MatchCalculationService],
  exports: [MatchService, MatchCalculationService]
})
export class MatchModule {} 