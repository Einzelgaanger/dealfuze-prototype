declare module '@clerk/express' {
  import { Request, Response, NextFunction } from 'express';

  export interface ClerkExpressMiddleware {
    (req: Request, res: Response, next: NextFunction): void;
  }

  export function clerkClient(): ClerkExpressMiddleware;
  export function requireAuth(): ClerkExpressMiddleware;
  export function withAuth(): ClerkExpressMiddleware;
} 