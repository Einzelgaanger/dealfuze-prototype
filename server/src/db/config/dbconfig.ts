import mongoose from "mongoose";
import dotenv from "dotenv";
import { AppConfig } from "../../config";

dotenv.config();

// Enhanced connection options for scalability and reliability
const mongooseOptions: mongoose.ConnectOptions = {
  autoIndex: AppConfig.NODE_ENV !== "production", // Don't create indexes in production for better performance
  maxPoolSize: 100, // Increase connection pool size for high traffic
  serverSelectionTimeoutMS: 30000, // Longer server selection timeout
  socketTimeoutMS: 45000, // Longer socket timeout
  family: 4, // Use IPv4, skip trying IPv6
  connectTimeoutMS: 30000, // Longer connection timeout
  heartbeatFrequencyMS: 10000, // Heartbeat to detect and recover from connection failures
  retryWrites: true, // Retry write operations
};

/**
 * Connect to MongoDB database with enhanced error handling and reconnection
 * @returns Promise resolving to Mongoose connection
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  try {
    const mongoUri =
      AppConfig.DATABASE_URI || "mongodb://localhost:27017/deal-fuze";

    // Set up global configuration for better performance
    mongoose.set('strictQuery', false);
    
    const connection = await mongoose.connect(mongoUri, mongooseOptions);

    console.log(`MongoDB connected: ${connection.connection.host}`);

    // Enhanced error handling
    mongoose.connection.on("error", (err) => {
      console.error(`MongoDB connection error: ${err}`);
      // Alert monitoring system in production
      if (AppConfig.NODE_ENV === "production") {
        // TODO: Add monitoring alerts integration
      }
    });

    // Reconnection handling
    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected, attempting to reconnect");
      // Automatic reconnection is handled by mongoose
    });

    // Proper cleanup on application shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });

    return connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // In production, we might want to retry connection before exiting
    if (AppConfig.NODE_ENV === "production") {
      console.log("Retrying connection in 5 seconds...");
      setTimeout(() => connectToDatabase(), 5000);
    } else {
      process.exit(1);
    }
    throw error; // Re-throw for proper error handling
  }
}

// Add connection health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const status = mongoose.connection.readyState;
    return status === 1; // 1 = connected
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

export default { connectToDatabase, checkDatabaseConnection };
