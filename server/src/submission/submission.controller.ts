import { Request, Response } from "express";
import { validationResult } from "express-validator";
import SubmissionModel from "../db/models/submission.schema";
import submissionService from "./submission.service";

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

export default {
  submitForm,
  getFormSubmissions,
  getSubmissionById,
  deleteSubmissions,
};
