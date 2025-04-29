import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { Match, MatchDocument, MatchStatus, RejectionReason } from './match.schema';

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name);

  constructor(
    @InjectModel(Match.name) private matchModel: Model<MatchDocument, {}, {}, {}, MatchDocument & Document, {}, {}>
  ) {}

  async create(match: Partial<Match>): Promise<MatchDocument> {
    try {
      const createdMatch = new this.matchModel(match);
      return createdMatch.save();
    } catch (error: unknown) {
      this.logger.error(`Error creating match: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : undefined);
      throw new BadRequestException('Failed to create match');
    }
  }

  async findAll(): Promise<MatchDocument[]> {
    return this.matchModel.find().exec();
  }

  async findById(id: string): Promise<MatchDocument | null> {
    return this.matchModel.findById(id).exec();
  }

  async findByFounderSubmissionId(founderSubmissionId: string): Promise<MatchDocument[]> {
    return this.matchModel.find({ founderSubmissionId }).exec();
  }

  async findByInvestorSubmissionId(investorSubmissionId: string): Promise<MatchDocument[]> {
    return this.matchModel.find({ investorSubmissionId }).exec();
  }

  async update(id: string, match: Partial<Match>): Promise<MatchDocument | null> {
    const updatedMatch = await this.matchModel.findByIdAndUpdate(id, match, { new: true }).exec();
    if (!updatedMatch) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    return updatedMatch;
  }

  async delete(id: string): Promise<void> {
    const result = await this.matchModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
  }

  async updateStatus(id: string, status: MatchStatus): Promise<MatchDocument | null> {
    const updatedMatch = await this.matchModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).exec();
    if (!updatedMatch) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    return updatedMatch;
  }

  async rejectMatch(id: string, reason: RejectionReason, notes?: string): Promise<MatchDocument | null> {
    const updatedMatch = await this.matchModel.findByIdAndUpdate(
      id,
      { 
        status: MatchStatus.REJECTED,
        rejectionReason: reason,
        rejectionNotes: notes,
        rejectedAt: new Date()
      },
      { new: true }
    ).exec();
    if (!updatedMatch) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    return updatedMatch;
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