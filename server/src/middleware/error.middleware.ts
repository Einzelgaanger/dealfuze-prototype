import { NextFunction, Request, Response } from "express";

export enum ErrorType {
  NotFound = "NotFoundError",
  Validation = "ValidationError",
  Database = "DatabaseError",
}

export class AppError extends Error {
  constructor(public statusCode: number, type: ErrorType, message: string) {
    super(message);
    this.name = type;
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error details:", {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      errors: [{ message: err.message }],
    });
    return;
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    res.status(400).json({
      error: err.message,
    });
    return;
  }

  if (err.name === "NotFoundError") {
    res.status(404).json({
      error: err.message,
    });
    return;
  }

  // Handle database errors
  if (err.name === "DatabaseError") {
    res.status(500).json({
      errors: [{ message: "Database error occurred" }],
    });
    return;
  }

  // Default error
  res.status(500).json({
    errors: [{ message: "Internal server error" }],
  });
};
