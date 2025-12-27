import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import StudentCourses from "./StudentCourses";
import StudentExams from "./StudentExams";
import StudentResults from "./StudentResults";
import StudentProfile from "./StudentProfile";

import "./StudentDashboard.css";

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("courses");
  const [lightMode, setLightMode] = useState(false);

  const navigate = useNavigate();

  /* ===============================
     LOAD SAVED THEME
  =============================== */
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setLightMode(true);
    }
  }, []);

  /* ===============================
     SAVE THEME
  =============================== */
  useEffect(() => {
    localStorage.setItem("theme", lightMode ? "light" : "dark");
  }, [lightMode]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const renderTab = () => {
    switch (activeTab) {
      case "exams":
        return <StudentExams />;
      case "results":
        return <StudentResults />;
      case "profile":
        return <StudentProfile />;
      default:
        return <StudentCourses />;
    }
  };

  return (
    <div className={`student-layout ${lightMode ? "light" : ""}`}>
      {/* ================= SIDEBAR ================= */}
      <aside className="student-sidebar">
        {/* Brand */}
        <div className="brand">
          <h2>🎓 Student</h2>
          <span className="subtitle">Dashboard</span>
        </div>

        {/* Menu */}
        <nav className="menu">
          <button
            className={activeTab === "courses" ? "active" : ""}
            onClick={() => setActiveTab("courses")}
          >
            <span className="menu-icon">📘</span>
            <span className="menu-label">Courses</span>
          </button>

          <button
            className={activeTab === "exams" ? "active" : ""}
            onClick={() => setActiveTab("exams")}
          >
            <span className="menu-icon">📝</span>
            <span className="menu-label">Exams</span>
          </button>

          <button
            className={activeTab === "results" ? "active" : ""}
            onClick={() => setActiveTab("results")}
          >
            <span className="menu-icon">📊</span>
            <span className="menu-label">Results</span>
          </button>

          <button
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            <span className="menu-icon">👤</span>
            <span className="menu-label">Profile</span>
          </button>
        </nav>

        {/* Logout */}
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="student-main">
        {/* Header */}
        <header className="student-header">
          <h1 className="page-title">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>

          <div className="header-row">
            <span className="page-subtitle">
              Track your progress and stay ahead
            </span>

            <button
              className="theme-toggle"
              onClick={() => setLightMode(prev => !prev)}
            >
              {lightMode ? "🌙 Dark" : "☀️ Light"}
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="content-card">
          {renderTab()}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
