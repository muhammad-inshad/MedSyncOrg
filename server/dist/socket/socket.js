import { Server } from "socket.io";
export const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: [
                process.env.FRONTEND_URL || 'http://localhost:5173',
                'http://localhost:5173',
                'https://med-sync-org-72v5.vercel.app'
            ],
            methods: ["GET", "POST"],
            credentials: true
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
