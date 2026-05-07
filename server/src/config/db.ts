import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../utils/logger.ts";
import dns from "node:dns";

// Fix for Node.js SRV resolution issue on certain networks
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    logger.info("MongoDB connected");
  } catch (error) {
    logger.error("MongoDB connection failed", error);
    process.exit(1);
  }
};

