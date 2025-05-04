import express from "express";
import pipelineController from "./pipeline.controller";
import { pipelineOwnershipMiddleware } from "../middleware/pipelineOwnership.middleware";
import formRoutes from "../form/form.routes";
import matchCriteriaRoutes from "../matchCriteria/matchCriteria.routes";

const router = express.Router();

// Base routes
router.get("/", (req, res) => {
  const getPipelines = req.app.locals.getPipelines || pipelineController.getPipelines;
  return getPipelines(req, res);
});
router.post("/", pipelineController.createPipeline.bind(pipelineController));

// Pipeline-specific routes
router.get(
  "/:pipelineId",
  pipelineOwnershipMiddleware,
  (req, res) => {
    const getPipelineById = req.app.locals.getPipelineById || pipelineController.getPipelineById;
    return getPipelineById(req, res);
  }
);
router.put(
  "/:pipelineId",
  pipelineOwnershipMiddleware,
  pipelineController.updatePipeline.bind(pipelineController)
);
router.delete("/:pipelineId", pipelineController.deletePipeline.bind(pipelineController));
router.use("/:pipelineId/form", pipelineOwnershipMiddleware, formRoutes);
router.use(
  "/:pipelineId/match-criteria",
  pipelineOwnershipMiddleware,
  matchCriteriaRoutes
);

export default router;
