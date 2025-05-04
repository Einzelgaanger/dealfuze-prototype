import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchCriteriaService } from './matchCriteria.service';
import MatchCriteriaModel from '../db/models/matchCriteria.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MatchCriteriaModel.name, schema: MatchCriteriaModel }
    ])
  ],
  providers: [MatchCriteriaService],
  exports: [MatchCriteriaService]
})
export class MatchCriteriaModule {}