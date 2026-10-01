import api from "./axiosInstance";

export const registerUser = (formData) => {
  return api.post("/users/register", formData);
};

export const verifyEmail = (data) => {
  return api.post("/users/verify-email", data);
};

export const loginUser = (data) => {
  return api.post("/users/login", data);
};

export const logoutUser = () => {
  return api.post("/users/logout");
};

export const getCurrentUser = () => {
  return api.get("/users/me");
};