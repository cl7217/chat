const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const { connectDb } = require("./db");
const { initSocket } = require("./socket");

const app = express();
const server = http.createServer(app);

// Serve static client files from /public
app.use(express.static(path.join(__dirname, "..", "public")));

// Example REST endpoint to fetch recent messages (optional)
const Message = require("./models/Message");
app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 }).limit(100);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to load messages" });
  }
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

initSocket(io);

const PORT = process.env.PORT || 3001;

connectDb().then(() => {
  server.listen(PORT, () => {
    console.log(`Realtime chat server listening on http://localhost:${PORT}`);
  });
});
