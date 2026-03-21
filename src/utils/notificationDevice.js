import { getOrCreateDeviceId } from "./authSession.js";

/**
 * Browser push permission — only send device fields to the API when the user
 * has allowed notifications (so we don’t register a device row otherwise).
 */
export function areBrowserNotificationsGranted() {
  if (typeof window === "undefined") return false;
  if (typeof Notification === "undefined") return false;
  return Notification.permission === "granted";
}

/**
 * Optional fields for `POST /user/register`, `POST /user/login`, `POST /user/logout`.
 * Empty object when notifications are not allowed.
 *
 * @returns {{ device_id?: string, device_token?: string, device_type?: string }}
 */
export function getOptionalPushDevicePayload() {
  if (!areBrowserNotificationsGranted()) return {};
  const device_id = getOrCreateDeviceId();
  return {
    device_id,
    device_token: device_id,
    device_type: "web",
  };
}
