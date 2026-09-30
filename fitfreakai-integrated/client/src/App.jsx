import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./component/Navbar";
import UserProfile from "./component/UserProfile";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Goals from "./pages/Goals";
import Plan from "./pages/Plans";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";
import Coins from "./pages/Coins";
import CurrentStreak from "./pages/CurrentStreak";
import Help from "./pages/Help";
import WomensWellness from "./pages/WomensWellness";
import Chatbot from "./component/Chatbot";

import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import LandingPage from "./LandingPage";
import "./App.css";
import Calendar from "./component/Calendar";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppContent() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  if (pathname === "/") return <LandingPage />;

  return (
    <div className={`app-container ${user ? "with-aside" : "no-aside"}`}>
      {/* Left Sidebar */}
      <Navbar />

      {/* Middle Main Content */}
      <main className="main-content">
        <div className="page-inner">
          <Routes>
            {/* Public Routes */}
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/signup" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />

            <Route
              path="/dashboard"
              element={<PrivateRoute><Navigate to="/goals" replace /></PrivateRoute>}
            />

            {/* Protected Routes */}
            <Route
              path="/goals"
              element={
                <PrivateRoute>
                  <Goals />
                </PrivateRoute>
              }
            />
            <Route
              path="/plans"
              element={
                <PrivateRoute>
                  <Plan />
                </PrivateRoute>
              }
            />
            <Route
              path="/community"
              element={
                <PrivateRoute>
                  <Community />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <PrivateRoute>
                  <Progress />
                </PrivateRoute>
              }
            />
            <Route
              path="/coins"
              element={
                <PrivateRoute>
                  <Coins />
                </PrivateRoute>
              }
            />
            <Route
              path="/current-streak"
              element={
                <PrivateRoute>
                  <CurrentStreak />
                </PrivateRoute>
              }
            />
            <Route
              path="/help"
              element={
                <PrivateRoute>
                  <Help />
                </PrivateRoute>
              }
            />
            <Route
              path="/wellness"
              element={
                <PrivateRoute>
                  <WomensWellness />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
          </Routes>
        </div>
      </main>

      {/* ✅ Only render right sidebar when logged in */}
      {user && (
        <aside className="right-profile">
          <UserProfile />
          <Calendar />
        </aside>
      )}
      <Chatbot />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
