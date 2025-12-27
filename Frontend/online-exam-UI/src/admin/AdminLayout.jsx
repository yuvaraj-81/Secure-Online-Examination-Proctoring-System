import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "./AdminLayout.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 🌙 Dark mode default
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("admin-theme") !== "light";
  });

  useEffect(() => {
    localStorage.setItem(
      "admin-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const isActive = path => location.pathname === path;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className={`admin ${darkMode ? "dark" : "light"}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <h3 className="sidebar-title">Admin Panel</h3>

        <nav className="nav">
          <button
            className={isActive("/admin") ? "active" : ""}
            onClick={() => navigate("/admin")}
          >
            Dashboard
          </button>

          <button
            className={isActive("/admin/students") ? "active" : ""}
            onClick={() => navigate("/admin/students")}
          >
            Students
          </button>

          <button
            className={isActive("/admin/courses") ? "active" : ""}
            onClick={() => navigate("/admin/courses")}
          >
            Courses
          </button>

          <button
            className={isActive("/admin/exams") ? "active" : ""}
            onClick={() => navigate("/admin/exams")}
          >
            Exams
          </button>

          <button
            className={isActive("/admin/results") ? "active" : ""}
            onClick={() => navigate("/admin/results")}
          >
            Results
          </button>
        </nav>

        <button className="logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      {/* Main */}
      <main className="content">
        <div className="topbar">
          <span className="role-badge">ADMIN</span>

          <button
            className="mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
