import { Express, Request, Response, NextFunction, Router } from 'express';
import express from 'express';

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
    userId?: string;
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

  export interface Response {
    // Add any custom properties to the response object
  }
}

// Add Express static methods
declare namespace Express {
  export interface Express {
    static: (root: string, options?: any) => any;
    json: (options?: any) => any;
    urlencoded: (options?: any) => any;
  }
}

// Export a callable express function
declare const express: {
  (): express.Express;
  static: (root: string, options?: any) => any;
  json: (options?: any) => any;
  urlencoded: (options?: any) => any;
};

export = express;

export { Express, Request, Response, NextFunction, Router }; 