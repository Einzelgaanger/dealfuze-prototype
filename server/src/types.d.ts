// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export {};

/// <reference types="@clerk/express/env" />
