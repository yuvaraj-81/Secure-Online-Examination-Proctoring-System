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

  const [status, setStatus] = useState("LOADING");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [violations, setViolations] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [examTitle, setExamTitle] = useState("Exam");

  /* 🎥 VIDEO PROCTORING STATE */
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const timerRef = useRef(null);
  const submittedRef = useRef(false);
  const violationLockRef = useRef(false);

  /* ================= OPTIONS (RANDOMIZED) ================= */
  const buildOptions = useCallback(q => {
    if (!q) return [];
    const base = [q.optionA, q.optionB, q.optionC, q.optionD]
      .filter(Boolean)
      .map(o => o.trim());

    return shuffleArray(base, q.id);
  }, []);

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

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      navigate("/student/exams", { replace: true });
    },
    [examId, answers, violations, navigate]
  );

  /* ================= VIOLATION HANDLER ================= */
  const registerViolation = useCallback(
    reason => {
      if (submittedRef.current || violationLockRef.current) return;

      violationLockRef.current = true;

      setViolations(v => {
        const next = v + 1;

        saveExamProgress(examId, {
          answers: JSON.stringify(answers),
          violations: next
        }).catch(() => {});

        if (next >= MAX_VIOLATIONS) {
          safeSubmit("MAX_VIOLATIONS");
        }

        return next;
      });

      setTimeout(() => {
        violationLockRef.current = false;
      }, 1000);
    },
    [examId, answers, safeSubmit]
  );

  /* ================= 🎥 CAMERA SETUP ================= */
  useEffect(() => {
    if (status !== "ACTIVE") return;

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });

        mediaStreamRef.current = stream;
        videoRef.current.srcObject = stream;
        setCameraActive(true);

        stream.getVideoTracks()[0].onended = () => {
          setCameraActive(false);
          registerViolation("CAMERA_DISABLED");
        };
      } catch {
        registerViolation("CAMERA_DENIED");
      }
    };

    initCamera();

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [status, registerViolation]);

  /* ================= PROCTORING EVENTS ================= */
  useEffect(() => {
    if (status !== "ACTIVE") return;

    const onVisibility = () => {
      if (document.hidden) registerViolation("TAB_SWITCH");
    };

    const onBlur = () => registerViolation("WINDOW_BLUR");

    const disableContextMenu = e => {
      e.preventDefault();
      registerViolation("RIGHT_CLICK");
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("contextmenu", disableContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("contextmenu", disableContextMenu);
    };
  }, [status, registerViolation]);

  /* ================= START / RESUME ================= */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data } = await startOrResumeExam(examId);
        if (!mounted) return;

        if (["SUBMITTED", "TERMINATED"].includes(data.status)) {
          alert("Exam already attempted");
          navigate("/student/exams", { replace: true });
          return;
        }

        setExamTitle(data.examTitle || "Exam");
        setViolations(data.violations ?? 0);
        setAnswers(data.answersJson ? JSON.parse(data.answersJson) : {});

        const seed = data.examAttemptId || Number(examId);
        setQuestions(shuffleArray(data.questions || [], seed));

        const remaining = Math.max(
          0,
          Math.floor((new Date(data.endsAt) - Date.now()) / 1000)
        );
        setTimeLeft(remaining);

        setStatus("ACTIVE");
        document.documentElement.requestFullscreen().catch(() => {});
      } catch {
        navigate("/student/exams", { replace: true });
      }
    })();

    return () => (mounted = false);
  }, [examId, navigate]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (status !== "ACTIVE") return;

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
  }, [status, safeSubmit]);

  /* ================= UI ================= */
  if (status === "LOADING") return <p>Loading exam...</p>;

  const q = questions[currentIndex];
  const options = buildOptions(q);
  const selectedAnswer = answers[q?.id];

  return (
    <div className="exam-shell">
     {/* 🎥 LIVE CAMERA PREVIEW */}
<div className={`camera-proctor ${cameraActive ? "ok" : "error"}`}>
  <video
    ref={videoRef}
    autoPlay
    muted
    playsInline
  />

  <div className="camera-overlay">
    <span className="camera-label">
      {cameraActive ? "Camera Active" : "Camera Error"}
    </span>

    <span className="violation-badge">
      ⚠ {violations}/{MAX_VIOLATIONS}
    </span>
  </div>
</div>



      <h2 className="exam-title">{examTitle}</h2>

      <div className="exam-header">
        <span className="timer">
          ⏱ {Math.floor(timeLeft / 60)}:
          {String(timeLeft % 60).padStart(2, "0")}
        </span>
        <span className="violation">
          ⚠ {violations}/{MAX_VIOLATIONS}
        </span>
      </div>

      <main className="exam-body">
        <div className="question-card">
          <strong>
            {currentIndex + 1}. {q.questionText}
          </strong>

          {options.map(opt => (
            <label key={opt}>
              <input
                type="radio"
                checked={selectedAnswer === opt}
                onChange={() =>
                  setAnswers(prev => ({ ...prev, [q.id]: opt }))
                }
              />
              {opt}
            </label>
          ))}
        </div>
      </main>

      <footer className="exam-footer">
        {currentIndex < questions.length - 1 ? (
          <button
            disabled={!selectedAnswer}
            onClick={() => setCurrentIndex(i => i + 1)}
          >
            Next
          </button>
        ) : (
          <button
            disabled={!selectedAnswer}
            onClick={() => safeSubmit("MANUAL_SUBMIT")}
          >
            Submit Exam
          </button>
        )}
      </footer>
    </div>
  );
};

export default ExamAttempt;
