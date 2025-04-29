import { Request, Response, NextFunction } from "express";
import { AppConfig } from "../config";
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

declare module 'express' {
  interface Request {
    userId?: string;
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Simple check without Clerk - we'll implement this properly
    // when Clerk middleware is correctly integrated
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      if (token) {
        req.userId = "mock-user-id"; // Mock user ID for now
        next();
        return;
      }
    }
    
    // For development/testing, allow requests without auth
    if (process.env.NODE_ENV !== 'production') {
      req.userId = "mock-user-id";
      next();
      return;
    }
    
    res.status(401).json({ error: "Unauthorized" });
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  private validateRequest(request: any): boolean {
    // TODO: Implement JWT validation logic
    return true; // Temporarily allowing all requests
  }
}
