const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const { initSocket } = require("./socket");

const app = express();
const server = http.createServer(app);

// Serve static client files from /public
app.use(express.static(path.join(__dirname, "..", "public")));

// Optional: additional API routes can be mounted here (e.g., /api/messages)
// const apiRouter = require("./routes");
// app.use("/api", apiRouter);

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
