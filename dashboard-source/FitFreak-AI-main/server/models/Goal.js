const mongoose = require('mongoose');
const calculateDurationWeeks = require('../utils/calculateDurationWeeks'); 
const User = require('./User'); 

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['lose_weight', 'gain_weight', 'maintain', 'build_muscle', 'endurance'],
      required: true,
    },
    targetWeight: {
      type: Number,
      required: true,
    },
    dailyCalories: {
      type: Number,
    },
    macros: {
      protein: Number,
      carbs: Number,
      fats: Number,
    },
    pace: {
      type: String,
      enum: ['fast', 'normal', 'slow'],
      default: 'normal',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property to calculate durationWeeks dynamically
goalSchema.virtual('durationWeeks').get(async function () {
  try {
    const user = await User.findById(this.user);
    if (user && user.currentWeight && this.targetWeight && this.pace) {
      return calculateDurationWeeks(user.currentWeight, this.targetWeight, this.pace);
    }
    return null;
  } catch (err) {
    return null;
  }
});

module.exports = mongoose.model('Goal', goalSchema);
