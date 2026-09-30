import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import axios from "../api/axiosInstance";
import "./Coins.css";

const shopItems = [
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

export default function Coins() {
  const { token } = useAuth();
  const [coins, setCoins] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchCoins = async () => {
      if (!token) return;
      try {
        const res = await axios.get("/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCoins(res.data.coins || 0);
      } catch (err) {
        console.error("Error fetching coins:", err);
      }
    };

    fetchCoins();
  }, [token]);

  return (
    <div className="coins-page-container">
      <h2 className="coins-header">Total FitFreak Coins: {coins} 🪙</h2>
      <p>Demo rewards — coin earning and redemption are coming soon.</p>

      {/* Want to Earn More? link */}
      <p className="earn-more-link" onClick={() => setShowPopup(true)}>
        💡 About rewards
      </p>

      <div className="shop-container">
        {shopItems.map((item) => (
          <div key={item.id} className="shop-item">
            <img src={item.img} alt={item.name} className="shop-item-img" />
            <h3 className="shop-item-name">{item.name}</h3>
            <p className="shop-item-price">{item.price} 🪙</p>
            <button className="shop-item-btn" disabled>
              Coming soon
            </button>
          </div>
        ))}
      </div>

      {/* Popup */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div
            className="popup-box"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside box
          >
            <h3>FitFreak Rewards</h3>
            <p>
              Rewards for consistent activity are planned. These sample items
              cannot be purchased yet, and completing tasks does not currently award coins.
            </p>
            <button className="popup-close-btn" onClick={() => setShowPopup(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
