import { useEffect, useState } from "react";
import { getAdminResults } from "../services/adminService";
import "./AdminResults.css";

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Loading results...</p>;

  return (
    <div className="admin-page">
      <h2>Exam Results</h2>

      {results.length === 0 && <p>No results available</p>}

      {results.length > 0 && (
        <table className="results-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Exam</th>
              <th>Score</th>
              <th>Correct</th>
              <th>Total</th>
              <th>Violations</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <tr key={r.resultId}>
                <td>{r.studentName}</td>
                <td>{r.studentEmail}</td>
                <td>{r.examTitle}</td>
                <td>{r.score}%</td>
                <td>{r.correctAnswers}</td>
                <td>{r.totalQuestions}</td>
                <td>{r.violations}</td>
                <td className={r.status === "PASS" ? "pass" : "fail"}>
                  {r.status}
                </td>
                <td>{r.submissionReason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Results;
