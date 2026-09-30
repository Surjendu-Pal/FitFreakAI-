// routes/progress.js
const express = require("express");
const router = express.Router();
const Plan = require("../models/Plan");
const authMiddleware = require("../middleware/authMiddleware");

/* -------------------- EXISTING ROUTE -------------------- */
// GET user progress
router.get("/", authMiddleware, async (req, res) => {
  try {
    const plans = await Plan.find({ user: req.user.id });

    const progressData = [];

    plans.forEach((plan) => {
      const startDate = plan.startDate || new Date();

      plan.dailyPlans.forEach((daily) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + daily.day - 1);

        const exercisesCompleted = daily.exercises.filter((e) => e.done).length;
        const mealsCompleted = daily.meals.filter((m) => m.taken).length;

        const totalExercises = daily.exercises.length;
        const totalMeals = daily.meals.length;

        const completed =
          totalExercises === exercisesCompleted && totalMeals === mealsCompleted;

        progressData.push({
          date: date.toISOString().split("T")[0], // "YYYY-MM-DD"
          completed,
          exercisesCompleted,
          exercisesTotal: totalExercises,
          mealsCompleted,
          mealsTotal: totalMeals,
        });
      });
    });

    res.json(progressData);
  } catch (err) {
    console.error("❌ Error fetching progress:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------- HELPER: STREAK CALCULATION -------------------- */
function calculateStreak(progressData) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sorted = progressData
    .map((p) => ({ ...p, dateObj: new Date(p.date) }))
    .sort((a, b) => a.dateObj - b.dateObj);

  // Longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate = null;

  sorted.forEach((day) => {
    if (!day.completed) {
      tempStreak = 0;
      prevDate = null;
      return;
    }

    if (prevDate) {
      const diff = (day.dateObj - prevDate) / (1000 * 60 * 60 * 24);
      tempStreak = diff === 1 ? tempStreak + 1 : 1;
    } else {
      tempStreak = 1;
    }

    longestStreak = Math.max(longestStreak, tempStreak);
    prevDate = day.dateObj;
  });

  // Current streak
  let currentStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const day = sorted[i];

    // ignore future days
    if (!day.completed || day.dateObj > today) continue;

    if (currentStreak === 0) {
      currentStreak = 1;
    } else {
      const nextDay = sorted[i + 1].dateObj;
      const diff = (nextDay - day.dateObj) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
}

/* -------------------- NEW ROUTE: YEARLY CALENDAR -------------------- */
router.get("/calendar", authMiddleware, async (req, res) => {
  try {
    const plans = await Plan.find({ user: req.user.id });

    let progressData = [];

    plans.forEach((plan) => {
      const startDate = plan.startDate || new Date();

      plan.dailyPlans.forEach((daily) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + daily.day - 1);

        const exercisesCompleted = daily.exercises.filter((e) => e.done).length;
        const mealsCompleted = daily.meals.filter((m) => m.taken).length;

        const totalExercises = daily.exercises.length;
        const totalMeals = daily.meals.length;

        const completed =
          totalExercises === exercisesCompleted && totalMeals === mealsCompleted;

        progressData.push({
          date: date.toISOString().split("T")[0],
          completed,
        });
      });
    });

    // Pad to make a full-year calendar
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31);

    let datePointer = new Date(startOfYear);
    const dateMap = Object.fromEntries(
      progressData.map((p) => [p.date, p.completed])
    );

    const fullYearData = [];
    while (datePointer <= endOfYear) {
      const key = datePointer.toISOString().split("T")[0];
      fullYearData.push({
        date: key,
        completed: dateMap[key] || false,
      });
      datePointer.setDate(datePointer.getDate() + 1);
    }

    // Calculate streaks
    const { currentStreak, longestStreak } = calculateStreak(fullYearData);

    res.json({
      calendar: fullYearData,
      currentStreak,
      longestStreak,
    });
  } catch (err) {
    console.error("❌ Error fetching calendar data:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------- NEW ROUTE: STREAK INFO ONLY -------------------- */
router.get("/streak", authMiddleware, async (req, res) => {
  try {
    const plans = await Plan.find({ user: req.user.id });

    let progressData = [];

    plans.forEach((plan) => {
      const startDate = plan.startDate || new Date();

      plan.dailyPlans.forEach((daily) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + daily.day - 1);

        const exercisesCompleted = daily.exercises.filter((e) => e.done).length;
        const mealsCompleted = daily.meals.filter((m) => m.taken).length;

        const totalExercises = daily.exercises.length;
        const totalMeals = daily.meals.length;

        const completed =
          totalExercises === exercisesCompleted && totalMeals === mealsCompleted;

        progressData.push({
          date: date.toISOString().split("T")[0],
          completed,
        });
      });
    });

    const { currentStreak, longestStreak } = calculateStreak(progressData);

    res.json({
      currentStreak,
      longestStreak,
    });
  } catch (err) {
    console.error("❌ Error fetching streak:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
