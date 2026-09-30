const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true });
const { checkDatabase, disconnectDB } = require('../config/db');

checkDatabase()
  .then(() => console.log('MongoDB connection and ping succeeded.'))
  .catch((error) => { console.error(error.message); process.exitCode = 1; })
  .finally(disconnectDB);
