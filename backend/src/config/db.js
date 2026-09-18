const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/devtinder';

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri);
    console.log(`[db] connected -> ${uri}`);
  } catch (err) {
    console.error('[db] connection failed:', err.message);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] disconnected');
  });
}

module.exports = connectDB;
