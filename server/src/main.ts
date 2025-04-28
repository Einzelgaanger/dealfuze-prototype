import express, { Request, Response, NextFunction } from "express";
import "express-async-errors";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectToDatabase } from "./db/config/dbconfig";
import apiRoutes from "./routes";
import { pinoHttp } from "pino-http";
import logger from "./logger";
import { AppConfig } from "./config";
import { errorHandler } from "./middleware/error.middleware";
import { brightDataCron } from "./cron/brightData";
import cron from "node-cron";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === "production";

connectToDatabase().catch((err) => {
  console.error("Failed to connect to MongoDB:", err);
  process.exit(1);
});

app.use(
  pinoHttp({
    logger,
    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: req.url,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
        body: res.body,
      }),
    },
  })
);

// Configure CORS based on environment
const corsOptions = {
  origin: isProduction 
    ? ["https://dealfuzealgorithmtrial.onrender.com"]
    : [AppConfig.CORS_ORIGIN!, "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Serve static files in production
if (isProduction) {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));
  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
  });
}

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

app.get("/healthz", (req: Request, res: Response) => {
  res.send("Api Running");
});

app.use("/api", apiRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Form Builder API",
    status: "running",
    version: "1.0.0",
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Not Found",
    message: "The requested resource was not found",
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
});

if (process.env.NODE_ENV === "development") {
  cron.schedule("*/1 * * * *", brightDataCron);
}

export default app;
