import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { MatchService } from '../match/match.service';
import { PersonalityService } from '../personality/personality.service';
import { MatchCriteriaService } from '../matchCriteria/matchCriteria.service';
import { FormService } from '../form/form.service';
import { SubmissionService } from '../submission/submission.service';
import { Submission, SubmissionDocument } from '../types/submission.type';
import { Match, MatchDocument } from '../types/match.type';
import { IForm, FormDocument } from '../types/form.type';
import { IPersonality, PersonalityDocument } from '../types/personality.type';
import { IMatchCriteria, MatchCriteriaDocument } from '../types/matchCriteria.type';
import { LinkedinProfileStatus } from '../types/linkedinProfile.type';
import LinkedinProfileModel from '../db/models/linkedinProfile.schema';
import { AppConfig } from "../config";

export async function brightDataCron() {
  const pendingProfiles = await LinkedinProfileModel.find({
    status: LinkedinProfileStatus.PENDING,
  });

  // Get models through NestJS's dependency injection
  const matchModel = getModelToken('Match') as unknown as Model<Match>;
  const submissionModel = getModelToken('Submission') as unknown as Model<Submission>;
  const personalityModel = getModelToken('Personality') as unknown as Model<IPersonality>;
  const formModel = getModelToken('Form') as unknown as Model<IForm>;
  const matchCriteriaModel = getModelToken('MatchCriteria') as unknown as Model<IMatchCriteria>;

  // Initialize services in the correct order with type assertions to fix TypeScript errors
  const matchCriteriaService = new MatchCriteriaService(matchCriteriaModel as any);
  const formService = new FormService(formModel as any, matchCriteriaService);

  const submissionService = new SubmissionService(
    submissionModel as any,
    null as any,
    null as any
  );

  const matchService = new MatchService(
    formModel as any,
    personalityModel as any,
    submissionModel as any,
    matchModel as any,
    matchCriteriaModel as any,
    submissionService
  );

  const personalityService = new PersonalityService(
    personalityModel as any,
    submissionModel as any,
    matchService
  );

  // Update submission service with proper dependencies
  Object.defineProperty(submissionService, 'matchService', {
    value: matchService,
    writable: true
  });

  Object.defineProperty(submissionService, 'personalityService', {
    value: personalityService,
    writable: true
  });

  for (const profile of pendingProfiles) {
    try {
      await personalityService.registerLinkedInProfileRetrieval(
        profile._id.toString()
      );
    } catch (error) {
      console.error(`Error processing profile ${profile._id}:`, error);
    }
  }

  console.log(`Found ${pendingProfiles.length} pending profiles`);

  await Promise.all(
    pendingProfiles.map(async (profile) => {
      try {
        const snapshotStatus = await fetch(
          `https://api.brightdata.com/datasets/v3/progress/${profile.snapshotId}`,
          {
            headers: {
              Authorization: `Bearer ${AppConfig.BRIGHTDATA_API_KEY}`,
            },
          }
        );

        const snapshotStatusData = await snapshotStatus.json();

        if (snapshotStatusData.status === "ready") {
          const snapshotResponse = await fetch(
            `https://api.brightdata.com/datasets/v3/snapshot/${profile.snapshotId}`,
            {
              headers: {
                Authorization: `Bearer ${AppConfig.BRIGHTDATA_API_KEY}`,
              },
            }
          );

          const snapshotData = await snapshotResponse.json();

          await LinkedinProfileModel.findByIdAndUpdate(profile._id, {
            $set: {
              status: LinkedinProfileStatus.SUCCESS,
              data: snapshotData,
              updatedAt: new Date(),
            },
          });

          await personalityService.registerLinkedInProfileRetrieval(
            profile._id.toString()
          );
        } else if (snapshotStatusData.status === "failed") {
          await LinkedinProfileModel.findByIdAndUpdate(profile._id, {
            $set: {
              status: LinkedinProfileStatus.ERROR,
              updatedAt: new Date(),
            },
          });

          return false;
        }

        return true;
      } catch (error) {
        console.error(`Error updating profile ${profile._id}`, error);
        return false;
      }
    })
  );

  console.log(`Updated ${pendingProfiles.filter(Boolean).length} profiles`);
}
