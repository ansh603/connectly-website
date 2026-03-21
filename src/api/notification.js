import api from "./axios.js";

/**
 * List notifications for the current user.
 */
export const listNotificationsApi = async (params = {}) => {
  return api.get("/notifications", { params });
};

/**
 * Mark all notifications as read.
 */
export const markNotificationsReadApi = async () => {
  return api.post("/notifications/read");
};
