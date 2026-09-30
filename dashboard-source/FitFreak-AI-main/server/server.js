const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });
const app = require('./app');
const { checkDatabase, disconnectDB } = require('./config/db');
const { getJWTSecret } = require('./config/auth');

async function startServer({ host } = {}) {
  getJWTSecret();
  await checkDatabase();
  const port = Number(process.env.PORT || 8000);
  return new Promise((resolve, reject) => {
    const server = app.listen(port, host, () => {
      console.log(`FitFreak AI API is running at http://localhost:${server.address().port}`);
      resolve(server);
    });
    server.once('error', reject);
  });
}

if (require.main === module) {
  startServer().then((server) => {
    let closing = false;
    const shutdown = () => {
      if (closing) return;
      closing = true;
      server.close(async () => {
        await disconnectDB();
        process.exitCode = 0;
      });
    };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  }).catch(async (error) => {
    console.error(error.code === 'EADDRINUSE'
      ? 'The API port is already in use. Stop the existing server or change PORT.'
      : error.message);
    await disconnectDB();
    process.exitCode = 1;
  });
}

module.exports = { startServer };
