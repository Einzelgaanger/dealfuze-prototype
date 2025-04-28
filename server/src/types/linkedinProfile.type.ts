import { Document } from "mongodb";

export interface LinkedinProfileInput {
  url: string;
}

export interface LinkedinProfilePost {
  title: string;
  attribution: string;
  img: string;
  link: string;
  interaction: string;
  id: string;
}

export interface LinkedinProfileCompany {
  link: string;
  name: string;
  company_id: string;
}

export interface LinkedinProfileEducation {
  title?: string;
  degree?: string;
  field?: string;
  url?: string;
  description?: string | null;
  description_html?: string | null;
  institute_logo_url: string;
}

export interface LinkedinProfileLanguage {
  subtitle: string;
  title: string;
}

export interface LinkedinProfileCertification {
  meta: string;
  subtitle: string;
  title: string;
  credential_url?: string | null;
  credential_id?: string | null;
}

export interface LinkedinProfileVolunteerExperience {
  cause?: string;
  duration: string;
  duration_short: string;
  end_date?: string | null;
  info: string;
  start_date: string;
  subtitle: string;
  title: string;
}

export interface LinkedinProfileProject {
  title: string;
  start_date: string;
  end_date: string;
  description: string;
}

export interface LinkedinProfileActivity {
  interaction: string;
  link: string;
  title: string;
  img: string;
  id: string;
}

export interface LinkedinProfileHonorAndAward {
  title: string;
  publication: string;
  date: string | null;
  description: string;
}

export interface LinkedinProfileExperience {
  title: string;
  location?: string;
  description?: string;
  description_html?: string;
  duration?: string;
  start_date?: string;
  end_date?: string;
  duration_short?: string;
  company?: string;
  company_id?: string;
  url?: string;
  company_logo_url?: string;
}

export interface BrightDataLinkedinProfile {
  input: LinkedinProfileInput;
  id: string;
  name: string;
  city: string;
  country_code: string;
  about: string;
  posts: LinkedinProfilePost[];
  current_company: LinkedinProfileCompany;
  experience: LinkedinProfileExperience[];
  url: string;
  educations_details: string;
  education: LinkedinProfileEducation[];
  avatar: string;
  languages: LinkedinProfileLanguage[];
  certifications: LinkedinProfileCertification[];
  volunteer_experience: LinkedinProfileVolunteerExperience[];
  followers: number;
  connections: number;
  current_company_company_id: string;
  current_company_name: string;
  projects: LinkedinProfileProject[];
  location: string;
  input_url: string;
  linkedin_id: string;
  activity: LinkedinProfileActivity[];
  linkedin_num_id: string;
  banner_image: string;
  honors_and_awards: LinkedinProfileHonorAndAward[];
  similar_profiles: any[];
  default_avatar: boolean;
  memorialized_account: boolean;
  timestamp: string;
  updated_at: Date;
}

export interface LinkedinProfile {
  linkedinId: string;
  snapshotId: string;
  data: BrightDataLinkedinProfile;
  status: LinkedinProfileStatus;
}

export interface LinkedinProfileDocument extends LinkedinProfile, Document {}

export enum LinkedinProfileStatus {
  PENDING = "pending",
  SUCCESS = "success",
  ERROR = "error",
}
