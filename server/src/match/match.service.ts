import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match, MatchDocument, MatchStatus, RejectionReason } from './match.schema';

// Define the type arguments for the Model
type MatchModelType = Model<
  MatchDocument,
  {},
  {},
  {},
  MatchDocument,
  any,
  {}
>;

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name);

  constructor(
    @InjectModel(Match.name) private matchModel: MatchModelType
  ) {}

  async create(createMatchDto: {
    founderSubmissionId: string;
    investorSubmissionId: string;
    score: number;
    matchDetails?: Record<string, any>;
  }): Promise<MatchDocument> {
    try {
      const createdMatch = new this.matchModel({
        ...createMatchDto,
        status: MatchStatus.PENDING,
        createdAt: new Date(),
      });
      return await createdMatch.save();
    } catch (error) {
      this.logger.error(`Error creating match: ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException('Failed to create match');
    }
  }

  async findAll(query: {
    status?: MatchStatus;
    founderSubmissionId?: string;
    investorSubmissionId?: string;
  }): Promise<MatchDocument[]> {
    return this.matchModel.find(query);
  }

  async findById(id: string): Promise<MatchDocument> {
    const match = await this.matchModel.findById(id);
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    return match;
  }

  async findByFounderSubmissionId(founderSubmissionId: string): Promise<MatchDocument[]> {
    return this.matchModel.find({ founderSubmissionId });
  }

  async findByInvestorSubmissionId(investorSubmissionId: string): Promise<MatchDocument[]> {
    return this.matchModel.find({ investorSubmissionId });
  }

  async updateStatus(
    id: string,
    status: MatchStatus,
    rejectionReason?: RejectionReason
  ): Promise<MatchDocument> {
    const match = await this.findById(id);
    
    const updateData: Partial<MatchDocument> = { status };
    
    // Set appropriate timestamp based on the new status
    if (status === MatchStatus.ACCEPTED) {
      updateData.acceptedAt = new Date();
    } else if (status === MatchStatus.REJECTED) {
      updateData.rejectedAt = new Date();
      updateData.rejectionReason = rejectionReason;
    } else if (status === MatchStatus.VIEWED) {
      updateData.viewedAt = new Date();
    } else if (status === MatchStatus.ARCHIVED) {
      updateData.archivedAt = new Date();
    }
    
    return this.matchModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  async batchProcessMatches(options: {
    startDate?: Date;
    endDate?: Date;
    minScore?: number;
    limit?: number;
  } = {}): Promise<{ processed: number; created: number }> {
    // Simple implementation that returns mock data
    // In a real implementation, this would process pending matches
    return { processed: 10, created: 5 };
  }

  async recalculateMatches(batchSize = 100): Promise<{ recalculated: number }> {
    // Simple implementation that returns mock data
    // In a real implementation, this would recalculate match scores
    return { recalculated: batchSize };
  }

  async getMatchStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byScoreRange: Record<string, number>;
  }> {
    // Get matches count
    const total = await this.matchModel.countDocuments();
    
    // Get matches count by status
    const byStatus: Record<string, number> = {};
    for (const status of Object.values(MatchStatus)) {
      byStatus[status] = await this.matchModel.countDocuments({ status });
    }
    
    // Get matches count by score range
    const byScoreRange: Record<string, number> = {
      "0-25": await this.matchModel.countDocuments({ score: { $gte: 0, $lt: 25 } }),
      "25-50": await this.matchModel.countDocuments({ score: { $gte: 25, $lt: 50 } }),
      "50-75": await this.matchModel.countDocuments({ score: { $gte: 50, $lt: 75 } }),
      "75-100": await this.matchModel.countDocuments({ score: { $gte: 75, $lte: 100 } }),
    };
    
    return { total, byStatus, byScoreRange };
  }
} 