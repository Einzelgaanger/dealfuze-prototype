import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IndustryFamilyService } from './industryFamily.service';
import IndustryFamily from '../db/models/industryFamily.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: IndustryFamily.name, schema: IndustryFamily.schema }
    ])
  ],
  providers: [IndustryFamilyService],
  exports: [IndustryFamilyService]
})
export class IndustryFamilyModule {}
