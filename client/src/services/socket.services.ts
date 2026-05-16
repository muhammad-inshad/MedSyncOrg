import { io, Socket } from "socket.io-client";

export const socket: Socket = io(import.meta.env.VITE_BACKEND_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on("connect_error", (err) => {
  console.error("Socket connection error:", err.message);
  // Fallback to polling if websocket fails
  if (socket.io.opts.transports && !socket.io.opts.transports.includes('polling')) {
    socket.io.opts.transports = ['polling', 'websocket'];
  }
});