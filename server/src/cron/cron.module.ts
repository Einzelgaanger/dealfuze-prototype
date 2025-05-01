import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PersonalityService } from '../personality/personality.service';
import { MatchService } from '../match/match.service';
import { SubmissionService } from '../submission/submission.service';
import { Submission } from '../submission/submission.schema';
import PersonalityModel from '../db/models/personality.schema';
import { Match } from '../match/match.schema';
import { CronService } from './cron.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Submission.name, schema: Submission },
      { name: PersonalityModel.name, schema: PersonalityModel },
      { name: Match.name, schema: Match },
    ]),
  ],
  providers: [
    PersonalityService,
    MatchService,
    SubmissionService,
    CronService,
  ],
  exports: [CronService],
})
export class CronModule {} 