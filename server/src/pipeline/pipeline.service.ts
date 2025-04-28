import matchCriteriaService from "../matchCriteria/matchCriteria.service";
import PipelineModel from "../db/models/pipeline.schema";
import formService from "../form/form.service";
import { ObjectId } from "mongodb";

async function createPipeline(
  userId: string,
  pipelineName: string,
  description: string
) {
  // Create pipeline
  const pipeline = await PipelineModel.create([
    {
      userId: userId,
      name: pipelineName,
      description,
    },
  ]);

  // Create match criteria
  await matchCriteriaService.createDefaultMatchCriteria(pipeline[0]._id);

  // Create forms
  await formService.createDefaultForms(pipeline[0]._id, pipelineName);

  return { id: pipeline[0]._id };
}

async function deletePipeline(pipelineId: ObjectId) {
  // Find the pipeline first
  const pipeline = await PipelineModel.findOne({ _id: pipelineId });

  if (!pipeline) {
    throw new Error("Pipeline not found");
  }

  // Use deleteOne() to trigger the pre-hook
  await pipeline.deleteOne();
}

async function updatePipeline(
  pipelineId: string,
  name: string,
  description: string
) {
  const pipeline = await PipelineModel.findOneAndUpdate(
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

const pipelineService = {
  createPipeline,
  deletePipeline,
  updatePipeline,
};

export default pipelineService;
