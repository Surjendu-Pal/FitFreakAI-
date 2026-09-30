const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { getJWTSecret } = require('./config/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.json({ service: 'FitFreak AI API', status: 'ok' });
});

// This confirms that the function starts without contacting MongoDB.
app.get('/api/health', (_req, res) => {
  const databaseConfigured = Boolean(process.env.MONGODB_URI || process.env.URL);
  const authenticationConfigured = Boolean(process.env.JWT_SECRET?.trim());
  res.json({
    service: 'FitFreak AI API',
    status: 'ok',
    configured: databaseConfigured && authenticationConfigured,
    databaseConfigured,
    authenticationConfigured,
  });
});

app.get('/api/health/ready', async (_req, res) => {
  getJWTSecret();
  await connectDB.checkDatabase();
  res.json({ service: 'FitFreak AI API', status: 'ready', database: 'connected' });
});

// Guest app guidance works even before a database has been configured.
app.use('/api/chat', require('./routes/chatRoutes'));

async function prepareAPI(_req, _res, next) {
  try {
    getJWTSecret();
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
}

app.use('/api/user', prepareAPI, require('./routes/userRoute'));
app.use('/api/goals', prepareAPI, require('./routes/goalRoutes'));
app.use('/api/plan', prepareAPI, require('./routes/planRoutes'));
app.use('/api/progress', prepareAPI, require('./routes/progressRoutes'));
app.use('/api/posts', prepareAPI, require('./routes/postRoutes'));
app.use('/api/wellness', prepareAPI, require('./routes/wellnessRoutes'));

app.use((_req, res) => {
  res.status(404).json({ message: 'API route not found' });
});
app.use(errorHandler);

module.exports = app;
