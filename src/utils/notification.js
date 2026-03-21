import { toast } from "react-toastify";

export const requestNotificationPermission = async () => {
  try {
    const result = await Notification.requestPermission();
    return result === "granted";
  } catch {
    return false;
  }
};

export const notifySuccess = (message) => {
  toast.success(message);
};

export const notifyError = (message) => {
  toast.error(message);
};
