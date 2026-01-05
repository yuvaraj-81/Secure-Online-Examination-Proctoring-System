import { useEffect, useState } from "react";
import {
  getStudents,
  updateStudent,
  deleteStudent,
  addStudent
} from "../services/adminService";

import "./AdminStudents.css";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState(null);

  //  ADD STUDENT STATE (NO PASSWORD)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: ""
  });

  const [error, setError] = useState("");

  /* ================= FETCH ================= */

  const fetchStudents = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await getStudents();
      setStudents(res.data || []);
    } catch {
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  /* ================= ADD ================= */

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.email) {
      alert("Name and Email are required");
      return;
    }

    try {
      await addStudent({
        name: newStudent.name,
        email: newStudent.email
      });

      setShowAddModal(false);
      setNewStudent({ name: "", email: "" });
      fetchStudents();
    } catch {
      alert("Failed to add student");
    }
  };

  /* ================= UPDATE ================= */

  const handleUpdate = async () => {
    try {
      await updateStudent(editingStudent.id, {
        name: editingStudent.name,
        email: editingStudent.email
      });

      setEditingStudent(null);
      fetchStudents();
    } catch {
      alert("Failed to update student");
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async studentId => {
    if (!window.confirm("Delete this student?")) return;

    try {
      await deleteStudent(studentId);
      fetchStudents();
    } catch (err) {
      alert(
        err?.response?.data ||
          "Cannot delete student. Student has exam attempts."
      );
    }
  };

  /* ================= UI ================= */

  return (
    <div className="admin-page">
      {/*  HEADER ROW */}
      <div className="students-header">
        <h2>Students</h2>

        <button
          className="primary-btn"
          onClick={() => setShowAddModal(true)}
        >
           Add Student
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading && <p>Loading students...</p>}

      {!loading &&
        students.map(student => (
          <div key={student.id} className="student-item">
            <div className="student-info">
              <strong>{student.name}</strong>
              <p>{student.email}</p>
            </div>

            <div className="student-actions">
              <button
                className="icon-btn edit"
                title="Edit"
                onClick={() =>
                  setEditingStudent({ ...student })
                }
              >
                ✏️
              </button>

              <button
                className="icon-btn delete"
                title="Delete"
                onClick={() => handleDelete(student.id)}
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
            <h3>Add Student</h3>

            <input
              placeholder="Name"
              value={newStudent.name}
              onChange={e =>
                setNewStudent({
                  ...newStudent,
                  name: e.target.value
                })
              }
            />

            <input
              placeholder="Email"
              value={newStudent.email}
              onChange={e =>
                setNewStudent({
                  ...newStudent,
                  email: e.target.value
                })
              }
            />

            <p style={{ fontSize: "0.85rem", color: "#aaa" }}>
              Default password will be <b>user123</b>
            </p>

            <div className="modal-actions">
              <button
                className="secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>

              <button
                className="primary"
                onClick={handleAddStudent}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}
      {editingStudent && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Student</h3>

            <input
              placeholder="Name"
              value={editingStudent.name}
              onChange={e =>
                setEditingStudent({
                  ...editingStudent,
                  name: e.target.value
                })
              }
            />

            <input
              placeholder="Email"
              value={editingStudent.email}
              onChange={e =>
                setEditingStudent({
                  ...editingStudent,
                  email: e.target.value
                })
              }
            />

            <div className="modal-actions">
              <button
                className="secondary"
                onClick={() => setEditingStudent(null)}
              >
                Cancel
              </button>

              <button
                className="primary"
                onClick={handleUpdate}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
