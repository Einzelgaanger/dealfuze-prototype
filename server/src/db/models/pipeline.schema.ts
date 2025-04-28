import mongoose, { Schema } from "mongoose";
import { PipelineDocument } from "../../types/pipeline.type";
import FormModel from "./form.schema";
import MatchCriteriaModel from "./matchCriteria.schema";
import PersonalityModel from "./personality.schema";

const pipelineSchema = new Schema<PipelineDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: { createdAt: "submittedAt", updatedAt: false }, // Only use submittedAt as timestamp
  }
);

// Pre-hook for cascade deletion
pipelineSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    const pipelineId = this._id;

    // Delete all forms associated with this pipeline
    const forms = await FormModel.find({ pipelineId });

    // Delete all match criteria
    await MatchCriteriaModel.deleteMany({ pipelineId });

    // Delete all personalities associated with submissions from this pipeline's forms
    for (const form of forms) {
      await PersonalityModel.deleteMany({
        submissionId: {
          $in: await FormModel.distinct("submissions", { formId: form._id }),
        },
      });
    }

    // Delete all forms
    await FormModel.deleteMany({ pipelineId });
  }
);

const PipelineModel = mongoose.model<PipelineDocument>(
  "Pipeline",
  pipelineSchema
);

export default PipelineModel;
