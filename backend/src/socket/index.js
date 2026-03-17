// Socket.IO initializer: attach to http server and wire real-time events
module.exports = function initSocket(server, messages) {
  const { Server } = require('socket.io');
  const io = new Server(server, {
    path: '/socket.io',
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Track connected users
  const connectedUsers = [];

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Client should send a 'join' event with user info { id, username }
    socket.on('join', (user) => {
      socket.data.user = user;
      // add to connectedUsers if not present
      if (user && user.id) {
        const exists = connectedUsers.find((u) => u.id === user.id);
        if (!exists) connectedUsers.push(user);
      }

      // send existing messages history to the connected client
      socket.emit('messages', messages);
      // send current users list to everyone
      io.emit('users', connectedUsers);
      // also notify others that a user joined
      socket.broadcast.emit('user-joined', user);
    });

    // Receive a chat message from a client
    socket.on('chat-message', (payload) => {
      const user = socket.data.user || { id: 'anon', username: payload.username || 'anon' };
      const message = {
        id: Date.now().toString(),
        user,
        text: payload.text,
        createdAt: new Date().toISOString(),
      };

      // store and broadcast
      messages.push(message);
      io.emit('message', message);
    });

    socket.on('disconnect', (reason) => {
      const user = socket.data.user;
      if (user) {
        // remove from connectedUsers
        const idx = connectedUsers.findIndex((u) => u.id === user.id);
        if (idx !== -1) connectedUsers.splice(idx, 1);
        // broadcast updated users list and user-left
        io.emit('users', connectedUsers);
        io.emit('user-left', user);
      }
      console.log('Socket disconnected:', socket.id, reason);
    });
  });

  return io;
};
