import { useEffect, useMemo, useState } from "react";
import { getAdminResults } from "../services/adminService";
import "./AdminResults.css";

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeExam, setActiveExam] = useState(null);

  /* ================= FETCH ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAdminResults();
        setResults(res.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ================= GROUP BY EXAM ================= */
  const exams = useMemo(() => {
    const map = {};

    results.forEach(r => {
      if (!map[r.examTitle]) {
        map[r.examTitle] = [];
      }
      map[r.examTitle].push(r);
    });

    return Object.entries(map).map(([examTitle, attempts]) => {
      const sorted = [...attempts].sort(
        (a, b) =>
          new Date(b.submittedAt) - new Date(a.submittedAt)
      );

      const avg =
        sorted.reduce((s, a) => s + (a.score || 0), 0) /
        sorted.length;

      const passed = sorted.filter(
        a => a.score >= 40
      ).length;

      return {
        examTitle,
        attempts: sorted,
        total: sorted.length,
        passed,
        failed: sorted.length - passed,
        avgScore: Math.round(avg),
        latest: sorted[0]?.submittedAt
      };
    });
  }, [results]);

  if (loading) return <p>Loading results…</p>;

  return (
    <div className="admin-page">
      <h2>Exam Results</h2>

      {exams.length === 0 && (
        <p>No results available</p>
      )}

      {/* ================= EXAM CARDS ================= */}
      <div className="results-list">
        {exams.map(exam => (
          <div
            key={exam.examTitle}
            className="result-card"
          >
            {/* ===== HEADER ===== */}
            <div className="result-header">
              <h3>{exam.examTitle}</h3>
              <span className="score-pill">
                Avg {exam.avgScore}%
              </span>
            </div>

            {/* ===== STATS ===== */}
            <div className="result-stats">
              <div>
                <label>Attempts</label>
                <span>{exam.total}</span>
              </div>

              <div className="pass">
                <label>Passed</label>
                <span>{exam.passed}</span>
              </div>

              <div className="fail">
                <label>Failed</label>
                <span>{exam.failed}</span>
              </div>

              <div>
                <label>Last Attempt</label>
                <span>
                  {exam.latest
                    ? new Date(
                        exam.latest
                      ).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>

            {/* ===== FOOTER ===== */}
            <div className="result-footer">
              <button
                className="view-btn"
                onClick={() => setActiveExam(exam)}
              >
                View Attempts →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL ================= */}
      {activeExam && (
        <div
          className="modal-overlay"
          onClick={() => setActiveExam(null)}
        >
          <div
            className="modal large"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h4>
                {activeExam.examTitle} — Attempts
              </h4>
              <button
                className="close-btn"
                onClick={() =>
                  setActiveExam(null)
                }
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Score</th>
                    <th>Correct</th>
                    <th>Total</th>
                    <th>Violations</th>
                    <th>Status</th>
                    <th>Reason</th>
                    <th>Submitted</th>
                  </tr>
                </thead>

                <tbody>
                  {activeExam.attempts.map(r => (
                    <tr key={r.resultId}>
                      <td>{r.studentName}</td>
                      <td>{r.studentEmail}</td>
                      <td>{r.score}%</td>
                      <td>{r.correctAnswers}</td>
                      <td>{r.totalQuestions}</td>
                      <td>{r.violations}</td>
                      <td
                        className={
                          r.score >= 40
                            ? "pass"
                            : "fail"
                        }
                      >
                        {r.score >= 40
                          ? "PASS"
                          : "FAIL"}
                      </td>
                      <td>{r.submissionReason}</td>
                      <td>
                        {new Date(
                          r.submittedAt
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
