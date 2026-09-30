// utils/wellnessRecommendation.js
// Simple, supportive rule-based workout adjustment.
// This is NOT medical advice or diagnosis — just a friendly nudge based on
// how the user says they feel today.

function getWorkoutAdjustment(checkin) {
  if (!checkin) {
    return {
      type: 'no_checkin',
      title: "No check-in yet today",
      message:
        "Do a quick daily check-in and we'll tailor today's workout to how you're feeling.",
    };
  }

  const { energy, cramps, discomfort, workoutComfort } = checkin;

  const severeSymptoms = cramps === 'severe' || discomfort === 'severe';
  const moderateSymptoms = cramps === 'moderate' || discomfort === 'moderate';
  const mildSymptoms = cramps === 'mild' || discomfort === 'mild';
  const notComfortable = workoutComfort === 'not_comfortable';

  if (severeSymptoms) {
    return {
      type: 'consult_professional',
      title: 'Take it easy today',
      message:
        "Your symptoms sound tough today. It's completely fine to rest. If severe cramps or discomfort keep happening, it's worth checking in with a healthcare professional.",
    };
  }

  if (moderateSymptoms || notComfortable) {
    return {
      type: 'gentle_mobility',
      title: 'Gentle movement today',
      message:
        "Let's keep today light — some gentle stretching or a short mobility session is a great option. Skipping the intense stuff today is completely okay.",
    };
  }

  if (mildSymptoms) {
    return {
      type: 'lighter_option',
      title: 'A lighter version works great',
      message:
        "Feeling a bit off today? A shorter, easier version of your workout (or some stretching) is a perfectly good choice.",
    };
  }

  if (energy === 'low') {
    return {
      type: 'lighter_option',
      title: 'Shorter workout today',
      message:
        "Your energy is a little low today. Let's keep it lighter — a shorter, lower-intensity workout is perfectly fine.",
    };
  }

  if (energy === 'high' && workoutComfort === 'comfortable') {
    return {
      type: 'advanced_option',
      title: "You're feeling great!",
      message:
        "You're feeling strong today! Stick with your planned workout, or go for the advanced option if you're up for it.",
    };
  }

  return {
    type: 'continue_plan',
    title: 'Business as usual',
    message: "You're feeling good today — continue with your regular planned workout.",
  };
}

// Supportive (never punishing) message for a missed workout day.
function getMissedWorkoutMessage() {
  const messages = [
    "Missing a day happens — your streak isn't the point, showing up for yourself is. Ready when you are.",
    "No guilt here. Rest is part of progress too. Come back whenever you're ready.",
    "One missed workout doesn't undo your progress. Be kind to yourself and pick back up today.",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

module.exports = { getWorkoutAdjustment, getMissedWorkoutMessage };
