// component/CommandHub.jsx
// Landing screen for Goals: greeting, live AI-engine status, prompt bar,
// quick actions and launch cards. Presentational + routing only - plan data
// and generation are supplied by the Goals page through props.
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaWandMagicSparkles,
  FaPaperPlane,
  FaVideo,
  FaDumbbell,
  FaAppleWhole,
  FaChartSimple,
  FaArrowRight,
  FaXmark,
  FaCheck,
} from "react-icons/fa6";
import { getChat } from "../api/chatApi";
import { useAuth } from "../context/useAuth";
import { goalTypeMap } from "../utils/goalOptions";
import { planProgress } from "../utils/planToday";
import { HUB_ROUTES } from "../utils/hubConfig";
import "./CommandHub.css";

const dash = (v) => (v === null || v === undefined || v === "" ? "--" : v);

function greetingFor(date) {
  const h = date.getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  return "Good evening";
}

function ProgressRing({ pct }) {
  const r = 14;
  const c = 2 * Math.PI * r;
  return (
    <svg className="hub-ring" viewBox="0 0 36 36" aria-hidden="true">
      <circle cx="18" cy="18" r={r} className="hub-ring-track" />
      <circle
        cx="18"
        cy="18"
        r={r}
        className="hub-ring-fill"
        strokeDasharray={c}
        strokeDashoffset={c - (c * pct) / 100}
      />
    </svg>
  );
}

export default function CommandHub({ user, goals, plans, onOpenCoach, onOpenGoals, onEnsureTodayPlan }) {
  const navigate = useNavigate();
  const { token } = useAuth();

  const now = new Date();
  const firstName = user?.name ? String(user.name).trim().split(/\s+/)[0] : "";
  const dateLabel = now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  const activeGoal = goals.length ? goals[goals.length - 1] : null;
  const progress = activeGoal ? planProgress(plans, activeGoal._id) : null;

  const [engine, setEngine] = useState("checking"); // checking | ai | guide | offline
  const [prompt, setPrompt] = useState("");
  const [leaving, setLeaving] = useState(false);
  const [panel, setPanel] = useState(null); // { type, status, ... }
  const timer = useRef(null);

  // Real engine status: the chat service reports whether it is running on the
  // OpenAI-backed "ai" mode or its built-in "guide" mode.
  useEffect(() => {
    const controller = new AbortController();
    getChat(token, controller.signal)
      .then((data) => setEngine(data?.mode === "ai" ? "ai" : "guide"))
      .catch(() => {
        if (!controller.signal.aborted) setEngine("offline");
      });
    return () => controller.abort();
  }, [token]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const engineLabel = {
    checking: "Connecting…",
    ai: "AI connected",
    guide: "Guide mode online",
    offline: "Offline",
  }[engine];

  // Morph into the conversational flow (short exit animation first).
  function enterConversation(text = "") {
    if (leaving) return;
    setLeaving(true);
    timer.current = setTimeout(() => onOpenCoach(text.trim()), 220);
  }

  function submitPrompt(e) {
    e.preventDefault();
    enterConversation(prompt);
  }

  async function runAction(type) {
    if (!activeGoal) {
      setPanel({ type, status: "needs-goal" });
      return;
    }
    setPanel({ type, status: "loading" });
    try {
      const result = await onEnsureTodayPlan(activeGoal);
      setPanel({ type, status: "ready", goal: activeGoal, ...result });
    } catch (err) {
      console.error("Error preparing today's plan:", err);
      setPanel({ type, status: "error" });
    }
  }

  function openPlans(state) {
    navigate(HUB_ROUTES.workout, { state });
  }

  function startWorkout() {
    if (!activeGoal) return enterConversation();
    openPlans({ openToday: true });
  }

  function logNutrition() {
    if (!activeGoal) return enterConversation();
    navigate(HUB_ROUTES.nutrition, { state: { openToday: true, focus: "meals" } });
  }

  /* ---------- result panel ---------- */
  function renderPanel() {
    if (!panel) return null;
    const isWorkout = panel.type === "workout";
    const title = isWorkout ? "Today's workout" : "Today's meals";

    let body;
    if (panel.status === "needs-goal") {
      body = (
        <>
          <p className="hub-panel-text">
            I need a goal first so I can build {isWorkout ? "your workout" : "your meals"} around you.
          </p>
          <button type="button" className="hub-panel-btn" onClick={() => enterConversation()}>
            Set my goal <FaArrowRight />
          </button>
        </>
      );
    } else if (panel.status === "loading") {
      body = (
        <div className="hub-panel-loading" aria-live="polite">
          <span className="hub-skel" />
          <span className="hub-skel short" />
          <span className="hub-skel" />
        </div>
      );
    } else if (panel.status === "error") {
      body = (
        <>
          <p className="hub-panel-text">I couldn't reach your plan just now.</p>
          <button type="button" className="hub-panel-btn" onClick={() => runAction(panel.type)}>
            Try again
          </button>
        </>
      );
    } else {
      const { dayPlan, day, goal, created } = panel;
      const exercises = dayPlan?.exercises || [];
      const meals = dayPlan?.meals || [];
      body = (
        <>
          <p className="hub-panel-meta">
            Day {dash(day)} · {goalTypeMap[goal?.type] || "Your plan"}
            {created && <span className="hub-panel-new">New plan generated</span>}
          </p>

          {isWorkout ? (
            exercises.length ? (
              <ul className="hub-list">
                {exercises.map((ex) => (
                  <li key={ex._id || ex.name}>
                    <span className={`hub-check${ex.done ? " on" : ""}`}>{ex.done && <FaCheck />}</span>
                    <span className="hub-list-name">{ex.name}</span>
                    <span className="hub-list-detail">
                      {ex.sets && ex.reps ? `${ex.sets} × ${ex.reps}` : ex.durationMinutes ? `${ex.durationMinutes} min` : "--"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="hub-panel-text">Recovery day 🛌 — rest up, stretch and stay hydrated.</p>
            )
          ) : (
            <>
              <div className="metric-pills hub-macros">
                <span className="metric-pill"><em>Calories</em>{dash(dayPlan?.calories)} kcal</span>
                <span className="metric-pill"><em>Protein</em>{dash(dayPlan?.macros?.protein)} g</span>
                <span className="metric-pill"><em>Carbs</em>{dash(dayPlan?.macros?.carbs)} g</span>
                <span className="metric-pill"><em>Fats</em>{dash(dayPlan?.macros?.fats)} g</span>
              </div>
              {meals.length ? (
                <ul className="hub-list">
                  {meals.map((m) => (
                    <li key={m._id || m.name}>
                      <span className={`hub-check${m.taken ? " on" : ""}`}>{m.taken && <FaCheck />}</span>
                      <span className="hub-list-name">{m.name}</span>
                      <span className="hub-list-detail">
                        {dash(m.calories)} kcal · P{dash(m.protein)} C{dash(m.carbs)} F{dash(m.fats)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="hub-panel-text">No meals scheduled for today.</p>
              )}
            </>
          )}

          <button
            type="button"
            className="hub-panel-btn"
            onClick={() => openPlans({ openToday: true, ...(isWorkout ? {} : { focus: "meals" }) })}
          >
            {isWorkout ? "Open in Plans" : "Log meals in Plans"} <FaArrowRight />
          </button>
        </>
      );
    }

    return (
      <section className="hub-panel" aria-label={title}>
        <header>
          <h2>{title}</h2>
          <button type="button" className="hub-panel-close" aria-label="Close" onClick={() => setPanel(null)}>
            <FaXmark />
          </button>
        </header>
        {body}
      </section>
    );
  }

  return (
    <div className={`hub${leaving ? " is-leaving" : ""}`}>
      <div className="hub-top">
        <div className="hub-heading">
          <span className="hub-date">{dateLabel}</span>
          <h1 className="hub-title">
            {greetingFor(now)}
            {firstName ? (
              <>
                ,<br />
                <span className="hub-name">{firstName}.</span>
              </>
            ) : (
              "."
            )}
          </h1>
          <p className="hub-sub">Stay consistent. A healthier you is in progress.</p>

          {activeGoal && (
            <button type="button" className="hub-progress-chip" onClick={onOpenGoals}>
              {progress && <ProgressRing pct={progress.pct} />}
              <span className="hub-progress-copy">
                <strong>{goalTypeMap[activeGoal.type] || "Your goal"}</strong>
                <small>{progress ? `${progress.pct}% of this week's plan` : "No plan generated yet"}</small>
              </span>
              <FaArrowRight className="hub-progress-arrow" />
            </button>
          )}
        </div>

        <div className={`hub-badge is-${engine}`} role="status">
          <span className="hub-badge-dot" />
          <span className="hub-badge-copy">
            <small>FitFreak AI</small>
            <strong>{engineLabel}</strong>
          </span>
        </div>
      </div>

      <form className="hub-prompt" onSubmit={submitPrompt} onClick={() => enterConversation(prompt)}>
        <FaWandMagicSparkles className="hub-prompt-icon" />
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask FitFreak AI..."
          aria-label="Ask FitFreak AI"
          autoComplete="off"
        />
        <button type="submit" className="hub-send" aria-label="Start conversation">
          <FaPaperPlane />
        </button>
      </form>

      <div className="hub-chips">
        {HUB_ROUTES.poseDetection && (
          <button type="button" className="hub-chip" onClick={() => navigate(HUB_ROUTES.poseDetection)}>
            <FaVideo /> Analyze my squat form
          </button>
        )}
        <button
          type="button"
          className={`hub-chip${panel?.type === "workout" ? " is-active" : ""}`}
          onClick={() => runAction("workout")}
        >
          <FaDumbbell /> Create today's workout
        </button>
        <button
          type="button"
          className={`hub-chip${panel?.type === "meals" ? " is-active" : ""}`}
          onClick={() => runAction("meals")}
        >
          <FaAppleWhole /> Suggest a meal plan
        </button>
      </div>

      {renderPanel()}

      <div className="hub-cards">
        <button type="button" className="hub-card hub-card-violet" onClick={startWorkout}>
          <span className="hub-card-icon"><FaDumbbell /></span>
          <span className="hub-card-copy">
            <strong>Start Workout</strong>
            <small>Choose a workout or generate with AI</small>
          </span>
          <span className="hub-card-arrow"><FaArrowRight /></span>
        </button>

        <button type="button" className="hub-card hub-card-green" onClick={() => navigate(HUB_ROUTES.progress)}>
          <span className="hub-card-icon"><FaChartSimple /></span>
          <span className="hub-card-copy">
            <strong>View Progress</strong>
            <small>Track your journey, streaks &amp; coins</small>
          </span>
          <span className="hub-card-arrow"><FaArrowRight /></span>
        </button>

        <button type="button" className="hub-card hub-card-amber" onClick={logNutrition}>
          <span className="hub-card-icon"><FaAppleWhole /></span>
          <span className="hub-card-copy">
            <strong>Log Nutrition</strong>
            <small>Track your meals &amp; personalized macros</small>
          </span>
          <span className="hub-card-arrow"><FaArrowRight /></span>
        </button>
      </div>
    </div>
  );
}
