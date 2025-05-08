import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SubmissionModule } from './submission/submission.module';
import { MatchModule } from './match/match.module';
import { CronModule } from './cron/cron.module';
import { MatchingModule } from './matching/matching.module';
import { PersonalityModule } from './personality/personality.module';
import { IndustryFamilyModule } from './services/industryFamily.module';
import { CharacterTraitModule } from './services/characterTrait.module';
import { PipelineModule } from './pipeline/pipeline.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    SubmissionModule,
    MatchModule,
    CronModule,
    MatchingModule,
    PersonalityModule,
    IndustryFamilyModule,
    CharacterTraitModule,
    PipelineModule,
  ],
})
export class AppModule {}