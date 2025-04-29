import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Match, MatchDocument, MatchStatus, RejectionReason } from './match.schema';
import { IMatchCriteria } from '../types/matchCriteria.type';
import { SubmissionService } from '../submission/submission.service';

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name);

  constructor(
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    private submissionService: SubmissionService
  ) {}

  async create(
    founderSubmissionId: string,
    investorSubmissionId: string,
    score: number,
    criteria: Record<string, number>
  ): Promise<MatchDocument> {
    const match = new this.matchModel({
      founderSubmissionId: new Types.ObjectId(founderSubmissionId),
      investorSubmissionId: new Types.ObjectId(investorSubmissionId),
      score,
      criteria,
      status: MatchStatus.PENDING,
      createdAt: new Date()
    });
    return match.save();
  }

  async findAll(): Promise<MatchDocument[]> {
    return this.matchModel.find().sort({ score: -1 }).exec();
  }

  async findById(id: string): Promise<MatchDocument | null> {
    return this.matchModel.findById(id).exec();
  }

  async findByFounderSubmissionId(id: string): Promise<MatchDocument[]> {
    return this.matchModel
      .find({ founderSubmissionId: new Types.ObjectId(id) })
      .sort({ score: -1 })
      .exec();
  }

  async findByInvestorSubmissionId(id: string): Promise<MatchDocument[]> {
    return this.matchModel
      .find({ investorSubmissionId: new Types.ObjectId(id) })
      .sort({ score: -1 })
      .exec();
  }

  async update(id: string, match: Partial<Match>): Promise<MatchDocument | null> {
    return this.matchModel.findByIdAndUpdate(
      id,
      { ...match, lastUpdated: new Date() },
      { new: true }
    ).exec();
  }

  async delete(id: string): Promise<MatchDocument | null> {
    return this.matchModel.findByIdAndDelete(id).exec();
  }

  async updateStatus(
    id: string,
    status: MatchStatus,
    notes?: string
  ): Promise<MatchDocument | null> {
    return this.matchModel.findByIdAndUpdate(
      id,
      { 
        status,
        statusUpdatedAt: new Date(),
        notes
      },
      { new: true }
    ).exec();
  }

  async rejectMatch(
    id: string,
    reason: RejectionReason,
    notes?: string
  ): Promise<MatchDocument | null> {
    return this.matchModel.findByIdAndUpdate(
      id,
      { 
        status: MatchStatus.REJECTED,
        rejectionReason: reason,
        rejectionNotes: notes,
        rejectedAt: new Date()
      },
      { new: true }
    ).exec();
  }

  async batchProcessMatches(
    founderSubmissionId: string,
    investorSubmissionIds: string[],
    scores: number[],
    criteria: Record<string, number>[]
  ): Promise<MatchDocument[]> {
    const matches = investorSubmissionIds.map((id, index) => ({
      founderSubmissionId: new Types.ObjectId(founderSubmissionId),
      investorSubmissionId: new Types.ObjectId(id),
      score: scores[index],
      criteria: criteria[index],
      status: MatchStatus.PENDING,
      createdAt: new Date()
    }));

    return this.matchModel.insertMany(matches);
  }

  async recalculateMatches(
    founderSubmissionId: string,
    newScores: number[],
    newCriteria: Record<string, number>[]
  ): Promise<MatchDocument[]> {
    // First, get all existing matches for this founder
    const existingMatches = await this.matchModel
      .find({ founderSubmissionId: new Types.ObjectId(founderSubmissionId) })
      .exec();

    // Update each match with new scores and criteria
    const updates = existingMatches.map((match, index) => ({
      updateOne: {
        filter: { _id: match._id },
        update: {
          $set: {
            score: newScores[index],
            criteria: newCriteria[index],
            lastUpdated: new Date()
          }
        }
      }
    }));

    // Perform bulk update
    await this.matchModel.bulkWrite(updates);

    // Return updated matches
    return this.matchModel
      .find({ founderSubmissionId: new Types.ObjectId(founderSubmissionId) })
      .sort({ score: -1 })
      .exec();
  }

  async getMatchStats(): Promise<{
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    averageScore: number;
    topIndustries: { industry: string; count: number }[];
  }> {
    const stats = await this.matchModel.aggregate([
      { $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgScore: { $avg: "$score" }
        }
      }
    ]).exec();

    const industryStats = await this.matchModel.aggregate([
      { $unwind: "$criteria" },
      { $group: {
          _id: "$criteria.industry",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).exec();

    let total = 0;
    let pending = 0;
    let accepted = 0;
    let rejected = 0;
    let totalScore = 0;
    let matchCount = 0;

    stats.forEach((stat: { _id: string; count: number; avgScore: number }) => {
      total += stat.count;
      if (stat._id === MatchStatus.PENDING) pending = stat.count;
      if (stat._id === MatchStatus.ACCEPTED) accepted = stat.count;
      if (stat._id === MatchStatus.REJECTED) rejected = stat.count;
      totalScore += stat.avgScore * stat.count;
      matchCount += stat.count;
    });

    const averageScore = matchCount > 0 ? totalScore / matchCount : 0;

    const topIndustries = industryStats.map((stat: { _id: string; count: number }) => ({
      industry: stat._id,
      count: stat.count
    }));

    return {
      total,
      pending,
      accepted,
      rejected,
      averageScore,
      topIndustries
    };
  }
} 