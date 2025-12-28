import { useEffect, useState } from "react";
import { getStudentDashboard } from "../services/studentService";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentDashboard()
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (!data) return <p>Failed to load dashboard</p>;

  return (
    <div className="student-dashboard">
      <h2>Dashboard Overview</h2>

      {/* ===== KPI CARDS ===== */}
      <div className="dashboard-cards">
        <div className="dash-card">
          <span>Total Exams</span>
          <strong>{data.totalExams}</strong>
        </div>

        <div className="dash-card success">
          <span>Passed</span>
          <strong>{data.passed}</strong>
        </div>

        <div className="dash-card">
          <span>Attempted</span>
          <strong>{data.attempted}</strong>
        </div>

        <div className="dash-card info">
          <span>Avg Score</span>
          <strong>{data.averageScore}%</strong>
        </div>
      </div>

      {/* ===== PROGRESS ===== */}
      <div className="progress-box">
        <div className="progress-label">
          Overall Completion — {data.completionPercent}%
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${data.completionPercent}%` }}
          />
        </div>
      </div>

      {/* ===== LATEST ACTIVITY ===== */}
      {data.latestExam && (
        <div className="latest-exam">
          <h4>Latest Activity</h4>
          <p>
            <strong>{data.latestExam.title}</strong> —{" "}
            <span
              className={
                data.latestExam.status === "PASS"
                  ? "pass"
                  : "fail"
              }
            >
              {data.latestExam.status}
            </span>{" "}
            ({data.latestExam.score}%)
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
