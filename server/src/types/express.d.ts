import { Request, Response, NextFunction } from 'express';
import { Express } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: string;
    }
  }
}

declare module 'express' {
  interface Request {
    user?: any;
  }
}

declare module 'express-serve-static-core' {
  interface Router {
    get(path: string, ...handlers: any[]): this;
    post(path: string, ...handlers: any[]): this;
    put(path: string, ...handlers: any[]): this;
    delete(path: string, ...handlers: any[]): this;
  }
}

export { Request, Response, NextFunction }; 