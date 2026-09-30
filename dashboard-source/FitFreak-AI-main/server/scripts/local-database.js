const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const net = require('node:net');
const dotenv = require('dotenv');

const serverDirectory = path.resolve(__dirname, '..');
const defaultURI = 'mongodb://127.0.0.1:27017/fitfreak-ai';

async function prepareLocalEnvironment({
  envPath = path.join(serverDirectory, '.env'),
  environment = process.env,
} = {}) {
  let source = await fs.readFile(envPath, 'utf8').catch((error) => {
    if (error.code === 'ENOENT') return '';
    throw error;
  });
  const nonemptyEnvironment = Object.fromEntries(
    Object.entries(environment).filter(([, value]) => typeof value === 'string' && value.trim()),
  );
  const configured = { ...dotenv.parse(source), ...nonemptyEnvironment };
  const additions = {};
  if (!(configured.MONGODB_URI?.trim() || configured.URL?.trim())) {
    additions.MONGODB_URI = defaultURI;
  }
  if (!configured.JWT_SECRET?.trim()) {
    additions.JWT_SECRET = crypto.randomBytes(48).toString('hex');
  }
  for (const [key, value] of Object.entries(additions)) {
    const setting = new RegExp(`^\\s*${key}\\s*=.*$`, 'gm');
    source = setting.test(source)
      ? source.replace(setting, `${key}=${value}`)
      : `${source.trimEnd()}\n${key}=${value}\n`;
  }
  if (Object.keys(additions).length) {
    await fs.mkdir(path.dirname(envPath), { recursive: true });
    await fs.writeFile(envPath, source, { mode: 0o600 });
  }
  for (const [key, value] of Object.entries({ ...dotenv.parse(source), ...additions })) {
    if (!environment[key]?.trim()) environment[key] = value;
  }
  return environment;
}

function localConnection(uri) {
  try {
    const parsed = new URL(uri);
    if (parsed.protocol !== 'mongodb:' || !['localhost', '127.0.0.1'].includes(parsed.hostname)) {
      return null;
    }
    // Credentials and special query options indicate a separately managed database.
    if (parsed.username || parsed.password || parsed.search) return null;
    return { port: Number(parsed.port || 27017), dbName: parsed.pathname.slice(1) || 'fitfreak-ai' };
  } catch {
    return null;
  }
}

function portIsOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    const finish = (open) => { socket.destroy(); resolve(open); };
    socket.once('connect', () => finish(true));
    socket.once('error', () => finish(false));
    socket.setTimeout(1500, () => finish(false));
  });
}

async function startLocalDatabase({
  uri = process.env.MONGODB_URI || process.env.URL || defaultURI,
  dbPath = path.join(serverDirectory, '.data', 'mongodb'),
  reuseExisting = true,
} = {}) {
  const connection = localConnection(uri);
  if (!connection) return null;
  if (reuseExisting && await portIsOpen(connection.port)) return null;
  await fs.mkdir(dbPath, { recursive: true });
  const { MongoMemoryServer } = require('mongodb-memory-server-core');
  // This launches a real mongod with a stable disk directory, not a disposable DB.
  const database = new MongoMemoryServer({
    binary: { version: '7.0.24' },
    instance: {
      port: connection.port,
      ip: '127.0.0.1',
      dbName: connection.dbName,
      dbPath,
      storageEngine: 'wiredTiger',
      args: ['--wiredTigerCacheSizeGB', '0.25'],
    },
    dispose: { enabled: false },
  });
  // Never silently choose a different port from the configured MONGODB_URI.
  await database.start(true);
  return database;
}

module.exports = { prepareLocalEnvironment, startLocalDatabase, localConnection, defaultURI };
