import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchingService } from '../services/matching.service';
import { MatchingController } from './matching.controller';
import Match from '../db/models/match.schema';
import { IndustryFamilyModule } from '../services/industryFamily.module';
import { CharacterTraitModule } from '../services/characterTrait.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Match', schema: Match }
    ]),
    IndustryFamilyModule,
    CharacterTraitModule
  ],
  controllers: [MatchingController],
  providers: [
    MatchingService
  ],
  exports: [MatchingService]
})
export class MatchingModule {}