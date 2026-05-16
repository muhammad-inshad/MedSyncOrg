import { Server } from "socket.io";
export const initSocket = (server) => {
    console.log("Initializing Socket.io...");
    const io = new Server(server, {
        cors: {
            origin: [process.env.FRONTEND_URL || 'http://localhost:5173', "https://accounts.google.com"],
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ["websocket", "polling"],
        allowEIO3: true,
        pingTimeout: 60000,
        pingInterval: 25000,
        cookie: false // Disable cookies to avoid potential conflicts
    });
    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);
        socket.on("join-room", (roomId) => {
            console.log(`Socket ${socket.id} joining room: ${roomId}`);
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
        socket.on("disconnect", (reason) => {
            console.log(`Client disconnected (${socket.id}):`, reason);
        });
    });
};
