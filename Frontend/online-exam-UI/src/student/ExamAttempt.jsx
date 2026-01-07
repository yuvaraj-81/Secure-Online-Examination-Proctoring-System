import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  startOrResumeExam,
  submitExam
} from "../services/studentService";
import "./ExamAttempt.css";

const MAX_VIOLATIONS = 3;

/* ================= SHUFFLE ================= */
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

  const [ready, setReady] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [violations, setViolations] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [examTitle, setExamTitle] = useState("Exam");
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const submittedRef = useRef(false);
  const violationLockRef = useRef(false);

  /* ================= SYNC SELECTION (🔥 FIX) ================= */
  useEffect(() => {
    const q = questions[currentIndex];
    if (!q) return;

    // Restore previous answer OR reset selection
    setSelected(answers[String(q.id)] ?? null);
  }, [currentIndex, questions, answers]);

  /* ================= NORMAL SUBMIT ================= */
  const submitExamNormally = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    await submitExam(examId, {
      reason: "MANUAL_SUBMIT",
      answers: JSON.stringify(answers),
      violations
    }).catch(() => {});

    streamRef.current?.getTracks().forEach(t => t.stop());
    document.exitFullscreen?.().catch(() => {});

    alert("Exam submitted successfully.");
    navigate("/student/exams", { replace: true });
  }, [examId, answers, violations, navigate]);

  /* ================= TERMINATE ================= */
  const terminateExam = useCallback(
    async reason => {
      if (submittedRef.current) return;
      submittedRef.current = true;

      await submitExam(examId, {
        reason,
        answers: JSON.stringify(answers),
        violations: violations + 1
      }).catch(() => {});

      streamRef.current?.getTracks().forEach(t => t.stop());
      document.exitFullscreen?.().catch(() => {});

      alert("Exam terminated due to rule violation.");
      navigate("/student/exams", { replace: true });
    },
    [examId, answers, violations, navigate]
  );

  /* ================= VIOLATION ================= */
  const addViolation = useCallback(
    () => {
      if (submittedRef.current || violationLockRef.current) return;

      violationLockRef.current = true;
      setTimeout(() => (violationLockRef.current = false), 800);

      setViolations(v => {
        const next = v + 1;
        if (next >= MAX_VIOLATIONS) {
          terminateExam("VIOLATION_LIMIT");
        }
        return next;
      });
    },
    [terminateExam]
  );

  /* ================= START ================= */
  const handleStartExam = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setReady(true);
    } catch {
      alert("Fullscreen permission is mandatory.");
    }
  };

  /* ================= CAMERA ================= */
  useEffect(() => {
    if (!ready) return;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then(stream => {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        stream.getVideoTracks()[0].onended = () =>
          terminateExam("CAMERA_STOPPED");
      })
      .catch(() => terminateExam("CAMERA_DENIED"));

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [ready, terminateExam]);

  /* ================= SECURITY GUARD ================= */
  useEffect(() => {
    if (!ready) return;

    const onKeyDown = e => {
      const key = e.key.toLowerCase();

      if (key === "escape") {
        e.preventDefault();
        terminateExam("ESC_KEY");
      }

      if (e.ctrlKey || e.metaKey) {
        if (["c", "v", "a", "x", "s", "p"].includes(key)) {
          e.preventDefault();
          addViolation();
        }
      }

      if (key === "f12") {
        e.preventDefault();
        terminateExam("DEVTOOLS");
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) addViolation();
    };

    const onBlur = () => addViolation();

    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        terminateExam("EXIT_FULLSCREEN");
      }
    };

    const block = e => e.preventDefault();

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFullscreenChange);

    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("paste", block);
    document.addEventListener("contextmenu", block);

    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFullscreenChange);

      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("paste", block);
      document.removeEventListener("contextmenu", block);

      document.body.style.userSelect = "";
    };
  }, [ready, addViolation, terminateExam]);

  /* ================= LOAD EXAM ================= */
  useEffect(() => {
    startOrResumeExam(examId)
      .then(({ data }) => {
        if (["SUBMITTED", "TERMINATED"].includes(data.status)) {
          navigate("/student/exams", { replace: true });
          return;
        }

        setExamTitle(data.examTitle);
        setViolations(data.violations || 0);
        setAnswers(data.answersJson ? JSON.parse(data.answersJson) : {});
        setQuestions(shuffleArray(data.questions || [], examId));
      })
      .catch(() => navigate("/student/exams", { replace: true }));
  }, [examId, navigate]);

  /* ================= PROGRESS ================= */
  const progressPercent =
    questions.length === 0
      ? 0
      : Math.round(((currentIndex + 1) / questions.length) * 100);

  useEffect(() => {
    requestAnimationFrame(() => setAnimatedProgress(progressPercent));
  }, [progressPercent]);

  const q = questions[currentIndex];
  const options = q
    ? shuffleArray(
        [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean),
        q.id
      )
    : [];

  return (
    <div className="exam-shell">
      {!ready && (
        <div className="exam-modal-backdrop">
          <div className="exam-modal-card">
            <h2>{examTitle}</h2>
            <p>Camera & fullscreen access is required.</p>
            <button onClick={handleStartExam} className="start-exam-btn">
              Start Exam
            </button>
          </div>
        </div>
      )}

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
            <label
              key={opt}
              className={selected === opt ? "selected" : ""}
              onClick={() => {
                setSelected(opt);
                setAnswers(prev => ({
                  ...prev,
                  [String(q.id)]: opt
                }));
              }}
            >
              <input type="radio" checked={selected === opt} readOnly />
              {opt}
            </label>
          ))}
        </div>

        <footer className="exam-footer">
          <button
            disabled={!selected}
            onClick={() =>
              currentIndex < questions.length - 1
                ? setCurrentIndex(i => i + 1)
                : submitExamNormally()
            }
          >
            {currentIndex < questions.length - 1 ? "Next" : "Submit Exam"}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ExamAttempt;
