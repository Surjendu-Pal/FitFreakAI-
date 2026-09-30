const { prepareLocalEnvironment, startLocalDatabase } = require('./local-database');

async function main() {
  if (process.env.NODE_ENV === 'production' || process.env.NETLIFY) {
    throw new Error('The local database launcher is for development. Configure MONGODB_URI and use npm start for production.');
  }
  await prepareLocalEnvironment();
  console.log('Preparing the database. The first local run downloads MongoDB; later runs reuse the cached binary.');
  let database;
  let server;
  let closing = false;

  const shutdown = async () => {
    if (closing) return;
    closing = true;
    if (server) await new Promise((resolve) => server.close(resolve));
    await require('../config/db').disconnectDB();
    if (database) await database.stop({ doCleanup: false });
  };

  try {
    database = await startLocalDatabase();
    if (database) console.log('Local MongoDB is ready. Data is saved in server/.data/mongodb.');
    else console.log('Using the configured, separately running MongoDB database.');
    await require('../config/db').checkDatabase();
    if (!process.argv.includes('--database-only')) {
      server = await require('../server').startServer({ host: '127.0.0.1' });
    } else {
      console.log('Database connection verified. Keep this terminal open while using the app.');
    }
    const handleSignal = () => shutdown().catch(() => { process.exitCode = 1; });
    process.once('SIGINT', handleSignal);
    process.once('SIGTERM', handleSignal);
  } catch (error) {
    await shutdown();
    throw error;
  }
}

main().catch((error) => {
  console.error(error.code === 'EADDRINUSE'
    ? 'The API port is already in use. Stop the existing server or change PORT.'
    : error.message);
  process.exitCode = 1;
});
