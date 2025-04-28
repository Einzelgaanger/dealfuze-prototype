import { Request, Response } from "express";
import matchCriteriaService from "./matchCriteria.service";

async function getMatchCriteria(req: Request, res: Response) {
  try {
    const { pipelineId } = req.params;

    const matchCriteria = await matchCriteriaService.getMatchCriteria(
      pipelineId
    );

    res.json(matchCriteria);
    return;
  } catch (error) {
    console.error("Error fetching match criteria:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
}

async function updateMatchCriteria(req: Request, res: Response) {
  try {
    const { pipelineId } = req.params;
    const matchCriteria = req.body;

    const updatedMatchCriteria = await matchCriteriaService.updateMatchCriteria(
      pipelineId,
      matchCriteria
    );

    if (!updatedMatchCriteria) {
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Match criteria not found",
      });
      return;
    }

    res.json(updatedMatchCriteria);
    return;
  } catch (error) {
    console.error("Error updating match criteria:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
}

const matchCriteriaController = {
  getMatchCriteria,
  updateMatchCriteria,
};

export default matchCriteriaController;
