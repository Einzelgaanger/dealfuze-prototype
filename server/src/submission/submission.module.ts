import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Submission, SubmissionSchema } from './submission.schema';
import { SubmissionService } from './submission.service';
import { SubmissionController } from './submission.controller';
import { MatchModule } from '../match/match.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Submission.name, schema: SubmissionSchema }]),
    forwardRef(() => MatchModule)
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
  exports: [SubmissionService]
})
export class SubmissionModule {} 