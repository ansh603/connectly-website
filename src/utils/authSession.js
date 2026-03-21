export const AUTH_TOKEN_KEY = "token";
export const AUTH_USER_KEY = "user";
export const AUTH_DEVICE_ID_KEY = "dostnow_device_id";

export function getOrCreateDeviceId() {
  let id = localStorage.getItem(AUTH_DEVICE_ID_KEY);
  if (!id) {
    id = globalThis.crypto?.randomUUID?.() || `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(AUTH_DEVICE_ID_KEY, id);
  }
  return id;
}

export function persistAuthSession({ token, user }) {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  if (user) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_DEVICE_ID_KEY);
}
