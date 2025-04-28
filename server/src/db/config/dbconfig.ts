import mongoose from "mongoose";
import dotenv from "dotenv";
import { AppConfig } from "../../config";

dotenv.config();

const mongooseOptions: mongoose.ConnectOptions = {
  autoIndex: AppConfig.NODE_ENV !== "production",
};

/**
 * Connect to MongoDB database
 * @returns Promise resolving to Mongoose connection
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  try {
    const mongoUri =
      AppConfig.DATABASE_URI || "mongodb://localhost:27017/form-builder";

    const connection = await mongoose.connect(mongoUri, mongooseOptions);

    console.log(`MongoDB connected: ${connection.connection.host}`);

    mongoose.connection.on("error", (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });

    return connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

export default { connectToDatabase };
