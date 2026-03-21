import api from "../api/axios.js";

/**
 * @param {string} folder - e.g. "profile", "gallery"
 * @param {File} file
 * @returns {Promise<string>} server path e.g. assets/profile/file-....jpg
 */
const uploadFile = async (folder, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
      Accept: "application/json",
    },
  };

  const result = await api.post(`/global/upload?folder=${encodeURIComponent(folder)}`, formData, config);
  const path = result?.data?.path;
  if (!path) {
    throw new Error(result?.data?.message || "Upload failed");
  }
  return path;
};

export default uploadFile;
