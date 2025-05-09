# DealFuze Matching Algorithm - TypeScript Implementation Guide

## Overview
DealFuze is a sophisticated matching system that connects founders with investors based on multiple weighted criteria. This guide provides a detailed implementation using TypeScript/TSX with direct database connectivity.

## Important Note
This implementation uses direct database connections and does not rely on mock data or hardcoded values. All data is fetched and processed from the database in real-time.

## System Overview

### The Story of DealFuze
DealFuze is a platform that revolutionizes how founders and investors connect. Here's how it works:

1. **Founder Journey**
   - Founders create detailed profiles including:
     - Industry focus and sub-industries
     - Current funding stage
     - Market size and potential
     - Funding requirements
     - Location and target markets
     - Business model details
     - Risk tolerance and growth strategy
   - They can create multiple pipelines for different investor types
   - Each pipeline can have customized matching criteria
   - Founders receive real-time match suggestions
   - They can track match quality and investor interest

2. **Investor Journey**
   - Investors create comprehensive profiles including:
     - Preferred industries and sub-sectors
     - Investment stages they focus on
     - Minimum market size requirements
     - Investment range and criteria
     - Geographic preferences
     - Investment thesis and strategy
     - Risk tolerance and return expectations
   - They can set up multiple investment pipelines
   - Each pipeline can have different matching criteria
   - Investors receive curated founder matches
   - They can track match quality and engagement

3. **Matching Process**
   The matching algorithm works in several layers:

   a. **Initial Screening**
   - Quick filters based on basic criteria
   - Industry alignment check
   - Stage compatibility
   - Geographic proximity
   - Market size requirements

   b. **Detailed Matching**
   - Industry compatibility score (40% weight)
     - Exact industry match
     - Related industry match
     - Industry family match
   - Stage compatibility score (30% weight)
     - Exact stage match
     - Adjacent stage match
     - Stage progression potential
   - Personality and Strategy match (30% weight)
     - Risk tolerance alignment
     - Growth strategy compatibility
     - Communication style match
     - Decision-making approach

   c. **Scoring System**
   - Each criterion gets a score from 0 to 1
   - Weights are applied to each criterion
   - Final score is normalized to 0-100
   - Minimum threshold for matches (default: 50)

4. **User Interface Flow**

   a. **Founder Dashboard**
   - Overview of all pipelines
   - Match quality metrics
   - Recent matches
   - Investor interest indicators
   - Pipeline performance analytics

   b. **Investor Dashboard**
   - Active investment pipelines
   - Match quality metrics
   - Recent founder matches
   - Industry distribution
   - Stage distribution

   c. **Match Details Page**
   - Comprehensive match analysis
   - Individual criterion scores
   - Compatibility breakdown
   - Communication options
   - Match history

5. **Real-time Updates**
   - New matches appear instantly
   - Match scores update in real-time
   - Pipeline changes reflect immediately
   - Communication status updates
   - Interest indicators update

6. **Results and Analytics**

   a. **Match Quality Metrics**
   - Overall match score
   - Individual criterion scores
   - Historical match performance
   - Success rate tracking
   - Engagement metrics

   b. **Pipeline Analytics**
   - Match distribution
   - Quality trends
   - Response rates
   - Conversion metrics
   - Time to match

7. **Performance Optimization**
   - Real-time processing
   - Cached results
   - Batch processing for large datasets
   - Optimized database queries
   - Efficient data structures

8. **Security and Privacy**
   - Secure data storage
   - Encrypted communications
   - Privacy controls
   - Data access restrictions
   - Audit logging

9. **System Architecture**
   - Microservices architecture
   - Real-time processing
   - Scalable database design
   - Caching layer
   - API gateway

10. **Integration Points**
    - CRM systems
    - Communication platforms
    - Analytics tools
    - Document management
    - Payment systems

## Technical Implementation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Database Models](#database-models)
3. [Matching Algorithm Implementation](#matching-algorithm-implementation)
4. [Advanced Features](#advanced-features)
5. [Performance Optimizations](#performance-optimizations)
6. [Implementation Examples](#implementation-examples)

## System Architecture

### 1. Pipeline System
```typescript
import { Schema, model, Document } from 'mongoose';
import { MatchCriteria } from './types';

interface IPipeline extends Document {
  id: string;
  name: string;
  description: string;
  criteria: MatchCriteria;
  createdAt: Date;
  updatedAt: Date;
}

const pipelineSchema = new Schema<IPipeline>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  criteria: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Pipeline = model<IPipeline>('Pipeline', pipelineSchema);

class PipelineService {
  async createPipeline(data: Partial<IPipeline>): Promise<IPipeline> {
    const pipeline = new Pipeline(data);
    return await pipeline.save();
  }

  async updateCriteria(pipelineId: string, criteria: MatchCriteria): Promise<IPipeline> {
    return await Pipeline.findByIdAndUpdate(
      pipelineId,
      { 
        criteria,
        updatedAt: new Date()
      },
      { new: true }
    );
  }

  async validatePipeline(pipelineId: string): Promise<boolean> {
    const pipeline = await Pipeline.findById(pipelineId);
    if (!pipeline) return false;

    return (
      pipeline.criteria.validate() &&
      pipeline.name.length >= 3 &&
      pipeline.description.length >= 10
    );
  }
}
```

### 2. Match Criteria
```typescript
import { Schema, model, Document } from 'mongoose';

interface IMatchCriteria extends Document {
  weights: {
    industry: number;
    stage: number;
    personality: number;
  };
  thresholds: {
    minMatchScore: number;
    maxDistance: number;
  };
  rules: Record<string, any>;
}

const matchCriteriaSchema = new Schema<IMatchCriteria>({
  weights: {
    industry: { type: Number, required: true },
    stage: { type: Number, required: true },
    personality: { type: Number, required: true }
  },
  thresholds: {
    minMatchScore: { type: Number, required: true },
    maxDistance: { type: Number, required: true }
  },
  rules: { type: Map, of: Schema.Types.Mixed }
});

export const MatchCriteria = model<IMatchCriteria>('MatchCriteria', matchCriteriaSchema);

class MatchCriteriaService {
  async validate(criteriaId: string): Promise<boolean> {
    const criteria = await MatchCriteria.findById(criteriaId);
    if (!criteria) return false;

    const totalWeight = Object.values(criteria.weights).reduce((sum, weight) => sum + weight, 0);
    return (
      totalWeight >= 0.99 && 
      totalWeight <= 1.01 && 
      criteria.thresholds.minMatchScore >= 0 && 
      criteria.thresholds.minMatchScore <= 1
    );
  }
}
```

## Database Models

### 1. Founder Profile
```typescript
import { Schema, model, Document } from 'mongoose';

interface IFounderProfile extends Document {
  industry: string;
  fundingStage: string;
  marketSize: number;
  fundingNeeded: number;
  location: string;
  personalityTraits: string[];
  businessModel: string;
  riskTolerance: number;
  network: string[];
  createdAt: Date;
  updatedAt: Date;
}

const founderProfileSchema = new Schema<IFounderProfile>({
  industry: { type: String, required: true },
  fundingStage: { type: String, required: true },
  marketSize: { type: Number, required: true },
  fundingNeeded: { type: Number, required: true },
  location: { type: String, required: true },
  personalityTraits: [{ type: String }],
  businessModel: { type: String, required: true },
  riskTolerance: { type: Number, required: true },
  network: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const FounderProfile = model<IFounderProfile>('FounderProfile', founderProfileSchema);
```

### 2. Investor Profile
```typescript
import { Schema, model, Document } from 'mongoose';

interface IInvestorProfile extends Document {
  preferredIndustries: string[];
  preferredStages: string[];
  minMarketSize: number;
  investmentRange: {
    min: number;
    max: number;
  };
  preferredLocations: string[];
  personalityTraits: string[];
  preferredBusinessModels: string[];
  riskTolerance: number;
  network: string[];
  createdAt: Date;
  updatedAt: Date;
}

const investorProfileSchema = new Schema<IInvestorProfile>({
  preferredIndustries: [{ type: String }],
  preferredStages: [{ type: String }],
  minMarketSize: { type: Number, required: true },
  investmentRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  preferredLocations: [{ type: String }],
  personalityTraits: [{ type: String }],
  preferredBusinessModels: [{ type: String }],
  riskTolerance: { type: Number, required: true },
  network: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const InvestorProfile = model<IInvestorProfile>('InvestorProfile', investorProfileSchema);
```

## Matching Algorithm Implementation

### 1. Base Matcher Class
```typescript
import { FounderProfile, InvestorProfile } from '../models';
import { MatchCriteria } from '../models/MatchCriteria';
import { Redis } from 'ioredis';

export abstract class BaseMatcher {
  protected cache: Redis;
  
  constructor(protected criteria: MatchCriteria) {
    this.cache = new Redis(process.env.REDIS_URL);
  }

  abstract calculateMatchScore(
    founder: IFounderProfile,
    investor: IInvestorProfile
  ): Promise<number>;

  protected async preprocessData<T extends Record<string, any>>(data: T): Promise<T> {
    const processed: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        processed[key] = value.toLowerCase().trim();
      } else if (Array.isArray(value)) {
        processed[key] = value.map(v => String(v).toLowerCase().trim());
      } else {
        processed[key] = value;
      }
    }
    
    return processed as T;
  }

  protected async getCachedValue<T>(key: string): Promise<T | null> {
    const cached = await this.cache.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  protected async setCachedValue<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    await this.cache.set(key, JSON.stringify(value), 'EX', ttl);
  }
}
```

### 2. Industry Matcher
```typescript
import { BaseMatcher } from './BaseMatcher';
import { IndustryFamily } from '../models/IndustryFamily';

export class IndustryMatcher extends BaseMatcher {
  async calculateMatchScore(
    founder: IFounderProfile,
    investor: IInvestorProfile
  ): Promise<number> {
    const cacheKey = `industry_match:${founder._id}:${investor._id}`;
    const cachedScore = await this.getCachedValue<number>(cacheKey);
    if (cachedScore !== null) return cachedScore;

    const founderIndustry = founder.industry.toLowerCase();
    const investorIndustries = investor.preferredIndustries.map(i => i.toLowerCase());

    // Check for exact match
    if (investorIndustries.includes(founderIndustry)) {
      await this.setCachedValue(cacheKey, 1.0);
      return 1.0;
    }

    // Check for family match
    const founderFamily = await IndustryFamily.findOne({
      relatedIndustries: founderIndustry
    });

    const investorFamilies = await IndustryFamily.find({
      relatedIndustries: { $in: investorIndustries }
    });

    if (founderFamily && investorFamilies.some(f => f._id.equals(founderFamily._id))) {
      await this.setCachedValue(cacheKey, 0.8);
      return 0.8;
    }

    // Check for related industries
    const founderRelated = await IndustryFamily.find({
      relatedIndustries: founderIndustry
    }).distinct('relatedIndustries');

    const investorRelated = await IndustryFamily.find({
      relatedIndustries: { $in: investorIndustries }
    }).distinct('relatedIndustries');

    const commonIndustries = founderRelated.filter(industry =>
      investorRelated.includes(industry)
    );

    const score = commonIndustries.length > 0 ? 0.6 : 0.0;
    await this.setCachedValue(cacheKey, score);
    return score;
  }
}
```

### 3. Stage Matcher
```typescript
import { BaseMatcher } from './BaseMatcher';

export class StageMatcher extends BaseMatcher {
  private readonly stageHierarchy: Record<string, number> = {
    'idea': 1,
    'mvp': 2,
    'early_revenue': 3,
    'growth': 4,
    'scale': 5
  };

  async calculateMatchScore(
    founder: IFounderProfile,
    investor: IInvestorProfile
  ): Promise<number> {
    const cacheKey = `stage_match:${founder._id}:${investor._id}`;
    const cachedScore = await this.getCachedValue<number>(cacheKey);
    if (cachedScore !== null) return cachedScore;

    const founderStage = founder.fundingStage.toLowerCase();
    const investorStages = investor.preferredStages.map(s => s.toLowerCase());

    // Exact match
    if (investorStages.includes(founderStage)) {
      await this.setCachedValue(cacheKey, 1.0);
      return 1.0;
    }

    // Stage proximity
    const founderLevel = this.stageHierarchy[founderStage];
    if (!founderLevel) {
      await this.setCachedValue(cacheKey, 0.0);
      return 0.0;
    }

    const investorLevels = investorStages
      .map(s => this.stageHierarchy[s])
      .filter(l => l !== undefined);

    if (investorLevels.length === 0) {
      await this.setCachedValue(cacheKey, 0.0);
      return 0.0;
    }

    const minDiff = Math.min(...investorLevels.map(l => Math.abs(founderLevel - l)));
    const score = Math.max(0.0, 1.0 - (minDiff * 0.2));
    
    await this.setCachedValue(cacheKey, score);
    return score;
  }
}
```

## Advanced Features

### 1. Batch Processing with Database Integration
```typescript
import { FounderProfile, InvestorProfile } from '../models';
import { BaseMatcher } from './BaseMatcher';
import { MatchCriteria } from '../models/MatchCriteria';

interface MatchResult {
  founderId: string;
  investorId: string;
  score: number;
  criteriaScores: Record<string, number>;
}

export class BatchMatcher {
  private matchers: Record<string, BaseMatcher>;

  constructor(private criteria: MatchCriteria) {
    this.matchers = {
      industry: new IndustryMatcher(criteria),
      stage: new StageMatcher(criteria),
      personality: new PersonalityMatcher(criteria),
      marketSize: new MarketSizeMatcher(criteria),
      location: new LocationMatcher(criteria)
    };
  }

  async processBatch(
    pipelineId: string,
    minThreshold: number = 0.5
  ): Promise<MatchResult[]> {
    // Fetch all relevant profiles from database
    const [founders, investors] = await Promise.all([
      FounderProfile.find({ pipelineId }),
      InvestorProfile.find({ pipelineId })
    ]);

    // Create lookup tables for optimization
    const investorLookup = await this.createInvestorLookup(investors);

    // Process matches
    const matches: MatchResult[] = [];
    
    for (const founder of founders) {
      const potentialInvestors = await this.getPotentialInvestors(founder, investorLookup);
      
      for (const investor of potentialInvestors) {
        const score = await this.calculateMatchScore(founder, investor);
        
        if (score >= minThreshold) {
          matches.push({
            founderId: founder._id.toString(),
            investorId: investor._id.toString(),
            score,
            criteriaScores: await this.getCriteriaScores(founder, investor)
          });
        }
      }
    }

    // Sort matches by score
    return matches.sort((a, b) => b.score - a.score);
  }

  private async createInvestorLookup(
    investors: IInvestorProfile[]
  ): Promise<Record<string, IInvestorProfile[]>> {
    const lookup: Record<string, IInvestorProfile[]> = {};

    for (const investor of investors) {
      // Index by industry
      for (const industry of investor.preferredIndustries) {
        if (!lookup[industry]) lookup[industry] = [];
        lookup[industry].push(investor);
      }

      // Index by stage
      for (const stage of investor.preferredStages) {
        if (!lookup[stage]) lookup[stage] = [];
        lookup[stage].push(investor);
      }
    }

    return lookup;
  }

  private async getPotentialInvestors(
    founder: IFounderProfile,
    investorLookup: Record<string, IInvestorProfile[]>
  ): Promise<IInvestorProfile[]> {
    const potentialInvestors = new Set<IInvestorProfile>();

    // Get investors matching industry
    if (investorLookup[founder.industry]) {
      investorLookup[founder.industry].forEach(investor => 
        potentialInvestors.add(investor)
      );
    }

    // Get investors matching stage
    if (investorLookup[founder.fundingStage]) {
      investorLookup[founder.fundingStage].forEach(investor => 
        potentialInvestors.add(investor)
      );
    }

    return Array.from(potentialInvestors);
  }

  private async calculateMatchScore(
    founder: IFounderProfile,
    investor: IInvestorProfile
  ): Promise<number> {
    let totalScore = 0;
    let totalWeight = 0;

    for (const [matcherName, matcher] of Object.entries(this.matchers)) {
      const weight = this.criteria.weights[matcherName] || 0;
      if (weight > 0) {
        const score = await matcher.calculateMatchScore(founder, investor);
        totalScore += score * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  private async getCriteriaScores(
    founder: IFounderProfile,
    investor: IInvestorProfile
  ): Promise<Record<string, number>> {
    const scores: Record<string, number> = {};

    for (const [matcherName, matcher] of Object.entries(this.matchers)) {
      scores[matcherName] = await matcher.calculateMatchScore(founder, investor);
    }

    return scores;
  }
}
```

## API Implementation

### 1. Express/TSX API Routes
```typescript
import { Router } from 'express';
import { BatchMatcher } from '../services/BatchMatcher';
import { MatchCriteria } from '../models/MatchCriteria';
import { Pipeline } from '../models/Pipeline';

const router = Router();

router.post('/api/matches/calculate', async (req, res) => {
  try {
    const { pipelineId, minThreshold = 0.5 } = req.body;

    // Fetch pipeline and criteria from database
    const pipeline = await Pipeline.findById(pipelineId);
    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    // Initialize matcher with pipeline criteria
    const matcher = new BatchMatcher(pipeline.criteria);

    // Process matches
    const startTime = Date.now();
    const matches = await matcher.processBatch(pipelineId, minThreshold);
    const processingTime = Date.now() - startTime;

    res.json({
      matches,
      totalMatches: matches.length,
      processingTime
    });
  } catch (error) {
    console.error('Error calculating matches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

### 2. Database Connection
```typescript
import mongoose from 'mongoose';
import { Redis } from 'ioredis';

export async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    const redis = new Redis(process.env.REDIS_URL);
    redis.on('connect', () => console.log('Connected to Redis'));
    redis.on('error', (err) => console.error('Redis error:', err));

    return { mongoose, redis };
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}
```

## Notes
- All data is fetched directly from the database
- No mock data or hardcoded values are used
- Caching is implemented for performance optimization
- Database indexes should be created for frequently queried fields
- Regular database maintenance and optimization is recommended
- Monitor database performance and adjust indexes as needed
- Implement proper error handling and logging
- Consider implementing database sharding for large datasets
- Regular backups of the database are essential
- Implement proper security measures for database access 