const stripTrailing = (url) => String(url || "").replace(/\/+$/, "");

/** API origin without trailing slash (for axios baseURL) */
export const API_BASE_URL = stripTrailing(
  import.meta.env.VITE_API_BASE_URL || "https://connectly-backend-y2yn.onrender.com"
);

/** Prefix for turning stored paths like `assets/...` into full URLs */
export const BASE_IMAGE_URL = `${API_BASE_URL}/`;
