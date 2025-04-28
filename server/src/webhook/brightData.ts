import { AppConfig } from "../config";
import LinkedinProfileModel from "../db/models/linkedinProfile.schema";
import { Request, Response } from "express";
import {
  BrightDataLinkedinProfile,
  LinkedinProfileStatus,
} from "../types/linkedinProfile.type";
import { personalityService } from "../personality/personality.service";

async function handleBrightDataWebhook(req: Request, res: Response) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).send("Unauthorized");
  }

  const token = authHeader.split(" ")[1];

  if (token !== AppConfig.BRIGHTDATA_WEBHOOK_SECRET) {
    res.status(401).send("Unauthorized");
    return;
  }

  const linkedinData: BrightDataLinkedinProfile = req.body;

  // First try to find existing profile
  let linkedinProfile = await LinkedinProfileModel.findOne({
    linkedinId: linkedinData.linkedin_id,
  });

  if (linkedinProfile) {
    // Update existing profile
    linkedinProfile = await LinkedinProfileModel.findByIdAndUpdate(
      linkedinProfile._id,
      {
        $set: {
          data: linkedinData,
          status: LinkedinProfileStatus.SUCCESS,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );
  } else {
    // Create new profile
    linkedinProfile = await LinkedinProfileModel.create({
      linkedinId: linkedinData.linkedin_id,
      snapshotId: linkedinData.id,
      status: LinkedinProfileStatus.SUCCESS,
      data: linkedinData,
    });
  }

  if (!linkedinProfile) {
    res.status(404).send("Linkedin profile not found");
    return;
  }

  await personalityService.registerLinkedInProfileRetrieval(
    linkedinProfile._id
  );

  res.status(200).send("OK");
}

export { handleBrightDataWebhook };
