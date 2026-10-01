import api from "./axiosInstance.js";

const unwrap = (p) => p.then((r) => r.data.data);

export const createSession = (quizId) => unwrap(api.post(`/sessions/quiz/${quizId}`));
export const getSessionByRoom = (roomCode) => unwrap(api.get(`/sessions/room/${roomCode}`));
export const getTeacherOverview = () => unwrap(api.get("/sessions/teacher/overview"));
export const getTeacherHistory = () => unwrap(api.get("/sessions/teacher/history"));
export const getSessionResults = (id) => unwrap(api.get(`/sessions/${id}/results`));
export const endSession = (id) => unwrap(api.patch(`/sessions/${id}/end`));
export const getStudentHistory = () => unwrap(api.get("/sessions/student/history"));