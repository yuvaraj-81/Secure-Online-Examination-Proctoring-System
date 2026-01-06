import { useEffect, useState } from "react";
import {
  getMyResults,
  getResultReview,
  getResultSummary,
  downloadResultPdf
} from "../services/studentService";
import "./StudentResults.css";

const PASS_PERCENT = 40;

const StudentResults = () => {
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedResult, setSelectedResult] = useState(null);
  const [reviewResult, setReviewResult] = useState(null);
  const [reviewData, setReviewData] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);

  /* ================= FETCH ================= */

  useEffect(() => {
    Promise.all([getMyResults(), getResultSummary()])
      .then(([resultsRes, summaryRes]) => {
        const data = resultsRes.data || [];
        data.sort(
          (a, b) =>
            new Date(b.submittedAt) - new Date(a.submittedAt)
        );

        setResults(data);
        setSummary(summaryRes.data);
      })
      .catch(() => {
        setResults([]);
        setSummary(null);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ================= SCROLL LOCK ================= */

  useEffect(() => {
    document.body.style.overflow =
      selectedResult || reviewResult ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [selectedResult, reviewResult]);

  /* ================= PDF ================= */

  const handleDownloadPdf = async (id) => {
    try {
      const res = await downloadResultPdf(id);
      const blob = new Blob([res.data], {
        type: "application/pdf"
      });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `result-${id}.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download PDF");
    }
  };

  if (loading) return <p>Loading results…</p>;

  return (
    <div className="student-results">
      <h3>My Results</h3>

      {/* ================= SUMMARY ================= */}
      {summary && (
        <div className="results-summary">
          <div className="summary-card">
            <span>Total Exams</span>
            <strong>{summary.totalExams}</strong>
          </div>

          <div className="summary-card success">
            <span>Passed</span>
            <strong>{summary.passed}</strong>
          </div>

          <div className="summary-card info">
            <span>Average Score</span>
            <strong>{summary.averageScore}%</strong>
          </div>
        </div>
      )}

      {/* ================= EMPTY ================= */}
      {results.length === 0 && (
        <div className="empty-state">
          No results yet
          <p>Attempt an exam to see your performance.</p>
        </div>
      )}

      {/* ================= RESULTS ================= */}
      <div className="results-grid">
        {results.map(r => {
          const score = r.score ?? 0;
          const passed = score >= PASS_PERCENT;

          return (
            <div key={r.id} className="result-card">
              <div className="result-header">
                <strong>{r.examTitle}</strong>
                <span className={`status ${passed ? "pass" : "fail"}`}>
                  {passed ? "PASS" : "FAIL"}
                </span>
              </div>

              <div className="score-row">
                <span>Score</span>
                <strong>{score}%</strong>
              </div>

              <div className="progress">
                <div
                  className={`progress-bar ${passed ? "pass" : "fail"}`}
                  style={{ width: `${score}%` }}
                />
              </div>

              <div className="meta">
                Violations: {r.violations}
              </div>
              <div className="meta">
                📅 {new Date(r.submittedAt).toLocaleDateString()}
              </div>

              <div className="result-actions">
                <button
                  className="view-btn"
                  onClick={() => setSelectedResult(r)}
                >
                  View Summary
                </button>

                <button
                  className="view-btn primary"
                  onClick={async () => {
                    setReviewResult(r);
                    setReviewLoading(true);
                    try {
                      const res = await getResultReview(r.id);
                      setReviewData(res.data || []);
                    } catch {
                      setReviewData([]);
                    } finally {
                      setReviewLoading(false);
                    }
                  }}
                >
                  Review Exam
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= DETAILS MODAL ================= */}
      {selectedResult && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedResult(null)}
        >
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{selectedResult.examTitle}</h4>
              <button
                className="close-btn"
                onClick={() => setSelectedResult(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p><strong>Status:</strong> {selectedResult.score >= PASS_PERCENT ? "PASS" : "FAIL"}</p>
              <p><strong>Score:</strong> {selectedResult.score}%</p>
              <p><strong>Total Questions:</strong> {selectedResult.totalQuestions}</p>
              <p><strong>Correct Answers:</strong> {selectedResult.correctAnswers}</p>
              <p><strong>Violations:</strong> {selectedResult.violations}</p>
              <p><strong>Submitted:</strong> {new Date(selectedResult.submittedAt).toLocaleString()}</p>

              <div className="modal-actions">
                <button
                  className="view-btn primary"
                  onClick={() => handleDownloadPdf(selectedResult.id)}
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= REVIEW MODAL ================= */}
      {reviewResult && (
        <div
          className="modal-overlay"
          onClick={() => {
            setReviewResult(null);
            setReviewData([]);
          }}
        >
          <div
            className="modal large"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h4>Exam Review – {reviewResult.examTitle}</h4>
              <button
                className="close-btn"
                onClick={() => {
                  setReviewResult(null);
                  setReviewData([]);
                }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body review-body">
              {reviewLoading && <p>Loading review…</p>}

              {!reviewLoading &&
                reviewData.map((q, i) => (
                  <div key={q.questionId} className="review-question">
                    <strong>{i + 1}. {q.questionText}</strong>

                    <ul className="review-options">
                      {q.options.map(opt => {
                        let cls = "";
                        if (opt === q.correctAnswer) cls = "correct";
                        else if (
                          opt === q.selectedAnswer &&
                          q.selectedAnswer !== q.correctAnswer
                        ) cls = "wrong";

                        return (
                          <li key={opt} className={cls}>{opt}</li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentResults;
