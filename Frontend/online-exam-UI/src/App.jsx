import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Signup from "./components/Signup";

/* ================= ADMIN ================= */
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import Students from "./admin/Students";
import Courses from "./admin/Courses";
import Exams from "./admin/Exams";
import Results from "./admin/Results";
import Questions from "./admin/Questions";

/* ================= STUDENT ================= */
import StudentDashboard from "./student/StudentDashboard";
import StudentCourses from "./student/StudentCourses";
import StudentExams from "./student/StudentExams";
import StudentResults from "./student/StudentResults";
import StudentProfile from "./student/StudentProfile";
import ExamAttempt from "./student/ExamAttempt";

import "./App.css";

/* ================= AUTH GUARD ================= */

const RequireAuth = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const savedRole = localStorage.getItem("role");

  if (!token || !savedRole) {
    return <Navigate to="/login" replace />;
  }

  if (role && savedRole !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/* ================= APP ================= */

function App() {
  const role = localStorage.getItem("role");

  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route
          path="/"
          element={
            role === "ADMIN" ? (
              <Navigate to="/admin" replace />
            ) : role === "STUDENT" ? (
              <Navigate to="/student" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ================= STUDENT NORMAL PAGES ================= */}
        <Route
          path="/student"
          element={
            <RequireAuth role="STUDENT">
              <StudentDashboard />
            </RequireAuth>
          }
        >
          <Route index element={<StudentExams />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="exams" element={<StudentExams />} />
          <Route path="results" element={<StudentResults />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* ================= 🔥 EXAM ATTEMPT (FULLSCREEN) ================= */}
        <Route
          path="/exam/attempt/:examId"
          element={
            <RequireAuth role="STUDENT">
              <ExamAttempt />
            </RequireAuth>
          }
        />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <RequireAuth role="ADMIN">
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="courses" element={<Courses />} />
          <Route path="exams" element={<Exams />} />
          <Route
            path="exams/:examId/questions"
            element={<Questions />}
          />
          <Route path="results" element={<Results />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
