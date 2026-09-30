// routes/wellnessRoutes.js
const express = require('express');
const router = express.Router();
const CycleEntry = require('../models/CycleEntry');
const WellnessCheckin = require('../models/WellnessCheckin');
const authMiddleware = require('../middleware/authMiddleware');
const { getCycleSummary } = require('../utils/cycleUtils');
const {
  getWorkoutAdjustment,
  getMissedWorkoutMessage,
} = require('../utils/wellnessRecommendation');

// All wellness data is private to the authenticated user — every query below
// is scoped to req.user.id so a user can only ever see their own data.
router.use(authMiddleware);

function startOfDay(date) {
  const d = date ? new Date(date) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/* -------------------- CYCLE: ADD ENTRY -------------------- */
router.post('/cycle', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    if (!startDate) {
      return res.status(400).json({ message: 'startDate is required' });
    }

    const entry = new CycleEntry({
      user: req.user.id,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
    });

    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    console.error('Error creating cycle entry:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -------------------- CYCLE: UPDATE END DATE -------------------- */
router.patch('/cycle/:id', async (req, res) => {
  try {
    const entry = await CycleEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Cycle entry not found' });
    if (entry.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.body.endDate) entry.endDate = new Date(req.body.endDate);
    if (req.body.startDate) entry.startDate = new Date(req.body.startDate);
    await entry.save();
    res.json(entry);
  } catch (err) {
    console.error('Error updating cycle entry:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -------------------- CYCLE: DELETE ENTRY -------------------- */
router.delete('/cycle/:id', async (req, res) => {
  try {
    const entry = await CycleEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Cycle entry not found' });
    if (entry.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await entry.deleteOne();
    res.json({ message: 'Cycle entry deleted' });
  } catch (err) {
    console.error('Error deleting cycle entry:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -------------------- CYCLE: LIST + SUMMARY -------------------- */
router.get('/cycle', async (req, res) => {
  try {
    const entries = await CycleEntry.find({ user: req.user.id }).sort({ startDate: -1 });
    const summary = getCycleSummary(entries);
    res.json({ entries, summary });
  } catch (err) {
    console.error('Error fetching cycle entries:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -------------------- CHECK-IN: CREATE/UPDATE TODAY -------------------- */
router.post('/checkin', async (req, res) => {
  try {
    const {
      energy,
      mood,
      cramps,
      discomfort,
      sleep,
      workoutComfort,
      pregnancyStatus,
      date,
    } = req.body;

    if (!energy || !mood || !sleep || !workoutComfort) {
      return res.status(400).json({ message: 'Missing required check-in fields' });
    }

    const day = startOfDay(date);

    const setFields = {
      energy,
      mood,
      cramps: cramps || 'none',
      discomfort: discomfort || 'none',
      sleep,
      workoutComfort,
    };

    // Pregnancy/postpartum status is only ever stored if the user explicitly
    // chooses one — never defaulted or required.
    const update = { $set: setFields };
    if (pregnancyStatus === 'pregnant' || pregnancyStatus === 'postpartum') {
      setFields.pregnancyStatus = pregnancyStatus;
    } else {
      update.$unset = { pregnancyStatus: '' };
    }

    const checkin = await WellnessCheckin.findOneAndUpdate(
      { user: req.user.id, date: day },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(checkin);
  } catch (err) {
    console.error('Error saving check-in:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -------------------- CHECK-IN: TODAY -------------------- */
router.get('/checkin/today', async (req, res) => {
  try {
    const checkin = await WellnessCheckin.findOne({
      user: req.user.id,
      date: startOfDay(),
    });
    res.json(checkin || null);
  } catch (err) {
    console.error('Error fetching today\'s check-in:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -------------------- CHECK-IN: HISTORY -------------------- */
router.get('/checkin', async (req, res) => {
  try {
    const checkins = await WellnessCheckin.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(30);
    res.json(checkins);
  } catch (err) {
    console.error('Error fetching check-in history:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -------------------- WORKOUT ADJUSTMENT RECOMMENDATION -------------------- */
router.get('/recommendation', async (req, res) => {
  try {
    const checkin = await WellnessCheckin.findOne({
      user: req.user.id,
      date: startOfDay(),
    });
    const adjustment = getWorkoutAdjustment(checkin);
    res.json(adjustment);
  } catch (err) {
    console.error('Error building recommendation:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -------------------- SUPPORTIVE MISSED-WORKOUT MESSAGE -------------------- */
router.get('/missed-workout-message', (_req, res) => {
  res.json({ message: getMissedWorkoutMessage() });
});

module.exports = router;
