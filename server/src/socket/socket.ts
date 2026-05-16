import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";

export const initSocket = (server: HTTPServer) => {
  console.log("Initializing Socket.io...");
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        callback(null, true);
      },
      methods: ["GET", "POST"],
      credentials: true
    },
    path: "/socket.io/",
    transports: ["polling", "websocket"],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    cookie: false
  });

  io.on("connection", (socket: Socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join-room", (roomId: string) => {
      console.log(`Socket ${socket.id} joining room: ${roomId}`);
      socket.join(roomId);
      socket.to(roomId).emit("user-joined", socket.id);
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

    socket.on("disconnect", (reason) => {
      console.log(`Client disconnected (${socket.id}):`, reason);
    });
  });
};