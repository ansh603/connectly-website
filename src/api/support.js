import api from "./axios.js";

export const raiseTicketApi = async (payload) => {
  return api.post("/support/ticket", payload);
};

export const supportContactApi = async (payload) => {
  return api.post("/support/contact", payload);
};

