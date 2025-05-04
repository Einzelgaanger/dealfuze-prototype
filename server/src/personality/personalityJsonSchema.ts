import { z } from 'zod';
import {
  Industries,
  Interests,
  EXPERIENCE_LEVEL,
  FounderType,
  InvestorType,
  RiskTolerance,
} from '../types/enums.js';
import { IPersonality } from '../types/personality.type';

export const basePersonalityFields = {
  industryFocus: z.array(z.nativeEnum(Industries)).min(1),
  corporateExperience: z.nativeEnum(EXPERIENCE_LEVEL),
  riskTolerance: z.nativeEnum(RiskTolerance),
  languages: z.array(z.string()).min(1),
  countries: z.array(z.string()).min(1),
  interests: z.array(z.nativeEnum(Interests)).min(1),
  educationInstitutions: z.array(z.string()),
  summary: z.string()
};

export const founderPersonalitySchema = z.object({
  ...basePersonalityFields,
  founderType: z.nativeEnum(FounderType),
}).strict();

export const investorPersonalitySchema = z.object({
  ...basePersonalityFields,
  investorType: z.nativeEnum(InvestorType),
}).strict();

export type FounderPersonality = z.infer<typeof founderPersonalitySchema>;
export type InvestorPersonality = z.infer<typeof investorPersonalitySchema>;
