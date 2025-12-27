import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getQuestionsByExam,
  addQuestion,
  deleteQuestion
} from "../services/adminService";

import "./AdminQuestions.css";

const emptyForm = {
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: ""
};

const normalize = text =>
  text.trim().replace(/\s+/g, " ");

const Questions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= FETCH ================= */

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await getQuestionsByExam(examId);
      setQuestions(Array.isArray(res.data) ? res.data : []);
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [examId]);

  /* ================= ADD ================= */

  const handleAdd = async e => {
    e.preventDefault();
    if (saving) return;

    const normalizedForm = {
      questionText: normalize(form.questionText),
      optionA: normalize(form.optionA),
      optionB: normalize(form.optionB),
      optionC: normalize(form.optionC),
      optionD: normalize(form.optionD),
      correctAnswer: normalize(form.correctAnswer)
    };

    const {
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer
    } = normalizedForm;

    if (
      !questionText ||
      !optionA ||
      !optionB ||
      !optionC ||
      !optionD ||
      !correctAnswer
    ) {
      alert("All fields are required");
      return;
    }

    if (
      ![optionA, optionB, optionC, optionD].includes(
        correctAnswer
      )
    ) {
      alert(
        "Correct answer must exactly match one of the options"
      );
      return;
    }

    const exists = questions.some(
      q =>
        normalize(q.questionText).toLowerCase() ===
        questionText.toLowerCase()
    );

    if (exists) {
      alert("This question already exists for this exam");
      return;
    }

    try {
      setSaving(true);
      await addQuestion(examId, normalizedForm);
      setForm(emptyForm);
      fetchQuestions();
    } catch {
      alert("Failed to add question");
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async id => {
    if (!window.confirm("Delete this question?")) return;

    try {
      await deleteQuestion(id);
      fetchQuestions();
    } catch {
      alert("Failed to delete question");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="admin-page">
      {/* 🔥 HEADER ROW — FIXED ORDER */}
      <div className="students-header">
        <h2>Manage Questions</h2>

        <button
          className="back-btn"
          onClick={() => navigate("/admin/exams")}
        >
          ← Back to Exams
        </button>
      </div>

      {/* ===== ADD FORM ===== */}
      <form className="question-form responsive" onSubmit={handleAdd}>
        <textarea
          className="full"
          placeholder="Question text"
          value={form.questionText}
          onChange={e =>
            setForm({ ...form, questionText: e.target.value })
          }
        />

        <input
          placeholder="Option A"
          value={form.optionA}
          onChange={e =>
            setForm({ ...form, optionA: e.target.value })
          }
        />

        <input
          placeholder="Option B"
          value={form.optionB}
          onChange={e =>
            setForm({ ...form, optionB: e.target.value })
          }
        />

        <input
          placeholder="Option C"
          value={form.optionC}
          onChange={e =>
            setForm({ ...form, optionC: e.target.value })
          }
        />

        <input
          placeholder="Option D"
          value={form.optionD}
          onChange={e =>
            setForm({ ...form, optionD: e.target.value })
          }
        />

        <input
          className="full"
          placeholder="Correct Answer (must match option text)"
          value={form.correctAnswer}
          onChange={e =>
            setForm({
              ...form,
              correctAnswer: e.target.value
            })
          }
        />

        <button
          className="primary full"
          type="submit"
          disabled={saving}
        >
          {saving ? "Adding..." : "Add Question"}
        </button>
      </form>

      {/* ===== LIST ===== */}
      {loading && <p>Loading questions...</p>}

      {!loading && questions.length === 0 && (
        <p>No questions added yet</p>
      )}

      {!loading && questions.length > 0 && (
        <div className="question-list">
          {questions.map((q, index) => (
            <div key={q.id} className="question-card">
              <strong>
                {index + 1}. {q.questionText}
              </strong>

              <ul>
                <li>A. {q.optionA}</li>
                <li>B. {q.optionB}</li>
                <li>C. {q.optionC}</li>
                <li>D. {q.optionD}</li>
              </ul>

              <div className="correct">
                ✔ Correct: {q.correctAnswer}
              </div>

              <button
                className="danger"
                onClick={() => handleDelete(q.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Questions;
