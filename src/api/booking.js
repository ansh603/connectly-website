import api from "./axios.js";

/**
 * Create a new booking request.
 * Deducts from wallet (escrow) and creates booking.
 */
export const createBookingApi = async (payload) => {
  return api.post("/bookings", payload);
};

/**
 * List my bookings (sent + incoming).
 */
export const listBookingsApi = async (params = {}) => {
  return api.get("/bookings", { params });
};

/**
 * Accept incoming booking request (provider).
 */
export const acceptBookingApi = async (bookingId) => {
  return api.patch(`/bookings/${bookingId}/accept`);
};

/**
 * Decline incoming booking request (provider). Full refund to booker.
 */
export const declineBookingApi = async (bookingId) => {
  return api.patch(`/bookings/${bookingId}/decline`);
};

/**
 * Cancel a booking (booker). Partial refund based on cancellation policy.
 */
export const cancelBookingApi = async (bookingId) => {
  return api.patch(`/bookings/${bookingId}/cancel`);
};

/**
 * Complete a booking (OTP verified). Releases payment to provider.
 */
export const completeBookingApi = async (bookingId) => {
  return api.post(`/bookings/${bookingId}/complete`);
};

/**
 * Get available/engaged slots for a provider on a date.
 */
export const getAvailableSlotsApi = async ({ provider_id, date }) => {
  return api.get("/bookings/slots", { params: { provider_id, date } });
};

/**
 * Generate OTP for meeting (provider).
 */
export const generateOtpApi = async (bookingId) => {
  return api.post(`/bookings/${bookingId}/otp/generate`);
};

/**
 * Verify OTP (booker).
 */
export const verifyOtpApi = async (bookingId, otp) => {
  return api.post(`/bookings/${bookingId}/otp/verify`, { otp });
};
