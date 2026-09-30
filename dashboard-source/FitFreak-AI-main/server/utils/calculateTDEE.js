const calculateTDEE = (user) => {
  const { weight, height, age, gender, activityLevel } = user;

  if (!weight || !height || !age || !gender) {
    throw new Error('Missing required user data for TDEE calculation');
  }

  // 1️⃣ Calculate BMR
  let bmr;
  if (gender.toLowerCase() === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // 2️⃣ Activity multiplier
  const activityFactors = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  const factor = activityFactors[activityLevel] || 1.2; // default sedentary

  // 3️⃣ TDEE
  const tdee = Math.round(bmr * factor);
  return tdee;
};

module.exports = calculateTDEE;
