import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";

export const initSocket = (server: HTTPServer) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId: string) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    socket.on("offer", ({ roomId, offer }) => {
      console.log(`Relaying offer to room: ${roomId}`);
      socket.to(roomId).emit("offer", offer);
    });

    socket.on("answer", ({ roomId, answer }) => {
      console.log(`Relaying answer to room: ${roomId}`);
      socket.to(roomId).emit("answer", answer);
    });

    socket.on("ice-candidate", ({ roomId, candidate }) => {
      console.log(`Relaying ICE candidate to room: ${roomId}`);
      socket.to(roomId).emit("ice-candidate", candidate);
    });
  });
};