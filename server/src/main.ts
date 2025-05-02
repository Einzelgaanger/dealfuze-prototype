import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import express, { Request, Response, NextFunction } from "express";
import "express-async-errors";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectToDatabase } from "./db/config/dbconfig";
import apiRoutes from "./routes";
import { pinoHttp } from "pino-http";
import logger from "./logger";
import { AppConfig } from "./config";
import { errorHandler } from "./middleware/error.middleware";
import { brightDataCron } from "./cron/brightData";
import cron from "node-cron";
import path from "path";
import { CronService } from './cron/cron.service';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Use helmet for security
  app.use(helmet());
  
  // Use pino for logging
  app.use(pinoHttp({ logger }));
  
  // Use error handler
  app.use(errorHandler);
  
  // Add health check endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });
  
  // Get cron service
  const cronService = app.get(CronService);
  
  // Schedule cron job
  cron.schedule('*/5 * * * *', async () => {
    try {
      await cronService.brightDataCron();
    } catch (error) {
      logger.error('Error in brightDataCron:', error);
    }
  });
  
  // Start the application
  const port = process.env.API_PORT || 4000;
  await app.listen(port);
  logger.info(`Application is running on: ${port}`);
}

bootstrap();
