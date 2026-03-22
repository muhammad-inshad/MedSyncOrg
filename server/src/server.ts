import "dotenv/config";

import { connectDB } from "./config/db.ts";
import app from "./app.ts";
import { initSocket } from "./socket/socket.ts";

import http from "http";

connectDB();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});