// models/WellnessCheckin.js
const mongoose = require('mongoose');

const wellnessCheckinSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Normalized to midnight UTC so there is only one check-in per calendar day.
    date: {
      type: Date,
      required: true,
    },
    energy: {
      type: String,
      enum: ['low', 'normal', 'high'],
      required: true,
    },
    mood: {
      type: String,
      enum: ['low', 'okay', 'good'],
      required: true,
    },
    cramps: {
      type: String,
      enum: ['none', 'mild', 'moderate', 'severe'],
      default: 'none',
    },
    discomfort: {
      type: String,
      enum: ['none', 'mild', 'moderate', 'severe'],
      default: 'none',
    },
    sleep: {
      type: String,
      enum: ['poor', 'okay', 'good'],
      required: true,
    },
    workoutComfort: {
      type: String,
      enum: ['not_comfortable', 'okay', 'comfortable'],
      required: true,
    },
    // Optional and never required/defaulted to a disclosed value.
    // Only stored when the user explicitly picks something other than "prefer not to say".
    pregnancyStatus: {
      type: String,
      enum: ['pregnant', 'postpartum'],
    },
  },
  { timestamps: true }
);

// One check-in per user per day.
wellnessCheckinSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('WellnessCheckin', wellnessCheckinSchema);
