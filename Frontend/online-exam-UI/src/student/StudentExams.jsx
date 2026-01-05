import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getMyExams } from "../services/studentService";
import Skeleton from "../components/Skeleton";
import "./StudentExams.css";

const StudentExams = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState(null);
  const [startingExamId, setStartingExamId] = useState(null);

  // prevents race conditions on fast clicks
  const startingRef = useRef(false);

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

  /* ================= START / RESUME ================= */

  const startExam = async (examId) => {
    if (startingRef.current) return;

    startingRef.current = true;
    setStartingExamId(examId);

    try {
      /* ========= FULLSCREEN (USER GESTURE) ========= */
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }

      /* ========= CAMERA PERMISSION ========= */
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      // store globally for ExamAttempt.jsx
      window.__examCameraStream = stream;

      navigate(`/exam/attempt/${examId}`);
    } catch (err) {
      console.error("Exam start blocked:", err);

      alert(
        "Fullscreen and camera permission are required to start the exam."
      );

      /* ========= CLEANUP ========= */
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      if (window.__examCameraStream) {
        window.__examCameraStream.getTracks().forEach(t => t.stop());
        window.__examCameraStream = null;
      }
    } finally {
      startingRef.current = false;
      setStartingExamId(null);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="student-exams">
      <h3>Available Exams</h3>

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

      {/* Exams List */}
      {exams && exams.length > 0 && (
        <ul className="card-list">
          {exams.map(exam => {
            const status = exam.attemptStatus;
            const isStarting = startingExamId === exam.id;

            return (
              <li
                key={exam.id}
                className="card-item exam-card"
              >
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
                        disabled={isStarting}
                        onClick={() => startExam(exam.id)}
                      >
                        {isStarting ? "Starting..." : "Start"}
                      </button>
                    )}

                    {status === "ACTIVE" && (
                      <button
                        className="primary-btn resume-btn"
                        disabled={isStarting}
                        onClick={() => startExam(exam.id)}
                      >
                        {isStarting ? "Resuming..." : "Resume"}
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