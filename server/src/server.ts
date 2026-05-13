import "dotenv/config";

import { connectDB } from "./config/db.ts";
import app from "./app.ts";
import { initSocket } from "./socket/socket.ts";

import http from "http";

import logger from "./utils/logger.ts";

connectDB();
const PORT = Number(process.env.PORT) || 5000;


const server = http.createServer(app);

initSocket(server);

server.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});