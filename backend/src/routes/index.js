const express = require("express");
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = function (messages) {
  const router = express.Router();

  const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
  const jwtSecret = process.env.JWT_SECRET || 'change_me';
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

  function createToken(user) {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' })
  }

  // issueToken now only sets the cookie and returns the token string.
  function issueToken(res, user) {
    const token = createToken(user)
    try {
      const isProd = process.env.NODE_ENV === 'production'
      const cookieOptions = { httpOnly: true, sameSite: isProd ? 'none' : 'lax', secure: isProd }
      res.cookie('token', token, cookieOptions)
    } catch (e) { /* ignore cookie failures */ }
    return token
  }

  async function getUserFromToken(req) {
    const token = req.cookies && req.cookies.token;
    if (!token) return null;
    try {
      const decoded = jwt.verify(token, jwtSecret);
      const user = await User.findById(decoded.id);
      if (!user) return null;
      return { id: user._id, username: user.username, email: user.email, picture: user.picture };
    } catch (err) {
      return null;
    }
  }

  // Simple health/status endpoint
  router.get("/status", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  // Register (username + password)
  router.post('/register', async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'username and password required' });
    }

    try {
      const existing = await User.findOne({ $or: [{ username: username }, { email: username }] });
      if (existing) return res.status(400).json({ error: 'username taken' });

      const passwordHash = await bcrypt.hash(password, 10);
      const user = new User({ username: username.trim(), passwordHash });
      await user.save();
      issueToken(res, user);
      return res.json({ user: { id: user._id, username: user.username } });
    } catch (err) {
      console.error('register error', err);
      return res.status(500).json({ error: 'internal' });
    }
  });

  // Login (username + password)
  router.post('/login', async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'username and password required' });
    }

    try {
      const user = await User.findOne({ username });
      if (!user) return res.status(400).json({ error: 'invalid credentials' });

      const ok = await bcrypt.compare(password, user.passwordHash || '');
      if (!ok) return res.status(400).json({ error: 'invalid credentials' });

      issueToken(res, user);
      return res.json({ user: { id: user._id, username: user.username } });
    } catch (err) {
      console.error('login error', err);
      return res.status(500).json({ error: 'internal' });
    }
  });

  // Logout
  router.post('/logout', (req, res) => { res.clearCookie('token'); res.json({ ok: true }) })

  // Me endpoint
  router.get('/auth/me', async (req, res) => {
    try {
      let token = req.cookies?.token
      if (!token) {
        const auth = req.headers?.authorization
        if (auth && auth.startsWith('Bearer ')) token = auth.split(' ')[1]
      }
      if (!token) return res.status(401).json({ error: 'no token' })
      const data = jwt.verify(token, process.env.JWT_SECRET || 'devsecret')
      const user = await User.findById(data.id)
      if (!user) return res.status(401).json({ error: 'invalid token' })
      res.json({ user: { id: user._id, username: user.username, email: user.email, picture: user.picture } })
    } catch (err) {
      console.error('auth/me error', err)
      res.status(401).json({ error: 'unauthorized' })
    }
  })

  // Google ID token authentication (client obtains ID token and sends to this endpoint)
  router.post('/auth/google', async (req, res) => {
    const { id_token } = req.body || {};
    if (!id_token) return res.status(400).json({ error: 'id_token required' });

    try {
      const ticket = await googleClient.verifyIdToken({ idToken: id_token, audience: process.env.GOOGLE_CLIENT_ID });
      const payload = ticket.getPayload();
      const googleId = payload.sub;
      const email = payload.email
      let user = await User.findOne({ email })
      if (!user) {
        // generate a safe username; avoid collisions with existing users
        const rawName = (payload.name || email.split('@')[0]).toString()
        const base = rawName.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 30) || 'user'
        let candidate = base
        let suffix = 1
        // loop until we find a username that is not taken
        while (await User.findOne({ username: candidate })) {
          candidate = `${base}${suffix}`
          suffix++
        }
        user = new User({ username: candidate, email, googleId: payload.sub, picture: payload.picture })
        try {
          await user.save()
        } catch (saveErr) {
          // If a duplicate key error still happens (race), try a fallback random suffix
          if (saveErr && saveErr.code === 11000) {
            const rand = Math.floor(Math.random() * 9000) + 1000
            user.username = `${base}${rand}`
            await user.save()
          } else throw saveErr
        }
      } else if (!user.googleId) {
        user.googleId = googleId;
        user.name = user.name || name;
        user.picture = user.picture || picture;
        await user.save();
      }

      issueToken(res, user);
      return res.json({ user: { id: user._id, username: user.username, email: user.email, picture: user.picture } });
    } catch (err) {
      console.error('Google token verify failed', err);
      return res.status(400).json({ error: 'invalid id_token' });
    }
  });

  // Authorization code flow: redirect user to Google consent page
  router.get('/auth/google/start', (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const oauth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, redirectUri);
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'profile', 'email'],
      prompt: 'consent'
    });
    // redirect user to Google's OAuth 2.0 consent page
    res.redirect(authUrl);
  });

  // Callback endpoint for authorization code flow
  router.get('/auth/google/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).send('Missing code');

    const oauth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, redirectUri);
    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // verify id_token and obtain profile
      if (!tokens.id_token) {
        return res.status(400).send('Missing id_token in token response');
      }
      const ticket = await googleClient.verifyIdToken({ idToken: tokens.id_token, audience: process.env.GOOGLE_CLIENT_ID });
      const payload = ticket.getPayload();
      const googleId = payload.sub;
      const email = payload.email;
      const name = payload.name || email;
      const picture = payload.picture;

      let user = await User.findOne({ $or: [{ googleId }, { email }] });
      if (!user) {
        user = new User({ username: name, googleId, email, picture });
        await user.save();
      }

      // Issue JWT and set cookie instead of sending id_token in URL
      issueToken(res, user);
      return res.redirect(`${frontendUrl}/?authed=1`);
    } catch (err) {
      console.error('Callback exchange failed', err);
      return res.status(500).send('Authentication failed');
    }
  });

  // Return existing messages (in-memory)
  router.get("/messages", (req, res) => {
    res.json({ messages });
  });

  return router;
};
