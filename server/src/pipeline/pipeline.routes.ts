import express from "express";
import pipelineController from "./pipeline.controller";
import { pipelineOwnershipMiddleware } from "../middleware/pipelineOwnership.middleware";
import formRoutes from "../form/form.routes";
import matchCriteriaRoutes from "../matchCriteria/matchCriteria.routes";

const router = express.Router();

// Base routes
router.get("/", pipelineController.getPipelines);
router.post("/", pipelineController.createPipeline);

// Pipeline-specific routes
router.get(
  "/:pipelineId",
  pipelineOwnershipMiddleware,
  pipelineController.getPipelineById
);
router.put(
  "/:pipelineId",
  pipelineOwnershipMiddleware,
  pipelineController.updatePipeline
);
router.delete("/:pipelineId", pipelineController.deletePipeline);
router.use("/:pipelineId/form", pipelineOwnershipMiddleware, formRoutes);
router.use(
  "/:pipelineId/match-criteria",
  pipelineOwnershipMiddleware,
  matchCriteriaRoutes
);

export default router;
