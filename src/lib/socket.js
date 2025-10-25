import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        credentials: true
    }
})

// Store online users (userId -> socketId mapping)
const onlineUsers = new Map();

// Get socket ID by user ID
export const getReceiverSocketId = (receiverId) => {
    return onlineUsers.get(receiverId);
};


io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    const userId = socket.handshake.query.userId;

    if (userId && userId !== "undefined") {
        onlineUsers.set(userId, socket.id);
        console.log(`User ${userId} mapped to socket ${socket.id}`);

        // Emit online users to all clients
        io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    }

    // Listen for disconnect
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        // Remove user from online users
        if (userId && userId !== "undefined") {
            onlineUsers.delete(userId);
            console.log(`User ${userId} removed from online users`);
        }

        // Emit updated online users list
        io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    });
});

export { io, app, server };