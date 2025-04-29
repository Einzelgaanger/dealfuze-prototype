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
import matchService from "../match/match.service";
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document, Types } from 'mongoose';
import { Submission, SubmissionDocument } from './submission.schema';
import { MatchService } from '../match/match.service';

// Cached form lookups to reduce database queries
const formCache = new Map<string, FormDocument | null>();
const FORM_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

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
    private submissionModel: Model<SubmissionDocument>,
    private matchService: MatchService
  ) {}

  async create(submission: Partial<Submission>): Promise<SubmissionDocument> {
    const createdSubmission = new this.submissionModel(submission);
    return createdSubmission.save();
  }

  async update(id: string, submission: Partial<Submission>): Promise<SubmissionDocument | null> {
    return this.submissionModel.findByIdAndUpdate(
      id,
      { ...submission, lastUpdated: new Date() },
      { new: true }
    ).exec();
  }

  async softDelete(id: string): Promise<SubmissionDocument | null> {
    return this.submissionModel.findByIdAndUpdate(
      id,
      { 
        isDeleted: true,
        deletedAt: new Date(),
        status: SubmissionStatus.DELETED
      },
      { new: true }
    ).exec();
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

  async findAll(includeDeleted = false): Promise<SubmissionDocument[]> {
    const query = includeDeleted ? {} : { isDeleted: false };
    return this.submissionModel.find(query).sort({ matchScore: -1 }).exec();
  }

  async findById(id: string): Promise<SubmissionDocument | null> {
    return this.submissionModel.findById(id).exec();
  }

  async findByType(type: SubmissionType): Promise<SubmissionDocument[]> {
    return this.submissionModel
      .find({ type, isDeleted: false })
      .sort({ matchScore: -1 })
      .exec();
  }

  async findBestMatches(
    type: SubmissionType,
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
   * Create a submission with optimized database operations for high-scale usage
   */
  async createSubmission(
    formId: string,
    data: SubmissionDataType,
    userAgent: string,
    ip: string
  ): Promise<{ redirectUrl?: string; successMessage: string; submissionId?: string }> {
    // Use cached form data if available
    let form: FormDocument | null = null;
    const cacheKey = `form-${formId}`;
    
    if (formCache.has(cacheKey)) {
      form = formCache.get(cacheKey) || null;
    } else {
      // If not in cache, fetch from database
      form = await FormModel.findById(formId).lean();
      
      // Cache the result with TTL
      formCache.set(cacheKey, form);
      setTimeout(() => {
        formCache.delete(cacheKey);
      }, FORM_CACHE_TTL);
    }
    
    if (!form) {
      return { successMessage: "Form not found" };
    }

    // Extract name and email from form data for indexed lookup
    let name = '';
    let email = '';
    
    if (data) {
      // Look for name field
      if (data.name) {
        name = data.name;
      } else if (data.firstName && data.lastName) {
        name = `${data.firstName} ${data.lastName}`;
      }
      
      // Look for email field
      if (data.email) {
        email = data.email;
      }
    }

    // Prepare submission document with all indexed fields
    const submissionToCreate = {
      formId: new Types.ObjectId(formId),
      data,
      userAgent,
      ipAddress: ip,
      submittedAt: new Date(),
      status: SubmissionStatus.PENDING,
      name, // Indexed field for faster lookups
      email, // Indexed field for faster lookups
    };

    // Use create operation with optimized write concern for better performance
    const createdSubmission = await this.submissionModel.create(
      [submissionToCreate],
      { writeConcern: { w: 1, j: false } } // Write without journal sync for better performance
    );

    // Start processing the submission in background with automatic retry
    this.processSubmissionAsync(createdSubmission[0]._id.toString())
      .catch(err => console.error(`Error processing submission ${createdSubmission[0]._id}: ${err}`));
    
    return {
      redirectUrl: form.redirectUrl,
      successMessage: "Submission created successfully",
      submissionId: createdSubmission[0]._id.toString()
    };
  }

  /**
   * Process submission asynchronously with retry capability
   * This allows for better reliability and scalability
   */
  private async processSubmissionAsync(submissionId: string, retryCount = 0): Promise<void> {
    try {
      // Fetch the submission
      const submission = await this.submissionModel.findById(submissionId);
      if (!submission) return;

      // Process submission - this could include matching, sending notifications, etc.
      // Add any additional processing logic here

      // Update status to completed
      await this.submissionModel.updateOne(
        { _id: submission._id },
        { $set: { status: SubmissionStatus.COMPLETED } }
      ).exec();
    } catch (error) {
      console.error(`Error processing submission ${submissionId}:`, error);
      
      // Implement exponential backoff for retries
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`Retrying submission ${submissionId} in ${delay}ms (attempt ${retryCount + 1})`);
        
        setTimeout(() => {
          this.processSubmissionAsync(submissionId, retryCount + 1)
            .catch(err => console.error(`Retry error for submission ${submissionId}:`, err));
        }, delay);
      } else {
        // Max retries reached, mark as failed
        await this.submissionModel.updateOne(
          { _id: new Types.ObjectId(submissionId) },
          { $set: { status: SubmissionStatus.FAILED } }
        ).exec().catch(err => console.error(`Failed to update submission status for ${submissionId}:`, err));
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

    // Execute queries in parallel to reduce overall time
    const [total, submissions] = await Promise.all([
      // Use countDocuments with specific index for better performance
      this.submissionModel.countDocuments({ 
        formId: new Types.ObjectId(formId) 
      }).exec(),
      
      // Use lean() and projection to reduce memory usage and improve query performance
      this.submissionModel.find({ 
        formId: new Types.ObjectId(formId) 
      })
        .select('_id formId data submittedAt ipAddress userAgent name email status')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec()
    ]);

    // Map results to formatted output
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

  /**
   * Update submission status with optimized write operation
   */
  async updateStatus(id: string, status: SubmissionStatus): Promise<SubmissionDocument | null> {
    return this.submissionModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { $set: { status } },
      { new: true, lean: true }
    ).exec();
  }

  /**
   * Delete submissions in bulk with optimized performance
   */
  async deleteSubmissions(submissionIds: string[]): Promise<void> {
    if (!submissionIds.length) return;
    
    // Convert string IDs to ObjectIds
    const objectIds = submissionIds.map(id => new Types.ObjectId(id));
    
    // Use deleteMany with write concern options for better performance
    await this.submissionModel.deleteMany(
      { _id: { $in: objectIds } },
      { writeConcern: { w: 1, j: false } } // Faster writes
    ).exec();
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
    // Use MongoDB aggregation pipeline for efficient stats calculation
    const stats = await this.submissionModel.aggregate([
      { $match: { formId: new Types.ObjectId(formId) } },
      { $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]).exec();
    
    // Initialize counts
    let total = 0;
    let pending = 0;
    let completed = 0;
    let failed = 0;
    
    // Process aggregation results
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

    // Get recent submission trends (last 30 days)
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
