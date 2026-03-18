// Socket.IO initializer: attach to http server and wire real-time events
module.exports = function initSocket(server, messages) {
  const { Server } = require('socket.io');
  // use same allowedOrigins as server to support localhost and Netlify frontend
  const allowedOrigins = [process.env.FRONTEND_URL ||  'https://chat-frontend-chaya.netlify.app'];

  const io = new Server(server, {
    path: '/socket.io',
    cors: {
      origin: function (origin, callback) {
        // allow requests with no origin (e.g., server-to-server, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
        return callback(new Error('CORS policy: origin not allowed'), false);
      },
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
      // Removed broadcasting a chat-style 'user-joined' system message to avoid showing it in chat UI
      // socket.broadcast.emit('user-joined', user);
    });

    // Allow client to notify server about profile updates (avatar/name) so others get updated info
    socket.on('update-user', (user) => {
      if (!user || !user.id) return;
      // update socket data
      socket.data.user = user;
      // replace or add in connectedUsers
      const idx = connectedUsers.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        connectedUsers[idx] = user;
      } else {
        connectedUsers.push(user);
      }
      // broadcast updated users list
      io.emit('users', connectedUsers);
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
        // Removed broadcasting a chat-style 'user-left' system message to avoid showing it in chat UI
        // io.emit('user-left', user);
      }
      console.log('Socket disconnected:', socket.id, reason);
    });
  });

  return io;
};
