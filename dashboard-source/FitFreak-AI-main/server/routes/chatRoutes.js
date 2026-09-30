const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Goal = require('../models/Goal');
const Plan = require('../models/Plan');
const { generateReply, getChatMode } = require('../services/chatService');

const router = express.Router();
const suggestions = ['What should I do next?', 'Explain my workout plan', 'How do I track progress?'];
const guestRequests = new Map();

router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

async function authenticate(req, res, next) {
  if (!req.get('Authorization')) {
    return res.status(401).json({ message: 'Sign in to access saved conversations.' });
  }
  await connectDB();
  return authMiddleware(req, res, next);
}

async function optionalAuthentication(req, res, next) {
  if (!req.get('Authorization')) return next();
  return authenticate(req, res, next);
}

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validateMessage(req, res, next) {
  const { message, today, history } = req.body || {};
  if (typeof message !== 'string' || !message.trim() || message.length > 2000) {
    return res.status(400).json({ message: 'Enter a message between 1 and 2,000 characters.' });
  }
  if (today !== undefined && !validDate(today)) {
    return res.status(400).json({ message: 'Today must be a valid date in YYYY-MM-DD format.' });
  }
  if (history !== undefined && (!Array.isArray(history) || history.length > 10 || history.some(
    (item) => !item || !['user', 'assistant'].includes(item.role)
      || typeof item.content !== 'string' || item.content.length > 12000,
  ))) {
    return res.status(400).json({ message: 'Conversation history is invalid.' });
  }
  req.chatMessage = message.trim();
  next();
}

function limitGuestRequests(req, res, next) {
  if (req.user) return next();
  const now = Date.now();
  for (const [key, value] of guestRequests) {
    if (value.resetAt <= now) guestRequests.delete(key);
  }
  const key = req.ip;
  const entry = guestRequests.get(key) || { count: 0, resetAt: now + 60000 };
  if (entry.count >= 20 || (!guestRequests.has(key) && guestRequests.size >= 2000)) {
    res.set('Retry-After', '60');
    return res.status(429).json({ message: 'Please wait a minute before sending more messages.' });
  }
  entry.count += 1;
  guestRequests.set(key, entry);
  next();
}

async function getContext(userId, today) {
  const [user, goals, plans] = await Promise.all([
    User.findById(userId).select('name age gender height currentWeight activityLevel'),
    Goal.find({ user: userId }).sort({ createdAt: -1 }).limit(20).lean(),
    Plan.find({ user: userId }).sort({ startDate: -1 }).limit(20)
      .select('-dailyPlans.exercises.image -dailyPlans.meals.image').lean(),
  ]);
  return {
    user: user ? {
      name: user.name, age: user.age, gender: user.gender, height: user.height,
      weight: user.currentWeight, currentWeight: user.currentWeight,
      bmi: user.bmi, tdee: user.tdee, activityLevel: user.activityLevel,
    } : null,
    goals,
    plans,
    today: today || new Date().toISOString().slice(0, 10),
  };
}

router.get('/', authenticate, async (req, res) => {
  const conversation = await Conversation.findOne({ user: req.user.id }).lean();
  const messages = conversation?.messages || [];
  res.json({ messages, mode: messages.at(-1)?.mode || getChatMode(), suggestions });
});

router.post('/', validateMessage, optionalAuthentication, limitGuestRequests, async (req, res) => {
  let conversation;
  let context = null;
  // Never accept client-supplied account IDs, profiles, plans, or signed-in history.
  let history = (req.body.history || []).filter((item) => item.role === 'user');
  if (req.user) {
    try {
      await Conversation.updateOne({ user: req.user.id }, {
        $setOnInsert: { user: req.user.id, messages: [], revision: 0 },
      }, { upsert: true });
    } catch (error) {
      if (error.code !== 11000) throw error;
    }
    const now = new Date();
    conversation = await Conversation.findOneAndUpdate({
      user: req.user.id,
      $or: [
        { lastRequestAt: { $exists: false } },
        { lastRequestAt: { $lte: new Date(now.getTime() - 1500) } },
      ],
    }, { $set: { lastRequestAt: now } }, { new: true }).lean();
    if (!conversation) {
      res.set('Retry-After', '2');
      return res.status(429).json({ message: 'Please wait a moment before sending another message.' });
    }
    history = conversation.messages.slice(-10);
    context = await getContext(req.user.id, req.body.today);
  }

  const reply = await generateReply({ message: req.chatMessage, history, context, allowAI: Boolean(req.user) });
  const messages = [
    { _id: new mongoose.Types.ObjectId(), role: 'user', content: req.chatMessage, createdAt: new Date() },
    { _id: new mongoose.Types.ObjectId(), role: 'assistant', content: reply.content, mode: reply.mode, createdAt: new Date() },
  ];

  if (req.user) {
    // Save complete turns atomically. A clear from another tab must not resurrect history.
    const saved = await Conversation.updateOne({ user: req.user.id, revision: conversation.revision }, {
      $push: { messages: { $each: messages, $slice: -100 } },
    }, { runValidators: true });
    if (!saved.matchedCount) {
      return res.status(409).json({ message: 'The conversation was cleared. Please send your message again.' });
    }
  }
  res.json({ messages, mode: reply.mode, suggestions: reply.suggestions || suggestions });
});

router.delete('/', authenticate, async (req, res) => {
  await Conversation.updateOne({ user: req.user.id }, {
    $set: { messages: [] }, $inc: { revision: 1 },
  });
  res.status(204).end();
});

module.exports = router;
