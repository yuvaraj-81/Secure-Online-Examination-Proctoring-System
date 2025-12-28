import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  startOrResumeExam,
  submitExam,
  saveExamProgress
} from "../services/studentService";
import "./ExamAttempt.css";

const MAX_VIOLATIONS = 3;

/* ================= DETERMINISTIC SHUFFLE ================= */
const shuffleArray = (array, seed) => {
  const result = [...array];
  let currentIndex = result.length;

  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(random() * currentIndex);
    currentIndex--;
    [result[currentIndex], result[randomIndex]] = [
      result[randomIndex],
      result[currentIndex]
    ];
  }
  return result;
};

const ExamAttempt = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [ready, setReady] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [violations, setViolations] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [examTitle, setExamTitle] = useState("Exam");
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const submittedRef = useRef(false);

  /* ================= OPTIONS ================= */
  const buildOptions = useCallback(q => {
    if (!q) return [];
    return shuffleArray(
      [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean),
      q.id
    );
  }, []);

  /* ================= USER ACTION ================= */
  const handleStartExam = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setReady(true);
    } catch (err) {
      alert("Fullscreen permission is mandatory.");
    }
  };

  /* ================= 🎥 CAMERA — CORRECT WAY ================= */
  useEffect(() => {
    if (!ready) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });

        streamRef.current = stream;

        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.muted = true;
          video.playsInline = true;
          video.autoplay = true;
        }

        stream.getVideoTracks()[0].onended = () => {
          addViolation();
        };
      } catch (err) {
        alert("Camera permission denied.");
        safeSubmit("CAMERA_DENIED");
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [ready]);

  /* ================= SAFE SUBMIT ================= */
  const safeSubmit = useCallback(
    async reason => {
      if (submittedRef.current) return;
      submittedRef.current = true;

      clearInterval(timerRef.current);

      try {
        await saveExamProgress(examId, {
          answers: JSON.stringify(answers),
          violations
        });
      } catch {}

      try {
        await submitExam(examId, {
          reason,
          answers: JSON.stringify(answers),
          violations
        });
      } catch {}

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      navigate("/student/exams", { replace: true });
    },
    [examId, answers, violations, navigate]
  );

  /* ================= VIOLATIONS ================= */
  const addViolation = useCallback(() => {
    setViolations(v => {
      const next = v + 1;

      if (next >= MAX_VIOLATIONS) {
        alert("Exam terminated due to violations.");
        safeSubmit("VIOLATION_LIMIT");
      }

      return next;
    });
  }, [safeSubmit]);

  /* ================= LOAD EXAM ================= */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await startOrResumeExam(examId);

        setExamTitle(data.examTitle);
        setViolations(data.violations || 0);
        setAnswers(data.answersJson ? JSON.parse(data.answersJson) : {});
        setQuestions(
          shuffleArray(data.questions || [], data.examAttemptId || examId)
        );

        setTimeLeft(
          Math.max(0, Math.floor((new Date(data.endsAt) - Date.now()) / 1000))
        );
      } catch {
        navigate("/student/exams", { replace: true });
      }
    })();
  }, [examId, navigate]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!ready) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          safeSubmit("TIME_EXPIRED");
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [ready, safeSubmit]);

  /* ================= SECURITY ================= */
  useEffect(() => {
    if (!ready) return;

    const onVisibility = () => document.hidden && addViolation();
    const onFullscreen = () =>
      !document.fullscreenElement && safeSubmit("EXIT_FULLSCREEN");

    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", onFullscreen);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("fullscreenchange", onFullscreen);
    };
  }, [ready, addViolation, safeSubmit]);

  /* ================= PROGRESS ================= */
  const progressPercent =
    questions.length === 0
      ? 0
      : Math.round(((currentIndex + 1) / questions.length) * 100);

  useEffect(() => {
    requestAnimationFrame(() => setAnimatedProgress(progressPercent));
  }, [progressPercent]);

  const q = questions[currentIndex];
  const options = buildOptions(q);

  return (
    <div className="exam-shell">
      {/* ===== MODAL ===== */}
      {!ready && (
        <div className="exam-modal-backdrop">
          <div className="exam-modal-card">
            <h2>{examTitle}</h2>
            <p>Camera & fullscreen access is required.</p>
            <button onClick={handleStartExam}>Start Exam</button>
          </div>
        </div>
      )}

      {/* ===== EXAM UI ===== */}
      <div className={`exam-content ${!ready ? "blurred" : ""}`}>
        <div className="exam-top">
          <h2>{examTitle}</h2>

          <div className="camera-proctor">
            <video ref={videoRef} autoPlay muted playsInline />
            <span className="violation-badge">
              ⚠ {violations}/{MAX_VIOLATIONS}
            </span>
          </div>
        </div>

        <div className="exam-progress">
          <div
            className="exam-progress-bar"
            style={{ width: `${animatedProgress}%` }}
          />
        </div>

        <div className="question-card">
          <strong>
            {currentIndex + 1}. {q?.questionText}
          </strong>

          {options.map(opt => (
            <label key={opt}>
              <input
                type="radio"
                checked={answers[q.id] === opt}
                onChange={() =>
                  setAnswers(prev => ({ ...prev, [q.id]: opt }))
                }
              />
              {opt}
            </label>
          ))}
        </div>

        <footer className="exam-footer">
          {currentIndex < questions.length - 1 ? (
            <button
              disabled={!answers[q?.id]}
              onClick={() => setCurrentIndex(i => i + 1)}
            >
              Next
            </button>
          ) : (
            <button
              disabled={!answers[q?.id]}
              onClick={() => safeSubmit("MANUAL_SUBMIT")}
            >
              Submit Exam
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default ExamAttempt;
