const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { prepareLocalEnvironment, localConnection, defaultURI } = require('../scripts/local-database');

async function environmentFile(t, content = '') {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'fitfreak-env-test-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const envPath = path.join(directory, '.env');
  await fs.writeFile(envPath, content);
  return envPath;
}

test('local setup creates durable settings once, retaining the JWT secret on rerun', async (t) => {
  const envPath = await environmentFile(t);
  const first = await prepareLocalEnvironment({ envPath, environment: {} });
  assert.equal(first.MONGODB_URI, defaultURI);
  assert.match(first.JWT_SECRET, /^[a-f0-9]{96}$/);
  const second = await prepareLocalEnvironment({ envPath, environment: {} });
  assert.equal(second.JWT_SECRET, first.JWT_SECRET);
  assert.equal(second.MONGODB_URI, first.MONGODB_URI);
});

test('local setup preserves configured database credentials, secret, and comments', async (t) => {
  const original = '# Existing settings\nMONGODB_URI=mongodb+srv://existing.invalid/fitness\nJWT_SECRET=existing-secret\nPORT=8001\n';
  const envPath = await environmentFile(t, original);
  const environment = await prepareLocalEnvironment({ envPath, environment: { MONGODB_URI: '' } });
  assert.equal(await fs.readFile(envPath, 'utf8'), original);
  assert.equal(environment.MONGODB_URI, 'mongodb+srv://existing.invalid/fitness');
  assert.equal(environment.JWT_SECRET, 'existing-secret');
  assert.equal(environment.PORT, '8001');
});

test('local setup respects legacy URL and process-provided configuration', async (t) => {
  const envPath = await environmentFile(t, 'URL=mongodb://example.invalid/fitness\n');
  const environment = await prepareLocalEnvironment({ envPath, environment: { JWT_SECRET: 'process-secret' } });
  assert.equal(environment.MONGODB_URI, undefined);
  assert.equal(environment.URL, 'mongodb://example.invalid/fitness');
  assert.equal(environment.JWT_SECRET, 'process-secret');
  assert.equal(await fs.readFile(envPath, 'utf8'), 'URL=mongodb://example.invalid/fitness\n');
});

test('local setup fills empty values without retaining a blank setting', async (t) => {
  const envPath = await environmentFile(t, 'MONGODB_URI=\nJWT_SECRET=\n');
  const environment = await prepareLocalEnvironment({ envPath, environment: {} });
  assert.equal(environment.MONGODB_URI, defaultURI);
  assert.match(environment.JWT_SECRET, /^[a-f0-9]{96}$/);
  assert.equal((await fs.readFile(envPath, 'utf8')).match(/JWT_SECRET=/g).length, 1);
});

test('the launcher only manages plain loopback MongoDB connections', () => {
  assert.deepEqual(localConnection(defaultURI), { port: 27017, dbName: 'fitfreak-ai' });
  assert.deepEqual(localConnection('mongodb://localhost:27019/custom'), { port: 27019, dbName: 'custom' });
  for (const uri of [
    'mongodb+srv://cluster.invalid/fitness',
    'mongodb://example.invalid/fitness',
    'mongodb://user:password@127.0.0.1/fitness',
    'mongodb://127.0.0.1/fitness?replicaSet=rs0',
    'not a database URI',
  ]) assert.equal(localConnection(uri), null);
});
