import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CharacterTraitService } from './characterTrait.service';
import { CharacterTrait, CharacterTraitSchool } from '../db/models/characterTrait.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CharacterTrait.name, schema: CharacterTrait.schema },
      { name: CharacterTraitSchool.name, schema: CharacterTraitSchool.schema }
    ])
  ],
  providers: [CharacterTraitService],
  exports: [CharacterTraitService]
})
export class CharacterTraitModule {}
