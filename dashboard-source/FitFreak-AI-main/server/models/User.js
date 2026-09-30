const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    age: { type: Number, min: 10, max: 100 },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    height: { type: Number }, 
    currentWeight: { type: Number }, 
    targetWeight: { type: Number }, 
    fitnessGoal: { 
      type: String,
      enum: ['lose_weight', 'gain_weight', 'maintain', 'build_muscle', 'endurance']
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      default: 'moderate'
    },
    profilePic: { type: String, default: '' },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

/* ---------------------- VIRTUAL FIELDS ---------------------- */

// BMI
userSchema.virtual('bmi').get(function () {
  if (!this.height || !this.currentWeight) return null;
  const heightInMeters = this.height / 100;
  return (this.currentWeight / (heightInMeters * heightInMeters)).toFixed(2);
});

// BMI Category
userSchema.virtual('bmiCategory').get(function () {
  const bmi = this.bmi;
  if (!bmi) return null;
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 24.9) return 'Normal weight';
  if (bmi < 29.9) return 'Overweight';
  return 'Obese';
});

// TDEE
userSchema.virtual('tdee').get(function () {
  if (!this.height || !this.currentWeight || !this.age || !this.gender) return null;

  // BMR
  let bmr;
  if (this.gender === 'male') {
    bmr = 10 * this.currentWeight + 6.25 * this.height - 5 * this.age + 5;
  } else {
    bmr = 10 * this.currentWeight + 6.25 * this.height - 5 * this.age - 161;
  }

  // Activity multiplier
  const activityMap = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const multiplier = activityMap[this.activityLevel] || 1.55; // default moderate
  return Math.round(bmr * multiplier);
});

// Ensure virtuals show in JSON
userSchema.set('toJSON', {
  virtuals: true,
  transform: (_document, result) => {
    delete result.password;
    return result;
  },
});
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
