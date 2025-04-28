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

const getComponentValues = (component: FormComponent) => {
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
};

export function validateMatchCriteria(
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
          JSON.stringify(getComponentValues(investorComponent)) !==
          JSON.stringify(getComponentValues(founderComponent))
        ) {
          throw new Error(`Matching components must have the same options`);
        }
      }
    }
  }
}

async function createDefaultMatchCriteria(pipelineId: ObjectId) {
  await MatchCriteriaModel.create([
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

async function baseUpdateMatchCriteria(
  pipelineId: string,
  matching: BaseMatchCriteriaRequest
) {
  const matchingCriteria = await MatchCriteriaModel.findOneAndUpdate(
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

async function getMatchCriteria(pipelineId: string) {
  const matchingCriteria = await MatchCriteriaModel.findOne({ pipelineId });

  return matchingCriteria;
}

async function updateMatchCriteria(
  pipelineId: string,
  matchCriteria: AdvancedMatchCriteriaRequest
) {
  const matchingCriteria = await MatchCriteriaModel.findOneAndUpdate(
    { pipelineId },
    {
      $set: {
        matchCriteria: matchCriteria,
      },
    },
    { new: true }
  );

  return matchingCriteria;
}

const matchCriteriaService = {
  createDefaultMatchCriteria,
  baseUpdateMatchCriteria,
  getMatchCriteria,
  updateMatchCriteria,
};

export default matchCriteriaService;
