import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { useAuth } from "../context/useAuth";
import "./Profile.css";

export default function Profile() {
  const { token, login, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [currentStreak, setCurrentStreak] = useState(0);

  // Badge tiers
  const badges = [
    { day: 1, title: "Squire", image: "/images/squire.png" },
    { day: 3, title: "Page", image: "/images/page.png" },
    { day: 7, title: "Knight", image: "/images/knight.png" },
    { day: 14, title: "Champion", image: "/images/champion.png" },
    { day: 30, title: "Lord / Lady", image: "/images/lord.png" },
    { day: 50, title: "Baron / Baroness", image: "/images/baron.png" },
    { day: 100, title: "Royalty", image: "/images/royalty.png" },
  ];

  // Load profile and streak
  useEffect(() => {
    async function loadProfile() {
      if (!token) return;
      try {
        const res = await axios.get("/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
        setForm({
          name: res.data.name || "",
          email: res.data.email || "",
          age: res.data.age || "",
          gender: res.data.gender || "",
          height: res.data.height || "",
          currentWeight: res.data.currentWeight || "",
          activityLevel: res.data.activityLevel || "",
          profilePic: res.data.profilePic || "",
        });

        // Fetch streak
        const streakRes = await axios.get(
          "/progress/streak",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCurrentStreak(streakRes.data.currentStreak || 0);
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile.");
      }
    }
    loadProfile();
  }, [token]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMsg("");
    try {
      const updates = { ...form };
      const res = await axios.put(
        "/user/profile",
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(res.data);
      setEditing(false);
      setMsg("Profile updated successfully.");

      if (login) {
        login({ user: res.data, token });
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setError(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  if (!token)
    return (
      <div className="profile-page">
        <div className="card glass">
          <h2>Please log in</h2>
          <p>You must be logged in to view your profile.</p>
        </div>
      </div>
    );

  if (!profile)
    return (
      <div className="profile-page">
        <div className="card glass">{error || "Loading profile..."}</div>
      </div>
    );

  // Calculate unlocked badges based on current streak
  const unlockedBadges = badges.filter((badge) => currentStreak >= badge.day);

  return (
    <div className="profile-page">
      <div className="profile-wrapper">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="avatar-profile">
            {profile.profilePic ? (
              <img src={profile.profilePic} alt={`${profile.name}`} />
            ) : (
              <div className="avatar-placeholder">
                {(profile.name || "U").charAt(0)}
              </div>
            )}
          </div>
          <h2 className="profile-name">{profile.name}</h2>
          <p className="profile-email">{profile.email}</p>

          <div className="sidebar-actions">
            <button
              className="btn secondary"
              onClick={() => {
                setEditing((e) => !e);
                setMsg("");
                setError("");
              }}
            >
              {editing ? "Cancel" : "Edit Profile"}
            </button>

            <button
              className="btn danger"
              onClick={() => {
                if (logout) logout();
                window.location.href = "/login";
              }}
            >
              Logout
            </button>
          </div>

          <div className="profile-stats">
            <div>
              <strong>BMI:</strong>{" "}
              <span className="highlight">{profile.bmi || "N/A"}</span>
            </div>
            <div>
              <strong>TDEE:</strong>{" "}
              <span className="highlight">{profile.tdee || "N/A"}</span>
            </div>
            <div>
              <strong>Joined:</strong>{" "}
              {new Date(profile.createdAt).toLocaleDateString()}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="profile-main">
          <div className="card glass">
            <h3>Profile Details</h3>

            {msg && <div className="success">{msg}</div>}
            {error && <div className="error">{error}</div>}

            {!editing ? (
              <div className="details-grid">
                <div>
                  <strong>Name:</strong> {profile.name}
                </div>
                <div>
                  <strong>Email:</strong> {profile.email}
                </div>
                <div>
                  <strong>Age:</strong> {profile.age ?? "N/A"}
                </div>
                <div>
                  <strong>Gender:</strong> {profile.gender ?? "N/A"}
                </div>
                <div>
                  <strong>Height (cm):</strong> {profile.height ?? "N/A"}
                </div>
                <div>
                  <strong>Current Weight (kg):</strong>{" "}
                  {profile.currentWeight ?? "N/A"}
                </div>
                <div>
                  <strong>Activity Level:</strong>{" "}
                  {profile.activityLevel ?? "N/A"}
                </div>
              </div>
            ) : (
              <form className="edit-form" onSubmit={handleSave}>
                <label>
                  Full name
                  <input name="name" value={form.name} onChange={handleChange} required />
                </label>
                <label>
                  Email
                  <input type="email" name="email" value={form.email} onChange={handleChange} required />
                </label>
                <label>
                  Age
                  <input type="number" name="age" min="1" max="120" value={form.age} onChange={handleChange} />
                </label>
                <label>
                  Gender
                  <select name="gender" value={form.gender} onChange={handleChange}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label>
                  Height (cm)
                  <input type="number" name="height" min="1" step="0.1" value={form.height} onChange={handleChange} />
                </label>
                <label>
                  Current weight (kg)
                  <input type="number" name="currentWeight" min="1" step="0.1" value={form.currentWeight} onChange={handleChange} />
                </label>
                <label>
                  Activity level
                  <select name="activityLevel" value={form.activityLevel} onChange={handleChange}>
                    <option value="">Select activity level</option>
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active</option>
                    <option value="very_active">Very active</option>
                  </select>
                </label>
                <div className="form-actions">
                  <button className="btn" type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="card meta-card glass">
            <h4>Account Metadata</h4>
            <div>
              <strong>User ID:</strong> {profile._id}
            </div>
            <div>
              <strong>Last updated:</strong>{" "}
              {new Date(profile.updatedAt).toLocaleString()}
            </div>
            <div>
              <strong>Friends:</strong> {profile.friends?.length ?? 0}
            </div>
          </div>

          {/* ====== Badges Section ====== */}
          <div className="card glass badges-card">
            <h4>Unlocked Badges</h4>
            {unlockedBadges.length > 0 ? (
              <div className="badges-container">
                {unlockedBadges.map((badge, index) => (
                  <div className="badge" key={index}>
                    <img src={badge.image} alt={badge.title} />
                    <span>{badge.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No badges unlocked yet.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
