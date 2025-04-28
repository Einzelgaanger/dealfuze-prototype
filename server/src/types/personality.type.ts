import { Document, ObjectId } from "mongodb";
import { FormType } from "../types/form.type";

export enum InvestorType {
  // Long-term thinker, gives founders strategic guidance
  STRATEGIC = "strategic",
  // Hands-on investor, gets involved in the day-to-day operations of the company
  HANDS_ON = "hands-on",
  // Prefers numbers over gut instincts
  DATA_DRIVEN = "data-driven",
  // Only backs revolutionary ideas, deep-tech, frontier tech
  MOONSHOT = "moonshot",
  // Prefers long-term sustainable growth
  PATIENT = "patient",
  // Invests based on people, network-driven
  RELATIONSHIP = "relationship",
}

export enum FounderType {
  // Big-picture thinker, ambitious, charismatic
  VISIONARY = "visionary",
  // Data-driven, meticulous, process-oriented
  DATA_DRIVEN = "calculated",
  // Networker, social butterfly, loves meeting new people
  NETWORKER = "networker",
  // Serial entrepreneur, thrives on uncertainty
  RISK_TAKER = "risk-taker",
  // Execution-focused, hands-on, product-driven
  OPERATOR = "operator",
}

export enum Industries {
  AGRICULTURE = "Agriculture, Forestry, Fishing, and Hunting",
  MINING = "Mining, Quarrying, and Oil and Gas Extraction",
  UTILITIES = "Utilities",
  CONSTRUCTION = "Construction",
  MANUFACTURING = "Manufacturing",
  WHOLESALE_TRADE = "Wholesale Trade",
  RETAIL_TRADE = "Retail Trade",
  TRANSPORTATION = "Transportation and Warehousing",
  IT = "Information Technology (IT) and Software",
  AI = "Artificial Intelligence",
  FINANCE = "Finance and Insurance",
  REAL_ESTATE = "Real Estate and Rental Leasing",
  PROFESSIONAL = "Professional, Scientific, and Technical Services",
  ADMINISTRATIVE = "Administrative and Support Services",
  EDUCATIONAL = "Educational Services",
  HEALTHCARE = "Healthcare and Social Assistance",
  ARTS = "Arts, Entertainment, and Recreation",
  HOSPITALITY = "HOSPITALITY and Food Services",
  PUBLIC_ADMINISTRATION = "Public Administration",
  TELECOMMUNICATIONS = "Telecommunications",
  ENERGY = "Energy and Renewable Resources",
  CONSUMER_GOODS = "Consumer Goods and Services",
  BIOTECHNOLOGY = "Biotechnology and Pharmaceuticals",
  AEROSPACE = "Aerospace and Defense",
  ENVIRONMENTAL = "Environmental Services",
  LOGISTICS = "Logistics and Supply Chain Management",
}

export enum Interests {
  SPORTS = "Sports",
  MUSIC = "Music",
  ART = "Art",
  TECHNOLOGY = "Technology",
  SCIENCE = "Science",
  BUSINESS = "Business",
  PHILOSOPHY = "Philosophy",
  AI = "AI",
  PHILANTHROPY = "Philanthropy",
  ENVIRONMENT = "Environment",
  TRAVEL = "Travel",
  FOOD = "Food",
  GAMES = "Games",
  EDUCATION = "Education",
  DESIGN = "Design",
  FITNESS = "Fitness",
  HEALTH = "Health",
  BEAUTY = "Beauty",
  DEEP_TECH = "Deep Tech",
  VOLUNTEERING = "Volunteering",
  LITERATURE = "Literature",
  HISTORY = "History",
  POLITICS = "Politics",
  LAW = "Law",
}

export const bestFounderMatches = {
  [FounderType.VISIONARY]: [InvestorType.MOONSHOT, InvestorType.RELATIONSHIP],
  [FounderType.OPERATOR]: [
    InvestorType.HANDS_ON,
    InvestorType.DATA_DRIVEN,
    InvestorType.STRATEGIC,
  ],
  [FounderType.DATA_DRIVEN]: [
    InvestorType.DATA_DRIVEN,
    InvestorType.STRATEGIC,
    InvestorType.PATIENT,
  ],
  [FounderType.NETWORKER]: [InvestorType.RELATIONSHIP, InvestorType.PATIENT],
  [FounderType.RISK_TAKER]: [InvestorType.MOONSHOT],
};

export const worstFounderMatches = {
  [FounderType.VISIONARY]: [InvestorType.DATA_DRIVEN, InvestorType.PATIENT],
  [FounderType.OPERATOR]: [InvestorType.MOONSHOT],
  [FounderType.DATA_DRIVEN]: [InvestorType.MOONSHOT, InvestorType.RELATIONSHIP],
  [FounderType.NETWORKER]: [InvestorType.DATA_DRIVEN, InvestorType.HANDS_ON],
  [FounderType.RISK_TAKER]: [InvestorType.PATIENT, InvestorType.DATA_DRIVEN],
};

export enum RiskTolerance {
  LOW_RISK = 1,
  NORMAL_RISK = 2,
  MEDIUM_RISK = 3,
  HIGH_RISK = 4,
}

export enum EXPERIENCE_LEVEL {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  EXPERIENCED = 4,
}

export interface IPersonality {
  submissionId: ObjectId;
  formType: FormType;
  riskTolerance: RiskTolerance;
  industryFocus: string[];
  corporateExperience: EXPERIENCE_LEVEL;
  languages: string[];
  countries: string[];
  interests: string[];
  networkSize: number;
  followerCount: number;
  investorType?: InvestorType;
  founderType?: FounderType;
  educationInstitutions: string[];
}

export interface PersonalityDocument extends IPersonality, Document {}
