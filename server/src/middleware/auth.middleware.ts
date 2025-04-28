import { getAuth, clerkMiddleware } from "@clerk/express";
import { Request, Response, NextFunction } from "express";
import { AppConfig } from "../config";
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  clerkMiddleware({
    signInUrl: "http://localhost:5173/login",
    secretKey: AppConfig.CLERK_SECRET_KEY,
    publishableKey: AppConfig.CLERK_PUBLISHABLE_KEY,
    debug: true,
  })(req, res, async () => {
    const auth = getAuth(req);

    if (!auth.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    req.userId = auth.userId;
    next();
  });
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
