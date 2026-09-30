// component/GoalCoach.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { FaArrowUp, FaXmark, FaCheck } from "react-icons/fa6";
import AiOrb from "./AiOrb";
import {
  GOAL_TYPES,
  PACE_OPTIONS,
  CALORIE_OPTIONS,
  goalTypeMap,
  goalMeta,
  paceMap,
  classifyGoalText,
  goalEncouragement,
} from "../utils/goalOptions";
import "./GoalCoach.css";

const UNMATCHED_GOAL_REPLY =
  "I couldn't match that to a goal yet. Pick the closest one below and we'll fine-tune it together.";

let turnId = 0;
const nextTurnId = () => `turn-${++turnId}`;

/* ---------- small presentational helpers (no data logic) ---------- */

// Tiny inline-markdown renderer: **bold** only. Keeps AI copy expressive
// without pulling in a markdown dependency.
function Inline({ text }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part
  );
}

// Merge consecutive AI lines into one "message turn" so the orb + panel
// render once per turn instead of once per sentence.
function groupTurns(transcript) {
  const groups = [];
  transcript.forEach((t) => {
    const last = groups[groups.length - 1];
    if (last && last.speaker === "ai" && t.speaker === "ai") {
      last.lines.push(t);
    } else {
      groups.push({ id: t.id, speaker: t.speaker, lines: [t] });
    }
  });
  return groups;
}

function PromptCards({ options, onPick }) {
  return (
    <div className={`prompt-cards prompt-cards-${options.length}`}>
      {options.map((o, i) => (
        <button
          key={o.value}
          type="button"
          className="prompt-card"
          style={{ "--g1": o.g1, "--g2": o.g2, animationDelay: `${i * 60}ms` }}
          onClick={() => onPick(o.value)}
        >
          <span className="prompt-card-icon">
            <o.Icon />
          </span>
          <span className="prompt-card-text">
            <strong>{o.label}</strong>
            <small>{o.desc || o.hint}</small>
          </span>
        </button>
      ))}
    </div>
  );
}

function PromptBar({
  value,
  onChange,
  onSubmit,
  placeholder,
  type = "text",
  unit,
  disabled = false,
  allowEmpty = false,
  autoFocus = false,
}) {
  const canSend = !disabled && (allowEmpty || String(value).trim() !== "");
  return (
    <form
      className={`prompt-bar${disabled ? " is-disabled" : ""}`}
      onSubmit={onSubmit}
    >
      <input
        type={type}
        {...(type === "number" ? { min: "1", step: "0.1", inputMode: "decimal" } : {})}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={placeholder}
      />
      {unit && !disabled && <span className="prompt-unit">{unit}</span>}
      <button type="submit" className="prompt-send" disabled={!canSend} aria-label="Send">
        <FaArrowUp />
      </button>
    </form>
  );
}

/**
 * A small conversation engine for the FitFreak AI goal coach.
 *
 * This intentionally does NOT talk to a generative model - the existing
 * FitFreak AI/chat service (server/services/chatService.js) is a read-only
 * explainer that is explicitly not wired up to create or modify goals. Rather
 * than bolt an unrelated AI call onto goal creation, this drives an adaptive,
 * personality-matched conversation client-side and saves through the real
 * existing goal/plan endpoints, so nothing about the backend's data model or
 * the working chat feature changes. The collected answers are structured
 * exactly like the existing Goal schema so any future AI layer (chatService,
 * a planner, etc.) can consume them without translation.
 */
export default function GoalCoach({
  name,
  currentWeight,
  mode = "onboarding", // "onboarding" | "adjust"
  initialGoal = null,
  initialPrompt = "", // text typed in the Command Hub prompt bar
  autoFocusPrompt = false,
  onSubmitCreate,
  onSubmitUpdate,
  onCancel,
  onViewPlan,
}) {
  const isAdjust = mode === "adjust" && initialGoal;
  const firstName = name ? String(name).trim().split(/\s+/)[0] : "";
  // A prompt carried over from the hub is understood up front (same keyword
  // matching as typing it here), so the user never has to repeat themselves.
  const seedText = !isAdjust ? initialPrompt.trim() : "";
  const seedType = seedText ? classifyGoalText(seedText) : null;

  const [answers, setAnswers] = useState(() => ({
    type: isAdjust ? initialGoal.type : seedType || "",
    targetWeight: isAdjust ? String(initialGoal.targetWeight ?? "") : "",
    pace: isAdjust ? initialGoal.pace || "normal" : "",
    dailyCalories: isAdjust && initialGoal.dailyCalories ? String(initialGoal.dailyCalories) : "",
  }));
  const [stage, setStage] = useState(isAdjust || seedType ? "target" : "goal");
  const [transcript, setTranscript] = useState(() => buildInitialTranscript());
  const [freeTextGoal, setFreeTextGoal] = useState("");
  const [caloriesChoice, setCaloriesChoice] = useState(null); // "set" | "flexible"
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState(null);
  const scrollRef = useRef(null);

  function buildInitialTranscript() {
    if (isAdjust) {
      return [{ id: nextTurnId(), speaker: "ai", text: targetPrompt(initialGoal.type) }];
    }
    if (seedText) {
      return seedType
        ? [
            { id: nextTurnId(), speaker: "user", text: seedText },
            { id: nextTurnId(), speaker: "ai", text: goalEncouragement(seedType) },
            {
              id: nextTurnId(),
              speaker: "ai",
              text: `I've set this up as a **${goalTypeMap[seedType]}** goal so we can build around it.`,
            },
            { id: nextTurnId(), speaker: "ai", text: targetPrompt(seedType) },
          ]
        : [
            { id: nextTurnId(), speaker: "user", text: seedText },
            { id: nextTurnId(), speaker: "ai", text: UNMATCHED_GOAL_REPLY },
          ];
    }
    return [
      { id: nextTurnId(), speaker: "ai", text: "Tell me about your goal." },
      {
        id: nextTurnId(),
        speaker: "ai",
        text: "Let's understand what you want to achieve and build your fitness journey around you.",
      },
    ];
  }

  const groups = useMemo(() => groupTurns(transcript), [transcript]);

  // Follow the conversation as it grows, but not on first paint - the greeting
  // should be the first thing the user sees. Keyed on real changes so React
  // StrictMode's double-invoked effects can't trigger a scroll.
  const lastScrollKey = useRef(`${transcript.length}|${stage}|${caloriesChoice}`);
  useEffect(() => {
    const key = `${transcript.length}|${stage}|${caloriesChoice}`;
    if (key === lastScrollKey.current) return;
    lastScrollKey.current = key;
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [transcript, stage, caloriesChoice]);

  function pushTurns(entries) {
    setTranscript((prev) => [
      ...prev,
      ...entries.map(([speaker, text]) => ({ id: nextTurnId(), speaker, text })),
    ]);
  }

  function targetPrompt(type) {
    if (currentWeight) {
      return type === "maintain"
        ? `You're currently at **${currentWeight} kg**. Want to lock your target there, or set a different number?`
        : `What's your target weight? You're currently at **${currentWeight} kg**, for reference.`;
    }
    return "What's your target weight?";
  }

  /* ---------------- STAGE: goal type ---------------- */
  function chooseGoal(type) {
    setAnswers((a) => ({ ...a, type }));
    pushTurns([
      ["user", goalTypeMap[type]],
      ["ai", goalEncouragement(type)],
      ["ai", targetPrompt(type)],
    ]);
    setStage("target");
  }

  function submitFreeTextGoal(e) {
    e.preventDefault();
    const text = freeTextGoal.trim();
    if (!text) return;
    const type = classifyGoalText(text);
    setFreeTextGoal("");
    if (!type) {
      pushTurns([
        ["user", text],
        ["ai", UNMATCHED_GOAL_REPLY],
      ]);
      return;
    }
    setAnswers((a) => ({ ...a, type }));
    pushTurns([
      ["user", text],
      ["ai", goalEncouragement(type)],
      ["ai", `I've set this up as a **${goalTypeMap[type]}** goal so we can build around it.`],
      ["ai", targetPrompt(type)],
    ]);
    setStage("target");
  }

  /* ---------------- STAGE: target weight ---------------- */
  function submitTarget(e) {
    e.preventDefault();
    const value = answers.targetWeight;
    if (!value || Number(value) <= 0) return;
    pushTurns([
      ["user", `${value} kg`],
      ["ai", "How would you like to approach your progress?"],
    ]);
    setStage("pace");
  }

  /* ---------------- STAGE: pace ---------------- */
  function choosePace(pace) {
    setAnswers((a) => ({ ...a, pace }));
    pushTurns([
      ["user", paceMap[pace]],
      ["ai", "Want me to lock in a daily calorie target, or should we keep it flexible for now?"],
    ]);
    setStage("calories");
  }

  /* ---------------- STAGE: calories ---------------- */
  function pickCaloriesChoice(choice) {
    setCaloriesChoice(choice);
    if (choice === "flexible") {
      setAnswers((a) => ({ ...a, dailyCalories: "" }));
      pushTurns([
        ["user", "Keep it flexible"],
        ["ai", "Perfect. I have enough to start building your plan."],
      ]);
      setStage("review");
    } else {
      pushTurns([
        ["user", "I'll set one"],
        ["ai", "What daily calorie target should I aim for?"],
      ]);
    }
  }

  function submitCalories(e) {
    e.preventDefault();
    const entries = [];
    if (answers.dailyCalories) entries.push(["user", `${answers.dailyCalories} kcal/day`]);
    entries.push(["ai", "Perfect. I have enough to start building your plan."]);
    pushTurns(entries);
    setStage("review");
  }

  /* ---------------- STAGE: review / submit ---------------- */
  async function handleConfirm() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const payload = {
        type: answers.type,
        targetWeight: Number(answers.targetWeight),
        pace: answers.pace,
        ...(answers.dailyCalories ? { dailyCalories: Number(answers.dailyCalories) } : {}),
      };
      const goal = isAdjust
        ? await onSubmitUpdate(initialGoal._id, payload)
        : await onSubmitCreate(payload);
      setResult(goal);
      pushTurns([
        ["ai", "I've got you. 💜"],
        ["ai", "Your personalized fitness journey is ready to begin."],
      ]);
      setStage("done");
    } catch {
      setSubmitError("Something went wrong saving that. Mind trying again?");
    } finally {
      setSubmitting(false);
    }
  }

  function editStage(targetStage) {
    setStage(targetStage);
  }

  const meta = goalMeta[answers.type];

  /* ---------------- prompt bar config per stage ---------------- */
  let bar = null;
  if (stage === "goal") {
    bar = (
      <PromptBar
        value={freeTextGoal}
        onChange={setFreeTextGoal}
        onSubmit={submitFreeTextGoal}
        placeholder="Or describe your goal…"
        autoFocus={autoFocusPrompt}
      />
    );
  } else if (stage === "target") {
    bar = (
      <PromptBar
        type="number"
        value={answers.targetWeight}
        onChange={(v) => setAnswers((a) => ({ ...a, targetWeight: v }))}
        onSubmit={submitTarget}
        placeholder="Enter your target weight"
        unit="kg"
        autoFocus
      />
    );
  } else if (stage === "calories" && caloriesChoice === "set") {
    bar = (
      <PromptBar
        type="number"
        value={answers.dailyCalories}
        onChange={(v) => setAnswers((a) => ({ ...a, dailyCalories: v }))}
        onSubmit={submitCalories}
        placeholder="Daily calories"
        unit="kcal"
        allowEmpty
        autoFocus
      />
    );
  } else if (stage === "pace" || stage === "calories") {
    bar = (
      <PromptBar
        value=""
        onChange={() => {}}
        onSubmit={(e) => e.preventDefault()}
        placeholder="Choose an option above to continue…"
        disabled
      />
    );
  }

  return (
    <div className="goal-coach">
      {onCancel && stage !== "done" && (
        <button type="button" className="coach-close-btn" aria-label="Close" onClick={onCancel}>
          <FaXmark />
        </button>
      )}

      <header className="goal-coach-header">
        <span className="ai-status-pill">
          <span className="ai-status-dot" />
          FitFreak AI Engine Active
        </span>
        <h1 className="goal-hero">
          {isAdjust ? `Welcome back, ${firstName || "there"} 👋` : `Hi, ${firstName || "there"}! 👋`}
        </h1>
        <p className="goal-hero-sub">
          {isAdjust ? (
            <>Let's fine-tune your <strong>{goalTypeMap[initialGoal.type] || "fitness"}</strong> goal.</>
          ) : (
            <>I'm <strong>FitFreak AI</strong>.</>
          )}
        </p>
      </header>

      <div className="coach-convo" ref={scrollRef}>
        {groups.map((g) =>
          g.speaker === "ai" ? (
            <div className="coach-turn coach-turn-ai" key={g.id}>
              <AiOrb size="sm" />
              <div className="coach-ai-panel">
                {g.lines.map((line, li) => (
                  <p
                    key={line.id}
                    style={{ animationDelay: `${li * 110}ms` }}
                  >
                    <Inline text={line.text} />
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div className="coach-turn coach-turn-user" key={g.id}>
              <p>{g.lines[0].text}</p>
            </div>
          )
        )}

        {stage === "goal" && <PromptCards options={GOAL_TYPES} onPick={chooseGoal} />}
        {stage === "pace" && <PromptCards options={PACE_OPTIONS} onPick={choosePace} />}
        {stage === "calories" && caloriesChoice !== "set" && (
          <PromptCards options={CALORIE_OPTIONS} onPick={pickCaloriesChoice} />
        )}

        {stage === "review" && (
          <div className="coach-review-card">
            <div className="review-head">
              {meta && (
                <span className="prompt-card-icon" style={{ "--g1": meta.g1, "--g2": meta.g2 }}>
                  <meta.Icon />
                </span>
              )}
              <div>
                <small>Your plan blueprint</small>
                <strong>{goalTypeMap[answers.type] || answers.type}</strong>
              </div>
            </div>
            <div className="metric-pills">
              <span className="metric-pill"><em>Target</em>{answers.targetWeight} kg</span>
              <span className="metric-pill"><em>Pace</em>{paceMap[answers.pace] || answers.pace}</span>
              <span className="metric-pill">
                <em>Calories</em>
                {answers.dailyCalories ? `${answers.dailyCalories} kcal` : "Flexible"}
              </span>
            </div>
            <div className="review-edits">
              <button type="button" onClick={() => editStage("target")}>Edit target</button>
              <button type="button" onClick={() => editStage("pace")}>Edit pace</button>
              <button
                type="button"
                onClick={() => {
                  setCaloriesChoice(null);
                  editStage("calories");
                }}
              >
                Edit calories
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="coach-dock">
        {bar}

        {stage === "review" && (
          <div className="coach-dock-actions">
            {submitError && <p className="coach-error">{submitError}</p>}
            <button type="button" className="coach-primary-btn" disabled={submitting} onClick={handleConfirm}>
              {submitting ? "Building your plan…" : isAdjust ? "Save changes" : "Confirm & build my plan"}
            </button>
          </div>
        )}

        {stage === "done" && (
          <div className="coach-dock-actions">
            <p className="coach-success">
              <FaCheck /> Goal saved
            </p>
            <button type="button" className="coach-primary-btn" onClick={() => onViewPlan(result)}>
              View My Plan →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
