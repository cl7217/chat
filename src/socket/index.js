const connectedUsers = new Map();

function initSocket(io) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("login", (user) => {
      connectedUsers.set(socket.id, user);
      io.emit("users", Array.from(connectedUsers.values()));
    });

    socket.on("message", (msg) => {
      const sender = connectedUsers.get(socket.id) || { id: socket.id };

      const message = {
        id: socket.id,
        timestamp: Date.now(),
        sender,
        body: msg,
      };

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
