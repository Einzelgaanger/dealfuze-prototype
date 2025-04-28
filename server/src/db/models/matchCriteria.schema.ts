import mongoose, { Schema } from "mongoose";
import { MatchCriteriaDocument } from "../../types/matchCriteria.type";
import { MatchType } from "../../types/matchCriteria.type";

const matchCriteriaSchema = new Schema<MatchCriteriaDocument>(
  {
    pipelineId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    matchCriteria: [
      {
        id: { type: Schema.Types.ObjectId, auto: true },
        founderField: { type: String, required: true },
        investorField: { type: String, required: true },
        weight: { type: Number, min: 0, max: 1, default: 1 },
        matchType: {
          type: String,
          enum: Object.values(MatchType),
          default: MatchType.EXACT,
        },
        required: { type: Boolean, default: false },
      },
    ],
    useLinkedinPersonality: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

matchCriteriaSchema.index({ pipelineId: 1, investorField: 1 });

const MatchCriteriaModel = mongoose.model<MatchCriteriaDocument>(
  "MatchCriteria",
  matchCriteriaSchema
);

export default MatchCriteriaModel;
