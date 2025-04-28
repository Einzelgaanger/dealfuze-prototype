import { Request, Response, NextFunction } from "express";
import PipelineModel from "../db/models/pipeline.schema";
import { isValidObjectId } from "mongoose";

export const pipelineOwnershipMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pipelineId = req.params.pipelineId;
  const userId = req.userId;

  if (!isValidObjectId(pipelineId)) {
    res.status(400).json({
      success: false,
      error: "Invalid pipeline ID",
      message: "Pipeline ID is invalid",
    });
  }

  const pipeline = await PipelineModel.findById(pipelineId);

  if (!pipeline) {
    res.status(404).json({
      success: false,
      error: "Not found",
      message: "Pipeline not found",
    });
    return;
  }

  if (pipeline.userId.toString() !== userId) {
    res.status(404).json({
      success: false,
      error: "Not found",
      message: "Pipeline not found",
    });
    return;
  }

  next();
};
