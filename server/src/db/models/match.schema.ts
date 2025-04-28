import { model, Schema } from "mongoose";
import { MatchDocument } from "../../types/match.type";

const matchSchema = new Schema<MatchDocument>({
  pipelineId: { type: Schema.Types.ObjectId, ref: "Pipeline", required: true },
  investorId: { type: Schema.Types.ObjectId, ref: "Investor", required: true },
  founderId: { type: Schema.Types.ObjectId, ref: "Founder", required: true },
  totalMatchPercentage: { type: Number, required: true },
  formMatchPercentage: { type: Number, required: true },
  personalityMatchPercentage: { type: Number, required: true },
  formMatch: { type: Map, of: Number, required: true },
});

const MatchModel = model<MatchDocument>("Match", matchSchema);

export default MatchModel;
