const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const mongoose = require('mongoose');
const { startLocalDatabase } = require('../scripts/local-database');

async function freePort() {
  const listener = net.createServer();
  await new Promise((resolve) => listener.listen(0, '127.0.0.1', resolve));
  const port = listener.address().port;
  await new Promise((resolve) => listener.close(resolve));
  return port;
}

test('MongoDB keeps account and chat records after a full database restart', { timeout: 300000 }, async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'fitfreak-db-test-'));
  const uri = `mongodb://127.0.0.1:${await freePort()}/fitfreak-persistence-test`;
  let database;
  let connection;
  t.after(async () => {
    if (connection) await connection.close();
    if (database) await database.stop({ doCleanup: false });
    // This directory was created uniquely for this test; user data is never opened.
    await fs.rm(directory, { recursive: true, force: true });
  });
  database = await startLocalDatabase({ uri, dbPath: directory, reuseExisting: false });
  connection = await mongoose.createConnection(uri).asPromise();
  const account = await connection.collection('users').insertOne({ name: 'Persistence test', email: 'persistence@example.test' });
  await connection.collection('chatmessages').insertOne({ user: account.insertedId, role: 'user', content: 'Explain my plan' });
  await connection.close();
  connection = null;
  await database.stop({ doCleanup: false });
  assert.ok((await fs.readdir(directory)).includes('WiredTiger'));

  database = await startLocalDatabase({ uri, dbPath: directory, reuseExisting: false });
  connection = await mongoose.createConnection(uri).asPromise();
  assert.equal((await connection.collection('users').findOne({ _id: account.insertedId })).name, 'Persistence test');
  assert.equal((await connection.collection('chatmessages').findOne({ user: account.insertedId })).content, 'Explain my plan');
});
