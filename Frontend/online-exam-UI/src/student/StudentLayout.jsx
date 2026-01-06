import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import StudentDashboard from "./StudentDashboard";
import StudentCourses from "./StudentCourses";
import StudentExams from "./StudentExams";
import StudentResults from "./StudentResults";
import StudentProfile from "./StudentProfile";

import "./StudentLayout.css";

const TABS = ["dashboard", "courses", "exams", "results", "profile"];

const StudentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [lightMode, setLightMode] = useState(false);

  /* ===============================
     SYNC TAB FROM URL ✅ FIX
  =============================== */
  useEffect(() => {
    const path = location.pathname.replace("/student", "");
    const tabFromUrl = path.split("/")[1];

    if (TABS.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab("dashboard");
    }
  }, [location.pathname]);

  /* ===============================
     LOAD SAVED THEME
  =============================== */
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setLightMode(savedTheme === "light");
  }, []);

  /* ===============================
     APPLY THEME (BODY + HTML)
  =============================== */
  useEffect(() => {
    const theme = lightMode ? "light" : "dark";

    document.body.classList.remove("light", "dark");
    document.documentElement.classList.remove("light", "dark");

    document.body.classList.add(theme);
    document.documentElement.classList.add(theme);

    localStorage.setItem("theme", theme);
  }, [lightMode]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleTabChange = tab => {
    setActiveTab(tab);
    navigate(tab === "dashboard" ? "/student" : `/student/${tab}`);
  };

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <StudentDashboard />;
      case "courses":
        return <StudentCourses />;
      case "exams":
        return <StudentExams />;
      case "results":
        return <StudentResults />;
      case "profile":
        return <StudentProfile />;
      default:
        return null;
    }
  };

  return (
    <div className={`student-layout ${lightMode ? "light" : "dark"}`}>
      {/* SIDEBAR */}
      <aside className="student-sidebar">
        <div className="brand">
          <h2>🎓 Student</h2>
          <span className="subtitle">Dashboard</span>
        </div>

        <nav className="menu">
          {TABS.map(tab => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => handleTabChange(tab)}
            >
              <span className="menu-label">
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </span>
            </button>
          ))}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="student-main">
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
              {lightMode ? "Dark Mode" : "Light Mode"}
            </button>
          </div>
        </header>

        <div className="content-card">
          {renderTab()}
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
