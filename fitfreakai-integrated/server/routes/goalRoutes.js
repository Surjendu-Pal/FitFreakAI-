const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware'); // JWT protected

/* -------------------- CREATE GOAL -------------------- */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, targetWeight, dailyCalories, macros, pace } = req.body;

    // Validate type & pace
    if (!type || !['lose_weight', 'gain_weight', 'maintain', 'build_muscle', 'endurance'].includes(type)) {
      return res.status(400).json({ message: 'Invalid goal type' });
    }

    if (pace && !['fast', 'normal', 'slow'].includes(pace)) {
      return res.status(400).json({ message: 'Invalid pace' });
    }

    const goal = new Goal({
      user: req.user.id,
      type,
      targetWeight,
      dailyCalories,
      macros,
      pace: pace || 'normal'
    });

    await goal.save();

    // Fetch goal with virtual durationWeeks
    const goalWithDuration = await Goal.findById(goal._id);

    res.status(201).json(goalWithDuration);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -------------------- GET ALL GOALS FOR USER -------------------- */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id });
    res.json(goals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -------------------- GET SINGLE GOAL -------------------- */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    if (goal.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -------------------- UPDATE GOAL -------------------- */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    console.log("Goal.user:", goal.user.toString());
    console.log("req.user.id:", req.user.id);

    if (goal.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = req.body;
    Object.assign(goal, updates);

    await goal.save();

    res.json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -------------------- DELETE GOAL -------------------- */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    if (goal.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // ✅ Delete all plans linked to this goal before deleting goal
    const Plan = require('../models/Plan');
    const result = await Plan.deleteMany({ goal: goal._id });
    console.log(`🗑️ Deleted ${result.deletedCount} plan(s) for goal ${goal._id}`);

    await goal.deleteOne();

    res.json({ message: 'Goal and associated plans deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
