import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { Match, MatchSchema } from './match.schema';
import { Submission, SubmissionSchema } from '../submission/submission.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Match.name, schema: MatchSchema },
      { name: Submission.name, schema: SubmissionSchema },
    ]),
  ],
  controllers: [MatchController],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {} 