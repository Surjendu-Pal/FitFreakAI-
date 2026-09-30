const calculateDurationWeeks = (currentWeight, targetWeight, pace) => {
  // Ensure absolute difference (works for weight loss or gain)
  const weightDifference = Math.abs(targetWeight - currentWeight);

  // Define pace rates (kg per week)
  const paceRates = {
    fast: 1,      // 1 kg/week
    normal: 0.5,  // 0.5 kg/week
    slow: 0.25,   // 0.25 kg/week
  };

  // Fallback to 'normal' if pace is invalid
  const rate = paceRates[pace] || paceRates.normal;

  // Calculate duration in weeks, round up
  const durationWeeks = Math.ceil(weightDifference / rate);

  return durationWeeks;
};

module.exports = calculateDurationWeeks;
