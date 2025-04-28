import {
  FormComponent,
  RadioComponent,
  SelectComponent,
} from "../types/formComponent.type";
import { FormType } from "../types/form.type";

export function getComponentOptions(
  component: FormComponent
): { label: string; value: string }[] {
  if (component.type === "select") {
    return (
      (component as SelectComponent).data as {
        values: { label: string; value: string }[];
      }
    ).values;
  } else if (component.type === "selectboxes" || component.type === "radio") {
    return (component as RadioComponent).values || [];
  }

  return [];
}

export function setComponentOptions(
  component: FormComponent,
  options: { label: string; value: string }[]
) {
  if (component.type === "select") {
    (
      (component as SelectComponent).data as {
        values: { label: string; value: string }[];
      }
    ).values = options;
  } else if (component.type === "selectboxes" || component.type === "radio") {
    (component as RadioComponent).values = options;
  }

  return component;
}

export function getOppositeFormType(formType: FormType) {
  return formType === FormType.INVESTOR ? FormType.FOUNDER : FormType.INVESTOR;
}
