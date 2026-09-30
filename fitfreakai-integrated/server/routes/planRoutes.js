const express = require("express");
const router = express.Router();
const Plan = require("../models/Plan");
const Goal = require("../models/Goal");
const authMiddleware = require("../middleware/authMiddleware");

/* -------------------- Load Exercises & Meals JSON -------------------- */
const exercises = require("../data/excersies.json");
const meals = require("../data/meals.json");

/* -------------------- Helper: pick random items -------------------- */
function pickRandom(arr, count = 2) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/* -------------------- Weekly Exercise Pattern -------------------- */
const weeklySplit = [
  "chest",
  "back",
  "legs",
  "cardio",
  "fullbody",
  "shoulders",
  "rest"
];

// Group exercises manually into muscle groups based on their name/tags
function groupExercises(exerciseList) {
  return {
    chest: exerciseList.filter((e) => /bench|push/i.test(e.name)),
    back: exerciseList.filter((e) => /deadlift|row/i.test(e.name)),
    legs: exerciseList.filter((e) => /squat|leg/i.test(e.name)),
    cardio: exerciseList.filter((e) => /jog|cycle|jump|hiit/i.test(e.name)),
    fullbody: exerciseList.filter((e) => /plank|yoga/i.test(e.name)),
    shoulders: exerciseList.filter((e) => /shoulder|press/i.test(e.name)),
    misc: exerciseList, // fallback
  };
}

/* -------------------- CREATE PLAN -------------------- */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { goalId, weekNumber, startDate } = req.body;

    const goal = await Goal.findById(goalId);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    if (goal.user.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to create plan for this goal" });
    }

    const filteredExercises = exercises.filter(
      (e) => e.tags.includes(goal.type) || e.tags.includes(goal.pace)
    );
    const filteredMeals = meals.filter(
      (m) => m.tags.includes(goal.type) || m.tags.includes(goal.pace)
    );

    if (filteredExercises.length === 0) {
      return res
        .status(400)
        .json({ message: "No exercises available for this goal." });
    }

    const grouped = groupExercises(filteredExercises);

    const usageCount = {};
    const markUsed = (name) => (usageCount[name] = (usageCount[name] || 0) + 1);
    const canUse = (name) => (usageCount[name] || 0) < 3; // max 3 times per week

    // ✅ Always return 2 exercises, even if it means repeating
    function pickUniqueExercises(pool, count = 2) {
      let available = pool.filter((e) => canUse(e.name));

      // If not enough unused exercises, allow repeats from full pool
      if (available.length < count) {
        available = pool;
      }

      const chosen = [...available]
        .sort(() => 0.5 - Math.random())
        .slice(0, count);

      chosen.forEach((ex) => markUsed(ex.name));
      return chosen;
    }

    const dailyPlans = [];
    for (let day = 1; day <= 7; day++) {
      const dayType = weeklySplit[(day - 1) % weeklySplit.length];
      const pool = grouped[dayType]?.length ? grouped[dayType] : grouped.misc;

      const selectedExercises =
        dayType === "rest" ? [] : pickUniqueExercises(pool, 2);

      dailyPlans.push({
        day,
        calories: goal.dailyCalories || 2000,
        macros: goal.macros || { protein: 100, carbs: 200, fats: 70 },
        exercises: selectedExercises.map((ex) => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          durationMinutes: ex.durationMinutes,
          image: ex.image,
        })),
        meals: pickRandom(filteredMeals, 3).map((meal) => ({
          name: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fats: meal.fats,
          image: meal.image,
        })),
        isRestDay: selectedExercises.length === 0, // mark rest day explicitly
      });
    }

    const plan = new Plan({
      user: req.user.id,
      goal: goalId,
      weekNumber: weekNumber || 1,
      startDate: startDate ? new Date(startDate) : new Date(), // ✅ add startDate
      dailyPlans,
    });

    await plan.save();
    res.status(201).json(plan);
  } catch (err) {
    console.error("❌ Error creating plan:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------- GET ALL PLANS -------------------- */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const plans = await Plan.find({ user: req.user.id }).populate("goal");
    res.json(plans);
  } catch (err) {
    console.error("❌ Error fetching plans:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------- GET PLAN BY ID -------------------- */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id).populate("goal");
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    if (plan.user.toString() !== req.user.id.toString())
      return res.status(403).json({ message: "Not authorized" });
    res.json(plan);
  } catch (err) {
    console.error("❌ Error fetching plan by ID:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------- UPDATE PLAN -------------------- */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    if (plan.user.toString() !== req.user.id.toString())
      return res.status(403).json({ message: "Not authorized" });
    Object.assign(plan, req.body);
    await plan.save();
    res.json(plan);
  } catch (err) {
    console.error("❌ Error updating plan:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------- DELETE PLAN -------------------- */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    if (plan.user.toString() !== req.user.id.toString())
      return res.status(403).json({ message: "Not authorized" });
    await plan.deleteOne();
    res.json({ message: "Plan deleted" });
  } catch (err) {
    console.error("❌ Error deleting plan:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------- MARK EXERCISE/MEAL DONE -------------------- */
router.patch(
  "/:planId/daily/:day/type/:type/id/:itemId",
  authMiddleware,
  async (req, res) => {
    try {
      const { planId, day, type, itemId } = req.params;
      const plan = await Plan.findById(planId);
      if (!plan) return res.status(404).json({ message: "Plan not found" });
      if (plan.user.toString() !== req.user.id.toString())
        return res.status(403).json({ message: "Not authorized" });

      const dailyPlan = plan.dailyPlans.find((d) => d.day === parseInt(day));
      if (!dailyPlan)
        return res.status(404).json({ message: "Daily plan not found" });

      if (type === "exercise") {
        const exercise = dailyPlan.exercises.find(
          (e) => e._id.toString() === itemId
        );
        if (!exercise)
          return res.status(404).json({ message: "Exercise not found" });
        exercise.done = true;
      } else if (type === "meal") {
        const meal = dailyPlan.meals.find((m) => m._id.toString() === itemId);
        if (!meal) return res.status(404).json({ message: "Meal not found" });
        meal.taken = true;
      } else {
        return res.status(400).json({ message: "Invalid type" });
      }

      await plan.save();
      res.json({ message: `${type} marked as done/taken`, plan });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
