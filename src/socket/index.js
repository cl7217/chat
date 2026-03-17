const connectedUsers = new Map();
const Message = require("../models/Message");

async function sendRecentMessages(socket) {
  const messages = await Message.find().sort({ timestamp: 1 }).limit(100);
  socket.emit("history", messages);
}

function initSocket(io) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Send last messages to the client immediately
    sendRecentMessages(socket).catch((err) => {
      console.warn("Failed to load message history", err);
    });

    socket.on("login", (user) => {
      connectedUsers.set(socket.id, user);
      io.emit("users", Array.from(connectedUsers.values()));
    });

    socket.on("message", async (msg) => {
      const sender = connectedUsers.get(socket.id) || { id: socket.id, name: "Anonymous" };

      const message = {
        id: socket.id,
        timestamp: Date.now(),
        sender,
        body: msg,
      };

      // Persist to MongoDB (fire-and-forget)
      try {
        await Message.create({
          senderId: sender.id,
          senderName: sender.name || "Anonymous",
          body: msg,
          timestamp: message.timestamp,
        });
      } catch (err) {
        console.warn("Failed to save message to DB", err);
      }

      io.emit("message", message);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      connectedUsers.delete(socket.id);
      io.emit("users", Array.from(connectedUsers.values()));
    });
  });
}

module.exports = { initSocket };
