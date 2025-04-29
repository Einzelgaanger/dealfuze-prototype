import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Match, MatchDocument, MatchStatus, RejectionReason } from './match.schema';
import { IMatchCriteria } from '../types/matchCriteria.type';

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name);

  constructor(
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>
  ) {}

  async create(
    founderSubmissionId: Types.ObjectId,
    investorSubmissionId: Types.ObjectId,
    score: number,
    matchCriteria: IMatchCriteria,
    metadata?: Record<string, any>
  ): Promise<MatchDocument> {
    const newMatch = new this.matchModel({
      founderSubmissionId,
      investorSubmissionId,
      score,
      matchCriteria,
      metadata
    });
    return newMatch.save();
  }

  async findAll(query?: {
    status?: MatchStatus;
    founderSubmissionId?: string;
    investorSubmissionId?: string;
  }): Promise<MatchDocument[]> {
    const filter: any = {};
    if (query?.status) filter.status = query.status;
    if (query?.founderSubmissionId) filter.founderSubmissionId = new Types.ObjectId(query.founderSubmissionId);
    if (query?.investorSubmissionId) filter.investorSubmissionId = new Types.ObjectId(query.investorSubmissionId);
    return this.matchModel.find(filter).exec();
  }

  async findById(id: Types.ObjectId): Promise<MatchDocument | null> {
    return this.matchModel.findById(id).exec();
  }

  async findByFounderSubmissionId(founderSubmissionId: Types.ObjectId): Promise<MatchDocument[]> {
    return this.matchModel.find({ founderSubmissionId }).exec();
  }

  async findByInvestorSubmissionId(investorSubmissionId: Types.ObjectId): Promise<MatchDocument[]> {
    return this.matchModel.find({ investorSubmissionId }).exec();
  }

  async update(id: Types.ObjectId, updateData: Partial<Match>): Promise<MatchDocument | null> {
    return this.matchModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async delete(id: Types.ObjectId): Promise<MatchDocument | null> {
    return this.matchModel.findByIdAndDelete(id).exec();
  }

  async updateStatus(
    id: Types.ObjectId,
    status: MatchStatus,
    rejectionReason?: RejectionReason
  ): Promise<MatchDocument | null> {
    const updateData: Partial<Match> = { status };
    if (status === MatchStatus.ACCEPTED) {
      updateData.acceptedAt = new Date();
    } else if (status === MatchStatus.REJECTED) {
      updateData.rejectedAt = new Date();
      if (rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
    } else if (status === MatchStatus.EXPIRED) {
      updateData.expiredAt = new Date();
    } else if (status === MatchStatus.VIEWED) {
      updateData.viewedAt = new Date();
    } else if (status === MatchStatus.ARCHIVED) {
      updateData.archivedAt = new Date();
    }
    return this.matchModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async rejectMatch(
    id: Types.ObjectId,
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

  async batchProcessMatches(options: {
    startDate?: Date;
    endDate?: Date;
    minScore?: number;
    limit?: number;
  } = {}): Promise<{ processed: number; created: number; updated: number }> {
    const filter: any = {};
    if (options.startDate) filter.createdAt = { $gte: options.startDate };
    if (options.endDate) filter.createdAt = { ...filter.createdAt, $lte: options.endDate };
    if (options.minScore !== undefined) filter.score = { $gte: options.minScore };

    const matches = await this.matchModel.find(filter)
      .limit(options.limit || 100)
      .exec();

    let processed = 0;
    let created = 0;
    let updated = 0;

    for (const match of matches) {
      processed++;
      if (match.status === MatchStatus.PENDING) {
        // Process the match
        // This is where you would implement your match processing logic
        updated++;
      }
    }

    return { processed, created, updated };
  }

  async recalculateMatches(batchSize: number = 100): Promise<{ processed: number; updated: number }> {
    const matches = await this.matchModel.find()
      .limit(batchSize)
      .exec();

    let processed = 0;
    let updated = 0;

    for (const match of matches) {
      processed++;
      // Recalculate match score and criteria
      // This is where you would implement your recalculation logic
      updated++;
    }

    return { processed, updated };
  }

  async getMatchStats(): Promise<{
    total: number;
    byStatus: Record<MatchStatus, number>;
    averageScore: number;
    topIndustries: string[];
  }> {
    const stats = await this.matchModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          averageScore: { $avg: '$score' },
          byStatus: {
            $push: {
              status: '$status',
              count: 1
            }
          }
        }
      }
    ]).exec();

    const result = {
      total: stats[0]?.total || 0,
      byStatus: {} as Record<MatchStatus, number>,
      averageScore: stats[0]?.averageScore || 0,
      topIndustries: [] as string[]
    };

    // Process status counts
    if (stats[0]?.byStatus) {
      stats[0].byStatus.forEach((stat: { status: MatchStatus; count: number }) => {
        result.byStatus[stat.status] = (result.byStatus[stat.status] || 0) + stat.count;
      });
    }

    // Get top industries
    const industries = await this.matchModel.aggregate([
      { $unwind: '$matchCriteria.industry' },
      { $group: { _id: '$matchCriteria.industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).exec();

    result.topIndustries = industries.map((i: { _id: string }) => i._id);

    return result;
  }
} 