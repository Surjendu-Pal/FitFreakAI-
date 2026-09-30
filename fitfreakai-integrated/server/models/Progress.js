const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    day: {
      type: Number, 
      required: true,
    },
    completedExercises: [
      {
        name: String,
        setsDone: Number,
        repsDone: Number,
        durationMinutes: Number,
      },
    ],
    completedMeals: [
      {
        name: String,
        eaten: { type: Boolean, default: false },
      },
    ],
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
    notes: {
      type: String, 
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Progress', progressSchema);
