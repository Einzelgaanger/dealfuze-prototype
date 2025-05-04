import express from "express";
import { MatchCriteriaController } from "./matchCriteria.controller";
import { MatchCriteriaService } from "./matchCriteria.service";
import MatchCriteriaModel from "../db/models/matchCriteria.schema";
import { Model } from "mongoose";

const router = express.Router({ mergeParams: true });

// Create a mock model for the service
const mockMatchCriteriaModel = {} as Model<typeof MatchCriteriaModel>;

// Create controller instance with dependencies
const matchCriteriaService = new MatchCriteriaService(mockMatchCriteriaModel);
const matchCriteriaController = new MatchCriteriaController(matchCriteriaService);

router.get("/", matchCriteriaController.getMatchCriteria.bind(matchCriteriaController));
router.put("/", matchCriteriaController.updateMatchCriteria.bind(matchCriteriaController));

export default router;
