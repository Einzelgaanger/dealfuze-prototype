import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchingService } from '../services/matching.service';
import { IndustryFamilyService } from '../services/industryFamily.service';
import { CharacterTraitService } from '../services/characterTrait.service';
import { MatchingController } from './matching.controller';
import IndustryFamily from '../db/models/industryFamily.schema';
import { CharacterTrait, CharacterTraitSchool } from '../db/models/characterTrait.schema';
import Match from '../db/models/match.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'IndustryFamily', schema: IndustryFamily },
      { name: 'CharacterTrait', schema: CharacterTrait },
      { name: 'CharacterTraitSchool', schema: CharacterTraitSchool },
      { name: 'Match', schema: Match }
    ])
  ],
  controllers: [MatchingController],
  providers: [
    MatchingService,
    IndustryFamilyService,
    CharacterTraitService
  ],
  exports: [MatchingService]
})
export class MatchingModule {} 