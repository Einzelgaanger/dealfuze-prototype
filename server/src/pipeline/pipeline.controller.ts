import { Request, Response } from "express";
import PipelineModel from "../db/models/pipeline.schema";
import pipelineService from "./pipeline.service";
import { ObjectId } from "mongodb";

const getPipelines = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const pipelines = await PipelineModel.find({ userId });
    res.json(
      pipelines.map((pipeline) => ({
        id: pipeline._id,
        name: pipeline.name,
        description: pipeline.description,
      }))
    );
  } catch (error) {
    console.error("Error fetching pipelines:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const getPipelineById = async (req: Request, res: Response) => {
  try {
    const { pipelineId } = req.params;
    const userId = req.userId;

    const pipeline = await PipelineModel.findOne({
      _id: pipelineId,
      userId,
    });
    if (!pipeline) {
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Pipeline not found",
      });
      return;
    }

    res.json({
      id: pipeline._id,
      name: pipeline.name,
      description: pipeline.description,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const createPipeline = async (req: Request, res: Response) => {
  const { pipelineName, description } = req.body;
  const userId = req.userId;

  try {
    const pipeline = await pipelineService.createPipeline(
      userId,
      pipelineName,
      description
    );
    res.status(201).json({
      success: true,
      data: pipeline,
    });
  } catch (error) {
    console.error("Error creating pipeline:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const updatePipeline = async (
  req: Request<
    any,
    {
      name: string;
      description: string;
    },
    any,
    any
  >,
  res: Response
) => {
  try {
    const { pipelineId } = req.params;
    const updates = req.body;

    const pipeline = await pipelineService.updatePipeline(
      pipelineId,
      updates.pipelineName,
      updates.description
    );

    if (!pipeline) {
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Pipeline not found",
      });
      return;
    }

    res.json(pipeline);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const deletePipeline = async (req: Request, res: Response) => {
  try {
    const { pipelineId } = req.params;

    await pipelineService.deletePipeline(new ObjectId(pipelineId));

    res.status(204).send();
  } catch (error) {
    console.error("Delete pipeline error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const pipelineController = {
  getPipelines,
  getPipelineById,
  createPipeline,
  updatePipeline,
  deletePipeline,
};

export default pipelineController;
