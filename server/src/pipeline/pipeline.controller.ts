import { Request, Response } from "express";
import PipelineModel from "../db/models/pipeline.schema";
import { PipelineService } from "./pipeline.service";
import { ObjectId } from "mongodb";
import { Injectable, Controller, Get, Post, Put, Delete, Param, Body, Req, Res } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { PipelineDocument } from "../types/pipeline.type";
import { Model } from "mongoose";

@Controller('pipeline')
export class PipelineController {
  constructor(
    private readonly pipelineService: PipelineService,
    @InjectModel(PipelineModel.name)
    private pipelineModel: Model<PipelineDocument>
  ) {}

  @Get()
  async getPipelines(@Req() req: Request, @Res() res: Response) {
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
  }

  @Get(':pipelineId')
  async getPipelineById(@Req() req: Request, @Res() res: Response) {
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
  }

  @Post()
  async createPipeline(@Req() req: Request, @Res() res: Response) {
    try {
      const { userId, pipelineName, description } = req.body;

      const pipeline = await this.pipelineService.createPipeline(
        userId,
        pipelineName,
        description
      );

      res.status(201).json(pipeline);
    } catch (error) {
      console.error("Error creating pipeline:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create pipeline",
      });
    }
  }

  @Put(':pipelineId')
  async updatePipeline(@Req() req: Request, @Res() res: Response) {
    try {
      const { pipelineId } = req.params;
      const updates = req.body;

      const pipeline = await this.pipelineService.updatePipeline(
        pipelineId,
        updates.pipelineName,
        updates.description
      );

      res.json(pipeline);
    } catch (error) {
      console.error("Error updating pipeline:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update pipeline",
      });
    }
  }

  @Delete(':pipelineId')
  async deletePipeline(@Req() req: Request, @Res() res: Response) {
    try {
      const { pipelineId } = req.params;

      await this.pipelineService.deletePipeline(new ObjectId(pipelineId));

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting pipeline:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete pipeline",
      });
    }
  }
}

