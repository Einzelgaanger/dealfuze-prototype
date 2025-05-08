import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import PipelineModel from '../db/models/pipeline.schema';
import { PipelineController } from './pipeline.controller';
import { PipelineService } from './pipeline.service';
import { FormModule } from '../form/form.module';
import { MatchCriteriaModule } from '../matchCriteria/matchCriteria.module';
import { PipelineAuthMiddleware } from './pipeline.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PipelineModel.name, schema: PipelineModel.schema }
    ]),
    FormModule,
    MatchCriteriaModule
  ],
  controllers: [PipelineController],
  providers: [PipelineService],
  exports: [PipelineService]
})
export class PipelineModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PipelineAuthMiddleware)
      .forRoutes(PipelineController);
  }
}
