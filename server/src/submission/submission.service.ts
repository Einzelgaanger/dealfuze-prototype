import {
  ISubmission,
  SubmissionDataType,
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
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document, Types } from 'mongoose';
import { Submission, SubmissionDocument } from './submission.schema';
import { MatchService } from '../match/match.service';
import { PersonalityService } from '../personality/personality.service';

// Cached form lookups to reduce database queries
const formCache = new Map<string, FormDocument | null>();
const FORM_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

interface FormattedSubmission {
  id: string;
  formId: string;
  type: SubmissionType;
  data: SubmissionDataType;
  submittedAt: Date;
  ipAddress: string;
  userAgent: string;
  name: string;
  email: string;
  linkedInProfileId: string;
  status: SubmissionStatus;
  matchScore: number;
  isDeleted: boolean;
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
    @InjectModel('Submission')
    private submissionModel: Model<SubmissionDocument>,
    private matchService: MatchService,
    private personalityService: PersonalityService
  ) {}

  async createSubmission(
    formId: string,
    data: SubmissionDataType,
    userAgent: string,
    ipAddress: string,
    type: SubmissionType = SubmissionType.FOUNDER
  ): Promise<SubmissionDocument> {
    const submission = new this.submissionModel({
      formId: new Types.ObjectId(formId),
      data,
      userAgent,
      ipAddress,
      submittedAt: new Date(),
      status: SubmissionStatus.PENDING,
      type,
      isDeleted: false,
      matchScore: 0
    });
    return submission.save();
  }

  async findAll(): Promise<SubmissionDocument[]> {
    return this.submissionModel.find({ isDeleted: false }).exec();
  }

  async findById(id: string): Promise<SubmissionDocument | null> {
    return this.submissionModel.findById(id).exec();
  }

  async findByFormId(formId: string): Promise<SubmissionDocument[]> {
    return this.submissionModel.find({ formId: new Types.ObjectId(formId), isDeleted: false }).exec();
  }

  async update(id: string, data: Partial<ISubmission>): Promise<SubmissionDocument | null> {
    return this.submissionModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.submissionModel.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        status: SubmissionStatus.DELETED
      },
      { new: true }
    ).exec();
    return !!result;
  }

  async updateStatus(id: string, status: SubmissionStatus): Promise<SubmissionDocument | null> {
    return this.submissionModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).exec();
  }

  async formatSubmission(submission: SubmissionDocument): Promise<FormattedSubmission> {
    if (!submission._id) {
      throw new Error('Submission must have an _id');
    }

    return {
      id: submission._id.toString(),
      formId: submission.formId.toString(),
      type: submission.type,
      data: submission.data,
      submittedAt: submission.submittedAt,
      ipAddress: submission.ipAddress || '',
      userAgent: submission.userAgent || '',
      name: submission.name || '',
      email: submission.email || '',
      linkedInProfileId: submission.linkedInProfileId?.toString() || '',
      status: submission.status,
      matchScore: submission.matchScore || 0,
      isDeleted: submission.isDeleted || false
    };
  }

  async getSubmissionsByFormId(formId: string): Promise<SubmissionDocument[]> {
    return this.submissionModel
      .find({ formId: new Types.ObjectId(formId), isDeleted: false })
      .sort({ submittedAt: -1 })
      .exec();
  }

  async create(submission: Partial<ISubmission>): Promise<SubmissionDocument> {
    const createdSubmission = new this.submissionModel(submission);
    return createdSubmission.save();
  }

  async updateCharacterTraits(
    id: string,
    traits: Partial<Submission['characterTraits']>
  ): Promise<SubmissionDocument | null> {
    return this.submissionModel.findByIdAndUpdate(
      id,
      { 
        characterTraits: {
          ...traits,
          lastUpdated: new Date()
        }
      },
      { new: true }
    ).exec();
  }

  async updateFamilyInfo(
    id: string,
    info: Partial<Submission['familyInfo']>
  ): Promise<SubmissionDocument | null> {
    return this.submissionModel.findByIdAndUpdate(
      id,
      { 
        familyInfo: {
          ...info,
          lastUpdated: new Date()
        }
      },
      { new: true }
    ).exec();
  }

  async updateMatchScore(
    id: string,
    score: number
  ): Promise<SubmissionDocument | null> {
    return this.submissionModel.findByIdAndUpdate(
      id,
      { 
        matchScore: score,
        lastMatchUpdate: new Date()
      },
      { new: true }
    ).exec();
  }

  async findByType(type: string): Promise<SubmissionDocument[]> {
    return this.submissionModel
      .find({ type, isDeleted: false })
      .sort({ matchScore: -1 })
      .exec();
  }

  async findBestMatches(
    type: string,
    limit = 10
  ): Promise<SubmissionDocument[]> {
    return this.submissionModel
      .find({ 
        type,
        isDeleted: false,
        status: SubmissionStatus.ACTIVE
      })
      .sort({ matchScore: -1 })
      .limit(limit)
      .exec();
  }

  async cleanupDeletedSubmissions(daysToKeep = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.submissionModel.deleteMany({
      isDeleted: true,
      deletedAt: { $lt: cutoffDate }
    }).exec();

    return result.deletedCount || 0;
  }

  /**
   * Process submission asynchronously with retry capability
   * This allows for better reliability and scalability
   */
  private async processSubmissionAsync(submissionId: string, retryCount = 0): Promise<void> {
    try {
      const submission = await this.submissionModel.findById(submissionId);
      if (!submission) return;

      await this.submissionModel.updateOne(
        { _id: submission._id },
        { $set: { status: SubmissionStatus.COMPLETED } }
      ).exec();
    } catch (error) {
      console.error(`Error processing submission ${submissionId}:`, error);
      
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(`Retrying submission ${submissionId} in ${delay}ms (attempt ${retryCount + 1})`);
        
        setTimeout(() => {
          this.processSubmissionAsync(submissionId, retryCount + 1)
            .catch((err: Error) => console.error(`Retry error for submission ${submissionId}:`, err));
        }, delay);
      } else {
        await this.submissionModel.updateOne(
          { _id: new Types.ObjectId(submissionId) },
          { $set: { status: SubmissionStatus.FAILED } }
        ).exec().catch((err: Error) => console.error(`Failed to update submission status for ${submissionId}:`, err));
      }
    }
  }

  async getSubmissionById(id: string): Promise<SubmissionDocument | null> {
    return this.submissionModel.findById(id).exec();
  }

  /**
   * Get form submissions with optimized database queries for large datasets
   */
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

    const [total, submissions] = await Promise.all([
      this.submissionModel.countDocuments({ formId: new Types.ObjectId(formId) }).exec(),
      this.submissionModel.find({ formId: new Types.ObjectId(formId) })
        .select('_id formId type data submittedAt ipAddress userAgent name email status isDeleted matchScore')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec()
    ]);

    return {
      submissions: submissions.map(sub => ({
        id: sub._id.toString(),
        formId: sub.formId.toString(),
        type: sub.type,
        data: sub.data,
        submittedAt: sub.submittedAt,
        ipAddress: sub.ipAddress,
        userAgent: sub.userAgent,
        name: sub.name,
        email: sub.email,
        status: sub.status,
        isDeleted: sub.isDeleted,
        matchScore: sub.matchScore
      })),
      total,
      page,
      limit
    };
  }

  /**
   * Delete submissions in bulk with optimized performance
   */
  async deleteSubmissions(submissionIds: string[]): Promise<void> {
    if (!submissionIds.length) return;
    
    const objectIds = submissionIds.map(id => new Types.ObjectId(id));
    await this.submissionModel.deleteMany({ _id: { $in: objectIds } }).exec();
  }

  /**
   * Get submission statistics with optimized aggregation
   */
  async getSubmissionStats(formId: string): Promise<{ 
    total: number; 
    pending: number; 
    completed: number; 
    failed: number;
    recentSubmissionsPerDay: { date: string; count: number }[];
  }> {
    const stats = await this.submissionModel.aggregate([
      { $match: { formId: new Types.ObjectId(formId) } },
      { $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]).exec();
    
    let total = 0;
    let pending = 0;
    let completed = 0;
    let failed = 0;
    
    stats.forEach((stat: { _id: string; count: number }) => {
      total += stat.count;
      
      if (stat._id === SubmissionStatus.PENDING) {
        pending = stat.count;
      } else if (stat._id === SubmissionStatus.COMPLETED) {
        completed = stat.count;
      } else if (stat._id === SubmissionStatus.FAILED) {
        failed = stat.count;
      }
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentStats = await this.submissionModel.aggregate([
      { 
        $match: { 
          formId: new Types.ObjectId(formId),
          submittedAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).exec();
    
    const recentSubmissionsPerDay = recentStats.map((item: { _id: string; count: number }) => ({
      date: item._id,
      count: item.count
    }));

    return { 
      total, 
      pending, 
      completed, 
      failed,
      recentSubmissionsPerDay
    };
  }
}

export default SubmissionService;
