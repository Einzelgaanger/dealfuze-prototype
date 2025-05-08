import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

@Injectable()
export class PipelineAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Use the existing auth middleware
    authMiddleware(req, res, next);
  }
}
