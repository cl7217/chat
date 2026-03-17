const { supabase } = require("../supabase");

const connectedUsers = new Map();

async function persistMessage(message) {
  const { error } = await supabase.from("messages").insert([message]);
  if (error) {
    console.warn("Failed to persist message to Supabase:", error.message);
  }
}

async function sendRecentMessages(socket) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("timestamp", { ascending: true })
    .limit(100);

  if (error) {
    console.warn("Failed to load message history from Supabase:", error.message);
    return;
  }

  socket.emit("history", data);
}

function initSocket(io) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Send recent messages to the client immediately
    sendRecentMessages(socket).catch(console.warn);

    socket.on("login", (user) => {
      connectedUsers.set(socket.id, user);
      io.emit("users", Array.from(connectedUsers.values()));
    });

    socket.on("message", async (msg) => {
      const sender = connectedUsers.get(socket.id) || { id: socket.id, name: "Anonymous" };

      const message = {
        sender_id: sender.id,
        sender_name: sender.name || "Anonymous",
        body: msg,
        timestamp: new Date().toISOString(),
      };

      // Persist message in Supabase
      await persistMessage(message);

      // Broadcast message to all connected clients
      io.emit("message", {
        id: socket.id,
        timestamp: Date.now(),
        sender,
        body: msg,
      });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      connectedUsers.delete(socket.id);
      io.emit("users", Array.from(connectedUsers.values()));
    });
  });
}

module.exports = { initSocket };
