// utils/planToday.js
// Read-only helpers over the existing Plan documents (GET /api/plan).
// No API calls and no new data model - they only interpret what the
// plan generator already stores.

const DAY_MS = 86400000;
const localMidnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const goalIdOf = (plan) => String(plan?.goal?._id || plan?.goal);

export const plansForGoal = (plans, goalId) =>
  plans.filter((p) => goalIdOf(p) === String(goalId));

// Which day (1..N) of this plan is today? null if the plan week hasn't
// started or has already ended.
export function todayDayNumber(plan, now = new Date()) {
  const start = new Date(plan?.startDate || plan?.createdAt);
  if (Number.isNaN(start.getTime())) return null;
  const n = Math.round((localMidnight(now) - localMidnight(start)) / DAY_MS) + 1;
  const max = plan?.dailyPlans?.length || 7;
  return n >= 1 && n <= max ? n : null;
}

// Most recent plan for this goal whose week includes today.
export function currentPlanForGoal(plans, goalId) {
  const list = plansForGoal(plans, goalId);
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const day = todayDayNumber(list[i]);
    if (day) {
      return {
        plan: list[i],
        day,
        dayPlan: (list[i].dailyPlans || []).find((d) => d.day === day) || null,
      };
    }
  }
  return null;
}

// Completion of the latest plan for a goal: done exercises + taken meals over
// everything scheduled. null when the goal has no plan.
export function planProgress(plans, goalId) {
  const list = plansForGoal(plans, goalId);
  if (!list.length) return null;
  const plan = list[list.length - 1];
  let total = 0;
  let done = 0;
  (plan.dailyPlans || []).forEach((day) => {
    (day.exercises || []).forEach((e) => {
      total += 1;
      if (e.done) done += 1;
    });
    (day.meals || []).forEach((m) => {
      total += 1;
      if (m.taken) done += 1;
    });
  });
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}
