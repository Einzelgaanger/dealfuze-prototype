import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { SubmissionDocument, SubmissionStatus, ISubmission } from '../types/submission.type';
import { JwtAuthGuard } from '../middleware/auth.middleware';
import { Types } from 'mongoose';

@Controller('submission')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post('submit/:formId')
  async handleFormSubmit(
    @Param('formId') formId: string,
    @Body() data: any,
    @Query('userAgent') userAgent: string,
    @Query('ip') ip: string
  ) {
    try {
      const { redirectUrl, successMessage, submissionId } =
        await this.submissionService.createSubmission(
          formId,
          data,
          userAgent,
          ip
        );

      if (!submissionId) {
        return {
          success: false,
          error: "Not found",
          message: "Form not found",
        };
      }

      return {
        success: true,
        message: successMessage,
        redirect: redirectUrl || undefined,
        submissionId,
      };
    } catch (error) {
      const err = error as Error;
      console.error("Error submitting form:", err);
      return {
        success: false,
        error: "Server error",
        message: err.message,
      };
    }
  }

  @Get('form/:formId')
  async getSubmissionsByFormId(
    @Param('formId') formId: string,
    @Query('page') page: string,
    @Query('limit') limit: string
  ) {
    try {
      const result = await this.submissionService.getFormSubmissions(
        formId,
        page,
        limit
      );

      if (!result) {
        return {
          success: false,
          error: "Not found",
          message: "Form not found",
        };
      }

      return {
        success: true,
        data: result.submissions,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          pages: Math.ceil(result.total / result.limit),
        },
      };
    } catch (error) {
      const err = error as Error;
      console.error("Error getting form submissions:", err);
      return {
        success: false,
        error: "Server error",
        message: err.message,
      };
    }
  }

  @Get(':id')
  async getSubmissionById(@Param('id') id: string): Promise<SubmissionDocument | null> {
    return this.submissionService.getSubmissionById(id);
  }

  @Post()
  async createSubmission(@Body() submission: Partial<ISubmission>): Promise<SubmissionDocument> {
    return this.submissionService.createSubmission(submission);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: SubmissionStatus
  ): Promise<SubmissionDocument | null> {
    return this.submissionService.updateStatus(id, status);
  }

  @Delete()
  async deleteSubmissions(@Body('submissionIds') submissionIds: string[]): Promise<void> {
    await this.submissionService.deleteSubmissions(submissionIds);
  }

  @Get('stats/:formId')
  async getSubmissionStats(@Param('formId') formId: string) {
    return this.submissionService.getSubmissionStats(formId);
  }
}
