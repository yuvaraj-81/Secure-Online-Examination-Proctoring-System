import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getMyExams } from "../services/studentService";
import Skeleton from "../components/Skeleton";
import "./StudentExams.css";

const StudentExams = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState(null);
  const [startingExamId, setStartingExamId] = useState(null);

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
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      window.__examCameraStream = stream;

      navigate(`/exam/attempt/${examId}`);
    } catch (err) {
      alert("Fullscreen and camera permission are required to start the exam.");

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
      <div className="exams-header">
        <h3>Available Exams</h3>
        <p className="subtitle">
          Secure, proctored assessments assigned to you
        </p>
      </div>

      {/* Loading */}
      {!exams && (
        <div className="exam-grid">
          <Skeleton height={110} radius={16} />
          <Skeleton height={110} radius={16} />
        </div>
      )}

      {/* Empty */}
      {exams && exams.length === 0 && (
        <div className="empty-state">
          🎉 No exams right now. You’re all caught up.
        </div>
      )}

      {/* Exams */}
      {exams && exams.length > 0 && (
        <div className="exam-grid">
          {exams.map(exam => {
            const status = exam.attemptStatus;
            const isStarting = startingExamId === exam.id;

            return (
              <div key={exam.id} className="exam-card">
                <div className="exam-info">
                  <h4>{exam.title}</h4>
                  <span className="exam-meta">
                    ⏱ {exam.durationMinutes} minutes
                  </span>
                </div>

                <div className="exam-action">
                  {!status && (
                    <button
                      className="exam-btn start"
                      disabled={isStarting}
                      onClick={() => startExam(exam.id)}
                    >
                      {isStarting ? "Starting…" : "Start Exam"}
                    </button>
                  )}

                  {status === "ACTIVE" && (
                    <button
                      className="exam-btn resume"
                      disabled={isStarting}
                      onClick={() => startExam(exam.id)}
                    >
                      {isStarting ? "Resuming…" : "Resume"}
                    </button>
                  )}

                  {(status === "SUBMITTED" ||
                    status === "TERMINATED") && (
                    <button className="exam-btn done" disabled>
                      Completed
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentExams;
