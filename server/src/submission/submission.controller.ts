import { Request, Response } from "express";
import { validationResult } from "express-validator";
import SubmissionModel from "../db/models/submission.schema";
import submissionService from "./submission.service";
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { Submission } from './submission.schema';
import { AuthGuard } from '../middleware/auth.middleware';

/**
 * Submit a form response
 * @route POST /api/forms/:formId/submit
 */
export const submitForm = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: errors.array(),
      });
      return;
    }

    console.log(JSON.stringify(req.body, null, 2));

    const { formId } = req.params;

    const { redirectUrl, successMessage, submissionId } =
      await submissionService.createSubmission(
        formId,
        req.body.data,
        req.headers["user-agent"],
        req.ip
      );

    if (!submissionId) {
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Form not found",
      });
      return;
    }
    res.status(201).json({
      success: true,
      message: successMessage,
      redirect: redirectUrl || undefined,
      submissionId,
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error submitting form:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: err.message,
    });
  }
};

/**
 * Get all submissions for a form
 * @route GET /api/forms/:formId/submissions
 */
export const getFormSubmissions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { formId } = req.params;

    const result = await submissionService.getFormSubmissions(
      formId,
      req.query.page as string,
      req.query.limit as string
    );

    if (!result) {
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Form not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.submissions,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error(
      `Error retrieving submissions for form ${req.params.formId}:`,
      err
    );
    res.status(500).json({
      success: false,
      error: "Server error",
      message: err.message,
    });
  }
};

/**
 * Get a specific submission by ID
 * @route GET /api/submissions/:id
 */
export const getSubmissionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await submissionService.getSubmissionById(id);

    if (!result) {
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Submission not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const err = error as Error;
    console.error(`Error retrieving submission with ID ${req.params.id}:`, err);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: err.message,
    });
  }
};

/**
 * Delete submissions
 * @route DELETE /api/submissions
 */
export const deleteSubmissions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { submissionIds } = req.body;

    const deletedSubmissions = await SubmissionModel.deleteMany({
      _id: { $in: submissionIds },
    });

    if (!deletedSubmissions) {
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Submissions not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Submissions deleted successfully",
    });
  } catch (error) {
    const err = error as Error;
    console.error(`Error deleting submissions:`, err);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: err.message,
    });
  }
};

@Controller('submissions')
@UseGuards(AuthGuard)
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  async create(@Body() submission: Submission): Promise<Submission> {
    return this.submissionService.create(submission);
  }

  @Get()
  async findAll(): Promise<Submission[]> {
    return this.submissionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Submission> {
    return this.submissionService.findOne(id);
  }

  @Get('type/:type')
  async findByType(@Param('type') type: 'founder' | 'investor'): Promise<Submission[]> {
    return this.submissionService.findByType(type);
  }

  @Get('form/:formId')
  async findByFormId(@Param('formId') formId: string): Promise<Submission[]> {
    return this.submissionService.findByFormId(formId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() submission: Partial<Submission>,
  ): Promise<Submission> {
    return this.submissionService.update(id, submission);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.submissionService.delete(id);
  }

  @Get('stats')
  async getStats() {
    return this.submissionService.getSubmissionStats();
  }
}

export default {
  submitForm,
  getFormSubmissions,
  getSubmissionById,
  deleteSubmissions,
};
