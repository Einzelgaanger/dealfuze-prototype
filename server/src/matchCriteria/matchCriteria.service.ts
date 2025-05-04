import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import MatchCriteriaModel from "../db/models/matchCriteria.schema";
import { ObjectId } from "mongodb";
import { FormComponent, RadioComponent } from "../types/formComponent.type";
import { SelectComponent } from "../types/formComponent.type";
import { FormRequest } from "../types/form.type";
import {
  BaseMatchCriteriaRequest,
  AdvancedMatchCriteriaRequest,
  MatchType,
} from "../types/matchCriteria.type";

const OptionComponentTypes = ["select", "selectboxes", "radio"];

@Injectable()
export class MatchCriteriaService {
  constructor(
    @InjectModel(MatchCriteriaModel.name)
    private matchCriteriaModel: Model<typeof MatchCriteriaModel>
  ) {}

  private getComponentValues(component: FormComponent) {
    if (component.type === "select") {
      return (
        (component as SelectComponent).data as {
          values: { label: string; value: string }[];
        }
      ).values;
    }
    if (component.type === "selectboxes") {
      return (component as SelectComponent).values;
    }
    if (component.type === "radio") {
      return (component as RadioComponent).values;
    }
    return [];
  }

  validateMatchCriteria(
    founderForm: FormRequest,
    investorForm: FormRequest,
    matchCriteria: { founderField: string; investorField: string }[]
  ) {
    for (const { founderField, investorField } of matchCriteria) {
      const investorComponent = investorForm.components.find(
        (c) => c.key === investorField
      );
      const founderComponent = founderForm.components.find(
        (c) => c.key === founderField
      );

      if (!(investorComponent || founderComponent)) {
        throw new Error(`Matching components must be present in both forms`);
      }

      if (investorComponent && founderComponent) {
        if (
          !OptionComponentTypes.includes(founderComponent.type) &&
          investorComponent.type !== founderComponent.type
        ) {
          throw new Error(`Matching components must be of the same type`);
        } else {
          if (!OptionComponentTypes.includes(investorComponent.type)) {
            throw new Error(
              `Options can only match with other option components`
            );
          } else if (
            JSON.stringify(this.getComponentValues(investorComponent)) !==
            JSON.stringify(this.getComponentValues(founderComponent))
          ) {
            throw new Error(`Matching components must have the same options`);
          }
        }
      }
    }
  }

  async createDefaultMatchCriteria(pipelineId: ObjectId) {
    await this.matchCriteriaModel.create([
      {
        pipelineId: pipelineId,
        matchCriteria: [
          {
            founderField: "industry",
            investorField: "industry",
            required: false,
            matchType: MatchType.SOFT,
          },
          {
            founderField: "country",
            investorField: "country",
            required: false,
            matchType: MatchType.SOFT,
          },
        ],
        useLinkedinPersonality: true,
      },
    ]);
  }

  async baseUpdateMatchCriteria(
    pipelineId: string,
    matching: BaseMatchCriteriaRequest
  ) {
    const matchingCriteria = await this.matchCriteriaModel.findOneAndUpdate(
      { pipelineId },
      {
        $set: {
          matchCriteria: matching,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!matchingCriteria) {
      throw new Error("Matching criteria not found");
    }

    return matchingCriteria;
  }

  async getMatchCriteria(pipelineId: string) {
    return await this.matchCriteriaModel.findOne({ pipelineId });
  }

  async updateMatchCriteria(
    pipelineId: string,
    matchCriteria: AdvancedMatchCriteriaRequest
  ) {
    return await this.matchCriteriaModel.findOneAndUpdate(
      { pipelineId },
      {
        $set: {
          matchCriteria: matchCriteria,
        },
      },
      { new: true }
    );
  }
}
