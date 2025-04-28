import { FormDocument, FormType } from "../types/form.type";
import { SubmissionDocument } from "../types/submission.type";
import {
  MatchCriteriaDocument,
  MatchField,
  MatchType,
} from "../types/matchCriteria.type";
import PersonalityModel from "../db/models/personality.schema";
import { matchPersonality } from "../utils/matchPersonality";
import { FormComponent } from "../types/formComponent.type";
import MatchModel from "../db/models/match.schema";
import { MatchDocument } from "../types/match.type";

export type MatchEntity = {
  matchedFields: Map<string, number>;
  matchPercentage: number;
  submission: SubmissionDocument;
};

export async function match({
  founderForm,
  investorForm,
  entityType,
  entity,
  oppositeEntities,
  matchCriteria,
}: {
  founderForm: FormDocument;
  investorForm: FormDocument;
  entityType: FormType;
  entity: SubmissionDocument;
  oppositeEntities: SubmissionDocument[];
  matchCriteria: MatchCriteriaDocument;
}) {
  function getOppositeEntityField(matchField: MatchField) {
    if (entityType === FormType.FOUNDER) {
      return investorForm.components.find(
        (field) => field.key === matchField.investorField
      );
    } else {
      return founderForm.components.find(
        (field) => field.key === matchCriteria.founderField
      );
    }
  }

  function getEntityField(matchField: MatchField) {
    if (entityType === FormType.FOUNDER) {
      return founderForm.components.find(
        (field) => field.key === matchField.founderField
      );
    } else {
      return investorForm.components.find(
        (field) => field.key === matchField.investorField
      );
    }
  }

  const requiredFields = matchCriteria.matchCriteria.filter(
    (field) => field.required
  );

  const unrequiredFields = matchCriteria.matchCriteria.filter(
    (field) => !field.required
  );

  const filteredOppositeEntities = oppositeEntities.filter((oppositeEntity) => {
    for (const criteria of requiredFields) {
      const oppositeEntityField = getOppositeEntityField(criteria);
      const entityField = getEntityField(criteria);
      if (!oppositeEntityField || !entityField) {
        return false;
      }

      const oppositeEntityResponse = oppositeEntity.data.get(
        oppositeEntityField.key
      );
      const entityResponse = entity.data.get(entityField.key);

      if (
        oppositeEntityField.type === "selectboxes" ||
        oppositeEntityField.type === "select" ||
        oppositeEntityField.type === "radio"
      ) {
        return matchOptionsComponent(
          criteria.matchType,
          oppositeEntityField,
          oppositeEntityResponse,
          entityResponse
        );
      } else {
        return oppositeEntityResponse === entityResponse;
      }
    }

    return true;
  });

  // Convert founders to matched founders with percentages
  await Promise.all(
    filteredOppositeEntities.map(async (oppositeEntity) => {
      const matchedOppositeEntity: MatchEntity = {
        matchedFields: new Map(),
        matchPercentage: 0,
        submission: oppositeEntity,
      };

      let totalWeight = 0;
      let matchWeight = 0;

      const entityPersonality = await PersonalityModel.findOne({
        submissionId: entity._id,
      });

      const oppositeEntityPersonality = await PersonalityModel.findOne({
        submissionId: oppositeEntity._id,
      });

      // Ensure we have the correct personality types based on entityType
      const founderPersonality =
        entityType === FormType.FOUNDER
          ? entityPersonality
          : oppositeEntityPersonality;
      const investorPersonality =
        entityType === FormType.FOUNDER
          ? oppositeEntityPersonality
          : entityPersonality;

      if (!founderPersonality || !investorPersonality) {
        return;
      }

      const personalityMatch =
        entityPersonality && oppositeEntityPersonality
          ? await matchPersonality(founderPersonality, investorPersonality)
          : null;

      // Calculate match percentage based on matching fields (70% weight)
      for (const field of unrequiredFields) {
        const entityField = getEntityField(field);

        if (!entityField) continue;

        const fieldWeight = field.weight || 1;
        totalWeight += fieldWeight;

        const entityResponse = entity.data.get(entityField);
        const oppositeEntityResponse = oppositeEntity.data.get(
          getOppositeEntityField(field)?.key
        );

        if (!entityResponse || !oppositeEntityResponse) continue;

        if (field.matchType === MatchType.EXACT) {
          if (entityResponse === oppositeEntityResponse) {
            matchedOppositeEntity.matchedFields.set(entityField.key, 100);
            matchWeight += fieldWeight;
          } else {
            matchedOppositeEntity.matchedFields.set(entityField.key, 0);
          }
        } else {
          if (
            entityField.type === "selectboxes" ||
            entityField.type === "select" ||
            entityField.type === "radio"
          ) {
            const isMatch = matchOptionsComponent(
              field.matchType,
              entityField,
              entityResponse,
              oppositeEntityResponse
            );
            if (isMatch) {
              matchedOppositeEntity.matchedFields.set(entityField.key, 100);
              matchWeight += fieldWeight;
            }
          } else if (entityField.type === "number") {
            const entityValue = Number(entityResponse);
            const oppositeEntityValue = Number(oppositeEntityResponse);

            // Calculate the relative difference based on the larger number
            const maxValue = Math.max(entityValue, oppositeEntityValue);
            const relativeDifference =
              Math.abs(entityValue - oppositeEntityValue) / maxValue;

            // Calculate match score using exponential decay
            const matchScore = Math.exp(-5 * relativeDifference);

            if (matchScore > 0.5) {
              // Only consider it a match if score is above 50%
              matchedOppositeEntity.matchedFields.set(
                entityField.key,
                matchScore * 100
              );
              matchWeight += fieldWeight * matchScore;
            }
          }
        }
      }

      // Calculate form match percentage (70% of total)
      const formMatchPercentage = (matchWeight / totalWeight) * 100;

      // Calculate final weighted percentage including personality (30% weight)
      const personalityPercentage = personalityMatch ?? undefined;

      if (personalityPercentage) {
        matchedOppositeEntity.matchPercentage =
          formMatchPercentage * 0.7 + personalityPercentage * 0.3;
      }

      await MatchModel.create({
        founderId:
          entityType === FormType.FOUNDER ? entity._id : oppositeEntity._id,
        investorId:
          entityType === FormType.INVESTOR ? entity._id : oppositeEntity._id,
        pipelineId: matchCriteria.pipelineId,
        totalMatchPercentage: matchedOppositeEntity.matchPercentage,
        formMatchPercentage: formMatchPercentage,
        personalityMatchPercentage: personalityPercentage,
        formMatch: matchedOppositeEntity.matchedFields,
      } satisfies MatchDocument);
    })
  );
}

function matchOptionsComponent(
  matchType: MatchType,
  investorComponent: FormComponent,
  investorResponse: string | string[],
  founderResponse: string | string[]
) {
  if (matchType === MatchType.SOFT) {
    if (isMultiResponse(investorComponent) && Array.isArray(investorResponse)) {
      if (Array.isArray(founderResponse)) {
        return investorResponse.some((response) =>
          founderResponse.find((r) => r === response)
        );
      } else {
        return investorResponse.includes(founderResponse as string);
      }
    } else {
      if (Array.isArray(founderResponse)) {
        return founderResponse.includes(investorResponse as string);
      }
    }
  } else {
    return investorResponse === founderResponse;
  }

  return false;
}

function isMultiResponse(component: FormComponent) {
  return component.type === "selectboxes";
}
