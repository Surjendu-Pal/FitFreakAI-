// models/Plan.js
const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
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
    weekNumber: {
      type: Number,
      default: 1,
    },
    startDate: {
      type: Date,
      default: Date.now, // <-- add this
    },
    dailyPlans: [
      {
        day: { type: Number }, // 1,2,3,...7
        calories: { type: Number },
        macros: {
          protein: Number,
          carbs: Number,
          fats: Number,
        },
        exercises: [
          {
            name: String,
            sets: Number,
            reps: Number,
            durationMinutes: Number,
            image: String,
            done: { type: Boolean, default: false },
          },
        ],
        meals: [
          {
            name: String,
            calories: Number,
            protein: Number,
            carbs: Number,
            fats: Number,
            image: String,
            taken: { type: Boolean, default: false },
          },
        ],
        isRestDay: { type: Boolean, default: false }, // optional
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Plan', planSchema);
