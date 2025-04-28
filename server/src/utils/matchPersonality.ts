import { FormType } from "../types/form.type";
import {
  bestFounderMatches,
  worstFounderMatches,
  PersonalityDocument,
} from "../types/personality.type";

export async function matchPersonality(
  founderPersonality: PersonalityDocument,
  investorPersonality: PersonalityDocument
): Promise<number> {
  if (!founderPersonality || !investorPersonality) {
    throw new Error("Personality not found for one or both submissions");
  }

  // Verify correct types
  if (
    founderPersonality.formType !== FormType.FOUNDER ||
    investorPersonality.formType !== FormType.INVESTOR
  ) {
    throw new Error("Invalid submission types for matching");
  }

  const score = calculatePersonalityScore(
    founderPersonality,
    investorPersonality
  );

  return score;
}

function calculatePersonalityScore(
  personality1: PersonalityDocument,
  personality2: PersonalityDocument
): number {
  let score = 0;
  const maxScore = 100;

  // Type match score (35% of total)
  const typeMatchScore = calculateTypeMatchScore(personality1, personality2);
  score += typeMatchScore * 0.35;

  // Industry focus overlap (30% of total)
  const industryOverlap = personality1.industryFocus.filter((industry) =>
    personality2.industryFocus.includes(industry)
  ).length;
  const industryScore =
    (industryOverlap /
      Math.max(
        personality1.industryFocus.length,
        personality2.industryFocus.length
      )) *
    100;
  score += industryScore * 0.3;

  // Risk tolerance compatibility (20% of total)
  const riskDifference = Math.abs(
    personality1.riskTolerance - personality2.riskTolerance
  );
  // Each level difference reduces score by 25 points (100/4 levels)
  // Additional 50% penalty for any mismatch to emphasize risk alignment
  const riskScore =
    riskDifference === 0 ? 100 : (100 - riskDifference * 25) * 0.5;
  score += Math.max(0, riskScore) * 0.2;

  // Interest overlap (10% of total)
  const interestOverlap = personality1.interests.filter((interest) =>
    personality2.interests.includes(interest)
  ).length;

  const interestScore =
    (interestOverlap /
      Math.max(personality1.interests.length, personality2.interests.length)) *
    100;
  score += interestScore * 0.1;

  // Network size compatibility (5% of total)
  const networkScore = calculateNetworkScore(personality1, personality2);
  score += networkScore * 0.05;

  // Location and education bonus (up to 10%)
  const locationScore = calculateLocationScore(personality1, personality2);
  const educationScore = calculateEducationScore(personality1, personality2);
  score += Math.min((locationScore + educationScore) * 0.1, 10); // Cap total bonus at 10 points

  return Math.min(maxScore, Math.max(0, score));
}

function calculateNetworkScore(
  personality1: PersonalityDocument,
  personality2: PersonalityDocument
): number {
  // Define network size categories
  const getNetworkCategory = (size: number): number => {
    if (size < 100) return 1;
    if (size < 300) return 2;
    if (size < 500) return 3;
    return 4;
  };

  // Define follower count categories
  const getFollowerCategory = (count: number): number => {
    if (count < 1000) return 1;
    if (count < 5000) return 2;
    if (count < 10000) return 3;
    return 4;
  };

  const networkDiff = Math.abs(
    getNetworkCategory(personality1.networkSize) -
      getNetworkCategory(personality2.networkSize)
  );
  const followerDiff = Math.abs(
    getFollowerCategory(personality1.followerCount) -
      getFollowerCategory(personality2.followerCount)
  );

  // Average of both differences, converted to a score
  const avgDiff = (networkDiff + followerDiff) / 2;
  return Math.max(0, 100 - avgDiff * 2); // Each category difference reduces score by 2 points
}

function calculateLocationScore(
  personality1: PersonalityDocument,
  personality2: PersonalityDocument
): number {
  const languageOverlap = personality1.languages.filter((lang) =>
    personality2.languages.includes(lang)
  ).length;
  const countryOverlap = personality1.countries.filter((country) =>
    personality2.countries.includes(country)
  ).length;

  if (languageOverlap === 0 && countryOverlap === 0) return 0;

  return (
    (languageOverlap / Math.max(personality1.languages.length, 1)) * 50 +
    (countryOverlap / Math.max(personality1.countries.length, 1)) * 50
  );
}

function calculateEducationScore(
  personality1: PersonalityDocument,
  personality2: PersonalityDocument
): number {
  const universityOverlap = personality1.educationInstitutions.filter((uni) =>
    personality2.educationInstitutions.includes(uni)
  ).length;

  if (universityOverlap === 0) return 0;

  // If there's at least one match, give a score based on the proportion of matches
  return (
    (universityOverlap /
      Math.max(personality1.educationInstitutions.length, 1)) *
    100
  );
}

function calculateTypeMatchScore(
  personality1: PersonalityDocument,
  personality2: PersonalityDocument
): number {
  // Determine which is founder and which is investor
  const [founder, investor] =
    personality1.formType === FormType.FOUNDER
      ? [personality1, personality2]
      : [personality2, personality1];

  if (!founder.founderType || !investor.investorType) {
    return 50; // Neutral score if types are missing
  }

  // Check best matches
  if (bestFounderMatches[founder.founderType].includes(investor.investorType)) {
    return 100;
  }

  // Check worst matches
  if (
    worstFounderMatches[founder.founderType].includes(investor.investorType)
  ) {
    return 0;
  }

  // Neutral match
  return 50;
}
