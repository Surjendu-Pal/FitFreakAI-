const Plan = require('../models/Plan');
const calculateDurationWeeks = require('./durationCalculator');
const calculateTDEE = require('./tdeeCalculator'); // your TDEE util

async function generatePlanForGoal(user, goal) {
  const durationWeeks = calculateDurationWeeks(user.currentWeight, goal.targetWeight, goal.pace);

  // Macro ratios per goal type
  const macroRatios = {
    lose_weight: { protein: 0.3, carbs: 0.4, fats: 0.3 },
    gain_weight: { protein: 0.25, carbs: 0.5, fats: 0.25 },
    maintain: { protein: 0.25, carbs: 0.5, fats: 0.25 },
    build_muscle: { protein: 0.35, carbs: 0.4, fats: 0.25 },
    endurance: { protein: 0.2, carbs: 0.6, fats: 0.2 },
  };

  // Calculate daily calories
  const tdee = calculateTDEE(user); 
  let dailyCalories;
  if (goal.type === 'lose_weight') dailyCalories = tdee - 500;
  else if (goal.type === 'gain_weight') dailyCalories = tdee + 500;
  else dailyCalories = tdee;

  const macros = macroRatios[goal.type];

  // Generate daily plans
  const dailyPlans = [];
  for (let week = 1; week <= durationWeeks; week++) {
    for (let day = 1; day <= 7; day++) {
      dailyPlans.push({
        day,
        calories: dailyCalories,
        macros: {
          protein: Math.round(dailyCalories * macros.protein / 4), 
          carbs: Math.round(dailyCalories * macros.carbs / 4),     
          fats: Math.round(dailyCalories * macros.fats / 9),       
        },
        exercises: [], 
        meals: [],     
      });
    }
  }


  const plan = new Plan({
    user: user._id,
    goal: goal._id,
    weekNumber: 1, 
    dailyPlans,
  });

  await plan.save();
  return plan;
}

module.exports = generatePlanForGoal;
