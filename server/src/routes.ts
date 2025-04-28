import express from "express";
import { authMiddleware } from "./middleware/auth.middleware";
import pipelineRoutes from "./pipeline/pipeline.routes";
import submissionRoutes from "./submission/submission.routes";
import formRoutes from "./form/form.routes";
import { handleBrightDataWebhook } from "./webhook/brightData";

const router = express.Router();

router.post("/webhook/brightdata", async (req, res) => {
  await handleBrightDataWebhook(req, res);
});

// Public routes
router.use(authMiddleware, submissionRoutes);

// Protected routes
router.use("/pipeline", authMiddleware, pipelineRoutes);

router.use("/forms", authMiddleware, formRoutes);

export default router;
