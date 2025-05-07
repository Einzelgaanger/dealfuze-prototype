import { Controller, Post, Body, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { MatchingService } from '../services/matching.service';
import { SubmissionDocument } from '../types/submission.type';
import { MatchDocument } from '../types/match.type';

@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Post('find-matches')
  async findMatches(
    @Body() data: {
      submission: SubmissionDocument;
      oppositeSubmissions: SubmissionDocument[];
      entityType: 'founder' | 'investor';
    }
  ): Promise<MatchDocument[]> {
    try {
      if (!data.submission || !data.oppositeSubmissions || !data.entityType) {
        throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
      }

      if (!['founder', 'investor'].includes(data.entityType)) {
        throw new HttpException('Invalid entity type', HttpStatus.BAD_REQUEST);
      }

      return await this.matchingService.findMatches(
        data.submission,
        data.oppositeSubmissions,
        data.entityType
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error finding matches',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('matches/:submissionId')
  async getMatchesForSubmission(
    @Param('submissionId') submissionId: string
  ): Promise<MatchDocument[]> {
    try {
      if (!submissionId) {
        throw new HttpException('Missing submission ID', HttpStatus.BAD_REQUEST);
      }

      // TODO: Implement getting matches for a specific submission
      // This will be implemented when we add the repository layer
      return [];
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error getting matches',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 