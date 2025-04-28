import { getAuth, clerkMiddleware } from "@clerk/express";
import { Request, Response, NextFunction } from "express";
import { AppConfig } from "../config";

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
