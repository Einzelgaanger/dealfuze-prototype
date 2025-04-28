import {
  ISubmission,
  SubmissionDataType,
  SubmissionStatus,
} from "../types/submission.type";
import FormModel from "../db/models/form.schema";
import SubmissionModel from "../db/models/submission.schema";
import { createFormSchema } from "../utils";
import { FormDocument } from "../types/form.type";
import MatchCriteriaModel from "../db/models/matchCriteria.schema";
import {
  personalityService,
  requestLinkedInProfile,
} from "../personality/personality.service";
import { LinkedinProfileStatus } from "../types/linkedinProfile.type";
import matchService from "../match/match.service";
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Submission, SubmissionDocument } from './submission.schema';

interface FormattedSubmission {
  id: string;
  formId: string;
  data: SubmissionDataType;
  submittedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  name?: string;
  email?: string;
  status: SubmissionStatus;
}

interface SubmissionQueryHelpers {
  // Custom query helper methods if any
}

interface SubmissionMethods {
  // Custom instance methods if any
}

interface SubmissionVirtuals {
  // Virtual properties if any
}

@Injectable()
export class SubmissionService {
  constructor(
    @InjectModel(Submission.name) 
    private readonly submissionModel: any
  ) {}

  async createSubmission(
    formId: string,
    data: any,
    userAgent: string,
    ip: string
  ): Promise<{ redirectUrl?: string; successMessage: string; submissionId?: string }> {
    const form = await FormModel.findById(formId);
    if (!form) {
      return { successMessage: "Form not found" };
    }

    const submissionToCreate = {
      formId: new Types.ObjectId(formId),
      data,
      userAgent,
      ipAddress: ip,
      submittedAt: new Date(),
      status: SubmissionStatus.PENDING
    };

    const createdSubmission = await this.submissionModel.create(submissionToCreate);
    return {
      redirectUrl: form.redirectUrl,
      successMessage: "Submission created successfully",
      submissionId: createdSubmission._id.toString()
    };
  }

  async getSubmissionById(id: string): Promise<SubmissionDocument | null> {
    return this.submissionModel.findById(id);
  }

  async getFormSubmissions(
    formId: string,
    pageQuery: string,
    limitQuery: string
  ): Promise<{
    submissions: FormattedSubmission[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = parseInt(pageQuery) || 1;
    const limit = parseInt(limitQuery) || 20;
    const skip = (page - 1) * limit;

    const total = await this.submissionModel.countDocuments({ formId: new Types.ObjectId(formId) });
    const submissions = await this.submissionModel.find({ formId: new Types.ObjectId(formId) })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const formattedSubmissions = submissions.map((sub: any) => ({
      id: sub._id.toString(),
      formId: sub.formId.toString(),
      data: sub.data,
      submittedAt: sub.submittedAt,
      ipAddress: sub.ipAddress,
      userAgent: sub.userAgent,
      name: sub.name,
      email: sub.email,
      status: sub.status
    }));

    return {
      submissions: formattedSubmissions,
      total,
      page,
      limit
    };
  }

  async updateStatus(id: string, status: SubmissionStatus): Promise<SubmissionDocument | null> {
    return this.submissionModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  }

  async deleteSubmissions(submissionIds: string[]): Promise<void> {
    await this.submissionModel.deleteMany({
      _id: { $in: submissionIds.map(id => new Types.ObjectId(id)) }
    });
  }

  async getSubmissionStats(formId: string): Promise<{ total: number; pending: number; completed: number; failed: number }> {
    const total = await this.submissionModel.countDocuments({ formId: new Types.ObjectId(formId) });
    const pending = await this.submissionModel.countDocuments({ 
      formId: new Types.ObjectId(formId),
      status: SubmissionStatus.PENDING
    });
    const completed = await this.submissionModel.countDocuments({ 
      formId: new Types.ObjectId(formId),
      status: SubmissionStatus.COMPLETED
    });
    const failed = await this.submissionModel.countDocuments({ 
      formId: new Types.ObjectId(formId),
      status: SubmissionStatus.FAILED
    });

    return { total, pending, completed, failed };
  }
}

export default SubmissionService;
