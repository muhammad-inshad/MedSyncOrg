import { Server } from "socket.io";
export const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
        },
    });
    io.on("connection", (socket) => {
        socket.on("join-room", (roomId) => {
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
