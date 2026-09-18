const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const swipeRoutes = require('./routes/swipeRoutes');
const matchRoutes = require('./routes/matchRoutes');
const messageRoutes = require('./routes/messageRoutes');
const errorHandler = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/swipe', swipeRoutes);
  app.use('/api/matches', matchRoutes);
  app.use('/api/messages', messageRoutes);

  app.use((req, res) => res.status(404).json({ message: `No route for ${req.method} ${req.path}` }));
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
