import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Match, MatchSchema } from './match.schema';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { MatchCalculationService } from './match-calculation.service';
import { SubmissionModule } from '../submission/submission.module';
import FormModel from '../db/models/form.schema';
import PersonalityModel from '../db/models/personality.schema';
import SubmissionModel from '../db/models/submission.schema';
import MatchCriteriaModel from '../db/models/matchCriteria.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Match.name, schema: MatchSchema },
      { name: FormModel.name, schema: FormModel.schema },
      { name: PersonalityModel.name, schema: PersonalityModel.schema },
      { name: SubmissionModel.name, schema: SubmissionModel.schema },
      { name: MatchCriteriaModel.name, schema: MatchCriteriaModel.schema }
    ]),
    forwardRef(() => SubmissionModule)
  ],
  controllers: [MatchController],
  providers: [MatchService, MatchCalculationService],
  exports: [MatchService]
})
export class MatchModule {}