import express from "express";
import matchCriteriaController from "./matchCriteria.controller";

const router = express.Router({ mergeParams: true });

router.get("/", matchCriteriaController.getMatchCriteria);
router.put("/", matchCriteriaController.updateMatchCriteria);

export default router;
