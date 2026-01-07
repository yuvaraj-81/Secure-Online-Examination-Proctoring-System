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
  const [selected, setSelected] = useState(null);
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

  const q = questions[currentIndex];
  const options = buildOptions(q);

  /* ================= RESET SELECTION ================= */
  useEffect(() => {
    setSelected(null);
  }, [currentIndex]);

  /* ================= START EXAM ================= */
  const handleStartExam = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setReady(true);
    } catch {
      alert("Fullscreen permission is mandatory.");
    }
  };

  /* ================= SAFE SUBMIT ================= */
  const safeSubmit = useCallback(
    async reason => {
      if (submittedRef.current) return;
      submittedRef.current = true;

      clearInterval(timerRef.current);

      await saveExamProgress(examId, {
        answers: JSON.stringify(answers),
        violations
      }).catch(() => {});

      await submitExam(examId, {
        reason,
        answers: JSON.stringify(answers),
        violations
      }).catch(() => {});

      streamRef.current?.getTracks().forEach(t => t.stop());

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

  /* ================= CAMERA ================= */
  useEffect(() => {
    if (!ready) return;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then(stream => {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;

        stream.getVideoTracks()[0].onended = () => {
          addViolation();
        };
      })
      .catch(() => {
        alert("Camera permission denied.");
        safeSubmit("CAMERA_DENIED");
      });

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [ready, addViolation, safeSubmit]);

  /* ================= ANTI COPY / PASTE ================= */
  useEffect(() => {
    if (!ready) return;

    const block = e => e.preventDefault();

    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("paste", block);
    document.addEventListener("contextmenu", block);

    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";

    return () => {
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("paste", block);
      document.removeEventListener("contextmenu", block);

      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    };
  }, [ready]);

  /* ================= ESC + FULLSCREEN VIOLATION ================= */
  useEffect(() => {
    if (!ready) return;

    const onKeyDown = e => {
      if (e.key === "Escape") {
        e.preventDefault();
        addViolation();
      }
    };

    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        addViolation();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [ready, addViolation]);

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
              <input
                type="radio"
                name={`question-${q?.id}`}
                checked={selected === opt}
                readOnly
              />
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
                : safeSubmit("MANUAL_SUBMIT")
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
