import { Schema, model } from "mongoose";
import {
  LinkedinProfile,
  LinkedinProfileExperience,
} from "../../types/linkedinProfile.type";
import {
  LinkedinProfileEducation,
  LinkedinProfileLanguage,
  LinkedinProfileCertification,
  LinkedinProfileVolunteerExperience,
  LinkedinProfileProject,
  LinkedinProfileActivity,
  LinkedinProfileHonorAndAward,
  LinkedinProfileStatus,
  BrightDataLinkedinProfile,
} from "../../types/linkedinProfile.type";

const experienceSchema = new Schema<LinkedinProfileExperience>({
  title: { type: String, required: true },
  location: { type: String, required: false },
  description: { type: String, required: false },
  description_html: { type: String, required: false },
  duration: { type: String, required: false },
  start_date: { type: String, required: false },
  end_date: { type: String, required: false },
  duration_short: { type: String, required: false },
  company: { type: String, required: false },
  company_id: { type: String, required: false },
  url: { type: String, required: false },
  company_logo_url: { type: String, required: false },
});

const educationSchema = new Schema<LinkedinProfileEducation>({
  title: { type: String, required: false },
  degree: { type: String, required: false },
  field: { type: String, required: false },
  url: { type: String, required: false },
  description: { type: String, required: false },
  description_html: { type: String, required: false },
  institute_logo_url: { type: String, required: false },
});

const languageSchema = new Schema<LinkedinProfileLanguage>({
  subtitle: { type: String, required: true },
  title: { type: String, required: true },
});

const certificationSchema = new Schema<LinkedinProfileCertification>({
  meta: { type: String, required: true },
  subtitle: { type: String, required: true },
  title: { type: String, required: true },
  credential_url: { type: String, required: false },
  credential_id: { type: String, required: false },
});

const volunteerExperienceSchema =
  new Schema<LinkedinProfileVolunteerExperience>({
    cause: { type: String, required: false },
    duration: { type: String, required: true },
    duration_short: { type: String, required: true },
    end_date: { type: String, required: false },
    info: { type: String, required: true },
    start_date: { type: String, required: true },
    subtitle: { type: String, required: true },
    title: { type: String, required: true },
  });

const projectSchema = new Schema<LinkedinProfileProject>({
  title: { type: String, required: true },
  start_date: { type: String, required: true },
  end_date: { type: String, required: true },
  description: { type: String, required: true },
});

const activitySchema = new Schema<LinkedinProfileActivity>({
  interaction: { type: String, required: true },
  link: { type: String, required: true },
  title: { type: String, required: true },
  img: { type: String, required: true },
  id: { type: String, required: true },
});

const honorAndAwardSchema = new Schema<LinkedinProfileHonorAndAward>({
  title: { type: String, required: true },
  publication: { type: String, required: true },
  date: { type: String, required: false },
  description: { type: String, required: true },
});

const brightDataSchema = new Schema<BrightDataLinkedinProfile>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  city: { type: String, required: false },
  country_code: { type: String, required: true },
  about: { type: String, required: false },
  posts: [
    {
      title: { type: String, required: true },
      attribution: String,
      img: String,
      link: { type: String },
      interaction: { type: String },
      id: { type: String, required: true },
    },
  ],
  current_company: {
    link: { type: String, required: false },
    name: { type: String, required: false },
    company_id: { type: String, required: false },
  },
  experience: {
    type: [experienceSchema],
    required: false,
  },
  url: { type: String, required: true },
  educations_details: { type: String, required: false },
  education: {
    type: [educationSchema],
    required: false,
  },
  avatar: { type: String, required: false },
  languages: {
    type: [languageSchema],
    required: false,
  },
  certifications: {
    type: [certificationSchema],
    required: false,
  },
  volunteer_experience: {
    type: [volunteerExperienceSchema],
    required: false,
  },
  followers: { type: Number, required: true },
  connections: { type: Number, required: true },
  current_company_company_id: { type: String, required: false },
  current_company_name: { type: String, required: false },
  projects: {
    type: [projectSchema],
    required: false,
  },
  location: { type: String, required: false },
  input_url: { type: String, required: false },
  linkedin_id: { type: String, required: false },
  activity: {
    type: [activitySchema],
    required: false,
  },
  linkedin_num_id: { type: String, required: false },
  banner_image: { type: String, required: false },
  honors_and_awards: {
    type: [honorAndAwardSchema],
    required: false,
  },
  default_avatar: { type: Boolean, required: false },
  memorialized_account: { type: Boolean, required: false },
  updated_at: { type: Date, required: false },
});

const linkedinProfileSchema = new Schema<LinkedinProfile>({
  linkedinId: { type: String, required: true, unique: true },
  snapshotId: { type: String, required: true },
  data: {
    type: brightDataSchema,
    required: false,
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(LinkedinProfileStatus),
  },
});

const LinkedinProfileModel = model<LinkedinProfile>(
  "LinkedinProfile",
  linkedinProfileSchema
);

export default LinkedinProfileModel;
