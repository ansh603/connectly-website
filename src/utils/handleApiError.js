import { toast } from "react-toastify";
import { ZodError } from "zod";

/**
 * - Zod (client validation): maps to field errors via setErrors — no toast.
 * - Backend / network: toast only (no field map).
 */
export function handleApiError(error, setErrors = null) {
  if (error instanceof ZodError) {
    const formatted = {};
    error.issues.forEach((issue) => {
      const key =
        issue.path.length > 0 ? String(issue.path[0]) : "_form";
      if (formatted[key] == null) {
        formatted[key] = issue.message;
      }
    });

    if (setErrors) setErrors(formatted);
    return;
  }

  if (error.response) {
    const status = error.response.status;
    const data = error.response.data || {};
    const message =
      data.message ||
      (Array.isArray(data.errors) ? data.errors[0] : null) ||
      "Something went wrong";

    toast.error(message);

    // Don't wipe session on "verify email" login response
    if (status === 403 && !data?.needs_email_verification) {
      localStorage.removeItem("token");
    }

    return;
  }

  if (error.request) {
    toast.error("Network error. Check your connection.");
    return;
  }

  toast.error(error?.message || "Something went wrong");
}
