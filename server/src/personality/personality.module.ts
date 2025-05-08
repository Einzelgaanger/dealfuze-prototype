import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { PersonalityService } from './personality.service';
import PersonalityModel from '../db/models/personality.schema';
import { Submission, SubmissionSchema } from '../submission/submission.schema';
import { MatchModule } from '../match/match.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PersonalityModel.name, schema: PersonalityModel.schema },
      { name: Submission.name, schema: SubmissionSchema }
    ]),
    MatchModule
  ],
  providers: [PersonalityService],
  exports: [PersonalityService]
})
export class PersonalityModule {}