import { Request, Response } from "express";
import { validationResult } from "express-validator";
import FormModel from "../db/models/form.schema";
import { FormType, FormUpdateRequest } from "../types/form.type";
import formService from "./form.service";
import submissionService from "../submission/submission.service";
/**
 * Get a form by ID
 * @route GET /api/forms/:id
 */
export const getFormsByPipelineId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { pipelineId } = req.params;

    const forms = await FormModel.find({ pipelineId });

    if (!forms || forms.length !== 2) {
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Form not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: forms,
    });
  } catch (error) {
    console.error("Error fetching forms:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getFormById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { formId } = req.params;

  console.log("formId", formId);

  const form = await FormModel.findById(formId);

  if (!form) {
    res.status(404).json({
      success: false,
      error: "Not found",
      message: "Form not found",
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: form,
  });
};

/**
 * Update a form by ID
 * @route PUT /api/forms/:id
 */
export const updateForm = async (
  req: Request<{ pipelineId: string }, {}, FormUpdateRequest>,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: "Validation error",
      message: errors.array(),
    });
    return;
  }

  const { pipelineId } = req.params;
  const { investorForm, founderForm, matching } = req.body;

  try {
    await formService.updateForms({
      pipelineId,
      investorForm,
      founderForm,
      matching,
    });
    res.status(200).json({
      success: true,
      message: "Forms updated successfully",
    });
  } catch (error) {
    const err = error as Error;
    console.error(`Error updating form with ID ${req.params.pipelineId}:`, err);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: err.message,
    });
  }
};

export const patchFormComponents = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { pipelineId, formId } = req.params;
  const { optionsToAdd } = req.body;

  try {
    await formService.addFormOptions({ pipelineId, formId, optionsToAdd });
    res.status(200).json({
      success: true,
      message: "Form components updated successfully",
    });
  } catch (error) {
    const err = error as Error;
    console.error(
      `Error patching form components with ID ${req.params.pipelineId}:`,
      err
    );
    res.status(500).json({
      success: false,
      error: "Server error",
      message: err.message,
    });
  }
};

export const importSubmissions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { formId } = req.params;
  const { submissions } = req.body;

  const createdSubmissions = [];

  for (const submission of submissions) {
    try {
      const { submissionId } = await submissionService.createSubmission(
        formId,
        submission
      );
      createdSubmissions.push(submissionId);
    } catch (error) {
      const err = error as Error;
      console.error(`Error importing submissions:`, err);
      continue;
    }
  }

  res.status(200).json({
    success: true,
    data: createdSubmissions,
  });
};

const formController = {
  getFormsByPipelineId,
  updateForm,
  patchFormComponents,
  importSubmissions,
  getFormById,
};

export default formController;
