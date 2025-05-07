import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IndustryFamilyDocument } from '../types/industry.type';
import IndustryFamily from '../db/models/industryFamily.schema';

@Injectable()
export class IndustryFamilyService {
  constructor(
    @InjectModel(IndustryFamily.name)
    private industryFamilyModel: Model<IndustryFamilyDocument>
  ) {}

  async createFamily(name: string): Promise<IndustryFamilyDocument> {
    // Get the next available index
    const lastFamily = await this.industryFamilyModel
      .findOne()
      .sort({ index: -1 })
      .exec();
    
    const nextIndex = lastFamily ? lastFamily.index + 1 : 0;
    
    const family = new this.industryFamilyModel({
      name,
      index: nextIndex,
      relatedFamilies: []
    });
    
    return family.save();
  }

  async findSimilarFamilies(name: string): Promise<IndustryFamilyDocument[]> {
    // Use text search to find similar industry names
    return this.industryFamilyModel
      .find({ $text: { $search: name } })
      .sort({ score: { $meta: "textScore" } })
      .limit(5)
      .exec();
  }

  async updateFamilyRelationships(
    familyId: string,
    relatedFamilyIds: string[]
  ): Promise<IndustryFamilyDocument> {
    return this.industryFamilyModel
      .findByIdAndUpdate(
        familyId,
        { relatedFamilies: relatedFamilyIds },
        { new: true }
      )
      .exec();
  }

  async getFamilyByIndex(index: number): Promise<IndustryFamilyDocument | null> {
    return this.industryFamilyModel.findOne({ index }).exec();
  }

  async getAllFamilies(): Promise<IndustryFamilyDocument[]> {
    return this.industryFamilyModel.find().sort({ index: 1 }).exec();
  }

  async calculateFamilySimilarity(
    family1: IndustryFamilyDocument,
    family2: IndustryFamilyDocument
  ): Promise<number> {
    // Calculate similarity based on index proximity
    const indexDiff = Math.abs(family1.index - family2.index);
    const maxIndex = await this.industryFamilyModel.countDocuments();
    
    // Convert to similarity score (0-1)
    return Math.max(0, 1 - (indexDiff / maxIndex));
  }

  async insertFamilyAtPosition(
    name: string,
    position: number
  ): Promise<IndustryFamilyDocument> {
    // Shift all families with index >= position
    await this.industryFamilyModel
      .updateMany(
        { index: { $gte: position } },
        { $inc: { index: 1 } }
      )
      .exec();
    
    // Create new family at position
    const family = new this.industryFamilyModel({
      name,
      index: position,
      relatedFamilies: []
    });
    
    return family.save();
  }
} 