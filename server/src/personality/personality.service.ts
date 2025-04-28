import OpenAI from "openai";
import { ObjectId } from "mongodb";
import { IPersonality } from "../types/personality.type";
import SubmissionModel from "../db/models/submission.schema";
import FormModel from "../db/models/form.schema";
import { zodResponseFormat } from "openai/helpers/zod";
import { FormType } from "../types/form.type";
import {
  founderPersonalitySchema,
  investorPersonalitySchema,
} from "./personalityJsonSchema";
import LinkedinProfileModel from "../db/models/linkedinProfile.schema";
import PersonalityModel from "../db/models/personality.schema";
import { FormComponent } from "../types/formComponent.type";
import { AppConfig } from "../config";
import { LinkedinProfileStatus } from "../types/linkedinProfile.type";
import { SubmissionStatus } from "../types/submission.type";
import MatchCriteriaModel from "../db/models/matchCriteria.schema";
import matchService from "../match/match.service";

const openai = new OpenAI({
  apiKey: AppConfig.OPEN_AI_API_KEY,
});

function getLinkedInId(linkedinUrl: string) {
  const linkedinRegex =
    /(?:https?:\/\/)?(?:www\.)?(?:[a-z]{2,3}\.)?linkedin\.com\/(?:in|profile)\/([a-zA-Z0-9_-]+)/;
  const match = linkedinUrl.match(linkedinRegex);
  return match ? match[1] : null;
}

export async function requestLinkedInProfile(linkedinUrl: string) {
  const linkedInId = getLinkedInId(linkedinUrl);

  if (!linkedInId) {
    throw new Error("Linkedin ID not found");
  }

  const currentLinkedinProfile = await LinkedinProfileModel.findOne({
    linkedInId,
  });

  if (
    currentLinkedinProfile &&
    currentLinkedinProfile.data.updated_at.getTime() >
      Date.now() - 1000 * 60 * 60 * 24 * 30
  ) {
    return currentLinkedinProfile;
  }

  const response = await fetch(
    `https://api.brightdata.com/datasets/v3/trigger?dataset_id=gd_l1viktl72bvl7bjuj0&include_errors=true&endpoint=${AppConfig.APP_URL}/api/webhook/brightdata&auth_header=Bearer%20${AppConfig.BRIGHTDATA_WEBHOOK_SECRET}&format=json&uncompressed_webhook=true`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AppConfig.BRIGHTDATA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          url: `https://www.linkedin.com/in/${linkedInId}`,
        },
      ]),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Error fetching LinkedIn profile: " + data.error);
  }

  let linkedinProfile = await LinkedinProfileModel.findOneAndUpdate(
    {
      linkedinId: linkedInId,
    },
    {
      $set: {
        status: LinkedinProfileStatus.PENDING,
        snapshotId: data.snapshot_id,
      },
    },
    {
      new: true,
    }
  );

  if (!linkedinProfile) {
    linkedinProfile = await LinkedinProfileModel.create({
      linkedinId: linkedInId,
      snapshotId: data.snapshot_id,
      status: LinkedinProfileStatus.PENDING,
    });
  }

  return linkedinProfile;
}

export async function generatePersonality(
  submissionId: ObjectId,
  personalityFields: FormComponent[],
  useLinkedinProfile: boolean
) {
  const submission = await SubmissionModel.findById(submissionId);

  if (!submission) {
    throw new Error("Submission not found");
  }

  const currentLinkedinProfile = await LinkedinProfileModel.findOne({
    _id: submission.linkedInProfileId,
  });

  const surveyResponses = personalityFields
    .filter((field) => submission.data.get(field.key))
    .reduce((acc, field) => {
      return `${acc}\nQuestion: ${field.label}\nAnswer: ${submission.data.get(
        field.key
      )}`;
    }, "");

  if (!currentLinkedinProfile && useLinkedinProfile) {
    throw new Error("Linkedin profile not found");
  }

  if (!surveyResponses && !currentLinkedinProfile) {
    throw new Error("No data to use");
  }

  const form = await FormModel.findById(submission.formId);
  if (!form) {
    throw new Error("Form not found");
  }

  const formType = form.submitterType;
  const formId = form._id;

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "system",
        content: `You are an AI agent specialised in extracting personality metrics from a person based on their ${
          useLinkedinProfile ? "linkedin profiles and " : ""
        }survey responses.
        You will be provided with ${
          useLinkedinProfile ? "linkedin profile data and " : ""
        }survey responses, and you are expected to make judgments on their character based on their ${
          useLinkedinProfile
            ? "profile, activity and work experience"
            : "submission"
        }.`,
      },
      {
        role: "user",
        content: `${
          useLinkedinProfile
            ? `Linkedin profile: ${JSON.stringify(
                currentLinkedinProfile?.data
              )} `
            : ""
        } ${surveyResponses ? ", Survey responses:" + surveyResponses : ""}`,
      },
    ],
    response_format: zodResponseFormat(
      formType === FormType.INVESTOR
        ? investorPersonalitySchema
        : founderPersonalitySchema,
      "personality"
    ),
  });

  const personality = completion.choices[0].message.parsed;

  let currentPersonality = await PersonalityModel.findOne({ submissionId });

  if (currentPersonality) {
    currentPersonality = await PersonalityModel.findOneAndUpdate(
      { submissionId },
      {
        $set: {
          ...personality,
          networkSize: currentLinkedinProfile?.data.connections ?? undefined,
          followerCount: currentLinkedinProfile?.data.followers ?? undefined,
        },
      },
      { new: true }
    );
  } else {
    currentPersonality = await PersonalityModel.create({
      ...personality,
      formId,
      submissionId,
      formType,
      networkSize: currentLinkedinProfile?.data.connections ?? undefined,
      followerCount: currentLinkedinProfile?.data.followers ?? undefined,
    });
  }

  return currentPersonality;
}

async function registerLinkedInProfileRetrieval(linkedInProfileId: ObjectId) {
  const linkedinProfile = await LinkedinProfileModel.findById(
    linkedInProfileId
  );

  if (!linkedinProfile) {
    throw new Error("Linkedin profile not found");
  }

  if (linkedinProfile.status === LinkedinProfileStatus.PENDING) {
    throw new Error("Linkedin profile is still pending");
  }

  console.log(
    "Registering linkedin profile retrieval ",
    linkedinProfile.linkedinId
  );

  const pendingSubmissions = await SubmissionModel.find({
    linkedInProfileId,
    status: { $in: [SubmissionStatus.PENDING, SubmissionStatus.FAILED] },
  });

  for (const submission of pendingSubmissions) {
    try {
      const form = await FormModel.findById(submission.formId);

      if (!form) {
        throw new Error("Form not found");
      }

      const matchCriteria = await MatchCriteriaModel.findOne({
        pipelineId: form.pipelineId,
      });

      if (!matchCriteria) {
        throw new Error("Match criteria not found");
      }

      await generatePersonality(
        submission._id as ObjectId,
        form.components.filter((component) => component.isPersonality),
        matchCriteria.useLinkedinPersonality
      );

      await matchService.matchSubmission(form, submission, matchCriteria);
    } catch (error) {
      console.error(error);
      await SubmissionModel.findByIdAndUpdate(submission._id, {
        status: SubmissionStatus.FAILED,
      });
    }
  }
}

async function createPersonality(personality: IPersonality) {
  const createdPersonality = await PersonalityModel.create(personality);
  return createdPersonality;
}

export const personalityService = {
  generatePersonality,
  createPersonality,
  registerLinkedInProfileRetrieval,
};
