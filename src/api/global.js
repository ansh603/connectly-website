import api from "./axios.js";

export const getCitiesApi = async () => {
  return api.get("/global/cities");
};

export const getInterestsApi = async () => {
  return api.get("/global/interests");
};

export const getSiteContentApi = async (key) => {
  return api.get(`/global/site-content/${encodeURIComponent(key)}`);
};

export const getSiteContentsApi = async () => {
  return api.get("/global/site-content");
};

/**
 * Delete an uploaded file from `assets/...` storage.
 * @param {string} file_path Example: `assets/gallery/abc.jpg`
 */
export const deleteFileApi = async (file_path) => {
  return api.delete(`/global/deleteFile/${encodeURIComponent(file_path)}`);
};
