/**
 * This file is kept for reference but is no longer used.
 * The routing is now handled by NestJS controllers with decorators.
 * See pipeline.controller.ts for the implementation.
 */

// The following is the original Express router implementation:
/*
import express from "express";
import { PipelineController } from "./pipeline.controller";
import { pipelineOwnershipMiddleware } from "../middleware/pipelineOwnership.middleware";
import formRoutes from "../form/form.routes";
import matchCriteriaRoutes from "../matchCriteria/matchCriteria.routes";

const router = express.Router();

// Base routes
router.get("/", (req, res) => {
  const controller = new PipelineController();
  return controller.getPipelines(req, res);
});
router.post("/", (req, res) => {
  const controller = new PipelineController();
  return controller.createPipeline(req, res);
});

// Pipeline-specific routes
router.get("/:pipelineId", pipelineOwnershipMiddleware, (req, res) => {
  const controller = new PipelineController();
  return controller.getPipelineById(req, res);
});
router.put("/:pipelineId", pipelineOwnershipMiddleware, (req, res) => {
  const controller = new PipelineController();
  return controller.updatePipeline(req, res);
});
router.delete("/:pipelineId", (req, res) => {
  const controller = new PipelineController();
  return controller.deletePipeline(req, res);
});

export default router;
*/

// Export an empty object to satisfy TypeScript
export default {};
