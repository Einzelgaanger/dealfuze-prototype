import { FormDocument, FormType } from "../types/form.type";
import { SubmissionDocument } from "../types/submission.type";

// Family code generation system
export class FamilyCodeGenerator {
  private static readonly BASE = 26;
  private static readonly START_CHAR = 'A'.charCodeAt(0);

  static generateCode(index: number): string {
    let code = '';
    while (index >= 0) {
      code = String.fromCharCode(this.START_CHAR + (index % this.BASE)) + code;
      index = Math.floor(index / this.BASE) - 1;
    }
    return code;
  }

  static getIndex(code: string): number {
    let index = 0;
    for (let i = 0; i < code.length; i++) {
      index = index * this.BASE + (code.charCodeAt(i) - this.START_CHAR + 1);
    }
    return index - 1;
  }
}

// Industry family management
export class IndustryFamilyManager {
  private industries: Map<string, string> = new Map(); // industry -> family code
  private familyOrder: string[] = []; // ordered list of family codes
  private industrySimilarity: Map<string, Map<string, number>> = new Map(); // industry -> {industry -> similarity}

  addIndustry(industry: string, closestIndustries: string[]): string {
    if (this.industries.has(industry)) {
      return this.industries.get(industry)!;
    }

    // Find the best position to insert the new industry
    let insertIndex = this.findBestInsertPosition(industry, closestIndustries);
    
    // Generate new family code
    const newCode = FamilyCodeGenerator.generateCode(insertIndex);
    
    // Insert into ordered list
    this.familyOrder.splice(insertIndex, 0, newCode);
    this.industries.set(industry, newCode);
    
    // Calculate and store similarity scores
    this.calculateIndustrySimilarity(industry, closestIndustries);
    
    return newCode;
  }

  private findBestInsertPosition(newIndustry: string, closestIndustries: string[]): number {
    if (closestIndustries.length === 0) {
      return this.familyOrder.length; // Append to end if no close matches
    }

    // Find positions of closest industries
    const positions = closestIndustries
      .map(industry => this.industries.get(industry))
      .filter(code => code !== undefined)
      .map(code => this.familyOrder.indexOf(code!));

    if (positions.length === 0) {
      return this.familyOrder.length;
    }

    // Return the average position of closest matches
    return Math.round(positions.reduce((a, b) => a + b, 0) / positions.length);
  }

  private calculateIndustrySimilarity(industry: string, closestIndustries: string[]): void {
    if (!this.industrySimilarity.has(industry)) {
      this.industrySimilarity.set(industry, new Map());
    }

    const similarityMap = this.industrySimilarity.get(industry)!;
    
    // Calculate similarity based on shared words and industry relationships
    closestIndustries.forEach(otherIndustry => {
      const similarity = this.calculateSimilarityScore(industry, otherIndustry);
      similarityMap.set(otherIndustry, similarity);
      
      // Ensure bidirectional similarity
      if (!this.industrySimilarity.has(otherIndustry)) {
        this.industrySimilarity.set(otherIndustry, new Map());
      }
      this.industrySimilarity.get(otherIndustry)!.set(industry, similarity);
    });
  }

  private calculateSimilarityScore(industry1: string, industry2: string): number {
    const words1 = new Set(industry1.toLowerCase().split(/[\s-]+/));
    const words2 = new Set(industry2.toLowerCase().split(/[\s-]+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  getFamilyCode(industry: string): string | undefined {
    return this.industries.get(industry);
  }

  getIndustrySimilarity(industry1: string, industry2: string): number {
    return this.industrySimilarity.get(industry1)?.get(industry2) || 0;
  }
}

// Character trait encoding system
export class CharacterTraitEncoder {
  private static readonly CHARSET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private static readonly CODE_LENGTH = 9;

  static encodeTrait(trait: any): string {
    // Convert trait to a normalized value between 0 and 1
    const normalizedValue = this.normalizeTrait(trait);
    
    // Convert to base-62 number
    let code = '';
    let value = Math.floor(normalizedValue * Math.pow(this.CHARSET.length, this.CODE_LENGTH));
    
    for (let i = 0; i < this.CODE_LENGTH; i++) {
      const index = value % this.CHARSET.length;
      code = this.CHARSET[index] + code;
      value = Math.floor(value / this.CHARSET.length);
    }
    
    return code;
  }

  private static normalizeTrait(trait: any): number {
    if (typeof trait === 'number') {
      return trait;
    } else if (typeof trait === 'string') {
      // Convert string to number using hash
      let hash = 0;
      for (let i = 0; i < trait.length; i++) {
        hash = ((hash << 5) - hash) + trait.charCodeAt(i);
        hash = hash & hash;
      }
      return (hash + 2147483647) / 4294967294;
    } else if (Array.isArray(trait)) {
      // Average of array values
      return trait.reduce((sum, val) => sum + this.normalizeTrait(val), 0) / trait.length;
    }
    return 0;
  }

  static getTraitDistance(code1: string, code2: string): number {
    let distance = 0;
    for (let i = 0; i < this.CODE_LENGTH; i++) {
      const index1 = this.CHARSET.indexOf(code1[i]);
      const index2 = this.CHARSET.indexOf(code2[i]);
      distance += Math.abs(index1 - index2);
    }
    return distance / (this.CODE_LENGTH * this.CHARSET.length);
  }
}

// Profile matching system
export class ProfileMatcher {
  constructor(
    private familyManager: IndustryFamilyManager,
    private topN: number = 50
  ) {}

  async matchProfiles(
    targetProfile: SubmissionDocument,
    allProfiles: SubmissionDocument[],
    entityType: string
  ): Promise<SubmissionDocument[]> {
    // Step 1: Calculate character trait distances
    const traitMatches = allProfiles
      .filter(profile => profile.type !== entityType)
      .map(profile => ({
        profile,
        traitDistance: this.calculateTraitDistance(targetProfile, profile)
      }));

    // Sort by trait similarity
    traitMatches.sort((a, b) => a.traitDistance - b.traitDistance);
    const topTraitMatches = traitMatches.slice(0, this.topN * 2);

    // Step 2: Filter by industry similarity
    const industryFilteredMatches = topTraitMatches.map(match => ({
      ...match,
      industryScore: this.calculateIndustryScore(targetProfile, match.profile)
    }));

    // Sort by combined score
    industryFilteredMatches.sort((a, b) => {
      const scoreA = this.calculateCombinedScore(a.traitDistance, a.industryScore);
      const scoreB = this.calculateCombinedScore(b.traitDistance, b.industryScore);
      return scoreB - scoreA; // Higher score is better
    });

    return industryFilteredMatches
      .slice(0, this.topN)
      .map(match => match.profile);
  }

  private calculateTraitDistance(profile1: SubmissionDocument, profile2: SubmissionDocument): number {
    const traits1 = this.extractTraits(profile1);
    const traits2 = this.extractTraits(profile2);
    
    let totalDistance = 0;
    let count = 0;
    
    for (const [key, value1] of traits1) {
      const value2 = traits2.get(key);
      if (value2 !== undefined) {
        const code1 = CharacterTraitEncoder.encodeTrait(value1);
        const code2 = CharacterTraitEncoder.encodeTrait(value2);
        totalDistance += CharacterTraitEncoder.getTraitDistance(code1, code2);
        count++;
      }
    }
    
    return count > 0 ? totalDistance / count : 1; // Return 1 (max distance) if no traits match
  }

  private calculateIndustryScore(profile1: SubmissionDocument, profile2: SubmissionDocument): number {
    const industries1 = this.extractIndustries(profile1);
    const industries2 = this.extractIndustries(profile2);
    
    if (industries1.length === 0 || industries2.length === 0) {
      return 0;
    }

    let maxSimilarity = 0;
    
    for (const industry1 of industries1) {
      for (const industry2 of industries2) {
        const similarity = this.familyManager.getIndustrySimilarity(industry1, industry2);
        maxSimilarity = Math.max(maxSimilarity, similarity);
      }
    }
    
    return maxSimilarity;
  }

  private calculateCombinedScore(traitDistance: number, industryScore: number): number {
    // Weight trait distance more heavily (70%)
    return (1 - traitDistance) * 0.7 + industryScore * 0.3;
  }

  private extractTraits(profile: SubmissionDocument): Map<string, any> {
    const traits = new Map<string, any>();
    for (const [key, value] of Object.entries(profile.data)) {
      if (key !== 'industries') { // Exclude industry fields
        traits.set(key, value);
      }
    }
    return traits;
  }

  private extractIndustries(profile: SubmissionDocument): string[] {
    const industries = profile.data.get('industries');
    if (!industries) return [];
    
    return Array.isArray(industries) ? industries : [industries];
  }
} 