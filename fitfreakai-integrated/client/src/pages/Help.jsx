import React from "react";
import "./Help.css";

const videoList = [
  {
    id: "IT94xC35u6k",
    title: "20 min Fat Burning Workout for TOTAL BEGINNERS",
  },
  {
    id: "zGf-9VVgCDw",
    title: "Quick 10 Minute Ultimate Beginners Workout Low-Impact",
  },
  {
    id: "ZrNXcyoy8-w",
    title: "Full Body Total Beginner Workout",
  },
];

const mentors = [
  {
    name: "Alice Johnson",
    monthlyCharge: "$100 / month",
    experience: "5 years specializing in strength training",
    contact: "alice.johnson@example.com",
    profileImg:
      "https://randomuser.me/api/portraits/women/44.jpg",
    social: {
      instagram: "@alicefittmentor",
      linkedin: "linkedin.com/in/alice-johnson-fit",
    },
  },
  {
    name: "Bob Smith",
    monthlyCharge: "$80 / month",
    experience: "3 years cardio & weight loss programs",
    contact: "bob.smith@example.com",
    profileImg:
      "https://randomuser.me/api/portraits/men/47.jpg",
    social: {
      instagram: "@bobcardiotrainer",
      linkedin: "linkedin.com/in/bob-smith-trainer",
    },
  },
  {
    name: "Carla Martinez",
    monthlyCharge: "$120 / month",
    experience: "7 years experience, nutrition + fitness",
    contact: "carla.m@example.com",
    profileImg:
      "https://randomuser.me/api/portraits/women/68.jpg",
    social: {
      instagram: "@carlafitnesscoach",
      linkedin: "linkedin.com/in/carla-martinez",
    },
  },
];

const Help = () => {
  return (
    <div className="help-page">
      <h1 className="help-page-title">Find a Mentor & Learn Exercises</h1>

      <div className="help-content">
        {/* ✅ Mentors FIRST */}
        <div className="mentor-section">
          <h2>Mentorship — Coming Soon</h2>
          <p>These are sample profiles for a planned feature. Mentor booking is not available yet.</p>
          <div className="mentor-list">
            {mentors.map((mentor, idx) => (
              <div key={idx} className="mentor-card">
                <img
                  src={mentor.profileImg}
                  alt={mentor.name}
                  className="mentor-profile-img"
                />
                <div className="mentor-details">
                  <h3 className="mentor-name">{mentor.name} (sample)</h3>
                  <p><strong>Monthly Charge:</strong> {mentor.monthlyCharge}</p>
                  <p><strong>Experience:</strong> {mentor.experience}</p>
                  <p><strong>Contact:</strong> {mentor.contact}</p>
                  <div className="mentor-social">
                    <p><strong>Instagram:</strong> {mentor.social.instagram}</p>
                    <p><strong>LinkedIn:</strong> {mentor.social.linkedin}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ Videos SECOND */}
        <div className="video-section">
          <h2>Tutorial Videos</h2>
          <div className="videos-list">
            {videoList.map((video) => (
              <a
                key={video.id}
                className="video-card"
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="video-thumb"
                  src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                  alt={video.title}
                />
                <p className="video-title">{video.title}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
