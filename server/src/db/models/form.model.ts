import mongoose, { Document, Schema } from 'mongoose';

export interface IFormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface IForm extends Document {
  title: string;
  description: string;
  fields: IFormField[];
  pipelineId: mongoose.Types.ObjectId;
  type: 'founder' | 'investor';
  createdAt: Date;
  updatedAt: Date;
}

const formFieldSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
  options: {
    type: [String],
  },
  placeholder: {
    type: String,
  },
});

const formSchema = new Schema<IForm>(
  {
    title: {
      type: String,
      required: [true, 'Form title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Form description is required'],
      trim: true,
    },
    fields: {
      type: [formFieldSchema],
      required: true,
    },
    pipelineId: {
      type: Schema.Types.ObjectId,
      ref: 'Pipeline',
      required: [true, 'Pipeline ID is required'],
    },
    type: {
      type: String,
      enum: ['founder', 'investor'],
      required: [true, 'Form type is required'],
    },
  },
  {
    timestamps: true,
  }
);

export const Form = mongoose.model<IForm>('Form', formSchema);
