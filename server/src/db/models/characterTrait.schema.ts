import mongoose, { Schema } from "mongoose";
import {
  CharacterTraitDocument,
  CharacterTraitSchoolDocument,
} from "../../types/characterTrait.type";

const characterTraitSchoolSchema = new Schema<CharacterTraitSchoolDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const characterTraitSchema = new Schema<CharacterTraitDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    schoolId: { type: Schema.Types.ObjectId, ref: "CharacterTraitSchool" },
    index: { type: Number },
    weight: { type: Number, default: 1 },
    compatibleTraits: [{ type: Schema.Types.ObjectId, ref: "CharacterTrait" }],
    incompatibleTraits: [{ type: Schema.Types.ObjectId, ref: "CharacterTrait" }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

characterTraitSchoolSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

characterTraitSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const CharacterTraitSchool = mongoose.model<CharacterTraitSchoolDocument>(
  "CharacterTraitSchool",
  characterTraitSchoolSchema
);

const CharacterTrait = mongoose.model<CharacterTraitDocument>(
  "CharacterTrait",
  characterTraitSchema
);

export { CharacterTraitSchool, CharacterTrait }; 