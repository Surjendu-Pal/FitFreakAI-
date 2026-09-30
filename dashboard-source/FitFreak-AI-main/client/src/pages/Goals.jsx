// pages/Goals.jsx
import { useState, useEffect } from "react";
import axios from "../api/axiosInstance";
import { useAuth } from "../context/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { FaPen, FaEye, FaRotate, FaTrashCan, FaPlus, FaArrowLeft } from "react-icons/fa6";
import GoalCoach from "../component/GoalCoach";
import CommandHub from "../component/CommandHub";
import { goalTypeMap, goalMeta, paceMap } from "../utils/goalOptions";
import {
  plansForGoal,
  planProgress,
  currentPlanForGoal,
  todayDayNumber,
} from "../utils/planToday";
import "./Goals.css";

const isValidNumber = (v) => v !== null && v !== undefined && v !== "" && Number(v) > 0;

export default function Goals() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [goals, setGoals] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [loadError, setLoadError] = useState("");
  // "hub" (Command Hub landing) | "coach" (conversational goal flow)
  // | "goals" (goal summary cards) | "adjust" (editing a goal)
  const [view, setView] = useState("hub");
  const [seedPrompt, setSeedPrompt] = useState("");
  const [adjustingGoal, setAdjustingGoal] = useState(null);
  // { goalId, phase: "confirm" | "working" | "done" | "error" }
  const [regen, setRegen] = useState(null);

  // Clicking the Goals tab always returns to the Command Hub, even if this
  // page is already mounted (a same-URL navigation still gets a new key).
  useEffect(() => {
    setView("hub");
    setSeedPrompt("");
  }, [location.key]);

  useEffect(() => {
    async function fetchGoals() {
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [goalsRes, plansRes] = await Promise.all([
          axios.get("/goals", { headers }),
          // plans only enrich the summary card; never block the page on them
          axios.get("/plan", { headers }).catch(() => ({ data: [] })),
        ]);
        setGoals(goalsRes.data);
        setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
      } catch (err) {
        console.error("Error fetching goals:", err);
        setLoadError("Could not load your goals. Check your connection and try again.");
      } finally {
        setLoadingGoals(false);
      }
    }
    if (token) fetchGoals();
  }, [token]);

  // ✅ Reuses the exact existing goal + plan creation endpoints/logic.
  async function createGoal(payload) {
    const res = await axios.post("/goals", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const createdGoal = res.data;
    setGoals((prev) => [...prev, createdGoal]);

    try {
      const planRes = await axios.post(
        "/plan",
        { goalId: createdGoal._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlans((prev) => [...prev, planRes.data]);
    } catch (planError) {
      console.error("⚠️ Error creating plan automatically:", planError);
    }
    return createdGoal;
  }

  // ✅ Reuses the existing update-goal endpoint (no new backend logic).
  async function updateGoal(id, payload) {
    const res = await axios.put(`/goals/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const updatedGoal = res.data;
    setGoals((prev) => prev.map((g) => (g._id === id ? updatedGoal : g)));
    return updatedGoal;
  }

  async function handleDelete(id) {
    try {
      await axios.delete(`/goals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const remaining = goals.filter((g) => g._id !== id);
      setGoals(remaining);
      if (!remaining.length) setView("hub");
    } catch (err) {
      console.error("Error deleting goal:", err);
    }
  }

  const progressFor = (goalId) => planProgress(plans, goalId);

  // Command Hub: today's plan for a goal. Reads the existing plan when one
  // covers today; otherwise asks the existing plan generator for a new one.
  async function ensureTodayPlan(goal) {
    const found = currentPlanForGoal(plans, goal._id);
    if (found) return { ...found, created: false };
    const res = await axios.post(
      "/plan",
      { goalId: goal._id },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const plan = res.data;
    setPlans((prev) => [...prev, plan]);
    const day = todayDayNumber(plan) || 1;
    return {
      plan,
      day,
      dayPlan: (plan.dailyPlans || []).find((d) => d.day === day) || null,
      created: true,
    };
  }

  // Regenerate = create the new plan first, then remove the old one(s), so a
  // failure never leaves the user without a plan. Uses existing plan endpoints.
  async function regeneratePlan(goal) {
    const headers = { Authorization: `Bearer ${token}` };
    const oldPlans = plansForGoal(plans, goal._id);
    setRegen({ goalId: goal._id, phase: "working" });
    try {
      const created = await axios.post("/plan", { goalId: goal._id }, { headers });
      await Promise.allSettled(oldPlans.map((p) => axios.delete(`/plan/${p._id}`, { headers })));
      const oldIds = new Set(oldPlans.map((p) => p._id));
      setPlans((prev) => [...prev.filter((p) => !oldIds.has(p._id)), created.data]);
      setRegen({ goalId: goal._id, phase: "done" });
    } catch (err) {
      console.error("Error regenerating plan:", err);
      setRegen({ goalId: goal._id, phase: "error" });
    }
  }

  function goToPlan() {
    navigate("/plans");
  }

  if (loadingGoals) {
    return (
      <div className="goals-container">
        <div className="goal-coach-loading">
          <span className="ai-status-pill">
            <span className="ai-status-dot" />
            FitFreak AI Engine Active
          </span>
          <p>Waking up FitFreak AI…</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="goals-container">
        <div className="empty-state">
          <h2>Something went wrong</h2>
          <p>{loadError}</p>
        </div>
      </div>
    );
  }

  const hasCurrent = isValidNumber(user?.currentWeight);

  return (
    <div className="goals-container">
      <div className="goals-view" key={view}>
      {view === "hub" && (
        <CommandHub
          user={user}
          goals={goals}
          plans={plans}
          onOpenCoach={(text) => {
            setSeedPrompt(text || "");
            setView("coach");
          }}
          onOpenGoals={() => setView("goals")}
          onEnsureTodayPlan={ensureTodayPlan}
        />
      )}

      {view === "goals" && (
        <div className="goals-returning">
          <button type="button" className="goals-back" onClick={() => setView("hub")}>
            <FaArrowLeft /> Command Hub
          </button>
          <header className="goals-returning-header">
            <span className="ai-status-pill">
              <span className="ai-status-dot" />
              FitFreak AI Engine Active
            </span>
            <h1 className="goals-welcome">Welcome back, {user?.name ? String(user.name).trim().split(/\s+/)[0] : "there"} 👋</h1>
            <p className="goals-returning-sub">Here's what we're working toward.</p>
          </header>

          {goals.map((goal) => {
            const meta = goalMeta[goal.type];
            const progress = progressFor(goal._id);
            const toGo =
              hasCurrent && isValidNumber(goal.targetWeight)
                ? Math.abs(Number(goal.targetWeight) - Number(user.currentWeight))
                : null;
            const regenState = regen?.goalId === goal._id ? regen.phase : null;

            return (
              <article className="goal-summary" key={goal._id}>
                <div className="goal-summary-top">
                  <span
                    className="goal-summary-icon"
                    style={meta ? { "--g1": meta.g1, "--g2": meta.g2 } : undefined}
                  >
                    {meta ? <meta.Icon /> : null}
                  </span>
                  <div className="goal-summary-title">
                    <small>Current goal</small>
                    <h2>{goalTypeMap[goal.type] || goal.type}</h2>
                  </div>
                  <span className="goal-status-chip">Active</span>
                </div>

                <div className="goal-progress">
                  <div className="goal-progress-label">
                    <span>Plan progress</span>
                    <strong>{progress ? `${progress.pct}%` : "—"}</strong>
                  </div>
                  <div
                    className="goal-progress-track"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress ? progress.pct : 0}
                  >
                    <div
                      className="goal-progress-fill"
                      style={{ width: `${progress ? Math.max(progress.pct, 3) : 0}%` }}
                    />
                  </div>
                  <p className="goal-progress-note">
                    {progress
                      ? `${progress.done} of ${progress.total} workouts & meals completed this week`
                      : "No plan generated yet — regenerate to build one."}
                  </p>
                </div>

                <div className="metric-pills goal-metrics">
                  <span className="metric-pill"><em>Target</em>{goal.targetWeight} kg</span>
                  {hasCurrent && <span className="metric-pill"><em>Current</em>{user.currentWeight} kg</span>}
                  {toGo !== null && <span className="metric-pill"><em>To go</em>{toGo.toFixed(1)} kg</span>}
                  <span className="metric-pill"><em>Pace</em>{paceMap[goal.pace] || goal.pace}</span>
                  <span className="metric-pill">
                    <em>Calories</em>
                    {goal.dailyCalories ? `${goal.dailyCalories} kcal` : "Flexible"}
                  </span>
                </div>

                <div className="goal-chips">
                  <button
                    type="button"
                    className="goal-chip"
                    onClick={() => {
                      setAdjustingGoal(goal);
                      setView("adjust");
                    }}
                  >
                    <FaPen /> Edit Goal
                  </button>
                  <button type="button" className="goal-chip goal-chip-primary" onClick={goToPlan}>
                    <FaEye /> View AI Plan
                  </button>
                  <button
                    type="button"
                    className="goal-chip"
                    disabled={regenState === "working"}
                    onClick={() => setRegen({ goalId: goal._id, phase: "confirm" })}
                  >
                    <FaRotate className={regenState === "working" ? "spin" : undefined} />{" "}
                    {regenState === "working" ? "Regenerating…" : "Regenerate Plan"}
                  </button>
                  <button
                    type="button"
                    className="goal-chip goal-chip-danger"
                    onClick={() => handleDelete(goal._id)}
                  >
                    <FaTrashCan /> Delete
                  </button>
                </div>

                {regenState === "confirm" && (
                  <div className="goal-regen-confirm" role="alert">
                    <p>Replace your current plan with a fresh one? Progress on the old plan will reset.</p>
                    <div>
                      <button type="button" className="goal-chip goal-chip-primary" onClick={() => regeneratePlan(goal)}>
                        Yes, regenerate
                      </button>
                      <button type="button" className="goal-chip" onClick={() => setRegen(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {regenState === "done" && <p className="goal-regen-note ok">New plan ready ✓</p>}
                {regenState === "error" && (
                  <p className="goal-regen-note bad">Couldn't regenerate the plan. Please try again.</p>
                )}
              </article>
            );
          })}

          <button
            className="add-goal-btn"
            onClick={() => {
              setSeedPrompt("");
              setView("coach");
            }}
          >
            <FaPlus /> Add another goal
          </button>
        </div>
      )}

      {view === "coach" && (
        <GoalCoach
          mode="onboarding"
          name={user?.name}
          currentWeight={user?.currentWeight}
          initialPrompt={seedPrompt}
          autoFocusPrompt
          onSubmitCreate={createGoal}
          onCancel={() => setView("hub")}
          onViewPlan={goToPlan}
        />
      )}

      {view === "adjust" && adjustingGoal && (
        <GoalCoach
          mode="adjust"
          name={user?.name}
          currentWeight={user?.currentWeight}
          initialGoal={adjustingGoal}
          onSubmitUpdate={updateGoal}
          onCancel={() => setView("goals")}
          onViewPlan={goToPlan}
        />
      )}
      </div>
    </div>
  );
}
