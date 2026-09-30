import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import {
  FaFire,
  FaCoins,
  FaTrophy,
  FaCrown,
  FaChevronRight,
  FaShoppingBag,
  FaUserFriends,
  FaStar,
  FaLock,
} from "react-icons/fa";
import "./Progress.css";

// ---- Static / demo content (frontend-only, no backend integration) ----

const BADGES = [
  { day: 1, title: "Squire", image: "/images/squire.png" },
  { day: 3, title: "Page", image: "/images/page.png" },
  { day: 7, title: "Knight", image: "/images/knight.png" },
  { day: 14, title: "Champion", image: "/images/champion.png" },
  { day: 30, title: "Lord / Lady", image: "/images/lord.png" },
  { day: 50, title: "Baron / Baroness", image: "/images/baron.png" },
  { day: 100, title: "Royalty", image: "/images/royalty.png" },
];

const LEADERBOARD_MONTH = [
  { username: "JohnDoe", streak: 120 },
  { username: "FitQueen", streak: 95 },
  { username: "IronMan", streak: 75 },
  { username: "Zayed", streak: 60 },
  { username: "Alex", streak: 45 },
];

const LEADERBOARD_ALL_TIME = [
  { username: "JohnDoe", streak: 240 },
  { username: "IronMan", streak: 210 },
  { username: "FitQueen", streak: 190 },
  { username: "Alex", streak: 150 },
  { username: "Zayed", streak: 130 },
];

const REWARDS = [
  {
    id: 1,
    name: "Protein Powder",
    price: 50,
    img: "https://as1.ftcdn.net/v2/jpg/00/63/44/44/1000_F_63444460_WnpfzekqhLE8zB69kVD5Q5tJNcXiCcyZ.jpg",
  },
  {
    id: 2,
    name: "Skipping Rope",
    price: 20,
    img: "https://as1.ftcdn.net/v2/jpg/05/79/17/52/1000_F_579175283_TgaaQ6e90MtPOpOcGj2Q2bouPFuQ4CtF.webp",
  },
  {
    id: 3,
    name: "Dumbbells",
    price: 100,
    img: "https://i.pinimg.com/736x/0e/b9/f2/0eb9f271d8b2a55f34ebfd9a96dce3b0.jpg",
  },
  {
    id: 4,
    name: "Yoga Mat",
    price: 40,
    img: "https://www.vhv.rs/dpng/d/526-5261265_extra-thick-exercise-yoga-mat-with-carry-strap.png",
  },
];

// Self-contained fallback (no external dependency) shown if a reward image
// fails to load, so the card never breaks visually.
const REWARD_IMG_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
      <rect width='200' height='200' fill='#150a2e'/>
      <g stroke='#b675ff' stroke-width='6' fill='none' stroke-linecap='round'>
        <line x1='40' y1='100' x2='160' y2='100'/>
        <rect x='24' y='80' width='16' height='40' fill='#b675ff' stroke='none'/>
        <rect x='160' y='80' width='16' height='40' fill='#b675ff' stroke='none'/>
      </g>
    </svg>`
  );

const COACHES = [
  {
    name: "Arjun Mehta",
    specialty: "Strength & Hypertrophy",
    tag: "#Strength",
    rating: 4.8,
    reviews: 320,
  },
  {
    name: "Riya Sharma",
    specialty: "Yoga & Flexibility",
    tag: "#Flexibility",
    rating: 4.9,
    reviews: 210,
  },
  {
    name: "Karan Malhotra",
    specialty: "Fat Loss & HIIT",
    tag: "#FatLoss",
    rating: 4.7,
    reviews: 180,
  },
];

const AVATAR_GRADIENTS = [
  "radial-gradient(circle at 30% 25%, #e2c6ff, #b675ff 45%, #5b21b6 100%)",
  "radial-gradient(circle at 30% 25%, #bfe0ff, #60a5fa 45%, #1e40af 100%)",
  "radial-gradient(circle at 30% 25%, #ffd3ec, #f472b6 45%, #a21caf 100%)",
  "radial-gradient(circle at 30% 25%, #fff1b8, #facc15 45%, #b45309 100%)",
  "radial-gradient(circle at 30% 25%, #c9ffe8, #34d399 45%, #047857 100%)",
];

const getInitials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const avatarStyle = (seed) => ({
  background: AVATAR_GRADIENTS[seed % AVATAR_GRADIENTS.length],
});

const rankMeta = (rank) => {
  if (rank === 1) return { className: "rank-1", crownColor: "#ffd700" };
  if (rank === 2) return { className: "rank-2", crownColor: "#dbe3ff" };
  if (rank === 3) return { className: "rank-3", crownColor: "#ffb26b" };
  return { className: "rank-other", crownColor: null };
};

const Progress = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [calendar, setCalendar] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [coins, setCoins] = useState(0);
  const [leaderboardTab, setLeaderboardTab] = useState("month");

  useEffect(() => {
    const fetchProgress = async () => {
      if (!token) return;

      try {
        // Fetch progress and streaks
        const res = await axios.get("/progress/calendar", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCalendar(res.data.calendar);
        setCurrentStreak(res.data.currentStreak);
        setLongestStreak(res.data.longestStreak);

        // Fetch coins from user profile
        const userRes = await axios.get("/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCoins(userRes.data.coins || 0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProgress();
  }, [token]);

  const getColor = (completed) => (completed ? "#4caf50" : "#2a2a2a");

  // Group days by month
  const months = {};
  calendar.forEach((day) => {
    const date = new Date(day.date);
    const month = date.toLocaleString("default", { month: "short" });
    if (!months[month]) months[month] = [];
    months[month].push(day);
  });

  const year = new Date().getFullYear();

  const nextBadge = BADGES.find((badge) => badge.day > currentStreak);
  const streakMessage = nextBadge
    ? `Keep going! Only ${nextBadge.day - currentStreak} more day${
        nextBadge.day - currentStreak > 1 ? "s" : ""
      } to unlock your "${nextBadge.title}" badge!`
    : "You're a champion! Keep maintaining your streak!";

  const leaderboard =
    leaderboardTab === "month" ? LEADERBOARD_MONTH : LEADERBOARD_ALL_TIME;

  // Podium = top 3, reordered visually as [#2, #1, #3]; rest render as a list
  const podium = leaderboard.slice(0, 3);
  const podiumOrdered = [podium[1], podium[0], podium[2]].filter(Boolean);
  const rest = leaderboard.slice(3);

  // Progress-toward-next-badge helper, used for the hover tooltip
  const badgeProgressLabel = (badge, idx) => {
    const unlocked = currentStreak >= badge.day;
    if (unlocked) return "Unlocked";
    const prevThreshold = idx === 0 ? 0 : BADGES[idx - 1].day;
    const total = badge.day - prevThreshold;
    const done = Math.max(0, Math.min(currentStreak - prevThreshold, total));
    return `${done}/${total} days completed`;
  };

  return (
    <div className="progress-page">
      {/* Page header */}
      <div className="progress-header">
        <div>
          <h1 className="progress-title">Progress</h1>
          <p className="progress-subtitle">
            Track your streaks, earn coins, climb the leaderboard and unlock rewards.
          </p>
        </div>
        <div className="motivation-pill">
          <span className="sparkle">✨</span> Small steps build big results
          <span className="heart">💜</span>
        </div>
      </div>

      {/* Current Streak + Coins */}
      <div className="stats-container">
        <div
          className="stat-card streak-card"
          onClick={() => navigate("/current-streak")}
        >
          <div className="stat-glow streak-glow" />
          <div className="stat-card-icon streak-icon">
            <FaFire />
          </div>
          <div className="stat-card-body">
            <h3>Current Streak</h3>
            <p className="stat-value tabular">
              {currentStreak} day{currentStreak === 1 ? "" : "s"}
            </p>
            <span className="stat-sub">
              Longest Streak: {longestStreak} day{longestStreak === 1 ? "" : "s"}
            </span>
          </div>
          <div className="stat-card-arrow">
            <FaChevronRight />
          </div>
        </div>

        <div className="stat-card coin-card" onClick={() => navigate("/coins")}>
          <div className="stat-glow coin-glow" />
          <div className="stat-card-icon coin-icon">
            <FaCoins />
          </div>
          <div className="stat-card-body">
            <h3>FitFreak Coins</h3>
            <p className="stat-value tabular">{coins}</p>
            <span className="stat-sub">Keep going to earn more coins!</span>
          </div>
          <div className="stat-card-arrow">
            <FaChevronRight />
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <section className="panel leaderboard-panel">
        <div className="panel-header">
          <div className="panel-title-group">
            <span className="panel-icon trophy-icon">
              <FaTrophy />
            </span>
            <div>
              <h2>Leaderboard</h2>
              <p>Top FitFreakers this month</p>
            </div>
          </div>
          <div className="leaderboard-tabs">
            <button
              type="button"
              className={leaderboardTab === "month" ? "active" : ""}
              onClick={() => setLeaderboardTab("month")}
            >
              This Month
            </button>
            <button
              type="button"
              className={leaderboardTab === "all" ? "active" : ""}
              onClick={() => setLeaderboardTab("all")}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Podium: top 3 */}
        <div className="podium-row">
          {podiumOrdered.map((user) => {
            const rank = leaderboard.indexOf(user) + 1;
            const meta = rankMeta(rank);
            const seed = leaderboard.indexOf(user);
            return (
              <div key={user.username} className={`podium-card ${meta.className}`}>
                {rank === 1 && <div className="podium-aura" />}
                {meta.crownColor && (
                  <FaCrown className="crown-icon" style={{ color: meta.crownColor }} />
                )}
                <div className="lb-avatar" style={avatarStyle(seed)}>
                  {getInitials(user.username)}
                </div>
                <div className="lb-rank-badge">{rank}</div>
                <div className="lb-username">{user.username}</div>
                <div className="lb-streak">{user.streak} Days</div>
                <div className="podium-base" />
              </div>
            );
          })}
        </div>

        {/* Ranks 4+ */}
        {rest.length > 0 && (
          <div className="leaderboard-list">
            {rest.map((user, i) => {
              const rank = i + 4;
              const seed = leaderboard.indexOf(user);
              return (
                <div key={user.username} className="leaderboard-row">
                  <span className="row-rank">{rank}</span>
                  <div className="lb-avatar sm" style={avatarStyle(seed)}>
                    {getInitials(user.username)}
                  </div>
                  <span className="row-username">{user.username}</span>
                  <span className="row-streak">{user.streak} Days</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Your Streak + Badge Tiers */}
      <section className="panel your-streak-panel">
        <div className="your-streak-grid">
          <div className="streak-calendar-block">
            <div className="panel-title-group">
              <span className="panel-icon fire-icon">
                <FaFire />
              </span>
              <div>
                <h2>Your Streak</h2>
                <p>Stay consistent and unlock exclusive badges!</p>
              </div>
            </div>

            <div className="streak-summary">
              <div>
                <span className="summary-label">Current Streak</span>
                <span className="summary-value tabular">{currentStreak} Days</span>
              </div>
              <div>
                <span className="summary-label">Longest Streak</span>
                <span className="summary-value tabular">{longestStreak} Days</span>
              </div>
            </div>
            <p className="streak-message">{streakMessage}</p>

            <div className="calendar-wrapper">
              <div className="year-label">{year}</div>
              <div className="months-container">
                {Object.keys(months).map((month) => {
                  const days = months[month];
                  const mid = Math.ceil(days.length / 2);
                  const leftColumn = days.slice(0, mid);
                  const rightColumn = days.slice(mid);

                  return (
                    <div key={month} className="month-block">
                      <div className="month-label">{month}</div>
                      <div className="month-days">
                        <div className="month-column">
                          {leftColumn.map((day, idx) => (
                            <div
                              key={idx}
                              className="day-cell"
                              style={{ backgroundColor: getColor(day.completed) }}
                              title={`${day.date} - ${day.completed ? "Completed" : "Not Completed"}`}
                            />
                          ))}
                        </div>
                        <div className="month-column">
                          {rightColumn.map((day, idx) => (
                            <div
                              key={idx}
                              className="day-cell"
                              style={{ backgroundColor: getColor(day.completed) }}
                              title={`${day.date} - ${day.completed ? "Completed" : "Not Completed"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="badge-tiers-block">
            <div className="badge-tiers-header">
              <div>
                <h3>Badge Tiers</h3>
                <p>Keep your streak and unlock rewards!</p>
              </div>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => navigate("/current-streak")}
              >
                View Badge Details <FaChevronRight />
              </button>
            </div>

            <div className="badges-grid">
              {BADGES.map((badge, idx) => {
                const unlocked = currentStreak >= badge.day;
                return (
                  <div
                    key={idx}
                    className={`badge-item ${unlocked ? "unlocked" : "locked"}`}
                    data-tooltip={badgeProgressLabel(badge, idx)}
                  >
                    <div className="badge-shield">
                      <img src={badge.image} alt={badge.title} className="badge-image" />
                      {!unlocked && <FaLock className="badge-lock" />}
                    </div>
                    <div className="badge-info">
                      {unlocked ? "Unlocked" : `${badge.day} days`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rewards + Coaches */}
      <div className="lower-grid">
        <section className="panel rewards-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <span className="panel-icon rewards-icon">
                <FaShoppingBag />
              </span>
              <div>
                <h2>Featured Rewards</h2>
                <p>Use your FitFreak Coins to redeem exclusive rewards.</p>
              </div>
            </div>
            <button type="button" className="ghost-btn" onClick={() => navigate("/coins")}>
              View All <FaChevronRight />
            </button>
          </div>

          <div className="rewards-grid">
            {REWARDS.map((item) => (
              <div key={item.id} className="reward-card">
                <div className="reward-image-wrap">
                  <div className="reward-glow" />
                  <img
                    src={item.img}
                    alt={item.name}
                    className="reward-image"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = REWARD_IMG_FALLBACK;
                    }}
                  />
                  <span className="coming-soon-badge">
                    <span className="dot" /> Coming Soon
                  </span>
                </div>
                <h4 className="reward-name">{item.name}</h4>
                <div className="reward-price">
                  <span className="tabular">{item.price}</span> <FaCoins />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel coaches-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <span className="panel-icon coaches-icon">
                <FaUserFriends />
              </span>
              <div>
                <h2>FitFreak Coaches</h2>
                <p>Learn, train and grow with expert coaches.</p>
              </div>
            </div>
          </div>

          <div className="coaches-grid">
            {COACHES.map((coach, idx) => (
              <div key={coach.name} className="coach-card">
                <div className="coach-avatar-frame">
                  <div className="coach-avatar" style={avatarStyle(idx + 2)}>
                    {getInitials(coach.name)}
                  </div>
                  <span className="status-dot" title="Available" />
                </div>
                <h4 className="coach-name">{coach.name}</h4>
                <p className="coach-specialty">{coach.specialty}</p>
                <span className="coach-tag">{coach.tag}</span>
                <div className="coach-rating">
                  <FaStar /> <span className="tabular">{coach.rating}</span>{" "}
                  <span className="reviews">({coach.reviews})</span>
                </div>
                <button type="button" className="pill-btn" disabled>
                  Coming Soon
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Progress;
