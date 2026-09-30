import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth"; // ✅ Import Auth context
import "./Home.css";

export default function Home() {
  const fullText = "Overcome your fitness procrastination and achieve your goals!";
  const [typedText, setTypedText] = useState("");
  const [showReviews, setShowReviews] = useState(false);
  const { token } = useAuth(); // ✅ Access login state (or user object)

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1));
      i++;
      if (i === fullText.length) clearInterval(typingInterval);
    }, 50);
    return () => clearInterval(typingInterval);
  }, []); 

  const reviews = [
    { name: "Alice", review: "FitFreak AI helped me finally stick to my daily workouts!" },
    { name: "John", review: "Love the streak feature, keeps me motivated every day." },
    { name: "Sophie", review: "The nutrition guidance and progress tracking are top-notch." },
  ];

  return (
    <div className="home-container">

      {/* Test rendering of images */}
      <img src="/images/female.png" alt="female" style={{ position: 'absolute', top: 50, left: 20, width: 150, zIndex: 1000 }} />
      <img src="/images/male.png" alt="male" style={{ position: 'absolute', top: 50, right: 20, width: 150, zIndex: 1000 }} />

      <div className="home-hero">
        <h1 className="app-title">FitFreak AI</h1>
        <p className="hero-subtitle">{typedText}</p>

        <ul className="features-list">
          <li className="feature-item">💪 Maintain streaks to earn rewards</li>
          <li className="feature-item">📊 Track your progress and stats</li>
          <li className="feature-item">🏋️‍♂️ Personalized workouts and plans</li>
          <li className="feature-item">🥗 Smart nutrition guidance</li>
          <li className="feature-item">🤝 Join the community and stay motivated</li>
        </ul>

        <div className="hero-buttons">
          {/* ✅ Conditional navigation based on login state */}
          <Link to={token ? "/goals" : "/register"} className="get-started-btn">
            Get Started →
          </Link>
          
          <button
            className="get-reviews-btn"
            onClick={() => setShowReviews(!showReviews)}
          >
            {showReviews ? "Close Reviews" : "Get Reviews"}
          </button>
        </div>
      </div>

      {/* Conditionally render reviews */}
      {showReviews && reviews.map((rev, idx) => (
        <div key={idx} className={`pop-review pop-${idx + 1}`}>
          <p className="review-text">"{rev.review}"</p>
          <p className="review-author">— {rev.name}</p>
        </div>
      ))} 
    </div>
  );
}
