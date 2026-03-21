import api from "./axios.js";

export const getWalletSummaryApi = async () => {
  return api.get("/wallet/summary");
};

export const getWalletTransactionsApi = async ({ limit = 20, offset = 0 } = {}) => {
  return api.get("/wallet/transactions", { params: { limit, offset } });
};

export const addWalletBalanceApi = async (amount) => {
  return api.post("/wallet/add-balance", { amount });
};

export const holdEscrowApi = async (payload = {}) => {
  return api.post("/wallet/escrow/hold", payload);
};

export const resolveEscrowApi = async (payload = {}) => {
  return api.post("/wallet/escrow/resolve", payload);
};

export const withdrawApi = async (amount) => {
  return api.post("/wallet/withdraw", { amount });
};

