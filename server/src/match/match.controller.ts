import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  NotFoundException,
  BadRequestException,
  Logger
} from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchStatus, RejectionReason } from './match.schema';

@Controller('matches')
export class MatchController {
  private readonly logger = new Logger(MatchController.name);

  constructor(private readonly matchService: MatchService) {}

  @Post()
  async createMatch(
    @Body() createMatchDto: { 
      founderSubmissionId: string; 
      investorSubmissionId: string;
      score: number;
      criteria: Record<string, number>;
    }
  ) {
    try {
      const { founderSubmissionId, investorSubmissionId, score, criteria } = createMatchDto;
      return await this.matchService.create(
        founderSubmissionId,
        investorSubmissionId,
        score,
        criteria
      );
    } catch (error) {
      this.logger.error(`Failed to create match: ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException('Failed to create match');
    }
  }

  @Get()
  async getMatches() {
    try {
      return await this.matchService.findAll();
    } catch (error) {
      this.logger.error(`Failed to fetch matches: ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException('Failed to retrieve matches');
    }
  }

  @Get(':id')
  async getMatchById(@Param('id') id: string) {
    try {
      return await this.matchService.findById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch match: ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException('Failed to retrieve match');
    }
  }

  @Get('founder/:founderSubmissionId')
  async getFounderMatches(@Param('founderSubmissionId') founderSubmissionId: string) {
    try {
      return await this.matchService.findByFounderSubmissionId(founderSubmissionId);
    } catch (error) {
      this.logger.error(`Failed to fetch founder matches: ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException('Failed to retrieve founder matches');
    }
  }

  @Get('investor/:investorSubmissionId')
  async getInvestorMatches(@Param('investorSubmissionId') investorSubmissionId: string) {
    try {
      return await this.matchService.findByInvestorSubmissionId(investorSubmissionId);
    } catch (error) {
      this.logger.error(`Failed to fetch investor matches: ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException('Failed to retrieve investor matches');
    }
  }

  @Patch(':id/status')
  async updateMatchStatus(
    @Param('id') id: string,
    @Body() updateDto: {
      status: MatchStatus;
      rejectionReason?: RejectionReason;
    }
  ) {
    try {
      return await this.matchService.updateStatus(
        id,
        updateDto.status,
        updateDto.rejectionReason
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update match status: ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException('Failed to update match status');
    }
  }

  @Post('batch/process')
  async batchProcessMatches(
    @Body() options: {
      founderSubmissionId: string;
      investorSubmissionIds: string[];
      scores: number[];
      criteria: Record<string, number>[];
    }
  ) {
    try {
      const { founderSubmissionId, investorSubmissionIds, scores, criteria } = options;
      const result = await this.matchService.batchProcessMatches(
        founderSubmissionId,
        investorSubmissionIds,
        scores,
        criteria
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to batch process matches: ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException('Failed to process matches');
    }
  }

  @Post('recalculate')
  async recalculateMatches(
    @Body() options: { 
      founderSubmissionId: string;
      newScores: number[];
      newCriteria: Record<string, number>[];
    }
  ) {
    try {
      const { founderSubmissionId, newScores, newCriteria } = options;
      const result = await this.matchService.recalculateMatches(
        founderSubmissionId,
        newScores,
        newCriteria
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to recalculate matches: ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException('Failed to recalculate matches');
    }
  }

  @Get('report/stats')
  async getMatchStats() {
    try {
      return await this.matchService.getMatchStats();
    } catch (error) {
      this.logger.error(`Failed to generate match report: ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException('Failed to generate match report');
    }
  }
}