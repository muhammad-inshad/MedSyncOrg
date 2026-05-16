import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";

export const initSocket = (server: HTTPServer) => {
  console.log("Initializing Socket.io...");
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        const allowedOrigins = [
          process.env.FRONTEND_URL,
          'http://localhost:5173',
          'https://med-sync-org-72v5.vercel.app',
          'https://med-sync-org.vercel.app',
        ].filter(Boolean) as string[];

        if (!origin) return callback(null, true);

        const isAllowed = allowedOrigins.some(allowed => 
          origin === allowed || (allowed && origin.startsWith(allowed))
        ) || origin.endsWith('.vercel.app') || origin.includes('localhost');

        if (isAllowed) {
          callback(null, true);
        } else {
          console.warn(`[Socket.io] Origin ${origin} not allowed by CORS matching logic`);
          callback(null, true); // Fallback to true while debugging
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["content-type", "authorization", "cookie"]
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 45000,
  });

  io.engine.on("connection_error", (err) => {
    console.error("[Socket.io] Connection Error:", {
      code: err.code,
      message: err.message,
      context: err.context
    });
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[Socket.io] New client connected: ${socket.id} from ${socket.handshake.headers.origin}`);

    socket.on("join-room", (roomId: string) => {
      console.log(`Socket ${socket.id} joining room: ${roomId}`);
      socket.join(roomId);
      socket.to(roomId).emit("user-joined", socket.id);
    });

    socket.on("offer", ({ roomId, offer }) => {
      console.log(`Relaying offer from ${socket.id} to room: ${roomId}`);
      socket.to(roomId).emit("offer", offer);
    });

    socket.on("answer", ({ roomId, answer }) => {
      console.log(`Relaying answer from ${socket.id} to room: ${roomId}`);
      socket.to(roomId).emit("answer", answer);
    });

    socket.on("ice-candidate", ({ roomId, candidate }) => {
      console.log(`Relaying ICE candidate from ${socket.id} to room: ${roomId}`);
      socket.to(roomId).emit("ice-candidate", candidate);
    });

    socket.on("disconnect", (reason) => {
      console.log(`Client disconnected (${socket.id}):`, reason);
    });
  });
};