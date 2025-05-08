import mongoose, { Schema } from "mongoose";
import {
  Submission,
  SubmissionDocument,
  SubmissionStatus,
  SubmissionType,
} from "../../types/submission.type";

const submissionSchema = new Schema<SubmissionDocument>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: "Form",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(SubmissionType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SubmissionStatus),
      default: SubmissionStatus.PENDING,
    },
    data: {
      type: Map,
      of: Schema.Types.Mixed,
      default: new Map(),
    },
    submittedAt: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
    name: String,
    email: String,
    linkedInProfileId: {
      type: String,
      ref: "LinkedinProfile",
      required: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    matchScore: {
      type: Number,
      default: 0,
    },
    characterTraits: {
      traits: [String],
      lastUpdated: Date,
    },
    familyInfo: {
      members: [String],
      lastUpdated: Date,
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ formId: 1, submittedAt: -1 });

const SubmissionModel = mongoose.model<SubmissionDocument>(
  "Submission",
  submissionSchema
);

export default SubmissionModel;
