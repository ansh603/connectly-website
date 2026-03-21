import api from "./axios.js";

/**
 * Explore verified profiles.
 * @param {object} params
 * @param {string} [params.search]
 * @param {'all'|'individual'|'group'} [params.type]
 * @param {string} [params.interests] Comma separated interest names
 * @param {number} [params.maxPrice]
 * @param {'rating'|'price_asc'|'price_desc'} [params.sortBy]
 * @param {number|string} [params.ageMin]
 * @param {number|string} [params.ageMax]
 * @param {string} [params.city]
 * @param {string} [params.location]
 * @param {number} params.page
 * @param {number} params.pageSize
 */
export const exploreProfilesApi = async (params = {}) => {
  return api.get("/user/explore", { params });
};

