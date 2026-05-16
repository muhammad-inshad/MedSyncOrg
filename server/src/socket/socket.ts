import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";

export const initSocket = (server: HTTPServer) => {
  console.log("Initializing Socket.io...");
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || origin.includes('localhost') || origin.includes('vercel.app')) {
          callback(null, true);
        } else {
          callback(null, true); // Fallback to true while debugging
        }
      },
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true 
  });

  io.on("connection", (socket: Socket) => {
    console.log("New client connected:", socket.id);

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