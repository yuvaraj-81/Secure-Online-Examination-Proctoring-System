import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getExams,
  createExam,
  updateExam,
  deleteExam,
  getCourses
} from "../services/adminService";
import "./AdminExams.css";

const Exams = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  //  ADD EXAM MODAL
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);

  //  EDIT
  const [editingExam, setEditingExam] = useState(null);

  const [form, setForm] = useState({
    title: "",
    durationMinutes: "",
    startTime: "",
    courseId: ""
  });

  /* ================= FETCH ================= */

  const fetchData = async () => {
    setLoading(true);
    try {
      const [examRes, courseRes] = await Promise.all([
        getExams(),
        getCourses()
      ]);

      setExams(Array.isArray(examRes.data) ? examRes.data : []);
      setCourses(Array.isArray(courseRes.data) ? courseRes.data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= CREATE ================= */

  const handleCreate = async () => {
    const { title, durationMinutes, startTime, courseId } = form;

    if (!title || !durationMinutes || !startTime || !courseId) {
      alert("All fields are required");
      return;
    }

    try {
      setCreating(true);

      await createExam({
        title: title.trim(),
        durationMinutes: Number(durationMinutes),
        startTime,
        course: { id: Number(courseId) }
      });

      setForm({
        title: "",
        durationMinutes: "",
        startTime: "",
        courseId: ""
      });

      setShowAddModal(false);
      fetchData();
    } catch {
      alert("Failed to create exam");
    } finally {
      setCreating(false);
    }
  };

  /* ================= UPDATE ================= */

  const handleUpdate = async () => {
    try {
      await updateExam(editingExam.id, {
        title: editingExam.title,
        durationMinutes: Number(editingExam.durationMinutes),
        startTime: editingExam.startTime,
        endTime: editingExam.endTime || null,
        course: { id: Number(editingExam.courseId) }
      });

      setEditingExam(null);
      fetchData();
    } catch {
      alert("Failed to update exam");
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async id => {
    if (!window.confirm("Delete this exam? All questions will be removed.")) {
      return;
    }

    try {
      await deleteExam(id);
      fetchData();
    } catch {
      alert("Failed to delete exam");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="admin-page">
      {/*  HEADER ROW */}
      <div className="students-header">
        <h2>Exams</h2>

        <button
          className="primary-btn"
          onClick={() => setShowAddModal(true)}
        >
          + Add Exam
        </button>
      </div>

      {loading && <p>Loading exams...</p>}

      {!loading && (
        <div className="exam-grid">
          {exams.map(exam => (
            <div key={exam.id} className="exam-card">
              <div className="exam-header">
                <strong>{exam.title}</strong>

                <div className="exam-actions">
                  <button
                    className="icon-btn edit"
                    title="Edit"
                    onClick={() =>
                      setEditingExam({
                        id: exam.id,
                        title: exam.title,
                        durationMinutes: exam.durationMinutes,
                        startTime: exam.startTime,
                        endTime: exam.endTime,
                        courseId: exam.course?.id || ""
                      })
                    }
                  >
                    ✏️
                  </button>

                  <button
                    className="icon-btn delete"
                    title="Delete"
                    onClick={() => handleDelete(exam.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div>⏱ {exam.durationMinutes} mins</div>

              <div>
                📅{" "}
                {exam.startTime
                  ? new Date(exam.startTime).toLocaleString()
                  : "-"}
              </div>

              <button
                className="secondary"
                onClick={() =>
                  navigate(`/admin/exams/${exam.id}/questions`)
                }
              >
                Manage Questions
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ================= ADD MODAL ================= */}
      {showAddModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="modal"
            onClick={e => e.stopPropagation()}
          >
            <h3>Add Exam</h3>

            <input
              placeholder="Exam title"
              value={form.title}
              onChange={e =>
                setForm({ ...form, title: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Duration (minutes)"
              value={form.durationMinutes}
              onChange={e =>
                setForm({
                  ...form,
                  durationMinutes: e.target.value
                })
              }
            />

            <input
              type="datetime-local"
              value={form.startTime}
              onChange={e =>
                setForm({
                  ...form,
                  startTime: e.target.value
                })
              }
            />

            <select
              value={form.courseId}
              onChange={e =>
                setForm({
                  ...form,
                  courseId: e.target.value
                })
              }
            >
              <option value="">Select Course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.courseName}
                </option>
              ))}
            </select>

            <div className="modal-actions">
              <button
                className="secondary"
                onClick={() => setShowAddModal(false)}
                disabled={creating}
              >
                Cancel
              </button>
              <button
                className="primary"
                onClick={handleCreate}
                disabled={creating}
              >
                {creating ? "Creating..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}
      {editingExam && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Exam</h3>

            <input
              value={editingExam.title}
              onChange={e =>
                setEditingExam({
                  ...editingExam,
                  title: e.target.value
                })
              }
            />

            <input
              type="number"
              value={editingExam.durationMinutes}
              onChange={e =>
                setEditingExam({
                  ...editingExam,
                  durationMinutes: e.target.value
                })
              }
            />

            <input
              type="datetime-local"
              value={editingExam.startTime || ""}
              onChange={e =>
                setEditingExam({
                  ...editingExam,
                  startTime: e.target.value
                })
              }
            />

            <select
              value={editingExam.courseId}
              onChange={e =>
                setEditingExam({
                  ...editingExam,
                  courseId: e.target.value
                })
              }
            >
              <option value="">Select Course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.courseName}
                </option>
              ))}
            </select>

            <div className="modal-actions">
              <button
                className="secondary"
                onClick={() => setEditingExam(null)}
              >
                Cancel
              </button>
              <button className="primary" onClick={handleUpdate}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Exams;