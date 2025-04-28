import { Request } from 'express';
import '@clerk/express/env';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export {};

// Import Mongoose types
import './types/mongoose';

/// <reference types="@clerk/express/env" />
