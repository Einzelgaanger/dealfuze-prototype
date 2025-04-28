import mongoose, { Schema } from "mongoose";
import { FormDocument, FormSettings, FormType } from "../../types/form.type";
import SubmissionModel from "./submission.schema";

const formSettingsSchema = new Schema<FormSettings>(
  {
    submitButtonText: { type: String, default: "Submit" },
    successMessage: { type: String, default: "Thank you for your submission!" },
    redirectUrl: String,
    sendEmailNotification: { type: Boolean, default: false },
    hideTitle: { type: Boolean, default: false },
  },
  { _id: false }
);

const formSchema = new Schema<FormDocument>(
  {
    pipelineId: {
      type: Schema.Types.ObjectId,
      ref: "Pipeline",
      required: true,
    },
    submitterType: {
      type: String,
      required: true,
      enum: Object.values(FormType),
    },
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      default: "form",
    },
    display: {
      type: String,
      required: true,
      default: "form",
    },
    title: { type: String, required: true },
    description: String,
    components: [Schema.Types.Mixed], // FormioComponent array
    settings: {
      type: formSettingsSchema,
      default: () => ({
        submitButtonText: "Submit",
        successMessage: "Thank you for your submission!",
        storeSubmissions: true,
        sendEmailNotification: false,
        emailRecipients: [],
        hideTitle: false,
      }),
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

formSchema.pre("deleteMany", async function () {
  let deletedData = await FormModel.find(this.getFilter());

  await SubmissionModel.deleteMany({
    formId: { $in: deletedData.map((form) => form._id) },
  });
});

const FormModel = mongoose.model<FormDocument>("Form", formSchema);
export default FormModel;
