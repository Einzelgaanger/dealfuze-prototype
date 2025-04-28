import {
  ISubmission,
  SubmissionDataType,
  SubmissionDocument,
  SubmissionStatus,
  SubmissionType,
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
import { Submission } from './submission.schema';

@Injectable()
export class SubmissionService {
  private readonly submissionModel: Model<SubmissionDocument>;

  constructor(
    @InjectModel(Submission.name) submissionModel: Model<SubmissionDocument>
  ) {
    this.submissionModel = submissionModel;
  }

  async createSubmission(submission: Partial<ISubmission>): Promise<SubmissionDocument> {
    const submissionToCreate = {
      ...submission,
      submittedAt: submission.submittedAt || new Date(),
      status: submission.status || SubmissionStatus.PENDING,
    };

    const createdSubmission = await this.submissionModel.create(submissionToCreate);
    return createdSubmission;
  }

  async getSubmissionById(id: string): Promise<SubmissionDocument | null> {
    return this.submissionModel.findById(id);
  }

  async getSubmissions(page = 1, limit = 10): Promise<SubmissionDocument[]> {
    return this.submissionModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async getFormSubmissions(
    formId: string,
    page = 1,
    limit = 10
  ): Promise<SubmissionDocument[]> {
    return this.submissionModel
      .find({ formId: new Types.ObjectId(formId) })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ submittedAt: -1 });
  }

  async getFormSubmissions(
    formId: string,
    pageQuery: string,
    limitQuery: string
  ): Promise<{
    submissions: Array<{
      id: string;
      formId: string;
      data: SubmissionDataType;
      submittedAt: Date;
      ipAddress?: string;
      userAgent?: string;
      name?: string;
      email?: string;
      status: SubmissionStatus;
    }>;
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
      .limit(limit);

    const formattedSubmissions = submissions.map((sub: SubmissionDocument) => {
      return {
        id: sub._id.toString(),
        formId: sub.formId.toString(),
        data: sub.data,
        submittedAt: sub.submittedAt,
        ipAddress: sub.ipAddress,
        userAgent: sub.userAgent,
        name: sub.name,
        email: sub.email,
        status: sub.status,
      };
    });

    return {
      submissions: formattedSubmissions,
      total,
      page,
      limit,
    };
  }

  async updateStatus(id: string, status: SubmissionStatus): Promise<SubmissionDocument | null> {
    return this.submissionModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).exec();
  }

  async deleteSubmissions(submissionIds: string[]): Promise<void> {
    await this.submissionModel.deleteMany({ _id: { $in: submissionIds.map(id => new Types.ObjectId(id)) } });
  }

  async getSubmissionStats(formId: string): Promise<{ total: number; pending: number; completed: number; failed: number }> {
    const [stats] = await this.submissionModel.aggregate([
      { $match: { formId: new Types.ObjectId(formId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', SubmissionStatus.PENDING] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', SubmissionStatus.COMPLETED] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', SubmissionStatus.FAILED] }, 1, 0] }
          }
        }
      }
    ]).exec();

    return stats || { total: 0, pending: 0, completed: 0, failed: 0 };
  }
}

export default SubmissionService;
