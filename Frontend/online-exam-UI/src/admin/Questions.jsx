import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getQuestionsByExam,
  addQuestion,
  deleteQuestion,
  importQuestionsPdf
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

  /*  IMPORT STATE */
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");

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

  /* ================= IMPORT ================= */

  const handleImport = async () => {
    if (!importFile) {
      alert("Please select a PDF file");
      return;
    }

    try {
      setImporting(true);
      setImportMsg("");

      const res = await importQuestionsPdf(examId, importFile);
      setImportMsg(res.data || "Questions imported successfully");

      setImportFile(null);
      fetchQuestions();
    } catch (err) {
      setImportMsg(
        err?.response?.data ||
          "Failed to import questions from PDF"
      );
    } finally {
      setImporting(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="admin-page">
      {/*  HEADER (NO IMPORT BUTTON HERE) */}
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

        {/*  FORM ACTION ROW */}
        <div className="form-actions full">
          <button
            className="primary"
            type="submit"
            disabled={saving}
          >
            {saving ? "Adding..." : "Add Question"}
          </button>

          <button
            type="button"
            className="secondary import-btn"
            onClick={() => setShowImport(true)}
          >
            ⬆ Import PDF
          </button>
        </div>
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

      {/* ===== IMPORT MODAL ===== */}
      {showImport && (
        <div
          className="modal-overlay"
          onClick={() => setShowImport(false)}
        >
          <div
            className="modal"
            onClick={e => e.stopPropagation()}
          >
            <h3>Import Questions from PDF</h3>

            <p style={{ fontSize: "13px", color: "#9ca3af" }}>
              PDF must follow this format:
              <br />
              Q1. Question text
              <br />
              A. Option A
              <br />
              B. Option B
              <br />
              C. Option C
              <br />
              D. Option D
              <br />
              ANSWER: Full option text
            </p>

            <input
              type="file"
              accept="application/pdf"
              onChange={e =>
                setImportFile(e.target.files[0])
              }
            />

            {importMsg && (
              <p style={{ marginTop: "10px" }}>
                {importMsg}
              </p>
            )}

            <div className="modal-actions">
              <button
                className="secondary"
                onClick={() => setShowImport(false)}
              >
                Cancel
              </button>

              <button
                className="primary"
                disabled={importing}
                onClick={handleImport}
              >
                {importing ? "Importing..." : "Import PDF"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;