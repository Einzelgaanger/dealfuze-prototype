import { Injectable } from '@nestjs/common';
import { SubmissionDocument } from '../submission/submission.schema';
import { MatchCriteria } from './match.schema';

@Injectable()
export class MatchCalculationService {
  async calculateMatchScore(
    founderSubmission: SubmissionDocument,
    investorSubmission: SubmissionDocument,
  ): Promise<{ score: number; matchCriteria: MatchCriteria }> {
    const matchCriteria: MatchCriteria = {
      industryMatch: false,
      stageMatch: false,
      marketSizeMatch: false,
      investmentRangeMatch: false,
      locationMatch: false
    };
    
    // Extract data for matching
    const founderData = founderSubmission.data as Record<string, any>;
    const investorData = investorSubmission.data as Record<string, any>;
    
    // Initialize weights for different criteria
    const weights = {
      industry: 0.3,
      stage: 0.25,
      marketSize: 0.15,
      investmentRange: 0.2,
      location: 0.1
    };
    
    let weightedScore = 0;
    
    // Industry match
    if (founderData.industry && investorData.preferredIndustries) {
      const preferredIndustries = Array.isArray(investorData.preferredIndustries) 
        ? investorData.preferredIndustries 
        : [investorData.preferredIndustries];
        
      if (preferredIndustries.some(industry => 
        industry.toLowerCase() === founderData.industry.toLowerCase() ||
        this.isRelatedIndustry(industry, founderData.industry)
      )) {
        matchCriteria.industryMatch = true;
        weightedScore += weights.industry;
      }
    }
    
    // Stage match
    if (founderData.companyStage && investorData.preferredStages) {
      const preferredStages = Array.isArray(investorData.preferredStages) 
        ? investorData.preferredStages 
        : [investorData.preferredStages];
        
      if (preferredStages.some(stage => 
        stage.toLowerCase() === founderData.companyStage.toLowerCase()
      )) {
        matchCriteria.stageMatch = true;
        weightedScore += weights.stage;
      }
    }
    
    // Market size match
    if (founderData.marketSize && investorData.minMarketSize) {
      const founderMarketSize = this.parseMarketSize(founderData.marketSize);
      const investorMinMarketSize = this.parseMarketSize(investorData.minMarketSize);
      
      if (founderMarketSize >= investorMinMarketSize) {
        matchCriteria.marketSizeMatch = true;
        weightedScore += weights.marketSize;
      }
    }
    
    // Investment range match
    if (founderData.fundingNeeded && investorData.investmentRange) {
      const fundingNeeded = this.parseInvestmentAmount(founderData.fundingNeeded);
      const investmentMin = this.parseInvestmentAmount(investorData.investmentRange.min);
      const investmentMax = this.parseInvestmentAmount(investorData.investmentRange.max);
      
      if (fundingNeeded >= investmentMin && fundingNeeded <= investmentMax) {
        matchCriteria.investmentRangeMatch = true;
        weightedScore += weights.investmentRange;
      }
    }
    
    // Location match
    if (founderData.location && investorData.preferredLocations) {
      const preferredLocations = Array.isArray(investorData.preferredLocations) 
        ? investorData.preferredLocations 
        : [investorData.preferredLocations];
        
      if (preferredLocations.includes('Any') || 
          preferredLocations.some(location => 
            location.toLowerCase() === founderData.location.toLowerCase() ||
            this.isNearbyLocation(location, founderData.location)
          )) {
        matchCriteria.locationMatch = true;
        weightedScore += weights.location;
      }
    }
    
    // Apply custom modifier based on specific factors if needed
    const finalScore = weightedScore;
    
    return { 
      score: Math.min(Math.max(finalScore, 0), 1), // Ensure score is between 0 and 1
      matchCriteria 
    };
  }
  
  private isRelatedIndustry(industry1: string, industry2: string): boolean {
    // Define related industry pairs
    const relatedIndustries: Record<string, string[]> = {
      'FinTech': ['Finance', 'Banking', 'Insurance', 'Payments'],
      'HealthTech': ['Healthcare', 'Medical', 'BioTech', 'Wellness'],
      'EdTech': ['Education', 'E-learning', 'Training'],
      'AI': ['Machine Learning', 'NLP', 'Computer Vision', 'Data Science'],
      'E-commerce': ['Retail', 'Marketplace', 'Consumer Goods'],
      'SaaS': ['Enterprise Software', 'B2B', 'Cloud Computing']
    };
    
    // Check if industries are related
    for (const [key, related] of Object.entries(relatedIndustries)) {
      const normalized1 = industry1.toLowerCase();
      const normalized2 = industry2.toLowerCase();
      
      if ((normalized1 === key.toLowerCase() && 
           related.some(r => r.toLowerCase() === normalized2)) ||
          (normalized2 === key.toLowerCase() && 
           related.some(r => r.toLowerCase() === normalized1))) {
        return true;
      }
    }
    
    return false;
  }
  
  private isNearbyLocation(location1: string, location2: string): boolean {
    // Simplified version - would need a more comprehensive solution in production
    // Example: Check if both locations are in the same region
    const regions: Record<string, string[]> = {
      'US West': ['San Francisco', 'Los Angeles', 'Seattle', 'Portland', 'San Diego', 'Las Vegas'],
      'US East': ['New York', 'Boston', 'Washington DC', 'Philadelphia', 'Miami'],
      'US Midwest': ['Chicago', 'Detroit', 'Minneapolis', 'St. Louis', 'Indianapolis'],
      'Europe': ['London', 'Paris', 'Berlin', 'Amsterdam', 'Madrid', 'Rome']
    };
    
    for (const [, cities] of Object.entries(regions)) {
      const containsLocation1 = cities.some(city => 
        location1.toLowerCase().includes(city.toLowerCase()));
      const containsLocation2 = cities.some(city => 
        location2.toLowerCase().includes(city.toLowerCase()));
        
      if (containsLocation1 && containsLocation2) {
        return true;
      }
    }
    
    return false;
  }
  
  private parseMarketSize(marketSizeStr: string): number {
    // Convert market size string like "$1B" or "500M" to a number in billions
    try {
      const numStr = marketSizeStr.replace(/[^0-9.]/g, '');
      const num = parseFloat(numStr);
      
      if (marketSizeStr.toLowerCase().includes('b')) {
        return num; // Already in billions
      } else if (marketSizeStr.toLowerCase().includes('m')) {
        return num / 1000; // Convert millions to billions
      } else if (marketSizeStr.toLowerCase().includes('t')) {
        return num * 1000; // Convert trillions to billions
      }
      
      return num;
    } catch (error) {
      return 0;
    }
  }
  
  private parseInvestmentAmount(amountStr: string): number {
    // Convert investment amount string like "$1M" or "500K" to a number in thousands
    try {
      const numStr = amountStr.replace(/[^0-9.]/g, '');
      const num = parseFloat(numStr);
      
      if (amountStr.toLowerCase().includes('m')) {
        return num * 1000; // Convert millions to thousands
      } else if (amountStr.toLowerCase().includes('k')) {
        return num; // Already in thousands
      } else if (amountStr.toLowerCase().includes('b')) {
        return num * 1000000; // Convert billions to thousands
      }
      
      return num;
    } catch (error) {
      return 0;
    }
  }
} 