require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');

const createApp = require('./src/app');
const connectDB = require('./src/config/db');
const attachSocket = require('./src/sockets/chatSocket');

async function main() {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
  });

  attachSocket(io);

  // Lets REST controllers (e.g. swipeController on a mutual match) reach the
  // real-time layer without importing the socket module directly.
  app.set('io', io);

  const port = process.env.PORT || 5000;
  server.listen(port, () => {
    console.log(`[server] DevTinder API listening on :${port}`);
  });
}

main().catch((err) => {
  console.error('[server] fatal startup error:', err);
  process.exit(1);
});
