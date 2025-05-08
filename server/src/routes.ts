/**
 * This file is kept for reference but is being migrated to NestJS controllers.
 * Some routes are still using Express routers while others have been migrated to NestJS controllers.
 */

import express from "express";
import { authMiddleware } from "./middleware/auth.middleware";
import submissionRoutes from "./submission/submission.routes";
import formRoutes from "./form/form.routes";
import { handleBrightDataWebhook } from "./webhook/brightData";

const router = express.Router();

router.post("/webhook/brightdata", async (req, res) => {
  await handleBrightDataWebhook(req, res);
});

// Public routes
router.use(authMiddleware, submissionRoutes);

// Protected routes - Pipeline routes are now handled by NestJS controllers

router.use("/forms", authMiddleware, formRoutes);

export default router;
