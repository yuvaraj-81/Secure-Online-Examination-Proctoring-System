import api from "./api";

/* ================= ADMIN ================= */

/* ===== DASHBOARD ===== */

export const getDashboardOverview = () =>
  api.get("/admin/dashboard/overview");

/* ===== COURSES ===== */

export const getCourses = () =>
  api.get("/admin/courses");

export const createCourse = body =>
  api.post("/admin/courses", body);

export const updateCourse = (courseId, body) =>
  api.put(`/admin/courses/${courseId}`, body);

export const deleteCourse = courseId =>
  api.delete(`/admin/courses/${courseId}`);

/* ===== EXAMS ===== */

export const getExams = () =>
  api.get("/admin/exams");

export const createExam = body =>
  api.post("/admin/exams", body);

export const updateExam = (examId, body) =>
  api.put(`/admin/exams/${examId}`, body);

export const deleteExam = examId =>
  api.delete(`/admin/exams/${examId}`);

/* ===== RESULTS ===== */

export const getAdminResults = () =>
  api.get("/admin/results");

/* ===== STUDENTS ===== */

export const getStudents = () =>
  api.get("/admin/students");

export const createStudent = body =>
  api.post("/admin/students", body);

export const addStudent = data =>
  api.post("/admin/students", data);

export const deleteStudent = studentId =>
  api.delete(`/admin/students/${studentId}`);

export const updateStudent = (studentId, body) =>
  api.put(`/admin/students/${studentId}`, body);

/* ===== QUESTIONS ===== */

export const getQuestionsByExam = examId =>
  api.get(`/admin/exams/${examId}/questions`);

export const addQuestion = (examId, body) =>
  api.post(`/admin/exams/${examId}/questions`, body);

export const deleteQuestion = questionId =>
  api.delete(`/admin/questions/${questionId}`);

/* ================= STUDENT ================= */

/* ===== COURSES ===== */

export const getMyCourses = () =>
  api.get("/student/courses");

/* ===== EXAMS ===== */

export const getMyExams = () =>
  api.get("/student/exams");

/* ===== RESULTS ===== */

export const getMyResults = () =>
  api.get("/student/results");

/* ===== PROFILE ===== */

export const getMyProfile = () =>
  api.get("/student/profile");
