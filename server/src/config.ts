import dotenv from "dotenv";

dotenv.config();

function createAppConfig() {
  const AppConfig = {
    NODE_ENV: process.env.NODE_ENV || "development",
    CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    DATABASE_URI: process.env.MONGODB_URI,
    BRIGHTDATA_API_KEY: process.env.BRIGHTDATA_API_KEY,
    OPEN_AI_API_KEY: process.env.OPEN_AI_API_KEY,
    BRIGHTDATA_WEBHOOK_SECRET: process.env.BRIGHTDATA_WEBHOOK_SECRET,
    APP_URL: process.env.APP_URL,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    API_PORT: process.env.API_PORT,
  };

  Object.entries(AppConfig).forEach(([key, val]) => {
    if (!val) {
      throw Error(`Required environment variable ${key} is undefined`);
    }
  });

  return AppConfig;
}

export const AppConfig = createAppConfig();
