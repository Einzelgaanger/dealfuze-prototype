import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CharacterTraitDocument, CharacterTraitSchoolDocument } from '../types/characterTrait.type';
import CharacterTrait, { CharacterTraitSchool } from '../db/models/characterTrait.schema';

@Injectable()
export class CharacterTraitService {
  constructor(
    @InjectModel(CharacterTrait.name)
    private characterTraitModel: Model<CharacterTraitDocument>,
    @InjectModel(CharacterTraitSchool.name)
    private characterTraitSchoolModel: Model<CharacterTraitSchoolDocument>
  ) {}

  async createSchool(name: string, description: string): Promise<CharacterTraitSchoolDocument> {
    const school = new this.characterTraitSchoolModel({
      name,
      description
    });
    return school.save();
  }

  async createTrait(
    name: string,
    description: string,
    schoolId: string,
    index: number
  ): Promise<CharacterTraitDocument> {
    const trait = new this.characterTraitModel({
      name,
      description,
      schoolId,
      index
    });
    return trait.save();
  }

  async getTraitsBySchool(schoolId: string): Promise<CharacterTraitDocument[]> {
    return this.characterTraitModel
      .find({ schoolId })
      .sort({ index: 1 })
      .exec();
  }

  async getAllSchools(): Promise<CharacterTraitSchoolDocument[]> {
    return this.characterTraitSchoolModel.find().exec();
  }

  async findSimilarTraits(name: string): Promise<CharacterTraitDocument[]> {
    // Use text search to find similar trait names
    return this.characterTraitModel
      .find({ $text: { $search: name } })
      .sort({ score: { $meta: "textScore" } })
      .limit(5)
      .exec();
  }

  async calculateTraitSimilarity(
    trait1: CharacterTraitDocument,
    trait2: CharacterTraitDocument
  ): Promise<number> {
    // If traits are in the same school, calculate similarity based on index
    if (trait1.schoolId.toString() === trait2.schoolId.toString()) {
      const indexDiff = Math.abs(trait1.index - trait2.index);
      const maxIndex = await this.characterTraitModel
        .countDocuments({ schoolId: trait1.schoolId });
      
      return Math.max(0, 1 - (indexDiff / maxIndex));
    }
    
    // If traits are in different schools, return a lower similarity
    return 0.3;
  }

  async insertTraitAtPosition(
    name: string,
    description: string,
    schoolId: string,
    position: number
  ): Promise<CharacterTraitDocument> {
    // Shift all traits in the same school with index >= position
    await this.characterTraitModel
      .updateMany(
        { schoolId, index: { $gte: position } },
        { $inc: { index: 1 } }
      )
      .exec();
    
    // Create new trait at position
    const trait = new this.characterTraitModel({
      name,
      description,
      schoolId,
      index: position
    });
    
    return trait.save();
  }

  async updateTraitSchool(
    traitId: string,
    newSchoolId: string
  ): Promise<CharacterTraitDocument> {
    return this.characterTraitModel
      .findByIdAndUpdate(
        traitId,
        { schoolId: newSchoolId },
        { new: true }
      )
      .exec();
  }
} 