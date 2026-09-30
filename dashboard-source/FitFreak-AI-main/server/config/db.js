const mongoose = require('mongoose');

// A warm Netlify function reuses this connection instead of opening a new pool.
let connectionPromise;
mongoose.set('bufferCommands', false);

function isDatabaseConfigured() {
  return Boolean(process.env.MONGODB_URI?.trim() || process.env.URL?.trim());
}

function databaseUnavailable() {
  const error = new Error('Database is unavailable. Check MONGODB_URI and database network access. For local development, run npm run dev:local.');
  error.status = 503;
  return error;
}

async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (connectionPromise) return connectionPromise;

  const uri = process.env.MONGODB_URI?.trim() || process.env.URL?.trim();
  if (!uri) {
    const error = new Error('Database is not configured. Set MONGODB_URI in the server environment.');
    error.status = 503;
    throw error;
  }

  connectionPromise = mongoose.connect(uri, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
  });

  try {
    return await connectionPromise;
  } catch {
    throw databaseUnavailable();
  } finally {
    // Failed connections may be retried on a later invocation.
    connectionPromise = undefined;
  }
}

async function checkDatabase() {
  await connectDB();
  try {
    await mongoose.connection.db.admin().ping({ maxTimeMS: 5000 });
    return true;
  } catch {
    throw databaseUnavailable();
  }
}

module.exports = connectDB;
module.exports.checkDatabase = checkDatabase;
module.exports.isDatabaseConfigured = isDatabaseConfigured;
module.exports.disconnectDB = () => mongoose.disconnect();
