import { Request, Response } from "express";
import { MatchCriteriaService } from "./matchCriteria.service";

export class MatchCriteriaController {
  constructor(private readonly matchCriteriaService: MatchCriteriaService) {}

  async getMatchCriteria(req: Request, res: Response) {
    try {
      const { pipelineId } = req.params;

      const matchCriteria = await this.matchCriteriaService.getMatchCriteria(
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

  async updateMatchCriteria(req: Request, res: Response) {
    try {
      const { pipelineId } = req.params;
      const matchCriteria = req.body;

      const updatedMatchCriteria = await this.matchCriteriaService.updateMatchCriteria(
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
}
