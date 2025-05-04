import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Submission, SubmissionSchema } from './submission.schema';
import { SubmissionService } from './submission.service';
import { SubmissionController } from './submission.controller';
import { MatchModule } from '../match/match.module';
import { PersonalityModule } from '../personality/personality.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Submission.name, schema: SubmissionSchema }]),
    forwardRef(() => MatchModule),
    PersonalityModule
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
  exports: [SubmissionService]
})
export class SubmissionModule {} 