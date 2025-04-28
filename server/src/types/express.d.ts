import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: string;
    }
  }
}

export { Request, Response, NextFunction }; 