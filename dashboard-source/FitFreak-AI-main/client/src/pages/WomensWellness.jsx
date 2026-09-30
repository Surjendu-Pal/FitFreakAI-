// pages/WomensWellness.jsx
import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { useAuth } from "../context/useAuth";
import "./WomensWellness.css";

/* -------------------- Static content (education only) -------------------- */

const NUTRITION_TOPICS = [
  {
    title: "Iron",
    body:
      "Period blood loss can lower iron levels, which may leave you feeling tired. Iron-rich foods include leafy greens, beans, lentils, and lean meats. Pairing them with vitamin C (like citrus) can help absorption.",
  },
  {
    title: "Protein",
    body:
      "Protein supports energy and muscle recovery, especially on workout days. Eggs, yogurt, tofu, fish, and legumes are all solid everyday sources.",
  },
  {
    title: "Calcium",
    body:
      "Calcium supports bone health and may help ease some period-related discomfort for some people. Dairy, fortified plant milks, tofu, and leafy greens are good sources.",
  },
  {
    title: "Hydration",
    body:
      "Staying hydrated can help with bloating and fatigue. Water, herbal tea, and water-rich foods (like fruit) all count toward your daily intake.",
  },
  {
    title: "Balanced Nutrition During Periods",
    body:
      "There's no single 'perfect' period diet — a balanced plate of protein, whole grains, healthy fats, and produce supports energy through the whole cycle. Cravings are normal; the goal is balance, not restriction.",
  },
];

const PCOS_SECTIONS = [
  {
    title: "What is PCOS?",
    body:
      "Polycystic Ovary Syndrome (PCOS) is a common hormonal condition that can affect how the ovaries work. It affects people differently, and severity varies widely.",
  },
  {
    title: "Common Symptoms",
    body:
      "Irregular or missed periods, acne, excess hair growth, hair thinning, weight changes, and fatigue are commonly reported. Having one or two of these does not mean you have PCOS.",
  },
  {
    title: "Menstrual Health Basics",
    body:
      "Cycle length can normally range from about 21 to 35 days, and some variation month to month is common. Tracking your cycle over time can help you notice patterns worth discussing with a doctor.",
  },
  {
    title: "Myth vs Fact",
    body:
      "Myth: 'PCOS means you can't get pregnant.' Fact: many people with PCOS can and do get pregnant, sometimes with support. Myth: 'Irregular periods always mean something is wrong.' Fact: occasional irregularity is common and not automatically a sign of a disorder.",
  },
  {
    title: "When to Talk to a Healthcare Professional",
    body:
      "Consider reaching out if you have persistently irregular cycles, severe pain, very heavy bleeding, or symptoms that are affecting your daily life. A doctor can help — this app can't diagnose anything.",
  },
];

const ENERGY_OPTIONS = ["low", "normal", "high"];
const MOOD_OPTIONS = ["low", "okay", "good"];
const SEVERITY_OPTIONS = ["none", "mild", "moderate", "severe"];
const SLEEP_OPTIONS = ["poor", "okay", "good"];
const COMFORT_OPTIONS = ["not_comfortable", "okay", "comfortable"];

const LABELS = {
  low: "Low",
  normal: "Normal",
  high: "High",
  okay: "Okay",
  good: "Good",
  none: "None",
  mild: "Mild",
  moderate: "Moderate",
  severe: "Severe",
  poor: "Poor",
  not_comfortable: "Not comfortable",
  comfortable: "Comfortable",
};

const TABS = [
  { key: "checkin", label: "Daily Check-in" },
  { key: "cycle", label: "Cycle Calendar" },
  { key: "nutrition", label: "Nutrition" },
  { key: "pcos", label: "PCOS & Awareness" },
];

export default function WomensWellness() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("checkin");

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  /* ---------------- Daily Check-in state ---------------- */
  const [checkinForm, setCheckinForm] = useState({
    energy: "normal",
    mood: "okay",
    cramps: "none",
    discomfort: "none",
    sleep: "okay",
    workoutComfort: "okay",
    pregnancyStatus: "",
  });
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [checkinSaving, setCheckinSaving] = useState(false);
  const [checkinError, setCheckinError] = useState("");

  /* ---------------- Cycle Calendar state ---------------- */
  const [cycleEntries, setCycleEntries] = useState([]);
  const [cycleSummary, setCycleSummary] = useState(null);
  const [cycleForm, setCycleForm] = useState({ startDate: "", endDate: "" });
  const [cycleError, setCycleError] = useState("");

  useEffect(() => {
    if (!token) return;
    fetchTodayCheckin();
    fetchRecommendation();
    fetchCycleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function fetchTodayCheckin() {
    try {
      const res = await axios.get("/wellness/checkin/today", authHeader);
      if (res.data) {
        setTodayCheckin(res.data);
        setCheckinForm({
          energy: res.data.energy,
          mood: res.data.mood,
          cramps: res.data.cramps,
          discomfort: res.data.discomfort,
          sleep: res.data.sleep,
          workoutComfort: res.data.workoutComfort,
          pregnancyStatus: res.data.pregnancyStatus || "",
        });
      }
    } catch (err) {
      console.error("Error fetching today's check-in:", err);
    }
  }

  async function fetchRecommendation() {
    try {
      const res = await axios.get("/wellness/recommendation", authHeader);
      setRecommendation(res.data);
    } catch (err) {
      console.error("Error fetching recommendation:", err);
    }
  }

  async function fetchCycleData() {
    try {
      const res = await axios.get("/wellness/cycle", authHeader);
      setCycleEntries(res.data.entries || []);
      setCycleSummary(res.data.summary || null);
    } catch (err) {
      console.error("Error fetching cycle data:", err);
    }
  }

  function handleCheckinChange(e) {
    setCheckinForm({ ...checkinForm, [e.target.name]: e.target.value });
  }

  async function handleCheckinSubmit(e) {
    e.preventDefault();
    setCheckinError("");
    setCheckinSaving(true);
    try {
      const payload = { ...checkinForm };
      if (!payload.pregnancyStatus) delete payload.pregnancyStatus;
      const res = await axios.post("/wellness/checkin", payload, authHeader);
      setTodayCheckin(res.data);
      await fetchRecommendation();
    } catch (err) {
      console.error("Error saving check-in:", err);
      setCheckinError("Couldn't save your check-in. Please try again.");
    } finally {
      setCheckinSaving(false);
    }
  }

  function handleCycleChange(e) {
    setCycleForm({ ...cycleForm, [e.target.name]: e.target.value });
  }

  async function handleCycleSubmit(e) {
    e.preventDefault();
    setCycleError("");
    if (!cycleForm.startDate) {
      setCycleError("Please choose a period start date.");
      return;
    }
    try {
      await axios.post(
        "/wellness/cycle",
        {
          startDate: cycleForm.startDate,
          endDate: cycleForm.endDate || undefined,
        },
        authHeader
      );
      setCycleForm({ startDate: "", endDate: "" });
      await fetchCycleData();
    } catch (err) {
      console.error("Error saving cycle entry:", err);
      setCycleError("Couldn't save that entry. Please try again.");
    }
  }

  async function handleCycleDelete(id) {
    try {
      await axios.delete(`/wellness/cycle/${id}`, authHeader);
      await fetchCycleData();
    } catch (err) {
      console.error("Error deleting cycle entry:", err);
    }
  }

  function formatDisplayDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="wellness-container">
      <h1 className="wellness-title">Women's Wellness</h1>
      <p className="wellness-subtitle">
        A private space to track how you feel and get workout suggestions that fit your day.
      </p>

      <div className="wellness-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`wellness-tab-btn ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* -------------------- DAILY CHECK-IN -------------------- */}
      {activeTab === "checkin" && (
        <div className="wellness-card">
          <h2 className="wellness-card-title">
            {todayCheckin ? "Today's Check-in" : "How are you feeling today?"}
          </h2>

          <form className="wellness-form" onSubmit={handleCheckinSubmit}>
            <label className="wellness-field">
              <span>Energy</span>
              <select name="energy" value={checkinForm.energy} onChange={handleCheckinChange}>
                {ENERGY_OPTIONS.map((o) => (
                  <option key={o} value={o}>{LABELS[o]}</option>
                ))}
              </select>
            </label>

            <label className="wellness-field">
              <span>Mood</span>
              <select name="mood" value={checkinForm.mood} onChange={handleCheckinChange}>
                {MOOD_OPTIONS.map((o) => (
                  <option key={o} value={o}>{LABELS[o]}</option>
                ))}
              </select>
            </label>

            <label className="wellness-field">
              <span>Cramps</span>
              <select name="cramps" value={checkinForm.cramps} onChange={handleCheckinChange}>
                {SEVERITY_OPTIONS.map((o) => (
                  <option key={o} value={o}>{LABELS[o]}</option>
                ))}
              </select>
            </label>

            <label className="wellness-field">
              <span>Discomfort</span>
              <select name="discomfort" value={checkinForm.discomfort} onChange={handleCheckinChange}>
                {SEVERITY_OPTIONS.map((o) => (
                  <option key={o} value={o}>{LABELS[o]}</option>
                ))}
              </select>
            </label>

            <label className="wellness-field">
              <span>Sleep</span>
              <select name="sleep" value={checkinForm.sleep} onChange={handleCheckinChange}>
                {SLEEP_OPTIONS.map((o) => (
                  <option key={o} value={o}>{LABELS[o]}</option>
                ))}
              </select>
            </label>

            <label className="wellness-field">
              <span>Workout comfort</span>
              <select name="workoutComfort" value={checkinForm.workoutComfort} onChange={handleCheckinChange}>
                {COMFORT_OPTIONS.map((o) => (
                  <option key={o} value={o}>{LABELS[o]}</option>
                ))}
              </select>
            </label>

            <label className="wellness-field">
              <span>Pregnancy / postpartum (optional)</span>
              <select
                name="pregnancyStatus"
                value={checkinForm.pregnancyStatus}
                onChange={handleCheckinChange}
              >
                <option value="">Prefer not to say</option>
                <option value="pregnant">Pregnant</option>
                <option value="postpartum">Postpartum</option>
              </select>
            </label>

            {checkinError && <p className="wellness-error">{checkinError}</p>}

            <button type="submit" className="wellness-primary-btn" disabled={checkinSaving}>
              {checkinSaving ? "Saving..." : todayCheckin ? "Update Check-in" : "Save Check-in"}
            </button>
          </form>

          {recommendation && (
            <div className={`wellness-recommendation wellness-rec-${recommendation.type}`}>
              <h3>{recommendation.title}</h3>
              <p>{recommendation.message}</p>
              {recommendation.type === "consult_professional" && (
                <p className="wellness-note">
                  This is general guidance, not a diagnosis. Please consult a healthcare professional if you're concerned.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* -------------------- CYCLE CALENDAR -------------------- */}
      {activeTab === "cycle" && (
        <div className="wellness-card">
          <h2 className="wellness-card-title">Cycle Calendar</h2>

          {cycleSummary && cycleSummary.hasEnoughData ? (
            <div className="wellness-summary-grid">
              <div className="wellness-summary-box">
                <h4>Current Cycle Day</h4>
                <p>Day {cycleSummary.currentCycleDay}</p>
              </div>
              <div className="wellness-summary-box">
                <h4>Estimated Phase</h4>
                <p style={{ textTransform: "capitalize" }}>{cycleSummary.phase}</p>
              </div>
              <div className="wellness-summary-box">
                <h4>Estimated Next Period</h4>
                <p>{formatDisplayDate(cycleSummary.estimatedNextPeriod)}</p>
              </div>
            </div>
          ) : (
            <p className="wellness-note">
              Log a period start date below to start seeing estimates.
            </p>
          )}
          <p className="wellness-note">
            These are estimates based on your own history, not medical facts.
          </p>

          <form className="wellness-form wellness-form-row" onSubmit={handleCycleSubmit}>
            <label className="wellness-field">
              <span>Period start date</span>
              <input
                type="date"
                name="startDate"
                value={cycleForm.startDate}
                onChange={handleCycleChange}
                required
              />
            </label>
            <label className="wellness-field">
              <span>Period end date (optional)</span>
              <input
                type="date"
                name="endDate"
                value={cycleForm.endDate}
                onChange={handleCycleChange}
              />
            </label>
            <button type="submit" className="wellness-primary-btn">
              Log Period
            </button>
          </form>
          {cycleError && <p className="wellness-error">{cycleError}</p>}

          <h3 className="wellness-subheading">Previous Periods</h3>
          {cycleEntries.length === 0 ? (
            <p className="wellness-note">No periods logged yet.</p>
          ) : (
            <div className="wellness-list">
              {cycleEntries.map((entry) => (
                <div className="wellness-list-item" key={entry._id}>
                  <span>
                    {formatDisplayDate(entry.startDate)} &rarr; {formatDisplayDate(entry.endDate)}
                  </span>
                  <button
                    className="wellness-delete-btn"
                    onClick={() => handleCycleDelete(entry._id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* -------------------- NUTRITION EDUCATION -------------------- */}
      {activeTab === "nutrition" && (
        <div className="wellness-card">
          <h2 className="wellness-card-title">Women's Nutrition Basics</h2>
          <p className="wellness-note">Educational only — not personalized medical or dietary advice.</p>
          <div className="wellness-grid">
            {NUTRITION_TOPICS.map((topic) => (
              <div className="wellness-info-card" key={topic.title}>
                <h4>{topic.title}</h4>
                <p>{topic.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------- PCOS & AWARENESS -------------------- */}
      {activeTab === "pcos" && (
        <div className="wellness-card">
          <h2 className="wellness-card-title">PCOS & Menstrual Health Awareness</h2>
          <p className="wellness-note">Educational only — this is not a diagnostic tool.</p>
          <div className="wellness-grid">
            {PCOS_SECTIONS.map((section) => (
              <div className="wellness-info-card" key={section.title}>
                <h4>{section.title}</h4>
                <p>{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
