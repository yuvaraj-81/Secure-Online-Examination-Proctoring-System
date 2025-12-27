import api from "./api";

export const getMyProfile = () => {
  return api.get("/student/profile");
};

export const getMyCourses = () => {
  return api.get("/student/courses");
};

export const getMyResults = () => {
  return api.get("/student/results");
};

export const getMyExams = () => {
  return api.get("/student/exams");
};

export const startOrResumeExam = (examId) => {
  return api.get(`/student/exams/${examId}/attempt`);
};

export const saveExamProgress = (examId, body) => {
  return api.post(`/student/exams/${examId}/autosave`, body);
};

export const submitExam = (examId, body) => {
  return api.post(`/student/exams/${examId}/submit`, body);
};

export const getResultReview = (resultId) =>
  api.get(`/student/results/${resultId}/review`);

export const getResultSummary = () =>
  api.get("/student/results/summary");