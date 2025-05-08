import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { MatchService } from '../match/match.service';
import { PersonalityService } from '../personality/personality.service';
import { MatchCriteriaService } from '../matchCriteria/matchCriteria.service';
import { FormService } from '../form/form.service';
import { SubmissionService } from '../submission/submission.service';
import { Submission, SubmissionDocument } from '../types/submission.type';
import { Match, MatchDocument } from '../types/match.type';
import { Form, FormDocument } from '../types/form.type';
import { Personality, PersonalityDocument } from '../types/personality.type';
import { MatchCriteria, MatchCriteriaDocument } from '../types/matchCriteria.type';
import { LinkedinProfileStatus } from '../types/linkedinProfile.type';
import LinkedinProfileModel from '../db/models/linkedinProfile.schema';
import { AppConfig } from "../config";

export async function brightDataCron() {
  const pendingProfiles = await LinkedinProfileModel.find({
    status: LinkedinProfileStatus.PENDING,
  });

  // Get models through NestJS's dependency injection
  const matchModel = getModelToken('Match') as unknown as Model<MatchDocument>;
  const submissionModel = getModelToken('Submission') as unknown as Model<SubmissionDocument>;
  const personalityModel = getModelToken('Personality') as unknown as Model<PersonalityDocument>;
  const formModel = getModelToken('Form') as unknown as Model<FormDocument>;
  const matchCriteriaModel = getModelToken('MatchCriteria') as unknown as Model<MatchCriteriaDocument>;

  // Initialize services in the correct order
  const matchCriteriaService = new MatchCriteriaService(matchCriteriaModel);
  const formService = new FormService(formModel, matchCriteriaService);

  const submissionService = new SubmissionService(
    submissionModel,
    null as any,
    null as any
  );

  const matchService = new MatchService(
    formModel,
    personalityModel,
    submissionModel,
    matchModel,
    matchCriteriaModel,
    submissionService
  );

  const personalityService = new PersonalityService(
    personalityModel,
    submissionModel,
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
