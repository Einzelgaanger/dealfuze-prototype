import mongoose, { Schema } from "mongoose";
import {
  SubmissionDocument,
  SubmissionStatus,
} from "../../types/submission.type";

const submissionSchema = new Schema<SubmissionDocument>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: "Form",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    data: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: Object.values(SubmissionStatus),
    },
    submittedAt: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
    linkedInProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LinkedinProfile",
      required: false,
    },
  },
  {
    timestamps: { createdAt: "submittedAt", updatedAt: false }, // Only use submittedAt as timestamp
  }
);

submissionSchema.index({ formId: 1, submittedAt: -1 });

const SubmissionModel = mongoose.model<SubmissionDocument>(
  "Submission",
  submissionSchema
);

export default SubmissionModel;
