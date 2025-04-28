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
import { Submission } from '../submission/submission.schema';
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

@Injectable()
export class MatchService {
  private familyManager: IndustryFamilyManager;
  private profileMatcher: ProfileMatcher;
  private submissionModel: Model<SubmissionDocument>;
  private matchModel: Model<MatchDocument>;

  constructor(
    @InjectModel(Submission.name) submissionModel: Model<SubmissionDocument>,
    @InjectModel(Match.name) matchModel: Model<MatchDocument>,
  ) {
    this.familyManager = new IndustryFamilyManager();
    this.profileMatcher = new ProfileMatcher(this.familyManager);
    this.submissionModel = submissionModel;
    this.matchModel = matchModel;
  }

  private cleanWord(word: string): string {
    return word.toLowerCase().trim();
  }

  private normalizeWord(word: string): string {
    return this.cleanWord(word).replace(/[^a-z0-9]/g, '');
  }

  async matchSubmission(
    form: FormDocument,
    submission: SubmissionDocument,
    matchCriteria: MatchCriteriaDocument
  ): Promise<void> {
    try {
      if (form.submitterType === FormType.INVESTOR) {
        await this.matchInvestorSubmission(form, submission, matchCriteria);
      } else if (form.submitterType === FormType.FOUNDER) {
        await this.matchFounderSubmission(form, submission, matchCriteria);
      }
    } catch (error) {
      console.error('Error matching submission:', error);
      await this.submissionModel.findByIdAndUpdate(submission._id, {
        status: SubmissionStatus.FAILED,
      });
    }
  }

  private async matchInvestorSubmission(
    form: FormDocument,
    submission: SubmissionDocument,
    matchCriteria: MatchCriteriaDocument
  ): Promise<void> {
    // Implementation details...
  }

  private async matchFounderSubmission(
    form: FormDocument,
    submission: SubmissionDocument,
    matchCriteria: MatchCriteriaDocument
  ): Promise<void> {
    // Implementation details...
  }

  async getMatchStats(pipelineId: string): Promise<any> {
    const matches = await this.matchModel.find({ pipelineId }).exec();
    const stats = matches.reduce((acc, match) => {
      acc.totalMatches++;
      acc.totalScore += match.score;
      return acc;
    }, { totalMatches: 0, totalScore: 0 });

    return {
      ...stats,
      averageScore: stats.totalMatches > 0 ? stats.totalScore / stats.totalMatches : 0,
    };
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

export default MatchService;
