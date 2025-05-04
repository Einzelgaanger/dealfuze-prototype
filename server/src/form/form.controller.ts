import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Injectable } from '@nestjs/common';
import { FormType, FormUpdateRequest } from "../types/form.type";
import { FormService } from "./form.service";
import { SubmissionService } from "../submission/submission.service";

@Injectable()
export class FormController {
  constructor(
    private readonly submissionService: SubmissionService,
    private readonly formService: FormService
  ) {}

  async getFormsByPipelineId(req: Request, res: Response): Promise<void> {
    try {
      const { pipelineId } = req.params;

      const forms = await this.formService.findByPipelineId(pipelineId);

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
  }

  async getFormById(req: Request, res: Response): Promise<void> {
    const { formId } = req.params;

    console.log("formId", formId);

    const form = await this.formService.findById(formId);

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
  }

  async updateForm(
    req: Request<{ pipelineId: string }, {}, FormUpdateRequest>,
    res: Response
  ): Promise<void> {
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
      await this.formService.updateForms({
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
  }

  async patchFormComponents(req: Request, res: Response): Promise<void> {
    const { pipelineId, formId } = req.params;
    const { optionsToAdd } = req.body;

    try {
      await this.formService.addFormOptions({ pipelineId, formId, optionsToAdd });
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
  }

  async importSubmissions(req: Request, res: Response): Promise<void> {
    const { formId } = req.params;
    const { submissions } = req.body;

    const createdSubmissions = [];

    for (const submission of submissions) {
      try {
        const submissionDoc = await this.submissionService.createSubmission(
          formId,
          submission,
          req.headers['user-agent'] || '',
          req.ip || '',
        );
        createdSubmissions.push(submissionDoc._id);
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
  }
}
