import { body } from "express-validator";

export const formValidation = [
  body(["founderForm.title", "investorForm.title"])
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Form title is required")
    .isLength({ max: 100 })
    .withMessage("Form title must be less than 100 characters"),

  body(["founderForm.components", "investorForm.components"])
    .optional()
    .isArray()
    .withMessage("Components must be an array"),

  body(["founderForm.components.*.key", "investorForm.components.*.key"])
    .notEmpty()
    .withMessage("Component ID is required"),

  body(["founderForm.components.*.type", "investorForm.components.*.type"])
    .notEmpty()
    .withMessage("Field type is required")
    .isIn([
      "textfield",
      "textarea",
      "number",
      "email",
      "select",
      "radio",
      "checkbox",
      "day",
      "url",
      "selectboxes",
      "file",
      "linkedinurl",
      "button",
    ])
    .withMessage("Invalid field type"),

  body(["founderForm.components.*.label", "investorForm.components.*.label"])
    .notEmpty()
    .withMessage("Field label is required"),

  body([
    "founderForm.settings.submitButtonText",
    "investorForm.settings.submitButtonText",
  ])
    .optional()
    .isString()
    .withMessage("Submit button text must be a string"),

  body([
    "founderForm.settings.successMessage",
    "investorForm.settings.successMessage",
  ])
    .optional()
    .isString()
    .withMessage("Success message must be a string"),

  body([
    "founderForm.settings.redirectUrl",
    "investorForm.settings.redirectUrl",
  ])
    .optional()
    .isURL()
    .withMessage("Redirect URL must be a valid URL"),

  body([
    "founderForm.settings.storeSubmissions",
    "investorForm.settings.storeSubmissions",
  ])
    .optional()
    .isBoolean()
    .withMessage("Store submissions must be a boolean"),

  body([
    "founderForm.settings.sendEmailNotification",
    "investorForm.settings.sendEmailNotification",
  ])
    .optional()
    .isBoolean()
    .withMessage("Send email notification must be a boolean"),

  body([
    "founderForm.settings.emailRecipients",
    "investorForm.settings.emailRecipients",
  ])
    .optional()
    .isArray()
    .withMessage("Email recipients must be an array"),

  body([
    "founderForm.settings.emailRecipients.*",
    "investorForm.settings.emailRecipients.*",
  ])
    .optional()
    .isEmail()
    .withMessage("Each email recipient must be a valid email"),

  body("matching")
    .optional()
    .isArray()
    .withMessage("Matching must be an array"),
];

export const submissionsValidation = [
  body("submissions").isArray().withMessage("Submissions must be an array"),
  body("submissions.*")
    .isObject()
    .withMessage("Each submission must be an object"),
  body("formId").isMongoId().withMessage("Invalid form ID format"),
];

export const patchFormValidation = [
  body("optionsToAdd")
    .custom((value) => {
      if (!value) return true;
      if (typeof value !== "object") return false;

      return Object.entries(value).every(([_, options]) => {
        return (
          Array.isArray(options) &&
          options.every(
            (option) =>
              typeof option === "object" &&
              typeof option.label === "string" &&
              typeof option.value === "string"
          )
        );
      });
    })
    .withMessage(
      "Options to add must be a record of arrays containing label/value pairs"
    ),
];
