// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware'); // optional, for protected routes

const { getJWTSecret } = require('../config/auth');

/* -------------------- REGISTER USER -------------------- */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, age, gender, height, currentWeight, activityLevel } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    user = new User({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      height,
      currentWeight,
      activityLevel,
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, getJWTSecret(), { expiresIn: '7d' });

    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -------------------- LOGIN USER -------------------- */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate token
    const token = jwt.sign({ id: user._id }, getJWTSecret(), { expiresIn: '7d' });

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -------------------- GET USER PROFILE -------------------- */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user); // includes virtuals like BMI, TDEE
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -------------------- UPDATE USER PROFILE -------------------- */
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* -------------------- ADD FRIEND -------------------- */
router.post('/add-friend/:friendId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const friendId = req.params.friendId;

    if (!user.friends.includes(friendId)) {
      user.friends.push(friendId);
      await user.save();
    }

    res.json({ message: 'Friend added', friends: user.friends });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
