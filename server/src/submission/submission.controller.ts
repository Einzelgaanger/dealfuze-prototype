import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { SubmissionService, FormattedSubmission } from './submission.service';
import { SubmissionDocument, SubmissionStatus } from '../types/submission.type';

interface SubmissionResponse {
  redirectUrl?: string;
  successMessage?: string;
  submissionId: string;
}

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
      const submission = await this.submissionService.createSubmission(
        formId,
        data,
        userAgent,
        ip
      );

      const response: SubmissionResponse = {
        submissionId: submission._id.toString()
      };

      return {
        success: true,
        message: 'Submission created successfully',
        ...response
      };
    } catch (error) {
      console.error("Error submitting form:", error);
      return {
        success: false,
        error: "Server error",
        message: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  @Get('form/:formId')
  async getSubmissionsByFormId(
    @Param('formId') formId: string,
    @Query('page') page: string,
    @Query('limit') limit: string
  ): Promise<{
    success: boolean;
    data: FormattedSubmission[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    try {
      const result = await this.submissionService.getFormSubmissions(
        formId,
        page,
        limit
      );

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
      console.error("Error getting form submissions:", error);
      throw error;
    }
  }

  @Get(':id')
  async getSubmissionById(@Param('id') id: string) {
    try {
      const submission = await this.submissionService.getSubmissionById(id);
      if (!submission) {
        return {
          success: false,
          error: "Not found",
          message: "Submission not found"
        };
      }
      return {
        success: true,
        data: submission
      };
    } catch (error) {
      console.error("Error getting submission:", error);
      return {
        success: false,
        error: "Server error",
        message: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: SubmissionStatus
  ) {
    try {
      const submission = await this.submissionService.updateStatus(id, status);
      if (!submission) {
        return {
          success: false,
          error: "Not found",
          message: "Submission not found"
        };
      }
      return {
        success: true,
        data: submission
      };
    } catch (error) {
      console.error("Error updating submission status:", error);
      return {
        success: false,
        error: "Server error",
        message: error instanceof Error ? error.message : "Unknown error"
      };
    }
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
