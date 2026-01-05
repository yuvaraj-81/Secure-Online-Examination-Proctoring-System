import { useEffect, useState } from "react";
import { getDashboardOverview } from "../services/adminService";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await getDashboardOverview();

        // ✅ Defensive defaults (CRITICAL)
        setData({
          totalStudents: res.data?.totalStudents ?? 0,
          totalCourses: res.data?.totalCourses ?? 0,
          totalExams: res.data?.totalExams ?? 0,
          upcomingExams: res.data?.upcomingExams ?? 0,
          completedExams: res.data?.completedExams ?? 0,
          averageScore: res.data?.averageScore ?? 0,
          passRate: res.data?.passRate ?? 0,

          // Future-proof sections
          recentExams: res.data?.recentExams ?? [],
          topStudents: res.data?.topStudents ?? [],
          atRiskStudents: res.data?.atRiskStudents ?? []
        });
      } catch (err) {
        console.error("Failed to load dashboard", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <p className="loading-text">Loading dashboard...</p>;
  }

  if (!data) {
    return <p className="error-text">No dashboard data available</p>;
  }

  return (
    <div className="admin-page">
      <h2>Dashboard Overview</h2>

      {/* ================= KPI GRID ================= */}
      <div className="kpi-grid">
        <KpiCard title="Total Students" value={data.totalStudents} />
        <KpiCard title="Courses" value={data.totalCourses} />
        <KpiCard title="Total Exams" value={data.totalExams} />
        <KpiCard title="Upcoming Exams" value={data.upcomingExams} />
        <KpiCard title="Completed Exams" value={data.completedExams} />
        <KpiCard
          title="Average Score"
          value={`${data.averageScore.toFixed(1)}%`}
        />
        <KpiCard
          title="Pass Rate"
          value={`${data.passRate.toFixed(1)}%`}
        />
      </div>

      {/* ================= RECENT EXAMS ================= */}
      <Section title="Recent Exams">
        {data.recentExams.length === 0 ? (
          <EmptyState text="No recent exams available" />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Exam</th>
                <th>Date</th>
                <th>Participants</th>
              </tr>
            </thead>
            <tbody>
              {data.recentExams.map((exam, idx) => (
                <tr key={idx}>
                  <td>{exam.title}</td>
                  <td>{exam.date}</td>
                  <td>{exam.participants}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      {/* ================= TOP STUDENTS ================= */}
      <Section title="Top Performers">
        {data.topStudents.length === 0 ? (
          <EmptyState text="No top performers yet" />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {data.topStudents.map((s, idx) => (
                <tr key={idx}>
                  <td>{s.name}</td>
                  <td>{s.score}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      {/* ================= AT-RISK STUDENTS ================= */}
      <Section title="Students at Risk">
        {data.atRiskStudents.length === 0 ? (
          <EmptyState text="No at-risk students 🎉" />
        ) : (
          <table className="admin-table danger">
            <thead>
              <tr>
                <th>Student</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {data.atRiskStudents.map((s, idx) => (
                <tr key={idx}>
                  <td>{s.name}</td>
                  <td>{s.score}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
    </div>
  );
};

/* ================= REUSABLE COMPONENTS ================= */

const KpiCard = ({ title, value }) => (
  <div className="kpi-card">
    <div className="kpi-title">{title}</div>
    <div className="kpi-value">{value}</div>
  </div>
);

const Section = ({ title, children }) => (
  <div className="dashboard-section">
    <h3>{title}</h3>
    {children}
  </div>
);

const EmptyState = ({ text }) => (
  <p className="empty-state">{text}</p>
);

export default AdminDashboard;