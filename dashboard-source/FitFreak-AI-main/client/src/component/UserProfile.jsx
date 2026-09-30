import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axiosInstance";
import { useAuth } from "../context/useAuth";
import "./UserProfile.css";

const isValid = (v) => v !== null && v !== undefined && v !== "" && Number(v) > 0;

const UserProfile = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      if (!token) return;
      try {
        const res = await axios.get("/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    }
    loadProfile();
  }, [token]);

  if (!profile)
    return (
      <div className="mini-profile">
        <div className="skeleton skeleton-avatar"></div>
        <div className="skeleton skeleton-line"></div>
        <div className="skeleton skeleton-line short"></div>
      </div>
    );

  // Only surface metrics that actually have data - no "N/A" placeholders.
  const metrics = [
    isValid(profile.height) && { label: "Height", value: profile.height, unit: "cm" },
    isValid(profile.currentWeight) && { label: "Current Weight", value: profile.currentWeight, unit: "kg" },
    isValid(profile.targetWeight) && { label: "Target Weight", value: profile.targetWeight, unit: "kg" },
    isValid(profile.bmi) && {
      label: "BMI",
      value: profile.bmi,
      note: typeof profile.bmiCategory === "string" ? profile.bmiCategory : undefined,
    },
    isValid(profile.tdee) && { label: "TDEE", value: profile.tdee, unit: "kcal/day" },
  ].filter(Boolean);

  const joined = profile.createdAt ? new Date(profile.createdAt) : null;
  const joinedLabel =
    joined && !Number.isNaN(joined.getTime())
      ? joined.toLocaleDateString(undefined, { month: "short", year: "numeric" })
      : null;

  const subline = [
    isValid(profile.age) && `${profile.age} yrs`,
    profile.gender && String(profile.gender).charAt(0).toUpperCase() + String(profile.gender).slice(1),
  ].filter(Boolean);

  return (
    <div className="mini-profile fade-in">
      <div className="profile-header">
        <div className="avatar">
          {profile.profilePic ? (
            <img src={profile.profilePic} alt={profile.name} />
          ) : (
            <div className="avatar-placeholder">{(profile.name || "U").charAt(0).toUpperCase()}</div>
          )}
        </div>
        <div className="name-age">
          <div className="name">{profile.name || "Athlete"}</div>
          {subline.length > 0 && <div className="age">{subline.join(" · ")}</div>}
          {joinedLabel && <div className="mp-joined">Member since {joinedLabel}</div>}
        </div>
      </div>

      {metrics.length > 0 ? (
        <div className="mp-metrics">
          {metrics.map((m) => (
            <div className="mp-metric" key={m.label}>
              <span className="mp-metric-label">{m.label}</span>
              <span className="mp-metric-value">
                {m.value}
                {m.unit && <small>{m.unit}</small>}
              </span>
              {m.note && <span className="mp-metric-note">{m.note}</span>}
            </div>
          ))}
        </div>
      ) : (
        <Link to="/profile" className="mp-empty">
          Add your height &amp; weight to unlock personalized metrics →
        </Link>
      )}
    </div>
  );
};

export default UserProfile;
