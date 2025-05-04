import { MatchCriteriaService } from "../matchCriteria/matchCriteria.service";
import { ObjectId } from "mongodb";
import { FormService } from "../form/form.service";
import PipelineModel from "../db/models/pipeline.schema";
import { PipelineDocument } from "../types/pipeline.type";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class PipelineService {
  constructor(
    @InjectModel(PipelineModel.name)
    private pipelineModel: Model<PipelineDocument>,
    private readonly matchCriteriaService: MatchCriteriaService,
    private readonly formService: FormService
  ) {}

  async createPipeline(
    userId: string,
    pipelineName: string,
    description: string
  ) {
    // Create pipeline
    const pipeline = await this.pipelineModel.create([
      {
        userId: userId,
        name: pipelineName,
        description,
      },
    ]);

    // Create match criteria
    await this.matchCriteriaService.createDefaultMatchCriteria(pipeline[0]._id);

    // Create forms
    await this.formService.createDefaultForms(pipeline[0]._id, pipelineName);

    return { id: pipeline[0]._id };
  }

  async deletePipeline(pipelineId: ObjectId) {
    // Find the pipeline first
    const pipeline = await this.pipelineModel.findOne({ _id: pipelineId });

    if (!pipeline) {
      throw new Error("Pipeline not found");
    }

    // Use deleteOne() to trigger the pre-hook
    await pipeline.deleteOne();
  }

  async updatePipeline(
    pipelineId: string,
    name: string,
    description: string
  ) {
    const pipeline = await this.pipelineModel.findOneAndUpdate(
      { _id: pipelineId },
      {
        $set: {
          name: name,
          description: description,
        },
      },
      { new: true }
    );

    return pipeline;
  }
}
