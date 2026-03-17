const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Socket.io uses the server instance
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Simple HTTP route to verify the server is running
app.get("/", (req, res) => {
  res.send("Realtime chat server running. Connect via Socket.io client.");
});

// Track connected users (optional)
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Optional: handle a "login" event so clients can tell us who they are
  socket.on("login", (user) => {
    // user can be an object like { id, name }
    connectedUsers.set(socket.id, user);
    io.emit("users", Array.from(connectedUsers.values()));
  });

  // Handle chat message from a client
  socket.on("message", (msg) => {
    const sender = connectedUsers.get(socket.id) || { id: socket.id };

    const message = {
      id: socket.id,
      timestamp: Date.now(),
      sender,
      body: msg,
    };

    // Broadcast to everyone (including sender)
    io.emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
    connectedUsers.delete(socket.id);
    io.emit("users", Array.from(connectedUsers.values()));
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Realtime chat server listening on http://localhost:${PORT}`);
});
