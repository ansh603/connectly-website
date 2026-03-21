import api from "./axios.js";

export const getProfileApi = () => api.get("/user/profile");

export const updateProfileApi = (payload) => api.patch("/user/profile", payload);
