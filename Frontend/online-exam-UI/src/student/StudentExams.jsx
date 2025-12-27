import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMyExams } from "../services/studentService";
import Skeleton from "../components/Skeleton";
import "./StudentExams.css";

const StudentExams = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState(null);

  /* ================= FETCH EXAMS ================= */

  const fetchExams = useCallback(() => {
    getMyExams()
      .then(res => {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];
        setExams(data);
      })
      .catch(() => setExams([]));
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  /* ================= UI ================= */

  return (
    <div className="student-exams">
      <h3>📝 Available Exams</h3>

      {/* Loading */}
      {!exams && (
        <>
          <Skeleton height={60} />
          <Skeleton height={60} />
        </>
      )}

      {/* Empty */}
      {exams && exams.length === 0 && (
        <p className="empty-state">No exams available</p>
      )}

      {/* Data */}
      {exams && exams.length > 0 && (
        <ul className="card-list">
          {exams.map(exam => {
            const status = exam.attemptStatus;
            // null | ACTIVE | SUBMITTED | TERMINATED

            return (
              <li key={exam.id} className="card-item exam-card">
                <div className="exam-row">
                  {/* LEFT */}
                  <div className="exam-left">
                    <strong>{exam.title}</strong>
                    <div className="muted">
                      ⏱ {exam.durationMinutes} mins
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="exam-right">
                    {!status && (
                      <button
                        className="primary-btn start-btn"
                        onClick={() =>
                          navigate(`/exam/attempt/${exam.id}`)
                        }
                      >
                        Start
                      </button>
                    )}

                    {status === "ACTIVE" && (
                      <button
                        className="primary-btn resume-btn"
                        onClick={() =>
                          navigate(`/exam/attempt/${exam.id}`)
                        }
                      >
                        Resume
                      </button>
                    )}

                    {(status === "SUBMITTED" ||
                      status === "TERMINATED") && (
                      <button
                        className="primary-btn completed-btn"
                        disabled
                      >
                        Completed
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default StudentExams;
