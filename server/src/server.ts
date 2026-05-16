import "dotenv/config";

import { connectDB } from "./config/db.js";
import app from "./app.js";
import { initSocket } from "./socket/socket.js";

import http from "http";

import logger from "./utils/logger.js";

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

connectDB();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

try {
  initSocket(server);
} catch (error) {
  logger.error("Failed to initialize Socket.io:", error);
}

server.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
