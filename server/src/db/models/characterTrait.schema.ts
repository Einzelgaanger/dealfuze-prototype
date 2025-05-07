import { Schema, model } from 'mongoose';
import { CharacterTraitDocument, CharacterTraitSchoolDocument } from '../../types/characterTrait.type';

const characterTraitSchoolSchema = new Schema<CharacterTraitSchoolDocument>({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const characterTraitSchema = new Schema<CharacterTraitDocument>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'CharacterTraitSchool', required: true },
  name: { type: String, required: true },
  index: { type: Number, required: true },
  relatedTraits: [{ type: Schema.Types.ObjectId, ref: 'CharacterTrait' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
characterTraitSchoolSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

characterTraitSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const CharacterTraitSchool = model<CharacterTraitSchoolDocument>('CharacterTraitSchool', characterTraitSchoolSchema);
export const CharacterTrait = model<CharacterTraitDocument>('CharacterTrait', characterTraitSchema); 