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

  /* sync tab from URL */
  useEffect(() => {
    const path = location.pathname.replace("/student", "");
    const tabFromUrl = path.split("/")[1];

    setActiveTab(TABS.includes(tabFromUrl) ? tabFromUrl : "dashboard");
  }, [location.pathname]);

  /* load saved theme */
  useEffect(() => {
    setLightMode(localStorage.getItem("theme") === "light");
  }, []);

  /* apply theme */
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
          <span className="subtitle">Portal</span>
        </div>

        <nav className="menu">
          {TABS.map(tab => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => handleTabChange(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
          <div className="header-top">
            <h1 className="page-title">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>

            <button
              className="theme-toggle"
              onClick={() => setLightMode(prev => !prev)}
            >
              {lightMode ? "🌙 Dark" : "☀️ Light"}
            </button>
          </div>

          <p className="page-subtitle">
            Track your progress and stay ahead
          </p>
        </header>

        <section className="content-card">
          {renderTab()}
        </section>
      </main>
    </div>
  );
};

export default StudentLayout;
