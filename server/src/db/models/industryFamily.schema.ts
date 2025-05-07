import { Schema, model } from 'mongoose';
import { IndustryFamilyDocument } from '../../types/industry.type';

const industryFamilySchema = new Schema<IndustryFamilyDocument>({
  name: { type: String, required: true, unique: true },
  index: { type: Number, required: true },
  relatedFamilies: [{ type: Schema.Types.ObjectId, ref: 'IndustryFamily' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
industryFamilySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default model<IndustryFamilyDocument>('IndustryFamily', industryFamilySchema); 