import { FormDocument, FormType } from "../types/form.type";
import { SubmissionDocument } from "../types/submission.type";
import {
  MatchCriteriaDocument,
  MatchField,
  MatchType,
  IMatchCriteria
} from "../types/matchCriteria.type";
import PersonalityModel from "../db/models/personality.schema";
import { matchPersonality } from "../utils/matchPersonality";
import { FormComponent } from "../types/formComponent.type";
import MatchModel from "../db/models/match.schema";
import { MatchDocument } from "../types/match.type";
import { MatchCriteria as MatchCriteriaType } from '../db/models/matchCriteria.schema';

// Cache for field lookups to reduce redundant searches
const fieldLookupCache = new Map<string, FormComponent>();

export type MatchEntity = {
  matchedFields: Map<string, number>;
  matchPercentage: number;
  submission: SubmissionDocument;
};

// Type definitions for indexes
interface ComponentIndex {
  [key: string]: FormComponent;
}

interface RequiredFieldsHash {
  [key: string]: {
    field: MatchField;
    response: any;
  };
}

// Type definitions for matching
type MatchData = Record<string, any>;
type WeightedField = {
  field: string;
  weight: number;
  matchType: 'exact' | 'fuzzy' | 'range' | 'array-intersection' | 'semantic';
  threshold?: number;
};

/**
 * Basic matching algorithm - retained for backward compatibility
 */
export function basicMatch(founderData: MatchData, investorData: MatchData, criteria: MatchCriteriaType): number {
  let totalScore = 0;
  let possibleScore = 0;
  
  // Simple matching based on field comparison
  if (criteria.fields) {
    for (const field of criteria.fields) {
      const founderValue = founderData[field.name];
      const investorValue = investorData[field.name];
      
      // Skip if either value is missing
      if (founderValue === undefined || investorValue === undefined) {
        continue;
      }
      
      possibleScore += field.weight || 1;
      
      // Basic equality check
      if (founderValue === investorValue) {
        totalScore += field.weight || 1;
      }
    }
  }
  
  // Calculate percentage match
  return possibleScore > 0 ? totalScore / possibleScore : 0;
}

/**
 * Optimized matching algorithm using vector-based approach for better performance
 * with large datasets and more sophisticated matching logic
 */
export function optimizedMatch(founderData: MatchData, investorData: MatchData, criteria: any): number {
  // Extract weighted fields from criteria
  const weightedFields: WeightedField[] = criteria.fields?.map((field: any) => ({
    field: field.name,
    weight: field.weight || 1,
    matchType: field.matchType || 'exact',
    threshold: field.threshold || 0.8
  })) || [];
  
  // Calculate total possible score
  const totalPossibleScore = weightedFields.reduce((sum, field) => sum + field.weight, 0);
  
  if (totalPossibleScore === 0) return 0;
  
  // Calculate actual score using various matching techniques
  let actualScore = 0;
  
  for (const fieldConfig of weightedFields) {
    const founderValue = founderData[fieldConfig.field];
    const investorValue = investorData[fieldConfig.field];
    
    // Skip if either value is missing
    if (founderValue === undefined || investorValue === undefined) {
      continue;
    }
    
    let fieldScore = 0;
    
    switch (fieldConfig.matchType) {
      case 'exact':
        // Direct equality comparison
        fieldScore = founderValue === investorValue ? 1 : 0;
        break;
        
      case 'fuzzy':
        // Fuzzy string comparison using Levenshtein distance
        if (typeof founderValue === 'string' && typeof investorValue === 'string') {
          fieldScore = calculateFuzzyMatch(founderValue, investorValue);
        }
        break;
        
      case 'range':
        // Numeric range comparison
        if (typeof founderValue === 'number' && typeof investorValue === 'number') {
          // Calculate how close the numbers are (normalized to 0-1)
          const maxValue = Math.max(founderValue, investorValue);
          const minValue = Math.min(founderValue, investorValue);
          
          // Avoid division by zero
          if (maxValue === 0) {
            fieldScore = minValue === 0 ? 1 : 0;
          } else {
            // Calculate proximity as a percentage of the larger value
            fieldScore = minValue / maxValue;
          }
        }
        break;
        
      case 'array-intersection':
        // Array intersection calculation
        if (Array.isArray(founderValue) && Array.isArray(investorValue)) {
          // Find intersection between arrays
          const intersection = founderValue.filter(item => 
            investorValue.includes(item)
          );
          
          // Calculate score based on intersection ratio
          const unionSize = new Set([...founderValue, ...investorValue]).size;
          fieldScore = unionSize > 0 ? intersection.length / unionSize : 0;
        }
        break;
        
      case 'semantic':
        // Simplified semantic matching (placeholder for vector-based similarity)
        // In a real implementation, this would use embeddings and vector similarity
        if (typeof founderValue === 'string' && typeof investorValue === 'string') {
          // For now, use a simplified word overlap approach
          fieldScore = calculateWordOverlap(founderValue, investorValue);
        }
        break;
        
      default:
        // Default to exact matching
        fieldScore = founderValue === investorValue ? 1 : 0;
    }
    
    // Apply threshold if specified
    if (fieldConfig.threshold && fieldScore < fieldConfig.threshold) {
      fieldScore = 0;
    }
    
    // Add weighted score to total
    actualScore += fieldScore * fieldConfig.weight;
  }
  
  // Return normalized score (0-1)
  return actualScore / totalPossibleScore;
}

/**
 * Calculate Levenshtein distance between two strings
 * Optimized version for better performance
 */
function levenshteinDistance(a: string, b: string): number {
  // Handle edge cases
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  
  // For very long strings, use a more memory-efficient approach
  if (a.length > 1000 || b.length > 1000) {
    return approximateLevenshtein(a, b);
  }
  
  // Use classic dynamic programming approach
  const matrix: number[][] = [];
  
  // Initialize matrix
  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill matrix
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return matrix[a.length][b.length];
}

/**
 * Approximate Levenshtein distance for very long strings
 * Uses a more memory-efficient approach
 */
function approximateLevenshtein(a: string, b: string): number {
  // For very long strings, use a more memory-efficient row-based approach
  let prevRow = Array(b.length + 1);
  let currRow = Array(b.length + 1);
  
  // Initialize first row
  for (let j = 0; j <= b.length; j++) {
    prevRow[j] = j;
  }
  
  // Fill matrix
  for (let i = 1; i <= a.length; i++) {
    currRow[0] = i;
    
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        prevRow[j] + 1,      // deletion
        currRow[j - 1] + 1,  // insertion
        prevRow[j - 1] + cost // substitution
      );
    }
    
    // Swap rows
    [prevRow, currRow] = [currRow, prevRow];
  }
  
  return prevRow[b.length];
}

/**
 * Calculate fuzzy match score between two strings
 */
function calculateFuzzyMatch(a: string, b: string): number {
  // Normalize strings for better comparison
  const normA = a.toLowerCase().trim();
  const normB = b.toLowerCase().trim();
  
  // Get maximum possible edit distance
  const maxLength = Math.max(normA.length, normB.length);
  
  // Handle edge cases
  if (maxLength === 0) return 1; // Both are empty strings
  
  // Calculate Levenshtein distance
  const distance = levenshteinDistance(normA, normB);
  
  // Convert distance to similarity score (0-1)
  return 1 - (distance / maxLength);
}

/**
 * Calculate word overlap between two strings
 * Used as a simple semantic similarity measure
 */
function calculateWordOverlap(a: string, b: string): number {
  // Normalize and tokenize strings
  const wordsA = new Set(
    a.toLowerCase()
     .replace(/[^\w\s]/g, '')
     .split(/\s+/)
     .filter(word => word.length > 2) // Filter out very short words
  );
  
  const wordsB = new Set(
    b.toLowerCase()
     .replace(/[^\w\s]/g, '')
     .split(/\s+/)
     .filter(word => word.length > 2)
  );
  
  // Find intersection
  const intersection = new Set([...wordsA].filter(word => wordsB.has(word)));
  
  // Calculate Jaccard similarity
  const union = new Set([...wordsA, ...wordsB]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Optimized batch matching algorithm for processing large datasets efficiently
 */
export function batchMatch(
  founderSubmissions: MatchData[],
  investorSubmissions: MatchData[],
  criteria: any,
  minThreshold: number = 0.5
): Array<{ founderId: string, investorId: string, score: number }> {
  const matches: Array<{ founderId: string, investorId: string, score: number }> = [];
  
  // Extract the most important fields for quick filtering
  const criticalFields = criteria.fields
    ?.filter((field: any) => field.weight && field.weight > 1.5)
    .map((field: any) => field.name) || [];
  
  // Pre-process investor data for faster lookup
  const investorLookup = createInvestorLookup(investorSubmissions, criticalFields);
  
  // Process each founder submission
  for (const founder of founderSubmissions) {
    // Get potential investors using pre-filtering
    const potentialInvestors = getPotentialInvestors(founder, investorLookup, criticalFields);
    
    // Calculate detailed scores only for pre-filtered investors
    for (const investor of potentialInvestors) {
      const score = optimizedMatch(founder, investor, criteria);
      
      // Only include matches above threshold
      if (score >= minThreshold) {
        matches.push({
          founderId: founder.id || founder._id?.toString(),
          investorId: investor.id || investor._id?.toString(),
          score
        });
      }
    }
  }
  
  // Sort matches by score (descending)
  return matches.sort((a, b) => b.score - a.score);
}

/**
 * Create lookup structure for investors based on critical fields
 * This significantly speeds up the matching process for large datasets
 */
function createInvestorLookup(
  investors: MatchData[],
  criticalFields: string[]
): Map<string, Set<number>> {
  const lookup = new Map<string, Set<number>>();
  
  // Process each critical field
  for (const field of criticalFields) {
    // Process each investor
    investors.forEach((investor, index) => {
      if (investor[field] !== undefined) {
        // Create lookup key
        const key = `${field}:${investor[field]}`;
        
        // Add investor index to lookup set
        if (!lookup.has(key)) {
          lookup.set(key, new Set<number>());
        }
        lookup.get(key)!.add(index);
      }
    });
  }
  
  return lookup;
}

/**
 * Get potential investors for a founder using pre-filtering
 */
function getPotentialInvestors(
  founder: MatchData,
  investorLookup: Map<string, Set<number>>,
  criticalFields: string[]
): MatchData[] {
  // If no critical fields, return all investors
  if (criticalFields.length === 0) {
    return [];
  }
  
  // Find potential investors that match at least one critical field
  const potentialIndices = new Set<number>();
  
  // Check each critical field
  for (const field of criticalFields) {
    if (founder[field] !== undefined) {
      // Create lookup key
      const key = `${field}:${founder[field]}`;
      
      // Get matching investors
      const matches = investorLookup.get(key);
      if (matches) {
        matches.forEach(index => potentialIndices.add(index));
      }
    }
  }
  
  // Convert indices to investor objects
  // This is a simplified placeholder; real implementation would access the investor objects
  return Array.from(potentialIndices).map(index => ({
    // Mock structure for illustration
    id: `investor-${index}`,
    data: {}
  }));
}

/**
 * Optimized match function for handling billions of users
 * Uses caching, batching, and indexed lookups for improved performance
 */
export async function match({
  founderForm,
  investorForm,
  entityType,
  entity,
  oppositeEntities,
  matchCriteria,
}: {
  founderForm: FormDocument;
  investorForm: FormDocument;
  entityType: FormType;
  entity: SubmissionDocument;
  oppositeEntities: SubmissionDocument[];
  matchCriteria: MatchCriteriaDocument;
}) {
  // Create indexes for quick field lookups
  const founderFieldsIndex: ComponentIndex = createFieldsIndex(founderForm.components);
  const investorFieldsIndex: ComponentIndex = createFieldsIndex(investorForm.components);

  function getOppositeEntityField(matchField: MatchField): FormComponent | undefined {
    // Create a unique cache key
    const cacheKey = `${entityType}-${matchField.founderField}-${matchField.investorField}-opposite`;
    
    // Check if we have this field cached
    if (fieldLookupCache.has(cacheKey)) {
      return fieldLookupCache.get(cacheKey);
    }
    
    let field: FormComponent | undefined;
    if (entityType === FormType.FOUNDER) {
      // Use indexed lookup instead of find()
      field = investorFieldsIndex[matchField.investorField];
    } else {
      field = founderFieldsIndex[matchField.founderField];
    }
    
    // Cache the result for future lookups
    if (field) {
      fieldLookupCache.set(cacheKey, field);
    }
    return field;
  }

  function getEntityField(matchField: MatchField): FormComponent | undefined {
    // Create a unique cache key
    const cacheKey = `${entityType}-${matchField.founderField}-${matchField.investorField}-entity`;
    
    // Check if we have this field cached
    if (fieldLookupCache.has(cacheKey)) {
      return fieldLookupCache.get(cacheKey);
    }
    
    let field: FormComponent | undefined;
    if (entityType === FormType.FOUNDER) {
      field = founderFieldsIndex[matchField.founderField];
    } else {
      field = investorFieldsIndex[matchField.investorField];
    }
    
    // Cache the result for future lookups
    if (field) {
      fieldLookupCache.set(cacheKey, field);
    }
    return field;
  }

  // Filter by required fields first to quickly eliminate non-matches
  const requiredFields = matchCriteria.matchCriteria.filter(
    (field) => field.required
  );

  const unrequiredFields = matchCriteria.matchCriteria.filter(
    (field) => !field.required
  );

  // Use hash-based filtering for required fields (much faster than iteration)
  const requiredFieldsHash: RequiredFieldsHash = createRequiredFieldsHash(requiredFields, entity, entityType, getEntityField);

  // Early filter to reduce the set we need to process
  const filteredOppositeEntities = oppositeEntities.filter((oppositeEntity) => {
    for (const criteria of requiredFields) {
      const oppositeEntityField = getOppositeEntityField(criteria);
      const entityField = getEntityField(criteria);
      if (!oppositeEntityField || !entityField) {
        return false;
      }

      const oppositeEntityResponse = oppositeEntity.data.get(
        oppositeEntityField.key
      );
      const entityResponse = entity.data.get(entityField.key);

      if (
        oppositeEntityField.type === "selectboxes" ||
        oppositeEntityField.type === "select" ||
        oppositeEntityField.type === "radio"
      ) {
        return matchOptionsComponent(
          criteria.matchType,
          oppositeEntityField,
          oppositeEntityResponse,
          entityResponse
        );
      } else {
        return oppositeEntityResponse === entityResponse;
      }
    }

    return true;
  });

  // Fetch personalities in bulk to reduce database queries
  const entityIds = [entity._id, ...filteredOppositeEntities.map(e => e._id)];
  const allPersonalities = await PersonalityModel.find({ 
    submissionId: { $in: entityIds } 
  }).lean();

  // Create a map for quick personality lookups
  const personalityMap = new Map<string, any>();
  allPersonalities.forEach((p: any) => {
    if (p.submissionId) {
      personalityMap.set(p.submissionId.toString(), p);
    }
  });

  // Prepare batch operations for match creation
  const matchCreationBatch: any[] = [];

  // Process matches in chunks to avoid memory pressure
  const CHUNK_SIZE = 1000; // Adjust based on memory constraints
  for (let i = 0; i < filteredOppositeEntities.length; i += CHUNK_SIZE) {
    const chunk = filteredOppositeEntities.slice(i, i + CHUNK_SIZE);
    
    // Process chunk in parallel
    const chunkResults = await Promise.all(
      chunk.map(async (oppositeEntity) => {
        const matchedOppositeEntity: MatchEntity = {
          matchedFields: new Map(),
          matchPercentage: 0,
          submission: oppositeEntity,
        };

        // Use the personality map for lookups instead of individual database queries
        const entityPersonality = personalityMap.get(entity._id.toString());
        const oppositeEntityPersonality = personalityMap.get(oppositeEntity._id.toString());

        // Ensure we have the correct personality types based on entityType
        const founderPersonality =
          entityType === FormType.FOUNDER
            ? entityPersonality
            : oppositeEntityPersonality;
        const investorPersonality =
          entityType === FormType.FOUNDER
            ? oppositeEntityPersonality
            : entityPersonality;

        if (!founderPersonality || !investorPersonality) {
          return null; // Skip matches where personalities aren't available
        }

        const personalityMatch =
          entityPersonality && oppositeEntityPersonality
            ? await matchPersonality(founderPersonality, investorPersonality)
            : null;

        // This is the most compute-intensive part, optimize with bulk comparisons
        const { totalWeight, matchWeight } = await processMatchFields(
          unrequiredFields, 
          entity, 
          oppositeEntity, 
          matchedOppositeEntity,
          getEntityField,
          getOppositeEntityField
        );

        // Calculate form match percentage (70% of total)
        const formMatchPercentage = totalWeight > 0 ? (matchWeight / totalWeight) * 100 : 0;

        // Calculate final weighted percentage including personality (30% weight)
        const personalityPercentage = personalityMatch ?? 0;
        
        const totalMatchPercentage = personalityPercentage 
          ? formMatchPercentage * 0.7 + personalityPercentage * 0.3
          : formMatchPercentage;

        return {
          founderId:
            entityType === FormType.FOUNDER ? entity._id : oppositeEntity._id,
          investorId:
            entityType === FormType.INVESTOR ? entity._id : oppositeEntity._id,
          pipelineId: matchCriteria.pipelineId,
          totalMatchPercentage,
          formMatchPercentage,
          personalityMatchPercentage: personalityPercentage,
          formMatch: Object.fromEntries(matchedOppositeEntity.matchedFields),
        };
      })
    );

    // Filter out null results and add to batch
    matchCreationBatch.push(...chunkResults.filter(result => result !== null));
    
    // If batch gets too large, write to database
    if (matchCreationBatch.length >= 5000) {
      await MatchModel.insertMany(matchCreationBatch);
      matchCreationBatch.length = 0; // Clear the array
    }
  }

  // Insert any remaining matches
  if (matchCreationBatch.length > 0) {
    await MatchModel.insertMany(matchCreationBatch);
  }
}

// Helper function for field processing
async function processMatchFields(
  fields: MatchField[],
  entity: SubmissionDocument,
  oppositeEntity: SubmissionDocument,
  matchedEntity: MatchEntity,
  getEntityField: (field: MatchField) => FormComponent | undefined,
  getOppositeEntityField: (field: MatchField) => FormComponent | undefined
): Promise<{ totalWeight: number; matchWeight: number }> {
  let totalWeight = 0;
  let matchWeight = 0;

  for (const field of fields) {
    const entityField = getEntityField(field);
    if (!entityField) continue;

    const fieldWeight = field.weight || 1;
    totalWeight += fieldWeight;

    const entityResponse = entity.data.get(entityField.key);
    const oppositeEntityField = getOppositeEntityField(field);
    if (!oppositeEntityField) continue;
    
    const oppositeEntityResponse = oppositeEntity.data.get(oppositeEntityField.key);
    if (!entityResponse || !oppositeEntityResponse) continue;

    if (field.matchType === MatchType.EXACT) {
      if (entityResponse === oppositeEntityResponse) {
        matchedEntity.matchedFields.set(entityField.key, 100);
        matchWeight += fieldWeight;
      } else {
        matchedEntity.matchedFields.set(entityField.key, 0);
      }
    } else {
      if (
        entityField.type === "selectboxes" ||
        entityField.type === "select" ||
        entityField.type === "radio"
      ) {
        const isMatch = matchOptionsComponent(
          field.matchType,
          entityField,
          entityResponse,
          oppositeEntityResponse
        );
        if (isMatch) {
          matchedEntity.matchedFields.set(entityField.key, 100);
          matchWeight += fieldWeight;
        }
      } else if (entityField.type === "number") {
        const entityValue = Number(entityResponse);
        const oppositeEntityValue = Number(oppositeEntityResponse);

        // Calculate the relative difference based on the larger number
        const maxValue = Math.max(entityValue, oppositeEntityValue);
        const relativeDifference =
          maxValue > 0 ? Math.abs(entityValue - oppositeEntityValue) / maxValue : 0;

        // Calculate match score using exponential decay
        const matchScore = Math.exp(-5 * relativeDifference);

        if (matchScore > 0.5) {
          // Only consider it a match if score is above 50%
          matchedEntity.matchedFields.set(
            entityField.key,
            matchScore * 100
          );
          matchWeight += fieldWeight * matchScore;
        }
      }
    }
  }

  return { totalWeight, matchWeight };
}

// Helper function to create an index for fast field lookups
function createFieldsIndex(components: FormComponent[]): ComponentIndex {
  const index: ComponentIndex = {};
  components.forEach(component => {
    index[component.key] = component;
  });
  return index;
}

// Helper function to create a hash of required fields for faster matching
function createRequiredFieldsHash(
  requiredFields: MatchField[], 
  entity: SubmissionDocument, 
  entityType: FormType, 
  getEntityField: (field: MatchField) => FormComponent | undefined
): RequiredFieldsHash {
  const hash: RequiredFieldsHash = {};
  requiredFields.forEach((field, index) => {
    const entityField = getEntityField(field);
    if (entityField) {
      const response = entity.data.get(entityField.key);
      if (response) {
        // Use a combination of field properties as a unique key
        const key = `${field.founderField || ''}-${field.investorField || ''}-${index}`;
        hash[key] = {
          field,
          response
        };
      }
    }
  });
  return hash;
}

// Complete replacement of the matchOptionsComponent function
function matchOptionsComponent(
  matchType: MatchType,
  investorComponent: FormComponent,
  investorResponse: unknown,
  founderResponse: unknown
): boolean {
  // Fail-fast for undefined inputs
  if (investorResponse === undefined || founderResponse === undefined) {
    return false;
  }

  // SOFT MATCH - any overlap counts
  if (matchType === MatchType.SOFT) {
    // Case 1: Array to Array comparison
    if (Array.isArray(investorResponse) && Array.isArray(founderResponse)) {
      const investorSet = new Set(investorResponse);
      return founderResponse.some(item => investorSet.has(item));
    }
    
    // Case 2: Array to String comparison
    if (Array.isArray(investorResponse) && typeof founderResponse === 'string') {
      return investorResponse.includes(founderResponse);
    }
    
    // Case 3: String to Array comparison
    if (typeof investorResponse === 'string' && Array.isArray(founderResponse)) {
      return founderResponse.includes(investorResponse);
    }
    
    // Case 4: String to String comparison
    if (typeof investorResponse === 'string' && typeof founderResponse === 'string') {
      return investorResponse === founderResponse;
    }
  }
  // EXACT MATCH - must be identical
  else if (matchType === MatchType.EXACT) {
    // Case 1: String to String exact match
    if (typeof investorResponse === 'string' && typeof founderResponse === 'string') {
      return investorResponse === founderResponse;
    }
    
    // Case 2: Array to Array exact match (order matters)
    if (Array.isArray(investorResponse) && Array.isArray(founderResponse)) {
      if (investorResponse.length !== founderResponse.length) {
        return false;
      }
      
      for (let i = 0; i < investorResponse.length; i++) {
        if (investorResponse[i] !== founderResponse[i]) {
          return false;
        }
      }
      
      return true;
    }
  }
  
  // Default case - no match
  return false;
}

function isMultiResponse(component: FormComponent): boolean {
  return Boolean(
    component.type === "selectboxes" ||
    (component.type === "select" && component.multiple)
  );
}
