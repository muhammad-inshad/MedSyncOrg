import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";

export const initSocket = (server: HTTPServer) => {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        const allowedOrigins = [
          process.env.FRONTEND_URL,
          'https://med-sync-org-72v5.vercel.app',
          'http://localhost:5173'
        ].filter(Boolean) as string[];

        if (!origin || origin.endsWith('.vercel.app') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
          callback(null, true);
        } else {
          const allowedOrigins = [
            process.env.FRONTEND_URL,
            'https://med-sync-org-72v5.vercel.app'
          ].filter(Boolean) as string[];

          if (allowedOrigins.some(o => origin.startsWith(o))) {
            callback(null, true);
          } else {
            callback(null, false);
          }
        }
      },
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ["websocket", "polling"],
    allowEIO3: true
  });

  io.on("connection", (socket: Socket) => {
    socket.on("join-room", (roomId: string) => {
      socket.join(roomId);
    });

    socket.on("offer", ({ roomId, offer }) => {
      socket.to(roomId).emit("offer", offer);
    });

    socket.on("answer", ({ roomId, answer }) => {
      socket.to(roomId).emit("answer", answer);
    });

    socket.on("ice-candidate", ({ roomId, candidate }) => {
      socket.to(roomId).emit("ice-candidate", candidate);
    });
  });
};