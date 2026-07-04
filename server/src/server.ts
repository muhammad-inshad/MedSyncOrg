import "dotenv/config";

import { connectDB } from "./config/db.ts";
import app from "./app.ts";
import { initSocket } from "./socket/socket.ts";

import http from "http";

import logger from "./utils/logger.ts";

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
