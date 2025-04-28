import express from "express";
import formController from "./form.controller";
import { formValidation } from "./form.validations";
import { submissionsValidation, patchFormValidation } from "./form.validations";

const router = express.Router({ mergeParams: true });

/**
 * @route   GET /api/forms/:pipelineId
 * @desc    Get a form by ID
 * @access  Public
 */
router.get("/", formController.getFormsByPipelineId);

/**
 * @route   GET /api/forms/:formId
 * @desc    Get a form by ID
 * @access  Public
 */
router.get("/:formId", formController.getFormById);

/**
 * @route   PUT /api/forms/:id
 * @desc    Update a form by ID
 * @access  Public
 */
router.put("/", formValidation, formController.updateForm);

/**
 * @route   PATCH /api/forms/:pipelineId/:formId
 * @desc    Add form options to a form
 * @access  Public
 */
router.patch(
  "/:formId",
  patchFormValidation,
  formController.patchFormComponents
);

/**
 * @route   POST /api/forms/:formId/submit
 * @desc    Submit a form
 * @access  Public
 */
router.post(
  "/:formId/import",
  submissionsValidation,
  formController.importSubmissions
);

export default router;
