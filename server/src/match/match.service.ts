import { Injectable, NotFoundException, Logger, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Match, MatchDocument, MatchStatus, RejectionReason } from './match.schema';
import { IMatchCriteria } from '../types/matchCriteria.type';
import { SubmissionService } from '../submission/submission.service';
import { Submission } from '../submission/submission.schema';
import { IForm } from '../types/form.type';
import { IPersonality } from '../types/personality.type';
import IndustryFamilyModel from '../db/models/industryFamily.schema';
import CharacterTraitModel from '../db/models/characterTrait.schema';
import { FormType } from '../types/form.type';
import { ISubmission } from '../types/submission.type';
import { IMatch } from '../types/match.type';
import { ICharacterTrait } from '../types/characterTrait.type';
import { IIndustryFamily } from '../types/industryFamily.type';
import { FormComponent } from '../types/formComponent.type';
import { MatchType } from '../types/match.type';
import { AppConfig } from '../config';
import FormModel from '../db/models/form.schema';
import PersonalityModel from '../db/models/personality.schema';
import SubmissionModel from '../db/models/submission.schema';
import MatchModel from '../db/models/match.schema';
import MatchCriteriaModel from '../db/models/matchCriteria.schema';

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name);

  constructor(
    @InjectModel(FormModel.name) private formModel: Model<IForm>,
    @InjectModel(PersonalityModel.name) private personalityModel: Model<IPersonality>,
    @InjectModel(SubmissionModel.name) private submissionModel: Model<ISubmission>,
    @InjectModel(MatchModel.name) private matchModel: Model<IMatch>,
    @InjectModel(MatchCriteriaModel.name) private matchCriteriaModel: Model<IMatchCriteria>,
    @Inject(forwardRef(() => SubmissionService))
    private submissionService: SubmissionService
  ) {}

  async create(
    founderSubmissionId: string,
    investorSubmissionId: string,
    score: number,
    criteria: Record<string, number>
  ): Promise<MatchDocument> {
    const match = new this.matchModel({
      founderSubmissionId: new Types.ObjectId(founderSubmissionId),
      investorSubmissionId: new Types.ObjectId(investorSubmissionId),
      score,
      criteria,
      status: MatchStatus.PENDING,
      createdAt: new Date()
    });
    return match.save();
  }

  async findAll(): Promise<MatchDocument[]> {
    return this.matchModel.find().sort({ score: -1 }).exec();
  }

  async findById(id: string): Promise<MatchDocument | null> {
    return this.matchModel.findById(id).exec();
  }

  async findByFounderSubmissionId(id: string): Promise<MatchDocument[]> {
    return this.matchModel
      .find({ founderSubmissionId: new Types.ObjectId(id) })
      .sort({ score: -1 })
      .exec();
  }

  async findByInvestorSubmissionId(id: string): Promise<MatchDocument[]> {
    return this.matchModel
      .find({ investorSubmissionId: new Types.ObjectId(id) })
      .sort({ score: -1 })
      .exec();
  }

  async update(id: string, match: Partial<Match>): Promise<MatchDocument | null> {
    return this.matchModel.findByIdAndUpdate(
      id,
      { ...match, lastUpdated: new Date() },
      { new: true }
    ).exec();
  }

  async delete(id: string): Promise<MatchDocument | null> {
    return this.matchModel.findByIdAndDelete(id).exec();
  }

  async updateStatus(
    id: string,
    status: MatchStatus,
    notes?: string
  ): Promise<MatchDocument | null> {
    return this.matchModel.findByIdAndUpdate(
      id,
      { 
        status,
        statusUpdatedAt: new Date(),
        notes
      },
      { new: true }
    ).exec();
  }

  async rejectMatch(
    id: string,
    reason: RejectionReason,
    notes?: string
  ): Promise<MatchDocument | null> {
    return this.matchModel.findByIdAndUpdate(
      id,
      { 
        status: MatchStatus.REJECTED,
        rejectionReason: reason,
        rejectionNotes: notes,
        rejectedAt: new Date()
      },
      { new: true }
    ).exec();
  }

  async batchProcessMatches(
    founderSubmissionId: string,
    investorSubmissionIds: string[],
    scores: number[],
    criteria: Record<string, number>[]
  ): Promise<MatchDocument[]> {
    const matches = investorSubmissionIds.map((id, index) => ({
      founderSubmissionId: new Types.ObjectId(founderSubmissionId),
      investorSubmissionId: new Types.ObjectId(id),
      score: scores[index],
      criteria: criteria[index],
      status: MatchStatus.PENDING,
      createdAt: new Date()
    }));

    return this.matchModel.insertMany(matches);
  }

  async recalculateMatches(
    founderSubmissionId: string,
    newScores: number[],
    newCriteria: Record<string, number>[]
  ): Promise<MatchDocument[]> {
    // First, get all existing matches for this founder
    const existingMatches = await this.matchModel
      .find({ founderSubmissionId: new Types.ObjectId(founderSubmissionId) })
      .exec();

    // Update each match with new scores and criteria
    const updates = existingMatches.map((match, index) => ({
      updateOne: {
        filter: { _id: match._id },
        update: {
          $set: {
            score: newScores[index],
            criteria: newCriteria[index],
            lastUpdated: new Date()
          }
        }
      }
    }));

    // Perform bulk update
    await this.matchModel.bulkWrite(updates);

    // Return updated matches
    return this.matchModel
      .find({ founderSubmissionId: new Types.ObjectId(founderSubmissionId) })
      .sort({ score: -1 })
      .exec();
  }

  async getMatchStats(): Promise<{
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    averageScore: number;
    topIndustries: { industry: string; count: number }[];
  }> {
    const stats = await this.matchModel.aggregate([
      { $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgScore: { $avg: "$score" }
        }
      }
    ]).exec();

    const industryStats = await this.matchModel.aggregate([
      { $unwind: "$criteria" },
      { $group: {
          _id: "$criteria.industry",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).exec();

    let total = 0;
    let pending = 0;
    let accepted = 0;
    let rejected = 0;
    let totalScore = 0;
    let matchCount = 0;

    stats.forEach((stat: { _id: string; count: number; avgScore: number }) => {
      total += stat.count;
      if (stat._id === MatchStatus.PENDING) pending = stat.count;
      if (stat._id === MatchStatus.ACCEPTED) accepted = stat.count;
      if (stat._id === MatchStatus.REJECTED) rejected = stat.count;
      totalScore += stat.avgScore * stat.count;
      matchCount += stat.count;
    });

    const averageScore = matchCount > 0 ? totalScore / matchCount : 0;

    const topIndustries = industryStats.map((stat: { _id: string; count: number }) => ({
      industry: stat._id,
      count: stat.count
    }));

    return {
      total,
      pending,
      accepted,
      rejected,
      averageScore,
      topIndustries
    };
  }

  async findMatches(submissionId: string) {
    const submission = await this.submissionModel.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    const form = await this.formModel.findById(submission.formId);
    if (!form) {
      throw new Error('Form not found');
    }

    // Get all submissions of the opposite type
    const oppositeType = form.submitterType === FormType.FOUNDER ? FormType.INVESTOR : FormType.FOUNDER;
    const oppositeSubmissions = await this.submissionModel.find({
      formId: { $ne: submission.formId },
      'data.type': oppositeType,
    });

    const matches = await Promise.all(
      oppositeSubmissions.map(async (oppositeSubmission) => {
        const score = await this.calculateMatchScore(submission, oppositeSubmission);
        return {
          submissionId,
          oppositeSubmissionId: oppositeSubmission._id,
          score,
        };
      })
    );

    // Sort matches by score in descending order
    return matches.sort((a, b) => b.score - a.score);
  }

  private async calculateMatchScore(submission1: Submission, submission2: Submission): Promise<number> {
    const form1 = await this.formModel.findById(submission1.formId);
    const form2 = await this.formModel.findById(submission2.formId);
    
    if (!form1 || !form2) {
      throw new Error('Form not found');
    }

    // Get personalities
    const personality1 = await this.personalityModel.findOne({ submissionId: submission1._id });
    const personality2 = await this.personalityModel.findOne({ submissionId: submission2._id });

    // Calculate industry match score
    const industryScore = await this.calculateIndustryScore(
      submission1.data.industry,
      submission2.data.industry
    );

    // Calculate form response match score
    const formScore = this.calculateFormScore(submission1.data, submission2.data, form1.components, form2.components);

    // Calculate personality match score
    const personalityScore = personality1 && personality2 
      ? await this.calculatePersonalityScore(personality1, personality2)
      : 0;

    // Weight the scores
    const weights = {
      industry: 0.3,
      form: 0.4,
      personality: 0.3,
    };

    return (
      industryScore * weights.industry +
      formScore * weights.form +
      personalityScore * weights.personality
    );
  }

  private async calculateIndustryScore(industry1: string, industry2: string): Promise<number> {
    // Find industry families
    const family1 = await IndustryFamilyModel.findOne({
      relatedIndustries: industry1,
    });
    const family2 = await IndustryFamilyModel.findOne({
      relatedIndustries: industry2,
    });

    if (!family1 || !family2) {
      return 0;
    }

    // Check if industries are in the same family
    if (family1._id.equals(family2._id)) {
      return 1;
    }

    // Check if one family is a parent of the other
    if (family1.parentFamily?.equals(family2._id) || family2.parentFamily?.equals(family1._id)) {
      return 0.8;
    }

    // Check for common related industries
    const commonIndustries = family1.relatedIndustries.filter(industry =>
      family2.relatedIndustries.includes(industry)
    );

    if (commonIndustries.length > 0) {
      return 0.6;
    }

    return 0;
  }

  private calculateFormScore(
    data1: Record<string, any>,
    data2: Record<string, any>,
    components1: any[],
    components2: any[]
  ): number {
    let totalScore = 0;
    let totalWeight = 0;

    // Find matching components between forms
    const matchingComponents = components1.filter(comp1 =>
      components2.some(comp2 => comp2.key === comp1.key)
    );

    for (const component of matchingComponents) {
      const value1 = data1[component.key];
      const value2 = data2[component.key];

      if (value1 === undefined || value2 === undefined) {
        continue;
      }

      const weight = component.weight || 1;
      totalWeight += weight;

      switch (component.type) {
        case 'select':
        case 'radio':
          totalScore += value1 === value2 ? weight : 0;
          break;

        case 'selectboxes':
          const commonValues = value1.filter((v: string) => value2.includes(v));
          totalScore += (commonValues.length / Math.max(value1.length, value2.length)) * weight;
          break;

        case 'number':
          const num1 = Number(value1);
          const num2 = Number(value2);
          if (!isNaN(num1) && !isNaN(num2)) {
            const max = Math.max(num1, num2);
            const diff = Math.abs(num1 - num2);
            totalScore += (1 - diff / max) * weight;
          }
          break;

        default:
          // For text fields, use fuzzy matching
          if (typeof value1 === 'string' && typeof value2 === 'string') {
            const similarity = this.calculateStringSimilarity(value1, value2);
            totalScore += similarity * weight;
          }
      }
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  private async calculatePersonalityScore(personality1: any, personality2: any): Promise<number> {
    const traits1 = await CharacterTraitModel.find({
      _id: { $in: personality1.traits },
    });
    const traits2 = await CharacterTraitModel.find({
      _id: { $in: personality2.traits },
    });

    let totalScore = 0;
    let totalWeight = 0;

    for (const trait1 of traits1) {
      for (const trait2 of traits2) {
        const weight = trait1.weight * trait2.weight;
        totalWeight += weight;

        if (trait1.compatibleTraits.some(id => id.equals(trait2._id))) {
          totalScore += weight;
        } else if (trait1.incompatibleTraits.some(id => id.equals(trait2._id))) {
          totalScore -= weight;
        }
      }
    }

    return totalWeight > 0 ? Math.max(0, totalScore / totalWeight) : 0;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    if (s1 === s2) return 1;
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;
    
    const words1 = new Set(s1.split(/\s+/));
    const words2 = new Set(s2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }
} 