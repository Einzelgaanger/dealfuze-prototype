import mongoose, { Schema } from "mongoose";
import { FormType } from "../../types/form.type";
import { InvestorType, FounderType } from "../../types/personality.type";
import { PersonalityDocument } from "../../types/personality.type";

const personalitySchema = new Schema<PersonalityDocument>(
  {
    submissionId: { type: Schema.Types.ObjectId, required: true, unique: true },
    formType: { type: String, required: true, enum: Object.values(FormType) },
    riskTolerance: { type: Number, required: true },
    industryFocus: { type: [String], required: true },
    corporateExperience: { type: Number, required: true },
    languages: { type: [String], required: true },
    countries: { type: [String], required: true },
    interests: { type: [String], required: true },
    networkSize: { type: Number, required: false },
    followerCount: { type: Number, required: false },
    investorType: { type: String, enum: Object.values(InvestorType) },
    founderType: { type: String, enum: Object.values(FounderType) },
    summary: { type: String, required: true },
    educationInstitutions: { type: [String], required: true },
  },
  {
    timestamps: true,
  }
);

const PersonalityModel = mongoose.model<PersonalityDocument>(
  "Personality",
  personalitySchema
);

export default PersonalityModel;
