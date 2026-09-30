const serverless = require('serverless-http');
const app = require('../../server/app');

const handleRequest = serverless(app);

exports.handler = async (event, context) => {
  // Keep the database pool available for the next invocation.
  context.callbackWaitsForEmptyEventLoop = false;

  // Support both the /api rewrite and the direct function URL.
  const prefix = '/.netlify/functions/api';
  if (event.path === prefix || event.path.startsWith(`${prefix}/`)) {
    event = { ...event, path: `/api${event.path.slice(prefix.length)}` };
  }

  return handleRequest(event, context);
};
