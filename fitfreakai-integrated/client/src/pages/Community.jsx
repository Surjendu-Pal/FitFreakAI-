import React from "react";
import "./Community.css";

const Community = () => {
  const communities = [
    {
      platform: "Reddit",
      logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/reddit.svg",
      description:
        "Join some of the most active gym and fitness subreddits where enthusiasts share tips, routines, and progress.",
      links: [
        { name: "r/Fitness", url: "https://www.reddit.com/r/Fitness/" },
        { name: "r/Bodybuilding", url: "https://www.reddit.com/r/bodybuilding/" },
        { name: "r/ProgressPics", url: "https://www.reddit.com/r/progresspics/" },
        { name: "r/WeightRoom", url: "https://www.reddit.com/r/weightroom/" },
      ],
    },
    {
      platform: "WhatsApp",
      logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/whatsapp.svg",
      description:
        "Find WhatsApp fitness groups to connect with people locally and share daily motivation.",
      links: [
        {
          name: "Fitness Motivation Group",
          url: "https://chat.whatsapp.com/BXo12345abcFitness",
        },
        {
          name: "Home Workout Support",
          url: "https://chat.whatsapp.com/HWk67890xyzSupport",
        },
      ],
    },
    {
      platform: "Discord",
      logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/discord.svg",
      description:
        "Join active Discord servers to chat in real-time about workouts, diets, and bodybuilding advice.",
      links: [
        { name: "The Fitness Discord", url: "https://discord.gg/fitness" },
        { name: "Gym Bros Community", url: "https://discord.gg/gymbros" },
      ],
    },
    {
      platform: "Telegram",
      logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/telegram.svg",
      description:
        "Stay updated with fitness news and tips via Telegram channels and groups.",
      links: [
        {
          name: "Gym Motivation Channel",
          url: "https://t.me/gymmotivation",
        },
        {
          name: "Fitness Discussion Group",
          url: "https://t.me/fitnessdiscussion",
        },
      ],
    },
    {
      platform: "Facebook Groups",
      logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg",
      description:
        "Join Facebook fitness groups to interact with thousands of fitness lovers globally.",
      links: [
        {
          name: "Global Fitness & Health Community",
          url: "https://www.facebook.com/groups/globalfitnesscommunity",
        },
        {
          name: "Home Workout & Nutrition",
          url: "https://www.facebook.com/groups/homeworkoutnutrition",
        },
      ],
    },
  ];

  return (
    <div className="community-container">
      <h1 className="page-title">🏋️ Community Hub</h1>
      <p className="page-subtitle">
        Connect with like-minded fitness enthusiasts across platforms.
      </p>

      <div className="community-grid">
        {communities.map((community) => (
          <div key={community.platform} className="community-card">
            <div className="logo-wrapper">
              <img
                src={community.logo}
                alt={community.platform}
                className="community-logo"
              />
            </div>
            <h2 className="community-title">{community.platform}</h2>
            <p className="community-desc">{community.description}</p>

            <ul className="community-links">
              {community.links.map((link, idx) => (
                <li key={idx}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
