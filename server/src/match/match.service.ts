import { ObjectId } from "mongodb";
import { FormDocument, FormType } from "../types/form.type";
import { MatchCriteriaDocument } from "../types/matchCriteria.type";
import { SubmissionDocument, SubmissionStatus } from "../types/submission.type";
import PersonalityModel from "../db/models/personality.schema";
import SubmissionModel from "../db/models/submission.schema";
import PipelineModel from "../db/models/pipeline.schema";
import MatchModel from "../db/models/match.schema";
import { match } from "./match";
import FormModel from "../db/models/form.schema";
import { ProfileMatcher, IndustryFamilyManager } from "./familyMatch";
import { Types } from "mongoose";
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Submission, SubmissionDocument as SubmissionSchemaDocument } from '../submission/submission.schema';
import { Match, MatchDocument } from './match.schema';
import { FounderSubmission, InvestorSubmission } from '../submission/submission.type';

async function getMatchStats(pipelineId: string) {
  const pipeline = await PipelineModel.findById(pipelineId);

  if (!pipeline) {
    throw new Error("Pipeline not found");
  }

  const top5 = await MatchModel.find({
    pipelineId: pipelineId,
  })
    .limit(5)
    .projection({
      investorId: 1,
      founderId: 1,
      totalMatchPercentage: 1,
      formMatchPercentage: 1,
      personalityMatchPercentage: 1,
    })
    .sort({ totalMatchPercentage: "desc" });

  return await Promise.all(
    top5.map(async (match: any) => {
      const investor = await SubmissionModel.findById(
        match.investorId
      ).projection({ name: 1, id: 1 });
      const founder = await SubmissionModel.findById(
        match.founderId
      ).projection({ name: 1, id: 1 });

      return {
        investor,
        founder,
        totalMatchPercentage: match.totalMatchPercentage,
        formMatchPercentage: match.formMatchPercentage,
        personalityMatchPercentage: match.personalityMatchPercentage,
      };
    })
  );
}

export async function matchSubmission(
  form: FormDocument,
  submission: SubmissionDocument,
  matchCriteria: MatchCriteriaDocument
) {
  try {
    if (form.submitterType === FormType.INVESTOR) {
      const forms = await FormModel.find({
        pipelineId: form.pipelineId,
      });

      const founderForm = forms.find(
        (form) => form.submitterType === FormType.FOUNDER
      );

      if (!founderForm) {
        throw new Error("Founder form not found");
      }

      await matchInvestorSubmission({
        investorForm: form,
        founderFormId: founderForm.id,
        matchCriteria,
        submission,
      });
    } else if (form.submitterType === FormType.FOUNDER) {
      const forms = await FormModel.find({
        pipelineId: form.pipelineId,
      });

      const investorForm = forms.find(
        (form) => form.submitterType === FormType.INVESTOR
      );

      if (!investorForm) {
        throw new Error("Investor form not found");
      }

      await matchFounderSubmission({
        founderForm: form,
        investorFormId: investorForm.id,
        matchCriteria,
        submission,
      });
    }
  } catch (error) {
    console.error(error);
    await SubmissionModel.findByIdAndUpdate(submission.id, {
      status: SubmissionStatus.FAILED,
    });
  }
}

async function matchFounderSubmission({
  founderForm,
  investorFormId,
  matchCriteria,
  submission,
}: {
  founderForm: FormDocument;
  investorFormId: ObjectId;
  matchCriteria: MatchCriteriaDocument;
  submission: SubmissionDocument;
}) {
  const personality = await PersonalityModel.findOne({
    submissionId: submission.id,
  });

  const investors = await SubmissionModel.find({
    formId: investorFormId,
  });

  const investorForm = await FormModel.findById(investorFormId);

  if (!investorForm) {
    throw new Error("Investor form not found");
  }

  if (investors.length === 0) {
    return null;
  }

  // Use the new matching algorithm
  const familyManager = new IndustryFamilyManager();
  const profileMatcher = new ProfileMatcher(familyManager);

  // Register industries from all profiles
  const allProfiles = [submission, ...investors];
  allProfiles.forEach(profile => {
    const industries = profile.data.get('industries');
    if (industries) {
      const industryList = Array.isArray(industries) ? industries : [industries];
      industryList.forEach(industry => {
        // Find similar industries based on shared words
        const words = industry.toLowerCase().split(/[\s-]+/);
        const similarIndustries = industryList.filter(other => {
          if (other === industry) return false;
          const otherWords = other.toLowerCase().split(/[\s-]+/);
          return words.some(word => otherWords.includes(word));
        });
        familyManager.addIndustry(industry, similarIndustries);
      });
    }
  });

  // Get matches using the profile matcher
  const matches = await profileMatcher.matchProfiles(
    submission,
    investors,
    FormType.FOUNDER
  );

  // Store matches in database
  const matchPromises = matches.map(async (match, index) => {
    const matchRecord = new MatchModel({
      founderSubmission: submission._id,
      investorSubmission: match._id,
      score: 100 - (index / matches.length * 100), // Simple linear scaling
      createdAt: new Date()
    });
    await matchRecord.save();
  });

  await Promise.all(matchPromises);
}

async function matchInvestorSubmission({
  investorForm,
  founderFormId,
  matchCriteria,
  submission,
}: {
  investorForm: FormDocument;
  founderFormId: ObjectId;
  matchCriteria: MatchCriteriaDocument;
  submission: SubmissionDocument;
}) {
  const personality = await PersonalityModel.findOne({
    submissionId: submission.id,
  });

  const founders = await SubmissionModel.find({
    formId: founderFormId,
  });

  if (founders.length === 0) {
    return null;
  }

  const founderForm = await FormModel.findById(founderFormId);

  if (!founderForm) {
    throw new Error("Founder form not found");
  }

  // Use the new matching algorithm
  const familyManager = new IndustryFamilyManager();
  const profileMatcher = new ProfileMatcher(familyManager);

  // Register industries from all profiles
  const allProfiles = [submission, ...founders];
  allProfiles.forEach(profile => {
    const industries = profile.data.get('industries');
    if (industries) {
      const industryList = Array.isArray(industries) ? industries : [industries];
      industryList.forEach(industry => {
        // Find similar industries based on shared words
        const words = industry.toLowerCase().split(/[\s-]+/);
        const similarIndustries = industryList.filter(other => {
          if (other === industry) return false;
          const otherWords = other.toLowerCase().split(/[\s-]+/);
          return words.some(word => otherWords.includes(word));
        });
        familyManager.addIndustry(industry, similarIndustries);
      });
    }
  });

  // Get matches using the profile matcher
  const matches = await profileMatcher.matchProfiles(
    submission,
    founders,
    FormType.INVESTOR
  );

  // Store matches in database
  const matchPromises = matches.map(async (match, index) => {
    const matchRecord = new MatchModel({
      founderSubmission: match._id,
      investorSubmission: submission._id,
      score: 100 - (index / matches.length * 100), // Simple linear scaling
      createdAt: new Date()
    });
    await matchRecord.save();
  });

  await Promise.all(matchPromises);

  return personality;
}

@Injectable()
export class MatchService {
  private familyManager: IndustryFamilyManager;
  private profileMatcher: ProfileMatcher;
  private submissionModel: Model<SubmissionSchemaDocument>;
  private matchModel: Model<MatchDocument>;

  constructor(
    @InjectModel(Submission.name) submissionModel: Model<SubmissionSchemaDocument>,
    @InjectModel(Match.name) matchModel: Model<MatchDocument>,
  ) {
    this.familyManager = new IndustryFamilyManager();
    this.profileMatcher = new ProfileMatcher(this.familyManager);
    this.submissionModel = submissionModel;
    this.matchModel = matchModel;
  }

  async findMatches(submissionId: string): Promise<Match[]> {
    const submission = await this.submissionModel.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    // Get all submissions of the opposite type
    const oppositeType = submission.type === 'founder' ? 'investor' : 'founder';
    const allProfiles = await this.submissionModel.find({ type: oppositeType });

    // First, ensure all industries are registered with the family manager
    this.registerIndustries([submission, ...allProfiles]);

    // Get matches using the profile matcher
    const matches = await this.profileMatcher.matchProfiles(
      submission,
      allProfiles,
      submission.type
    );

    // Store matches in database
    await this.storeMatches(submission, matches);

    // Return the matches
    return this.matchModel.find({
      [submission.type === 'founder' ? 'founderSubmission' : 'investorSubmission']: submission._id
    }).sort({ score: -1 }).limit(50);
  }

  private registerIndustries(profiles: SubmissionDocument[]): void {
    const allIndustries = new Set<string>();
    
    // Collect all unique industries
    profiles.forEach(profile => {
      const industries = profile.data.get('industries');
      if (industries) {
        if (Array.isArray(industries)) {
          industries.forEach(industry => allIndustries.add(industry));
        } else {
          allIndustries.add(industries);
        }
      }
    });

    // Register each industry with the family manager
    allIndustries.forEach(industry => {
      // For now, we'll use a simple heuristic: industries that share words are related
      const words = industry.toLowerCase().split(/[\s-]+/);
      const relatedIndustries = Array.from(allIndustries).filter(other => {
        if (other === industry) return false;
        const otherWords = other.toLowerCase().split(/[\s-]+/);
        return words.some(word => otherWords.includes(word));
      });
      
      this.familyManager.addIndustry(industry, relatedIndustries);
    });
  }

  private async storeMatches(
    targetProfile: SubmissionDocument,
    matches: SubmissionDocument[]
  ): Promise<void> {
    const matchPromises = matches.map(async (match) => {
      const matchRecord = new this.matchModel({
        founderSubmission: targetProfile.type === 'founder' ? targetProfile._id : match._id,
        investorSubmission: targetProfile.type === 'investor' ? targetProfile._id : match._id,
        score: 100 - (matches.indexOf(match) / matches.length * 100), // Simple linear scaling
        createdAt: new Date()
      });
      
      await matchRecord.save();
    });

    await Promise.all(matchPromises);
  }

  async getMatchStats(submissionId: string): Promise<{
    totalMatches: number;
    topMatches: Match[];
    averageScore: number;
  }> {
    const submission = await this.submissionModel.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    const matches = await this.matchModel.find({
      [submission.type === 'founder' ? 'founderSubmission' : 'investorSubmission']: submission._id
    });

    const totalMatches = matches.length;
    const topMatches = matches.sort((a, b) => b.score - a.score).slice(0, 5);
    const averageScore = matches.reduce((sum, match) => sum + match.score, 0) / totalMatches;

    return {
      totalMatches,
      topMatches,
      averageScore
    };
  }

  async create(match: Partial<Match>): Promise<Match> {
    const createdMatch = new this.matchModel(match);
    return createdMatch.save();
  }

  async findAll(): Promise<Match[]> {
    return this.matchModel.find().exec();
  }

  async findOne(id: string): Promise<Match | null> {
    return this.matchModel.findById(id).exec();
  }

  async findByFounder(founderId: string): Promise<Match[]> {
    return this.matchModel.find({ founderId }).exec();
  }

  async findByInvestor(investorId: string): Promise<Match[]> {
    return this.matchModel.find({ investorId }).exec();
  }
}

export default {
  getMatchStats,
  matchSubmission,
};
