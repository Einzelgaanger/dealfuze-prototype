import mongoose, { Schema } from "mongoose";
import { FormType } from "../../types/form.type";
import { InvestorType, FounderType } from "../../types/personality.type";
import { PersonalityDocument } from "../../types/personality.type";

export interface IPersonality {
  submissionId: mongoose.Types.ObjectId;
  formId: mongoose.Types.ObjectId;
  traits: mongoose.Types.ObjectId[];
  formType: FormType;
  createdAt: Date;
  updatedAt: Date;
}

const personalitySchema = new Schema<IPersonality>(
  {
    submissionId: {
      type: Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
    },
    formId: {
      type: Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
    },
    traits: [{
      type: Schema.Types.ObjectId,
      ref: 'CharacterTrait',
      required: true,
    }],
    formType: {
      type: String,
      enum: Object.values(FormType),
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster lookups
personalitySchema.index({ submissionId: 1 });
personalitySchema.index({ formId: 1 });
personalitySchema.index({ traits: 1 });

const PersonalityModel = mongoose.model<IPersonality>("Personality", personalitySchema);

export default PersonalityModel;
