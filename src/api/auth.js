import api from "./axios.js";

/** Register — creates account unverified; OTP emailed (no jwt_token until verify). */
export const registerApi = async (payload) => {
  // If payload is multipart (profile image upload), send FormData as-is.
  const isFormData =
    typeof FormData !== "undefined" && payload instanceof FormData;
  if (isFormData) {
    return api.post("/user/register", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return api.post("/user/register", payload);
};

/** Submit 6-digit code from email → returns jwt_token + user */
export const verifyEmailApi = async (payload) => {
  return api.post("/user/verify-email", payload);
};

/** Unverified account: resend OTP (requires password) */
export const resendVerificationOtpApi = async (payload) => {
  return api.post("/user/resend-verification-otp", payload);
};

export const loginApi = async (payload) => {
  return api.post("/user/login", payload);
};

export const logoutApi = async (payload) => {
  return api.post("/user/logout", payload);
};
