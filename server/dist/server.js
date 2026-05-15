import "dotenv/config";
import { connectDB } from "./config/db.js";
import app from "./app.js";
import { initSocket } from "./socket/socket.js";
import http from "http";
import logger from "./utils/logger.js";
connectDB();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);
server.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
});
