import { Express, Request, Response, NextFunction, Router } from 'express';

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

  interface Application {
    use: any;
    listen: any;
    static: any;
    json: any;
    urlencoded: any;
  }
}

export { Express, Request, Response, NextFunction, Router }; 