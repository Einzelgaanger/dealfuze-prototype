import FormModel from "../db/models/form.schema";
import { FormType, FormRequest } from "../types/form.type";
import matchCriteriaService from "../matchCriteria/matchCriteria.service";
import { defaultInvestorForm, defaultFounderForm } from "../types/defaultForm";
import { validateMatchCriteria } from "../matchCriteria/matchCriteria.service";
import { BaseMatchCriteriaRequest } from "../types/matchCriteria.type";
import { FormComponent } from "../types/formComponent.type";
import {
  getComponentOptions,
  getOppositeFormType,
  setComponentOptions,
} from "../utils/form";
import { ObjectId } from "mongodb";

async function createDefaultForms(pipelineId: ObjectId, pipelineName: string) {
  return await FormModel.create([
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

async function updateForms({
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
  validateMatchCriteria(founderForm, investorForm, matching);
  const checkDuplicateKeys = (form: FormRequest) => {
    const keys = form.components.map((component) => component.key);
    const uniqueKeys = [...new Set(keys)];
    if (keys.length !== uniqueKeys.length) {
      throw new Error(`Duplicate keys found in the form`);
    }
  };

  checkDuplicateKeys(investorForm);
  checkDuplicateKeys(founderForm);
  validateForm(investorForm);
  validateForm(founderForm);

  const currentInvestorForm = await FormModel.findOne({
    pipelineId: new ObjectId(pipelineId),
    submitterType: FormType.INVESTOR,
  });
  const currentFounderForm = await FormModel.findOne({
    pipelineId: new ObjectId(pipelineId),
    submitterType: FormType.FOUNDER,
  });

  if (!currentInvestorForm || !currentFounderForm) {
    throw new Error("Form not found");
  }

  await matchCriteriaService.baseUpdateMatchCriteria(pipelineId, matching);
  await updateForm(currentInvestorForm._id as ObjectId, investorForm);
  await updateForm(currentFounderForm._id as ObjectId, founderForm);
}

async function updateForm(formId: ObjectId, form: FormRequest) {
  await FormModel.updateOne(
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

async function addFormOptions({
  pipelineId,
  formId,
  optionsToAdd,
}: {
  pipelineId: string;
  formId: string;
  optionsToAdd: Record<string, { label: string; value: string }[]>;
}) {
  console.log("Adding form options", pipelineId, formId, optionsToAdd);

  const currentForm = await FormModel.findById(formId);
  const matchCriteria = await matchCriteriaService.getMatchCriteria(pipelineId);

  if (!currentForm || !matchCriteria) {
    throw new Error("Resources not found");
  }

  // Get both forms for the pipeline
  const investorForm = await FormModel.findOne({
    pipelineId: new ObjectId(pipelineId),
    submitterType: FormType.INVESTOR,
  });
  const founderForm = await FormModel.findOne({
    pipelineId: new ObjectId(pipelineId),
    submitterType: FormType.FOUNDER,
  });

  if (!investorForm || !founderForm) {
    throw new Error("Forms not found");
  }

  const updatedComponents: Record<FormType, { components: FormComponent[] }> = {
    [FormType.INVESTOR]: { components: investorForm.components },
    [FormType.FOUNDER]: { components: founderForm.components },
  };

  for (const [componentKey, options] of Object.entries(optionsToAdd)) {
    // Check and see if the component key is in the match criteria
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

    if (!component) {
      continue;
    }

    // If the component key is in the match criteria, add the options to both components
    if (matchCriteriaFound) {
      if (component) {
        const updatedComponent = addFormOptionsToComponent(options, component);
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
      }
    } else {
      // If the component key is not in the match criteria, add the options to the current component
      if (component) {
        const updatedComponent = addFormOptionsToComponent(options, component);
        updatedComponents[currentForm.submitterType].components =
          updatedComponents[currentForm.submitterType].components.map((c) =>
            c.key === componentKey ? updatedComponent : c
          );
      }
    }
  }

  // Update both forms with their new components
  await FormModel.updateOne(
    {
      _id: investorForm._id,
    },
    {
      $set: { components: updatedComponents[FormType.INVESTOR].components },
    }
  );

  await FormModel.updateOne(
    {
      _id: founderForm._id,
    },
    {
      $set: { components: updatedComponents[FormType.FOUNDER].components },
    }
  );
}

function addFormOptionsToComponent(
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

function validateForm(form: FormRequest) {
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

const formService = {
  createDefaultForms,
  updateForms,
  addFormOptions,
};

export default formService;
