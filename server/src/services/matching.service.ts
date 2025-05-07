import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IndustryFamilyService } from './industryFamily.service';
import { CharacterTraitService } from './characterTrait.service';
import { SubmissionDocument } from '../types/submission.type';
import { MatchDocument } from '../types/match.type';

@Injectable()
export class MatchingService {
  constructor(
    private readonly industryFamilyService: IndustryFamilyService,
    private readonly characterTraitService: CharacterTraitService,
    @InjectModel('Match')
    private readonly matchModel: Model<MatchDocument>
  ) {}

  async findMatches(
    submission: SubmissionDocument,
    oppositeSubmissions: SubmissionDocument[],
    entityType: 'founder' | 'investor'
  ): Promise<MatchDocument[]> {
    if (!submission || !oppositeSubmissions.length) {
      return [];
    }

    const matches: MatchDocument[] = [];

    for (const oppositeSubmission of oppositeSubmissions) {
      try {
        const matchScore = await this.calculateMatchScore(
          submission,
          oppositeSubmission,
          entityType
        );

        if (matchScore > 0) {
          const match = new this.matchModel({
            founderId: entityType === 'founder' ? submission._id : oppositeSubmission._id,
            investorId: entityType === 'investor' ? submission._id : oppositeSubmission._id,
            score: matchScore,
            createdAt: new Date(),
            updatedAt: new Date()
          });

          matches.push(await match.save());
        }
      } catch (error) {
        console.error(`Error calculating match score: ${error.message}`);
        continue;
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  }

  private async calculateMatchScore(
    submission1: SubmissionDocument,
    submission2: SubmissionDocument,
    entityType: 'founder' | 'investor'
  ): Promise<number> {
    if (!submission1?.data || !submission2?.data) {
      return 0;
    }

    // Extract data from submissions
    const data1 = submission1.data as Record<string, any>;
    const data2 = submission2.data as Record<string, any>;

    try {
      // Calculate industry match score (40% weight)
      const industryScore = await this.calculateIndustryScore(
        data1.industry,
        data2.preferredIndustries || []
      );

      // Calculate character trait match score (40% weight)
      const traitScore = await this.calculateTraitScore(
        data1.characterTraits || [],
        data2.characterTraits || []
      );

      // Calculate other criteria match score (20% weight)
      const otherScore = this.calculateOtherCriteriaScore(data1, data2);

      // Calculate weighted total
      return (
        industryScore * 0.4 +
        traitScore * 0.4 +
        otherScore * 0.2
      );
    } catch (error) {
      console.error(`Error in calculateMatchScore: ${error.message}`);
      return 0;
    }
  }

  private async calculateIndustryScore(
    industry: string,
    preferredIndustries: string[]
  ): Promise<number> {
    if (!industry || !preferredIndustries.length) return 0;

    try {
      let maxSimilarity = 0;

      for (const preferredIndustry of preferredIndustries) {
        const similarFamilies1 = await this.industryFamilyService.findSimilarFamilies(industry);
        const similarFamilies2 = await this.industryFamilyService.findSimilarFamilies(preferredIndustry);

        if (similarFamilies1.length && similarFamilies2.length) {
          const similarity = await this.industryFamilyService.calculateFamilySimilarity(
            similarFamilies1[0],
            similarFamilies2[0]
          );
          maxSimilarity = Math.max(maxSimilarity, similarity);
        }
      }

      return maxSimilarity;
    } catch (error) {
      console.error(`Error in calculateIndustryScore: ${error.message}`);
      return 0;
    }
  }

  private async calculateTraitScore(
    traits1: string[],
    traits2: string[]
  ): Promise<number> {
    if (!traits1.length || !traits2.length) return 0;

    try {
      let totalSimilarity = 0;
      let count = 0;

      for (const trait1 of traits1) {
        for (const trait2 of traits2) {
          const similarTraits1 = await this.characterTraitService.findSimilarTraits(trait1);
          const similarTraits2 = await this.characterTraitService.findSimilarTraits(trait2);

          if (similarTraits1.length && similarTraits2.length) {
            const similarity = await this.characterTraitService.calculateTraitSimilarity(
              similarTraits1[0],
              similarTraits2[0]
            );
            totalSimilarity += similarity;
            count++;
          }
        }
      }

      return count > 0 ? totalSimilarity / count : 0;
    } catch (error) {
      console.error(`Error in calculateTraitScore: ${error.message}`);
      return 0;
    }
  }

  private calculateOtherCriteriaScore(
    data1: Record<string, any>,
    data2: Record<string, any>
  ): number {
    try {
      let score = 0;
      let criteriaCount = 0;

      // Funding stage match
      if (data1.fundingStage && data2.preferredStages) {
        const stages = Array.isArray(data2.preferredStages) 
          ? data2.preferredStages 
          : [data2.preferredStages];
        
        if (stages.includes(data1.fundingStage)) {
          score += 1;
        }
        criteriaCount++;
      }

      // Location match
      if (data1.location && data2.preferredLocations) {
        const locations = Array.isArray(data2.preferredLocations)
          ? data2.preferredLocations
          : [data2.preferredLocations];
        
        if (locations.includes('Any') || locations.includes(data1.location)) {
          score += 1;
        }
        criteriaCount++;
      }

      // Investment range match
      if (data1.fundingNeeded && data2.investmentRange) {
        const needed = this.parseAmount(data1.fundingNeeded);
        const min = this.parseAmount(data2.investmentRange.min);
        const max = this.parseAmount(data2.investmentRange.max);
        
        if (needed >= min && needed <= max) {
          score += 1;
        }
        criteriaCount++;
      }

      return criteriaCount > 0 ? score / criteriaCount : 0;
    } catch (error) {
      console.error(`Error in calculateOtherCriteriaScore: ${error.message}`);
      return 0;
    }
  }

  private parseAmount(amount: string): number {
    try {
      if (!amount) return 0;

      // Remove currency symbols and commas
      const clean = amount.replace(/[$,]/g, '');
      
      // Convert to number
      const value = parseFloat(clean);
      
      if (isNaN(value)) return 0;
      
      // Handle 'k', 'm', 'b' suffixes
      if (amount.toLowerCase().includes('k')) return value * 1000;
      if (amount.toLowerCase().includes('m')) return value * 1000000;
      if (amount.toLowerCase().includes('b')) return value * 1000000000;
      
      return value;
    } catch (error) {
      console.error(`Error parsing amount: ${error.message}`);
      return 0;
    }
  }
} 