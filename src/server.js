const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const { initSocket } = require("./socket");
const { supabase } = require("./supabase");

const app = express();
const server = http.createServer(app);

// Serve static client files from /public
app.use(express.static(path.join(__dirname, "..", "public")));

// Simple helper API to fetch recent messages
app.get("/api/messages", async (req, res) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("timestamp", { ascending: true })
    .limit(100);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

initSocket(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Realtime chat server listening on http://localhost:${PORT}`);
});
