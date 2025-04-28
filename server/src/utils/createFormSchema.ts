import {
  FormComponent,
  SelectBoxesComponent,
} from "../types/formComponent.type";
import { z } from "zod";
import { getComponentOptions } from "./form";
import { FormDocument } from "../types/form.type";

export function createFormSchema(form: FormDocument, includeFormId = true) {
  return z
    .object({
      ...(includeFormId
        ? {
            formId: z.string().refine((val) => {
              if (!val) {
                return false;
              }
              return true;
            }, "This field is required"),
          }
        : {}),
      ...form.components.reduce((acc, component) => {
        let fieldSchema: z.ZodType<any>;

        if (component.key === "linkedinurl") {
          fieldSchema = z
            .string()
            .url("Invalid LinkedIn URL")
            .refine((val) => {
              const linkedinRegex =
                /^(https?:\/\/)?([a-z]{2,3}\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+$/;
              return linkedinRegex.test(val);
            }, "Invalid LinkedIn URL");

          return {
            ...acc,
            [component.key]: fieldSchema,
          };
        }

        // Handle specific component type validations
        switch (component.type) {
          case "email":
            fieldSchema = z.string().email("Invalid email address");
            break;
          case "number":
            const numberValidate = component.validate as
              | { min?: number; max?: number }
              | undefined;

            fieldSchema = z
              .union([
                z.string().transform((val) => {
                  const num = Number(val);
                  if (isNaN(num)) {
                    return undefined;
                  }
                  if (numberValidate?.min !== undefined) {
                    if (num < numberValidate.min) {
                      return undefined;
                    }
                  }
                  if (numberValidate?.max !== undefined) {
                    if (num > numberValidate.max) {
                      return undefined;
                    }
                  }
                  return num;
                }),
                z.number().refine((num) => {
                  if (numberValidate?.min !== undefined) {
                    if (num < numberValidate.min) {
                      return false;
                    }
                  }
                  if (numberValidate?.max !== undefined) {
                    if (num > numberValidate.max) {
                      return false;
                    }
                  }
                  return true;
                }),
              ])
              .pipe(z.number().optional());

            break;
          case "select":
          case "radio":
            fieldSchema = z
              .string()
              .refine(
                (val) =>
                  !val ||
                  getComponentOptions(component).some(
                    (opt) => opt.value === val
                  ),
                "Invalid option"
              );

            break;
          case "selectboxes":
            fieldSchema = z.union([
              z
                .string()
                .refine((val) => {
                  if (component.validate?.required && !val.length) {
                    return false;
                  }

                  return getComponentOptions(component).some((opt) =>
                    val.includes(opt.value)
                  );
                })
                .transform((val) => {
                  if (val.length === 0) {
                    return undefined;
                  }
                  return [val];
                }),
              z.array(z.string()).refine((val) => {
                if (component.validate?.required && !val.length) {
                  return false;
                }

                return getComponentOptions(component).some((opt) =>
                  val.includes(opt.value)
                );
              }, `Please select at least ${cast<SelectBoxesComponent>(component).validate?.minSelectedCount ?? "one"}`),
            ]);
            break;
          case "url":
            fieldSchema = z.string().url("Invalid URL");
            break;
          default:
            fieldSchema = z.string();
            if (component.validate?.required) {
              fieldSchema = (fieldSchema as z.ZodString).min(
                1,
                "This field is required"
              );
            }
        }

        if (!component.validate?.required) {
          fieldSchema = fieldSchema.optional();
        }

        return {
          ...acc,
          [component.key]: fieldSchema,
        };
      }, {} as Record<string, z.ZodType<any>>),
    })
    .refine((data) => {
      console.log("data", data);
      return true;
    }, "This field is required");
}

export function cast<T extends FormComponent>(component: FormComponent): T {
  return component as T;
}
