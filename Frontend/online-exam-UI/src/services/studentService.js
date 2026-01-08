import api from "./api";

/* ================= TIME UTILS (🔥 FIX) ================= */

export const formatIST = (isoString) => {
  if (!isoString) return "";

  return new Date(isoString).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short"
  });
};

/* ================= DASHBOARD ================= */

export const getStudentDashboard = async () => {
  const res = await api.get("/student/dashboard/summary");

  // 🔥 FIX latest exam time
  if (res.data?.latestExam?.submittedAt) {
    res.data.latestExam.submittedAt = formatIST(
      res.data.latestExam.submittedAt
    );
  }

  return res;
};

/* ================= PROFILE / COURSES ================= */

export const getMyProfile = () => api.get("/student/profile");
export const getMyCourses = () => api.get("/student/courses");

/* ================= RESULTS ================= */

export const getMyResults = async () => {
  const res = await api.get("/student/results");

  // 🔥 FIX results list timestamps
  res.data = res.data.map(r => ({
    ...r,
    submittedAt: formatIST(r.submittedAt)
  }));

  return res;
};

export const getResultSummary = () =>
  api.get("/student/results/summary");

export const getResultReview = (resultId) =>
  api.get(`/student/results/${resultId}/review`);

export const downloadResultPdf = (resultId) =>
  api.get(`/student/results/${resultId}/pdf`, {
    responseType: "blob"
  });

/* ================= EXAMS ================= */

export const getMyExams = () => api.get("/student/exams");

export const startOrResumeExam = (examId) =>
  api.get(`/student/exams/${examId}/attempt`);

export const saveExamProgress = (examId, body) =>
  api.post(`/student/exams/${examId}/autosave`, body);

export const submitExam = (examId, body) =>
  api.post(`/student/exams/${examId}/submit`, body);
