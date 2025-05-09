import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import express, { Request, Response, NextFunction } from "express";
import "express-async-errors";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectToDatabase } from "./db/config/dbconfig";
// import apiRoutes from "./routes";
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
  
  // Enable CORS with specific options
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://192.168.100.14:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });
  
  // Use helmet for security
  app.use(helmet());
  
  // Use pino for logging
  app.use(pinoHttp({ logger }));
  
  // Use error handler
  app.use(errorHandler);
  
  // Add health check endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });
  
  // Add API prefix to all routes
  app.setGlobalPrefix('api');
  
  // Add fallback route for pipeline endpoint
  app.getHttpAdapter().get('/api/pipeline', (req, res) => {
    res.status(200).json({ message: 'Pipeline API is available' });
  });
  
  // Add a catch-all route for debugging purposes
  app.getHttpAdapter().get('*', (req, res, next) => {
    console.log(`Request received for path: ${req.path}`);
    next();
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
  const port = process.env.API_PORT || 4001;
  await app.listen(port);
  logger.info(`Application is running on: ${port}`);
}

bootstrap();
