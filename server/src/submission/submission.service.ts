import {
  ISubmission,
  SubmissionDataType,
  SubmissionDocument,
  SubmissionStatus,
} from "../types/submission.type";
import FormModel from "../db/models/form.schema";
import SubmissionModel from "../db/models/submission.schema";
import { createFormSchema } from "../utils";
import { FormDocument } from "../types/form.type";
import MatchCriteriaModel from "../db/models/matchCriteria.schema";
import {
  personalityService,
  requestLinkedInProfile,
} from "../personality/personality.service";
import { LinkedinProfileStatus } from "../types/linkedinProfile.type";
import matchService from "../match/match.service";

async function validateSubmission(
  form: FormDocument,
  submission: SubmissionDataType
) {
  const formSchema = createFormSchema(form, false);
  const validationResult = formSchema.safeParse(submission);
  if (!validationResult.success) {
    console.error(JSON.stringify(validationResult.error, null, 2));
    throw new Error("Invalid submission");
  }

  const name = submission["name"];
  const email = submission["email"];

  if (!name || !email) {
    throw new Error("Name and email are required");
  }

  return { name, email };
}

async function getFormSubmissions(
  formId: string,
  pageQuery: string,
  limitQuery: string
) {
  const form = await FormModel.findById(formId);
  if (!form) {
    return null;
  }

  const page = parseInt(pageQuery) || 1;
  const limit = parseInt(limitQuery) || 20;
  const skip = (page - 1) * limit;

  const total = await SubmissionModel.countDocuments({ formId });
  const submissions = await SubmissionModel.find({ formId })
    .sort({ submittedAt: -1 })
    .skip(skip)
    .limit(limit);

  const formattedSubmissions = submissions.map((sub: SubmissionDocument) => {
    const dataObj: Record<string, any> = {};

    sub.data.forEach((value: any, key: any) => {
      dataObj[key] = value;
    });

    return {
      id: sub._id,
      formId: sub.formId,
      data: dataObj,
      submittedAt: sub.submittedAt,
      ipAddress: sub.ipAddress,
      userAgent: sub.userAgent,
      name: sub.name,
      email: sub.email,
      status: sub.status,
    };
  });

  return {
    submissions: formattedSubmissions,
    total,
    page,
    limit,
  };
}

async function getSubmissionById(submissionId: string) {
  const submission = await SubmissionModel.findById(submissionId);

  if (!submission) {
    return null;
  }

  const dataObj: Record<string, any> = {};
  submission.data.forEach((value: any, key: any) => {
    dataObj[key] = value;
  });

  const formattedSubmission = {
    id: submission._id,
    formId: submission.formId,
    data: dataObj,
    submittedAt: submission.submittedAt,
    ipAddress: submission.ipAddress,
    userAgent: submission.userAgent,
    name: submission.name,
    email: submission.email,
  };

  return formattedSubmission;
}

async function deleteSubmissions(submissionIds: string[]) {
  await SubmissionModel.deleteMany({ _id: { $in: submissionIds } });
}

async function createSubmission(
  formId: string,
  submission: SubmissionDataType,
  userAgent?: string,
  ipAddress?: string
) {
  const form = await FormModel.findById<FormDocument>(formId);
  if (!form) {
    throw new Error("Form not found");
  }

  const { name, email } = await validateSubmission(form, submission);

  const formData = new Map<string, any>();
  Object.entries(submission).forEach(([key, value]) => {
    formData.set(key, value);
  });

  const matchCriteria = await MatchCriteriaModel.findOne({
    pipelineId: form.pipelineId,
  });

  if (!matchCriteria) {
    throw new Error("Match criteria not found");
  }

  let submissionToCreate: ISubmission = {
    formId: form._id,
    name,
    email,
    data: formData,
    ipAddress,
    userAgent,
    submittedAt: new Date(),
    status: SubmissionStatus.PENDING,
  };

  const createdSubmission = await SubmissionModel.create(submissionToCreate);

  try {
    // If the match criteria is set to use linkedin personality, we need to request the linkedin profile
    if (matchCriteria.useLinkedinPersonality) {
      const linkedinProfile = await requestLinkedInProfile(
        formData.get("linkedinurl")
      );

      await SubmissionModel.findByIdAndUpdate(createdSubmission._id, {
        linkedInProfileId: linkedinProfile._id,
      });

      // If the linkedin profile is pending, we need to wait for it to be processed
      if (linkedinProfile.status === LinkedinProfileStatus.PENDING) {
        return {
          redirectUrl: form.settings.redirectUrl,
          successMessage: form.settings.successMessage,
          submissionId: createdSubmission._id,
        };
      }
    }
    // Generate the personality from the survey responses
    await personalityService.generatePersonality(
      createdSubmission._id,
      form.components.filter((component) => component.isPersonality),
      matchCriteria.useLinkedinPersonality
    );

    matchService.matchSubmission(form, createdSubmission, matchCriteria);
  } catch (error) {
    console.error(error);
    await SubmissionModel.findByIdAndUpdate(createdSubmission._id, {
      status: SubmissionStatus.FAILED,
    });

    throw error;
  }

  if (form.settings.sendEmailNotification) {
    console.log(
      "Email notification would be sent to:",
      form.settings.emailRecipients
    );
  }

  return {
    redirectUrl: form.settings.redirectUrl,
    successMessage: form.settings.successMessage,
    submissionId: createdSubmission._id,
  };
}

export default {
  createSubmission,
  getFormSubmissions,
  getSubmissionById,
  deleteSubmissions,
};
