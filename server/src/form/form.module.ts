import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormController } from './form.controller';
import { FormService } from './form.service';
import { SubmissionModule } from '../submission/submission.module';
import { MatchCriteriaModule } from '../matchCriteria/matchCriteria.module';
import FormModel from '../db/models/form.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FormModel.name, schema: FormModel }
    ]),
    SubmissionModule,
    MatchCriteriaModule
  ],
  controllers: [FormController],
  providers: [FormService],
  exports: [FormService]
})
export class FormModule {}