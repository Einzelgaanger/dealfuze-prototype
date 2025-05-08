import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Configuration, OpenAIApi } from 'openai/dist';
import PersonalityModel from '../db/models/personality.schema';
import { MatchService } from '../match/match.service';
import { IPersonality } from '../types/personality.type';
import { Submission, SubmissionDocument } from '../submission/submission.schema';
import FormModel from '../db/models/form.schema';
import LinkedinProfileModel from '../db/models/linkedinProfile.schema';
import { FormComponent } from '../types/formComponent.type';
import { AppConfig } from '../config';
import { LinkedinProfileStatus } from '../types/linkedinProfile.type';
import { SubmissionStatus } from '../types/submission.type';
import MatchCriteriaModel from '../db/models/matchCriteria.schema';
import CharacterTraitModel from '../db/models/characterTrait.schema';

type ObjectId = Types.ObjectId;

@Injectable()
export class PersonalityService {
  private readonly openai: OpenAIApi;

  constructor(
    @InjectModel(PersonalityModel.name) 
    private personalityModel: Model<IPersonality>,
    @InjectModel(Submission.name)
    private submissionModel: Model<SubmissionDocument>,
    private matchService: MatchService
  ) {
    const configuration = new Configuration({
      apiKey: AppConfig.OPEN_AI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  private getLinkedInId(linkedinUrl: string): string | null {
    const match = linkedinUrl.match(/linkedin\.com\/in\/([^\/]+)/);
    return match ? match[1] : null;
  }

  async requestLinkedInProfile(linkedinUrl: string) {
    const linkedInId = this.getLinkedInId(linkedinUrl);

    if (!linkedInId) {
      throw new Error('Invalid LinkedIn URL');
    }

    const currentLinkedinProfile = await LinkedinProfileModel.findOne({
      linkedInId,
    });

    if (
      currentLinkedinProfile &&
      currentLinkedinProfile.data.updated_at.getTime() >
        Date.now() - 1000 * 60 * 60 * 24 * 30
    ) {
      return currentLinkedinProfile;
    }

    const response = await fetch(
      `https://api.brightdata.com/datasets/v3/trigger?dataset_id=gd_l1viktl72bvl7bjuj0&include_errors=true&endpoint=${AppConfig.APP_URL}/api/webhook/brightdata&auth_header=Bearer%20${AppConfig.BRIGHTDATA_WEBHOOK_SECRET}&format=json&uncompressed_webhook=true`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AppConfig.BRIGHTDATA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            url: `https://www.linkedin.com/in/${linkedInId}`,
          },
        ]),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Error fetching LinkedIn profile: " + data.error);
    }

    let linkedinProfile = await LinkedinProfileModel.findOneAndUpdate(
      {
        linkedinId: linkedInId,
      },
      {
        $set: {
          status: LinkedinProfileStatus.PENDING,
          snapshotId: data.snapshot_id,
        },
      },
      {
        new: true,
      }
    );

    if (!linkedinProfile) {
      linkedinProfile = await LinkedinProfileModel.create({
        linkedinId: linkedInId,
        snapshotId: data.snapshot_id,
        status: LinkedinProfileStatus.PENDING,
      });
    }

    return linkedinProfile;
  }

  async generatePersonality(
    submissionId: ObjectId,
    personalityFields: FormComponent[],
    useLinkedinPersonality: boolean
  ) {
    const submission = await this.submissionModel.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    const form = await FormModel.findById(submission.formId);
    if (!form) {
      throw new Error('Form not found');
    }

    // Extract personality-related responses
    const personalityResponses = personalityFields.map(field => ({
      question: field.label,
      answer: submission.data[field.key]
    }));

    // Use OpenAI to analyze responses and suggest character traits
    const completion = await this.openai.createCompletion({
      model: "gpt-4",
      prompt: JSON.stringify([
        {
          role: "system",
          content: "You are a personality analyzer. Analyze the following responses and suggest character traits that best describe the person. Return the traits as a JSON array of strings."
        },
        {
          role: "user",
          content: JSON.stringify(personalityResponses)
        }
      ]),
      max_tokens: 1000,
      temperature: 0.7
    });

    const suggestedTraits = JSON.parse(completion.data.choices[0].text || '[]');

    // Find matching character traits in the database
    const matchingTraits = await CharacterTraitModel.find({
      name: { $in: suggestedTraits }
    });

    // Create or update personality document
    let personality = await this.personalityModel.findOne({ submissionId });

    if (personality) {
      personality = await this.personalityModel.findOneAndUpdate(
        { submissionId },
        {
          $set: {
            traits: matchingTraits.map(trait => trait._id),
            formId: form._id,
            updatedAt: new Date()
          }
        },
        { new: true }
      );
    } else {
      personality = await this.personalityModel.create({
        traits: matchingTraits.map(trait => trait._id),
        formId: form._id,
        submissionId
      });
    }

    return personality;
  }

  async registerLinkedInProfileRetrieval(linkedInProfileId: string | Types.ObjectId) {
    const linkedinProfile = await LinkedinProfileModel.findById(linkedInProfileId);

    if (!linkedinProfile) {
      throw new Error('LinkedIn profile not found');
    }

    const submission = await this.submissionModel.findOne({
      linkedInProfileId: linkedinProfile._id
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    const form = await FormModel.findById(submission.formId);
    if (!form) {
      throw new Error('Form not found');
    }

    const matchCriteria = await MatchCriteriaModel.findOne({ formId: form._id });
    if (!matchCriteria) {
      throw new Error('Match criteria not found');
    }

    try {
      await this.generatePersonality(
        submission._id as ObjectId,
        form.components.filter((component) => component.isPersonality),
        matchCriteria.useLinkedinPersonality
      );

      const defaultCriteria = { industry: 0, fundingStage: 0, marketSize: 0, investmentRange: 0, location: 0, personality: 0, total: 0 };
      await this.matchService.batchProcessMatches(
        form._id.toString(),
        [submission._id.toString()],
        [0],
        [defaultCriteria]
      );

      await this.submissionModel.findByIdAndUpdate(submission._id, {
        $set: { status: SubmissionStatus.COMPLETED }
      });

    } catch (error) {
      console.error('Error processing personality:', error);
      throw error;
    }
  }

  async createPersonality(personality: IPersonality) {
    const createdPersonality = await this.personalityModel.create(personality);
    return createdPersonality;
  }

  async processComponent(component: any): Promise<void> {
    if (!component.submissionId) {
      throw new Error('Submission ID is required');
    }

    try {
      const submission = await this.submissionModel.findById(component.submissionId);
      if (!submission) {
        throw new Error('Submission not found');
      }

      const form = await FormModel.findById(submission.formId);
      if (!form) {
        throw new Error('Form not found');
      }

      await this.generatePersonality(
        submission._id as ObjectId,
        form.components.filter((c) => c.isPersonality),
        false
      );

    } catch (error) {
      console.error('Error processing component:', error);
      throw error;
    }
  }

  async analyzePersonality(content: string): Promise<string[]> {
    try {
      const completion = await this.openai.createCompletion({
        model: 'gpt-4',
        prompt: JSON.stringify([
          {
            role: 'system',
            content: 'You are a personality analyzer. Analyze the given text and suggest character traits that best describe the person. Return the traits as a JSON array of strings.',
          },
          {
            role: 'user',
            content,
          },
        ]),
        max_tokens: 1000,
        temperature: 0.7
      });

      const suggestedTraits = JSON.parse(completion.data.choices[0].text || '[]');
      
      // Find matching character traits in the database
      const matchingTraits = await CharacterTraitModel.find({
        name: { $in: suggestedTraits }
      });

      return matchingTraits.map(trait => trait.name);
    } catch (error) {
      console.error('Error analyzing personality:', error);
      throw error;
    }
  }
}
