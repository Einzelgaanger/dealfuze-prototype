import { FormSettings as FormioFormSettings } from "@formio/core";
import { FormComponent } from "./formComponent.type";
import { Document, ObjectId } from "mongodb";

export enum FormType {
  INVESTOR = "investor",
  FOUNDER = "founder",
}

export type FormComponentsWithOptions = "select" | "selectboxes" | "radio";

export interface IForm {
  description?: string;
  submitterType: FormType;
  pipelineId: ObjectId;

  name: string;
  type: "form";
  display: "form";
  title: string;
  components: FormComponent[];
  settings: FormSettings;

  createdAt: Date;
  updatedAt: Date;
}

export interface FormDocument extends IForm, Document {}

export interface FormRequest extends Omit<IForm, "createdAt" | "updatedAt"> {}

export type FormUpdateRequest = {
  investorForm: FormRequest;
  founderForm: FormRequest;
  matching: {
    founderField: string;
    investorField: string;
  }[];
};

export interface FormSettings extends FormioFormSettings {
  submitButtonText: string;
  successMessage: string;
  redirectUrl: string;
  sendEmailNotification: boolean;
  emailRecipients: string[];
  hideTitle: boolean;
}
