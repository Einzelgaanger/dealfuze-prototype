import express, { Request, Response } from "express";
import { param, body } from "express-validator";
import submissionController from "./submission.controller";
import { personalityService } from "../personality/personality.service";
import SubmissionModel from "../db/models/submission.schema";
import LinkedinProfileModel from "../db/models/linkedinProfile.schema";
import { LinkedinProfileStatus } from "../types/linkedinProfile.type";
import { SubmissionStatus } from "../types/submission.type";
import matchService from "../match/match.service";
import FormModel from "../db/models/form.schema";
import MatchCriteriaModel from "../db/models/matchCriteria.schema";
import PipelineModel from "../db/models/pipeline.schema";
import PersonalityModel from "../db/models/personality.schema";

const router = express.Router();

const formIdValidation = [
  param("formId").isMongoId().withMessage("Invalid form ID format"),
];

const submissionValidation = [
  body().isObject().withMessage("Submission must be an object"),
  body("data")
    .optional()
    .isObject()
    .withMessage("Submission data must be an object"),
  body("formId").isMongoId().withMessage("Invalid form ID format"),
];

const submissionIdValidation = [
  param("id").isMongoId().withMessage("Invalid submission ID format"),
];

/**
 * @route   POST /api/forms/:formId/submit
 * @desc    Submit a form
 * @access  Public
 */
router.post(
  "/forms/:formId/submit",
  formIdValidation,
  submissionValidation,
  submissionController.submitForm
);

/**
 * @route   GET /api/forms/:formId/submissions
 * @desc    Get all submissions for a form
 * @access  Public
 */
router.get(
  "/forms/:formId/submissions",
  formIdValidation,
  submissionController.getFormSubmissions
);

/**
 * @route   GET /api/submissions/:id
 * @desc    Get a submission by ID
 * @access  Public
 */
router.get(
  "/submissions/:id",
  submissionIdValidation,
  submissionController.getSubmissionById
);

/**
 * @route   DELETE /api/submissions
 * @desc    Delete multiple submissions by ID
 * @access  Public
 */
router.delete("/submissions", submissionController.deleteSubmissions);

/**
 * @route   POST /api/submissions/:id/retry
 * @desc    Retry a submission by ID
 * @access  Public
 */
router.post(
  "/submissions/:id/retry",
  submissionIdValidation,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const submission = await SubmissionModel.findById(id);

    if (!submission || !submission.linkedInProfileId) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    const linkedinProfile = await LinkedinProfileModel.findById(
      submission.linkedInProfileId
    );

    if (
      linkedinProfile &&
      linkedinProfile.status !== LinkedinProfileStatus.SUCCESS
    ) {
      await personalityService.registerLinkedInProfileRetrieval(
        submission.linkedInProfileId
      );
    }

    const form = await FormModel.findById(submission.formId);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    const pipeline = await PipelineModel.findById(form.pipelineId);

    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: "Pipeline not found",
      });
    }

    const matchCriteria = await MatchCriteriaModel.findOne({
      pipelineId: pipeline._id,
    });

    if (!matchCriteria) {
      return res.status(404).json({
        success: false,
        message: "Match criteria not found",
      });
    }

    const personality = await PersonalityModel.findOne({
      submissionId: submission.id,
    });

    if (!personality) {
      const form = await FormModel.findById(submission.formId);

      if (!form) {
        return res.status(404).json({
          success: false,
          message: "Form not found",
        });
      }

      await personalityService.generatePersonality(
        submission._id,
        form.components.filter((component) => component.isPersonality),
        matchCriteria.useLinkedinPersonality
      );
    }

    if (submission.status === SubmissionStatus.FAILED) {
      await matchService.matchSubmission(form, submission, matchCriteria);
    }

    return res.status(200).json({
      success: true,
      message: "Submission retried",
    });
  }
);

export default router;
