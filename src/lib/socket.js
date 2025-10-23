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

io.on("connected", (socket) => {
    console.log("User Connected::::", socket.id);

    io.on("disconnected", () => {
        console.log("User is disconnected", socket.id);
    })
});

export { io, app, server };