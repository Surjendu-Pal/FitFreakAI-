// utils/goalOptions.js
// Single source of truth for goal/pace copy so the conversational coach and
// the goal list render the same labels as the existing Goal schema enums.
import {
  FaDumbbell,
  FaFire,
  FaChartLine,
  FaPersonRunning,
  FaScaleBalanced,
  FaLeaf,
  FaCompass,
  FaBolt,
  FaBullseye,
  FaWater,
} from "react-icons/fa6";

export const GOAL_TYPES = [
  {
    value: "build_muscle",
    label: "Build Muscle",
    emoji: "💪",
    desc: "Add lean mass with structured strength work",
    Icon: FaDumbbell,
    g1: "#7d2eff",
    g2: "#c084fc",
  },
  {
    value: "lose_weight",
    label: "Lose Weight",
    emoji: "🔥",
    desc: "Burn fat with a sustainable deficit",
    Icon: FaFire,
    g1: "#ff6b35",
    g2: "#ff3d81",
  },
  {
    value: "gain_weight",
    label: "Gain Weight",
    emoji: "📈",
    desc: "Build size with a clean calorie surplus",
    Icon: FaChartLine,
    g1: "#22d3ee",
    g2: "#6366f1",
  },
  {
    value: "endurance",
    label: "Build Endurance",
    emoji: "🏃",
    desc: "Boost stamina and cardio capacity",
    Icon: FaPersonRunning,
    g1: "#34d399",
    g2: "#06b6d4",
  },
  {
    value: "maintain",
    label: "Maintain Fitness",
    emoji: "⚖️",
    desc: "Stay consistent and keep what you've built",
    Icon: FaScaleBalanced,
    g1: "#a78bfa",
    g2: "#f0abfc",
  },
];

export const goalTypeMap = Object.fromEntries(
  GOAL_TYPES.map((g) => [g.value, g.label])
);

export const goalMeta = Object.fromEntries(GOAL_TYPES.map((g) => [g.value, g]));

export const PACE_OPTIONS = [
  {
    value: "slow",
    label: "Relaxed",
    hint: "Steady, low-pressure progress",
    Icon: FaLeaf,
    g1: "#34d399",
    g2: "#22d3ee",
  },
  {
    value: "normal",
    label: "Normal",
    hint: "A balanced, sustainable pace",
    Icon: FaCompass,
    g1: "#a78bfa",
    g2: "#7d2eff",
  },
  {
    value: "fast",
    label: "Faster",
    hint: "More intensity, quicker results",
    Icon: FaBolt,
    g1: "#fbbf24",
    g2: "#f97316",
  },
];

export const paceMap = Object.fromEntries(
  PACE_OPTIONS.map((p) => [p.value, p.label])
);

export const CALORIE_OPTIONS = [
  {
    value: "set",
    label: "I'll set one",
    hint: "Lock in a daily calorie target",
    Icon: FaBullseye,
    g1: "#7d2eff",
    g2: "#e879f9",
  },
  {
    value: "flexible",
    label: "Keep it flexible",
    hint: "Let FitFreak estimate it for now",
    Icon: FaWater,
    g1: "#22d3ee",
    g2: "#6366f1",
  },
];

// Lightweight keyword classifier so a user can type their goal in free text
// instead of only tapping a card. Falls back to "maintain" when unclear -
// there is no AI service wired up for this yet, so this keeps the flow
// working without inventing a new backend dependency.
export function classifyGoalText(text) {
  const normalized = (text || "").toLowerCase();
  if (/muscle|strength|bulk|tone|lean/.test(normalized)) return "build_muscle";
  if (/lose|fat|slim|cut|shed/.test(normalized)) return "lose_weight";
  if (/gain|bulk up|mass|weight gain/.test(normalized)) return "gain_weight";
  if (/endur|stamina|run|marathon|cardio|cycle/.test(normalized)) return "endurance";
  if (/maintain|stay fit|keep|balance/.test(normalized)) return "maintain";
  return null;
}

export function goalEncouragement(type) {
  switch (type) {
    case "build_muscle":
      return "Great. 💪 Let's make that specific to you.";
    case "lose_weight":
      return "Got it. 🔥 Let's shape a plan that fits you.";
    case "gain_weight":
      return "Nice. 📈 Let's build that up the right way.";
    case "endurance":
      return "Love it. 🏃 Let's build your stamina step by step.";
    case "maintain":
      return "Sounds good. ⚖️ Let's keep you steady and consistent.";
    default:
      return "Got it. Let's make that specific to you.";
  }
}
