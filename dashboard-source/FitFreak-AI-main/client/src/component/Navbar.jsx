import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { FaHome, FaBullseye, FaClipboardList, FaChartLine, FaUsers, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaVenus } from "react-icons/fa";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-logo">FitFreak AI</div>
      
      <ul className="navbar-links">
        <li><Link to="/" title="Home"><FaHome /></Link></li>
        {user && (
          <>
            <li><Link to="/goals" title="Goals"><FaBullseye /></Link></li>
            <li><Link to="/plans" title="Plans"><FaClipboardList /></Link></li>
            <li><Link to="/progress" title="Progress"><FaChartLine /></Link></li>
            <li><Link to="/community" title="Community"><FaUsers /></Link></li>
            <li><Link to="/wellness" title="Women's Wellness"><FaVenus /></Link></li>
            <li><Link to="/profile" title="Profile"><FaUser /></Link></li>
          </>
        )}
      </ul>

      <div className="navbar-auth">
        {user ? (
          <button className="logout-btn" onClick={logout} title="Logout">
            <FaSignOutAlt />
          </button>
        ) : (
          <>
            <Link className="login-btn" to="/login" title="Login">
              <FaSignInAlt />
            </Link>
            <Link className="register-btn" to="/register" title="Register">
              <FaUserPlus />
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
