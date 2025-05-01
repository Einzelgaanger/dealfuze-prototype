import { Injectable } from '@nestjs/common';
import { PersonalityService } from '../personality/personality.service';
import { MatchService } from '../match/match.service';
import { SubmissionService } from '../submission/submission.service';
import LinkedinProfileModel from '../db/models/linkedinProfile.schema';
import { LinkedinProfileStatus } from '../types/linkedinProfile.type';

@Injectable()
export class CronService {
  constructor(
    private readonly personalityService: PersonalityService,
    private readonly matchService: MatchService,
    private readonly submissionService: SubmissionService,
  ) {}

  async brightDataCron() {
    const pendingProfiles = await LinkedinProfileModel.find({
      status: LinkedinProfileStatus.PENDING,
    });

    for (const profile of pendingProfiles) {
      try {
        await this.personalityService.registerLinkedInProfileRetrieval(
          profile._id
        );
      } catch (error) {
        console.error(`Error processing profile ${profile._id}:`, error);
      }
    }
  }
} 