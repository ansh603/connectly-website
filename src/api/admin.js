import api from "./axios.js";

export const addCityApi = async (payload) => {
  return api.post("/admin/city", payload);
};

export const addInterestApi = async (payload) => {
  return api.post("/admin/interest", payload);
};
