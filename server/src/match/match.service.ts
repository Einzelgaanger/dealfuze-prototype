import { ObjectId } from "mongodb";
import { FormDocument, FormType } from "../types/form.type";
import { MatchCriteriaDocument } from "../types/matchCriteria.type";
import { SubmissionDocument, SubmissionStatus } from "../types/submission.type";
import PersonalityModel from "../db/models/personality.schema";
import SubmissionModel from "../db/models/submission.schema";
import PipelineModel from "../db/models/pipeline.schema";
import MatchModel from "../db/models/match.schema";
import { match } from "./match";
import FormModel from "../db/models/form.schema";

async function getMatchStats(pipelineId: string) {
  const pipeline = await PipelineModel.findById(pipelineId);

  if (!pipeline) {
    throw new Error("Pipeline not found");
  }

  const top5 = await MatchModel.find({
    pipelineId: pipelineId,
  })
    .limit(5)
    .projection({
      investorId: 1,
      founderId: 1,
      totalMatchPercentage: 1,
      formMatchPercentage: 1,
      personalityMatchPercentage: 1,
    })
    .sort({ totalMatchPercentage: "desc" });

  return await Promise.all(
    top5.map(async (match: any) => {
      const investor = await SubmissionModel.findById(
        match.investorId
      ).projection({ name: 1, id: 1 });
      const founder = await SubmissionModel.findById(
        match.founderId
      ).projection({ name: 1, id: 1 });

      return {
        investor,
        founder,
        totalMatchPercentage: match.totalMatchPercentage,
        formMatchPercentage: match.formMatchPercentage,
        personalityMatchPercentage: match.personalityMatchPercentage,
      };
    })
  );
}

export async function matchSubmission(
  form: FormDocument,
  submission: SubmissionDocument,
  matchCriteria: MatchCriteriaDocument
) {
  // Match the submission
  try {
    if (form.submitterType === FormType.INVESTOR) {
      const forms = await FormModel.find({
        pipelineId: form.pipelineId,
      });

      const founderForm = forms.find(
        (form) => form.submitterType === FormType.FOUNDER
      );

      if (!founderForm) {
        throw new Error("Founder form not found");
      }

      await matchInvestorSubmission({
        investorForm: form,
        founderFormId: founderForm.id,
        matchCriteria,
        submission,
      });
    } else if (form.submitterType === FormType.FOUNDER) {
      const forms = await FormModel.find({
        pipelineId: form.pipelineId,
      });

      const investorForm = forms.find(
        (form) => form.submitterType === FormType.INVESTOR
      );

      if (!investorForm) {
        throw new Error("Investor form not found");
      }

      await matchFounderSubmission({
        founderForm: form,
        investorFormId: investorForm.id,
        matchCriteria,
        submission,
      });
    }
    /*await SubmissionModel.findByIdAndUpdate(submission.id, {
      status: SubmissionStatus.COMPLETED,
    });*/
  } catch (error) {
    console.error(error);
    await SubmissionModel.findByIdAndUpdate(submission.id, {
      status: SubmissionStatus.FAILED,
    });
  }
}

async function matchFounderSubmission({
  founderForm,
  investorFormId,
  matchCriteria,
  submission,
}: {
  founderForm: FormDocument;
  investorFormId: ObjectId;
  matchCriteria: MatchCriteriaDocument;
  submission: SubmissionDocument;
}) {
  const personality = await PersonalityModel.findOne({
    submissionId: submission.id,
  });

  const investors = await SubmissionModel.find({
    formId: investorFormId,
  });

  const investorForm = await FormModel.findById(investorFormId);

  if (!investorForm) {
    throw new Error("Investor form not found");
  }

  if (investors.length === 0) {
    return null;
  }

  await match({
    founderForm,
    investorForm,
    entityType: FormType.FOUNDER,
    entity: submission,
    oppositeEntities: investors,
    matchCriteria,
  });
}

async function matchInvestorSubmission({
  investorForm,
  founderFormId,
  matchCriteria,
  submission,
}: {
  investorForm: FormDocument;
  founderFormId: ObjectId;
  matchCriteria: MatchCriteriaDocument;
  submission: SubmissionDocument;
}) {
  const personality = await PersonalityModel.findOne({
    submissionId: submission.id,
  });

  const founders = await SubmissionModel.find({
    formId: founderFormId,
  });

  if (founders.length === 0) {
    return null;
  }

  const founderForm = await FormModel.findById(founderFormId);

  if (!founderForm) {
    throw new Error("Founder form not found");
  }

  await match({
    investorForm,
    founderForm,
    entityType: FormType.INVESTOR,
    entity: submission,
    oppositeEntities: founders,
    matchCriteria,
  });

  return personality;
}

export default {
  getMatchStats,
  matchSubmission,
};
