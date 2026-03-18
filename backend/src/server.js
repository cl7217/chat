require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');

// Initialize app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Allow CORS from frontend to receive cookies in dev
const allowedOrigins = [
  process.env.FRONTEND_URL ,
  'https://chat-frontend-chaya.netlify.app'
];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (e.g., server-to-server, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('CORS policy: origin not allowed'), false);
  },
  credentials: true
}));

// Add COOP header in development to allow Google popups/postMessage communication
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    next();
  });
}

// In-memory messages store (will be moved to DB later)
const messages = [];

async function start() {
  // Read MongoDB URI from environment (.env). Fail early if not set so the value is defined in one place.
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set. Please add MONGODB_URI to your beckend/.env file. Example: MONGODB_URI=mongodb://localhost:27017/realtime-chat');
    process.exit(1);
  }
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB')
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }

  // Routes need access to messages, so require as a function
  const routes = require('./routes')(messages);
  app.use('/api', routes);

  // Serve frontend static files (public folder at project root)
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Create HTTP server and attach socket.io
  const server = http.createServer(app);
  require('./socket')(server, messages);

  // Read PORT from environment to avoid hardcoded defaults
  const PORT = process.env.PORT;
  if (!PORT) {
    console.error('PORT is not set. Please add PORT to your beckend/.env file. Example: PORT=3000');
    process.exit(1);
  }
  console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);
  server.listen(Number(PORT), () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start();
