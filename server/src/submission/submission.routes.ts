import express, { Request, Response } from "express";
import { param, body } from "express-validator";
import { SubmissionController } from "./submission.controller";
import { PersonalityService } from "../personality/personality.service";
import SubmissionModel from "../db/models/submission.schema";
import LinkedinProfileModel from "../db/models/linkedinProfile.schema";
import { LinkedinProfileStatus } from "../types/linkedinProfile.type";
import { SubmissionStatus } from "../types/submission.type";
import { MatchService } from '../match/match.service';
import FormModel from "../db/models/form.schema";
import MatchCriteriaModel from "../db/models/matchCriteria.schema";
import PipelineModel from "../db/models/pipeline.schema";
import PersonalityModel from "../db/models/personality.schema";
import { Router } from 'express';
import { SubmissionService } from './submission.service';
import { getModelToken } from '@nestjs/mongoose';
import { Submission, SubmissionDocument } from '../types/submission.type';
import { Match } from '../types/match.type';
import { IForm } from '../types/form.type';
import { IPersonality } from '../types/personality.type';
import { IMatchCriteria } from '../types/matchCriteria.type';
import { Model, Types } from 'mongoose';
import { FormService } from '../form/form.service';
import { MatchCriteriaService } from '../matchCriteria/matchCriteria.service';

const router = Router();

// Get the model through NestJS's dependency injection
const submissionModel = getModelToken('Submission') as unknown as Model<Submission>;
const matchModel = getModelToken('Match') as unknown as Model<Match>;
const personalityModel = getModelToken('Personality') as unknown as Model<IPersonality>;
const formModel = getModelToken('Form') as unknown as Model<IForm>;
const matchCriteriaModel = getModelToken('MatchCriteria') as unknown as Model<IMatchCriteria>;

// Initialize services in the correct order with type assertions to fix TypeScript errors
const matchCriteriaService = new MatchCriteriaService(matchCriteriaModel as any);
const formService = new FormService(formModel as any, matchCriteriaService);

const submissionService = new SubmissionService(
  submissionModel as any,
  null as any,
  null as any
);

const matchService = new MatchService(
  formModel as any,
  personalityModel as any,
  submissionModel as any,
  matchModel as any,
  matchCriteriaModel as any,
  submissionService
);

const personalityService = new PersonalityService(
  personalityModel as any,
  submissionModel as any,
  matchService
);

// Update submission service with proper dependencies
Object.defineProperty(submissionService, 'matchService', {
  value: matchService,
  writable: true
});

Object.defineProperty(submissionService, 'personalityService', {
  value: personalityService,
  writable: true
});

const controller = new SubmissionController(submissionService);

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
  (req: Request, res: Response) => controller.handleFormSubmit(
    req.params.formId,
    req.body,
    req.headers['user-agent'] as string,
    req.ip
  )
);

/**
 * @route   GET /api/forms/:formId/submissions
 * @desc    Get all submissions for a form
 * @access  Public
 */
router.get(
  "/forms/:formId/submissions",
  formIdValidation,
  (req: Request, res: Response) => controller.getSubmissionsByFormId(
    req.params.formId,
    req.query.page as string,
    req.query.limit as string
  )
);

/**
 * @route   GET /api/submissions/:id
 * @desc    Get a submission by ID
 * @access  Public
 */
router.get(
  "/submissions/:id",
  submissionIdValidation,
  (req: Request, res: Response) => controller.getSubmissionById(req.params.id)
);

/**
 * @route   DELETE /api/submissions
 * @desc    Delete multiple submissions by ID
 * @access  Public
 */
router.delete("/submissions", (req: Request, res: Response) => 
  controller.deleteSubmissions(req.body.submissionIds)
);

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
        submission._id as any,
        form.components.filter((component) => component.isPersonality),
        matchCriteria.useLinkedinPersonality
      );
    }

    if (submission.status === SubmissionStatus.FAILED) {
      await matchService.batchProcessMatches(
        form._id.toString(),
        [submission._id.toString()],
        [0],
        [{}]
      );
    }

    const submissionId = new Types.ObjectId(submission._id.toString());

    return res.status(200).json({
      success: true,
      message: "Submission retried",
    });
  }
);

// Form submission routes
router.post('/:formId/submit', async (req: Request, res: Response) => {
  try {
    const result = await controller.handleFormSubmit(
      req.params.formId,
      req.body,
      req.headers['user-agent'] as string,
      req.ip
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get submissions for a form
router.get('/:formId/submissions', async (req: Request, res: Response) => {
  try {
    const result = await controller.getSubmissionsByFormId(
      req.params.formId,
      req.query.page as string,
      req.query.limit as string
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific submission
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await controller.getSubmissionById(req.params.id);
    if (!result) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete submissions
router.post('/delete', async (req: Request, res: Response) => {
  try {
    await controller.deleteSubmissions(req.body.submissionIds);
    res.status(200).json({ message: 'Submissions deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get submission stats
router.get('/stats/:formId', async (req: Request, res: Response) => {
  try {
    const result = await controller.getSubmissionStats(req.params.formId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
