import { useEffect, useState } from "react";
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse
} from "../services/adminService";

import "./AdminCourses.css";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 ADD COURSE MODAL STATE
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // 🔥 EDIT STATE
  const [editingCourse, setEditingCourse] = useState(null);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    courseCode: "",
    courseName: "",
    description: ""
  });

  /* ================= FETCH ================= */

  const fetchCourses = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await getCourses();
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  /* ================= CREATE ================= */

  const handleCreate = async () => {
    if (!form.courseCode || !form.courseName) {
      alert("Course code and name are required");
      return;
    }

    try {
      setCreating(true);

      await createCourse({
        courseCode: form.courseCode.trim(),
        courseName: form.courseName.trim(),
        description: form.description.trim()
      });

      setForm({ courseCode: "", courseName: "", description: "" });
      setShowAddModal(false);
      fetchCourses();
    } catch {
      alert("Failed to create course");
    } finally {
      setCreating(false);
    }
  };

  /* ================= UPDATE ================= */

  const handleUpdate = async () => {
    if (
      !editingCourse.courseCode.trim() ||
      !editingCourse.courseName.trim()
    ) {
      alert("Course code and name are required");
      return;
    }

    try {
      setUpdating(true);

      await updateCourse(editingCourse.id, {
        courseCode: editingCourse.courseCode.trim(),
        courseName: editingCourse.courseName.trim(),
        description: editingCourse.description?.trim() || ""
      });

      setEditingCourse(null);
      fetchCourses();
    } catch {
      alert("Failed to update course");
    } finally {
      setUpdating(false);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async id => {
    if (!window.confirm("Delete this course?")) return;

    try {
      await deleteCourse(id);
      fetchCourses();
    } catch {
      alert("Failed to delete course");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="admin-page">
      {/* 🔥 HEADER ROW */}
      <div className="students-header">
        <h2>Courses</h2>

        <button
          className="primary-btn"
          onClick={() => setShowAddModal(true)}
        >
          + Add Course
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading && <p>Loading courses...</p>}

      {/* ================= LIST ================= */}
      {!loading &&
        courses.map(course => (
          <div key={course.id} className="course-item">
            <div className="course-content">
              <strong>
                {course.courseCode} – {course.courseName}
              </strong>
              {course.description && (
                <p>{course.description}</p>
              )}
            </div>

            <div className="course-actions">
              <button
                className="icon-btn edit"
                title="Edit"
                onClick={() =>
                  setEditingCourse({ ...course })
                }
              >
                ✏️
              </button>
              <button
                className="icon-btn delete"
                title="Delete"
                onClick={() => handleDelete(course.id)}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}

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
            <h3>Add Course</h3>

            <input
              placeholder="Course Code (e.g. CS101)"
              value={form.courseCode}
              onChange={e =>
                setForm({
                  ...form,
                  courseCode: e.target.value
                })
              }
            />

            <input
              placeholder="Course Name"
              value={form.courseName}
              onChange={e =>
                setForm({
                  ...form,
                  courseName: e.target.value
                })
              }
            />

            <input
              placeholder="Description (optional)"
              value={form.description}
              onChange={e =>
                setForm({
                  ...form,
                  description: e.target.value
                })
              }
            />

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
                {creating ? "Adding..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}
      {editingCourse && (
        <div
          className="modal-overlay"
          onClick={() => setEditingCourse(null)}
        >
          <div
            className="modal"
            onClick={e => e.stopPropagation()}
          >
            <h3>Edit Course</h3>

            <input
              value={editingCourse.courseCode}
              onChange={e =>
                setEditingCourse({
                  ...editingCourse,
                  courseCode: e.target.value
                })
              }
            />

            <input
              value={editingCourse.courseName}
              onChange={e =>
                setEditingCourse({
                  ...editingCourse,
                  courseName: e.target.value
                })
              }
            />

            <input
              value={editingCourse.description || ""}
              onChange={e =>
                setEditingCourse({
                  ...editingCourse,
                  description: e.target.value
                })
              }
            />

            <div className="modal-actions">
              <button
                className="secondary"
                onClick={() => setEditingCourse(null)}
                disabled={updating}
              >
                Cancel
              </button>
              <button
                className="primary"
                onClick={handleUpdate}
                disabled={updating}
              >
                {updating ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
