import api from "./axiosInstance.js";

const unwrap = (p) => p.then((r) => r.data.data);

export const getMyQuizzes = () => unwrap(api.get("/quizzes/getMyQuizzes"));
export const getQuizById = (id) => unwrap(api.get(`/quizzes/${id}`));
// AI call slow hoti hai, isliye timeout lamba
export const generateQuiz = (body) => unwrap(api.post("/quizzes/generate", body, { timeout: 90000 }));
export const updateQuestion = (id, body) => unwrap(api.patch(`/questions/${id}`, body));
export const deleteQuestion = (id) => unwrap(api.delete(`/questions/${id}`));
export const deleteQuiz = (id) => unwrap(api.delete(`/quizzes/${id}`));