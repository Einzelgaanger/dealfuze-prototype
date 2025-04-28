import { Controller, Get, Post, Param, Body, UseGuards, Query } from '@nestjs/common';
import { MatchService } from './match.service';
import { Match } from './match.schema';
import { JwtAuthGuard } from '../middleware/auth.middleware';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post()
  async create(@Body() match: Match): Promise<Match> {
    return this.matchService.create(match);
  }

  @Get()
  async findAll(): Promise<Match[]> {
    return this.matchService.findAll();
  }

  @Get('founder/:founderId')
  async findByFounder(@Param('founderId') founderId: string): Promise<Match[]> {
    return this.matchService.findByFounder(founderId);
  }

  @Get('investor/:investorId')
  async findByInvestor(@Param('investorId') investorId: string): Promise<Match[]> {
    return this.matchService.findByInvestor(investorId);
  }

  @Post(':submissionId/find')
  async findMatches(@Param('submissionId') submissionId: string): Promise<Match[]> {
    return this.matchService.findMatches(submissionId);
  }

  @Get(':submissionId/stats')
  async getMatchStats(@Param('submissionId') submissionId: string) {
    return this.matchService.getMatchStats(submissionId);
  }

  @Get(':submissionId/top')
  async getTopMatches(
    @Param('submissionId') submissionId: string,
    @Body('limit') limit: number = 10
  ): Promise<Match[]> {
    const matches = await this.matchService.findMatches(submissionId);
    return matches.slice(0, limit);
  }
} 