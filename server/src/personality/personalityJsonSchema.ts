import { z } from "zod";
import {
  IPersonality,
  Industries,
  EXPERIENCE_LEVEL,
  Interests,
  FounderType,
  RiskTolerance,
  InvestorType,
} from "../types/personality.type";

export const founderPersonalitySchema: z.ZodType<
  Omit<
    IPersonality,
    "submissionId" | "formId" | "formType" | "networkSize" | "followerCount"
  >
> = z.object({
  industryFocus: z.array(z.nativeEnum(Industries), {
    description:
      "The industries the person are interested and focused in, maximum 4 industries with strong evidence and recurring themes in their profile,and must be a value from the following list: " +
      Object.values(Industries).join(", "),
  }),
  corporateExperience: z.nativeEnum(EXPERIENCE_LEVEL, {
    description:
      "The level of corporate experience (EXCLUDES STARTUPS, MUST BE CORPORATE) exclusively based on their concrete work experience the profile has, must be a value from the following list: " +
      "0 - 2 year experience: 1, 2 - 3 years experience: 2, 3 - 5 years experience: 3, 5+ years experience: 4",
  }),
  languages: z.array(z.string(), {
    description:
      "The ISO 639-1 language codes of the languages the person has listed on their LinkedIn profile, or has used in their profile.",
  }),
  countries: z.array(z.string(), {
    description:
      "The ISO 3166-1 alpha-2 country codes of the countries the person has visited, lived in or mentioned on their LinkedIn profile.",
  }),
  interests: z.array(z.nativeEnum(Interests), {
    description:
      "The interests of the person, with strong evidence and recurring themes in their profile, maximum 4 interests, must be a value from the following list: " +
      Object.values(Interests).join(", "),
  }),
  founderType: z.nativeEnum(FounderType, {
    description:
      "The type of founder the person is, choose the best match with the most evidence. Must be a value from the following list: " +
      "visionary: Big-picture thinker, ambitious, charismatic. Will typically be involved in large potential or ambitious ideas. Excited about new technologies. " +
      "calculated: Data-driven, meticulous, process-oriented. Will typically have technical projects or work experience " +
      "networker: Networker, social butterfly, loves meeting new people. Will typically go to a lot of events, meetups and post frequently " +
      "risk-taker: Serial entrepreneur, thrives on uncertainty. Will typically have a startup background " +
      "operator: Execution-focused, hands-on, product-driven. Will typically have experience working or leading teams and projects",
  }),
  riskTolerance: z.nativeEnum(RiskTolerance, {
    description:
      "The risk tolerance of the person, based on factors such as: 1) does the person take risks in business or typically stay in one role for a long time 2) Does the person shift countries or cities much 3) Does the person invest in risky ventures. Note that this is relative to a baseline of an entrepreneur which already has high risk tolerance. must be a value from the following list: " +
      Object.values(RiskTolerance).join(", "),
  }),
  educationInstitutions: z.array(z.string(), {
    description:
      "The Universities the person has studied at. Ensure that it is the standard name of the university, e.g University of Cambridge, not Cambridge University, however for universities with a different naming standard (e.g Harvard University), use the standard name.",
  }),
  summary: z.string({
    description:
      "A summary of the person's personality, experience and background, maximum 100 words",
  }),
});

export const investorPersonalitySchema: z.ZodType<
  Omit<
    IPersonality,
    "submissionId" | "formId" | "formType" | "networkSize" | "followerCount"
  >
> = z.object({
  industryFocus: z.array(z.nativeEnum(Industries), {
    description:
      "The industries the person are interested and focused in, must be a value from the following list: " +
      Object.values(Industries).join(", "),
  }),
  corporateExperience: z.nativeEnum(EXPERIENCE_LEVEL, {
    description:
      "The level of corporate experience (EXCLUDES STARTUPS, MUST BE CORPORATE) the person has, must be a value from the following list: " +
      "0 - 1 year experience: 1, 1 - 3 years experience: 2, 3 - 5 years experience: 3, 5+ years experience: 4",
  }),
  languages: z.array(z.string(), {
    description:
      "The ISO 639-1 language codes of the languages the person has listed on their LinkedIn profile, or has used in their profile.",
  }),
  countries: z.array(z.string(), {
    description:
      "The ISO 3166-1 alpha-2 country codes of the countries the person has visited, lived in or mentioned on their LinkedIn profile.",
  }),
  interests: z.array(z.nativeEnum(Interests), {
    description:
      "The interests of the person, must be a value from the following list: " +
      Object.values(Interests).join(", "),
  }),
  investorType: z.nativeEnum(InvestorType, {
    description:
      "The type of investor the person is, must be a value from the following list: " +
      "strategic: Long-term thinker, gives founders strategic guidance. Typically works with smaller and early stage startups " +
      "hands-on: Hands-on investor, gets involved in the day-to-day operations of the company. Will likely have started their own company" +
      "data-driven: Prefers numbers over gut instincts. Will typically have a technical background " +
      "moonshot: Only backs revolutionary ideas, deep-tech, frontier tech " +
      "patient: Prefers long-term sustainable growth. Will exit late " +
      "relationship: Invests based on people, network-driven. Will typically have a large network and post frequently on LinkedIn",
  }),
  riskTolerance: z.nativeEnum(RiskTolerance, {
    description:
      "The risk tolerance of the person, based on factors such as: 1) does the person take risks in business or typically stay in one role for a long time 2) Does the person shift countries or cities much 3) Does the person invest in risky ventures. must be a value from the following list: " +
      Object.values(RiskTolerance).join(", "),
  }),
  educationInstitutions: z.array(z.string(), {
    description:
      "The Universities the person has studied at. Ensure that it is the standard name of the university, e.g University of Cambridge, not Cambridge University, however for universities with a different naming standard (e.g Harvard University), use the standard name.",
  }),
  summary: z.string({
    description:
      "A summary of the person's personality, experience and background, maximum 100 words",
  }),
});
