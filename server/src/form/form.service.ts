import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import FormModel from "../db/models/form.schema";
import { FormType, FormRequest } from "../types/form.type";
import { MatchCriteriaService } from "../matchCriteria/matchCriteria.service";
import { defaultInvestorForm, defaultFounderForm } from "../types/defaultForm";
import { BaseMatchCriteriaRequest, MatchCriteriaDocument } from "../types/matchCriteria.type";
import { FormComponent } from "../types/formComponent.type";
import {
  getComponentOptions,
  getOppositeFormType,
  setComponentOptions,
} from "../utils/form";
import { ObjectId } from "mongodb";

@Injectable()
export class FormService {
  constructor(
    @InjectModel(FormModel.name) private formModel: Model<typeof FormModel>,
    private readonly matchCriteriaService: MatchCriteriaService
  ) {}

  async findById(formId: string) {
    return await this.formModel.findById(formId);
  }

  async findByPipelineId(pipelineId: string) {
    return await this.formModel.find({ pipelineId: new ObjectId(pipelineId) });
  }

  async createDefaultForms(pipelineId: ObjectId, pipelineName: string) {
    return await this.formModel.create([
      {
        ...defaultInvestorForm,
        name: `${pipelineName} Investor Form`,
        type: "form",
        display: "form",
        title: `${pipelineName} Investor Form`,
        description: "Form for investors",
        pipelineId: pipelineId,
        submitterType: FormType.INVESTOR,
      },
      {
        ...defaultFounderForm,
        name: `${pipelineName} Founder Form`,
        type: "form",
        display: "form",
        title: `${pipelineName} Founder Form`,
        description: "Form for founders",
        pipelineId: pipelineId,
        submitterType: FormType.FOUNDER,
      },
    ]);
  }

  async updateForms({
    pipelineId,
    investorForm,
    founderForm,
    matching,
  }: {
    pipelineId: string;
    investorForm: FormRequest;
    founderForm: FormRequest;
    matching: BaseMatchCriteriaRequest;
  }) {
    this.matchCriteriaService.validateMatchCriteria(founderForm, investorForm, matching);
    this.checkDuplicateKeys(founderForm);
    this.checkDuplicateKeys(investorForm);
    this.validateForm(investorForm);
    this.validateForm(founderForm);

    const currentInvestorForm = await this.formModel.findOne({
      pipelineId: new ObjectId(pipelineId),
      submitterType: FormType.INVESTOR,
    });
    const currentFounderForm = await this.formModel.findOne({
      pipelineId: new ObjectId(pipelineId),
      submitterType: FormType.FOUNDER,
    });

    if (!currentInvestorForm || !currentFounderForm) {
      throw new Error("Form not found");
    }

    await this.matchCriteriaService.baseUpdateMatchCriteria(pipelineId, matching);
    await this.updateForm(currentInvestorForm._id as ObjectId, investorForm);
    await this.updateForm(currentFounderForm._id as ObjectId, founderForm);
  }

  private async updateForm(formId: ObjectId, form: FormRequest) {
    await this.formModel.updateOne(
      {
        _id: formId,
      },
      {
        $set: {
          title: form.title,
          name: form.name,
          description: form.description,
          components: form.components,
          settings: form.settings,
          updatedAt: new Date(),
        },
      }
    );
  }

  async addFormOptions({
    pipelineId,
    formId,
    optionsToAdd,
  }: {
    pipelineId: string;
    formId: string;
    optionsToAdd: Record<string, { label: string; value: string }[]>;
  }) {
    const currentForm = await this.formModel.findById(formId).lean<FormRequest>();
    const matchCriteriaDoc = await this.matchCriteriaService.getMatchCriteria(pipelineId);

    if (!currentForm || !matchCriteriaDoc) {
      throw new Error("Resources not found");
    }

    const matchCriteria = matchCriteriaDoc as unknown as MatchCriteriaDocument;

    const investorForm = await this.formModel.findOne({
      pipelineId: new ObjectId(pipelineId),
      submitterType: FormType.INVESTOR,
    }).lean<FormRequest>();
    const founderForm = await this.formModel.findOne({
      pipelineId: new ObjectId(pipelineId),
      submitterType: FormType.FOUNDER,
    }).lean<FormRequest>();

    if (!investorForm || !founderForm) {
      throw new Error("Forms not found");
    }

    const updatedComponents: Record<FormType, { components: FormComponent[] }> = {
      [FormType.INVESTOR]: { components: investorForm.components },
      [FormType.FOUNDER]: { components: founderForm.components },
    };

    for (const [componentKey, options] of Object.entries(optionsToAdd)) {
      let matchCriteriaFound;
      if (currentForm.submitterType === FormType.INVESTOR) {
        matchCriteriaFound = matchCriteria.matchCriteria.find(
          (criteria) => criteria.investorField === componentKey
        );
      } else {
        matchCriteriaFound = matchCriteria.matchCriteria.find(
          (criteria) => criteria.founderField === componentKey
        );
      }

      const component = currentForm.components.find(
        (component) => component.key === componentKey
      );

      if (!component) continue;

      if (matchCriteriaFound) {
        const updatedComponent = this.addFormOptionsToComponent(options, component);
        updatedComponents[currentForm.submitterType].components =
          updatedComponents[currentForm.submitterType].components.map((c) =>
            c.key === componentKey ? updatedComponent : c
          );
        const oppositeFormType = getOppositeFormType(currentForm.submitterType);
        updatedComponents[oppositeFormType].components = updatedComponents[
          oppositeFormType
        ].components.map((c) =>
          c.key === componentKey ? updatedComponent : c
        );
      } else {
        const updatedComponent = this.addFormOptionsToComponent(options, component);
        updatedComponents[currentForm.submitterType].components =
          updatedComponents[currentForm.submitterType].components.map((c) =>
            c.key === componentKey ? updatedComponent : c
          );
      }
    }

    await this.formModel.updateOne(
      { _id: investorForm._id },
      { $set: { components: updatedComponents[FormType.INVESTOR].components } }
    );

    await this.formModel.updateOne(
      { _id: founderForm._id },
      { $set: { components: updatedComponents[FormType.FOUNDER].components } }
    );
  }

  private addFormOptionsToComponent(
    options: { label: string; value: string }[],
    component: FormComponent
  ) {
    if (component.type === "select") {
      const values = getComponentOptions(component);
      return setComponentOptions(component, [
        ...values,
        ...options.filter((option) => !values.includes(option)),
      ]);
    } else if (component.type === "selectboxes" || component.type === "radio") {
      const values = getComponentOptions(component);
      return setComponentOptions(component, [
        ...values,
        ...options.filter((option) => !values.includes(option)),
      ]);
    } else {
      throw new Error("Invalid component type");
    }
  }

  private checkDuplicateKeys(form: FormRequest) {
    const keys = form.components.map((component) => component.key);
    const uniqueKeys = [...new Set(keys)];
    if (keys.length !== uniqueKeys.length) {
      throw new Error(`Duplicate keys found in the form`);
    }
  }

  private validateForm(form: FormRequest) {
    const nameComponent = form.components.find(
      (component) => component.key === "name"
    );
    const emailComponent = form.components.find(
      (component) => component.key === "email"
    );

    if (!nameComponent || !emailComponent) {
      throw new Error("Name and email components are required");
    }

    if (nameComponent.type !== "textfield" || emailComponent.type !== "email") {
      throw new Error("Name and email components must be textfield and email");
    }

    if (nameComponent.validate?.required || emailComponent.validate?.required) {
      throw new Error("Name and email components must not have validation");
    }
  }
}
