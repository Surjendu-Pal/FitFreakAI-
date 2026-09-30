const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true, maxlength: 12000 },
  mode: { type: String, enum: ['guide', 'ai'] },
  createdAt: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  messages: { type: [messageSchema], default: [] },
  lastRequestAt: Date,
  revision: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
