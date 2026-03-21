/**
 * Split a display string like "+91 9876543210" into API fields.
 * @returns {{ country_code: string | null, phone_number: string | null }}
 */
export function splitMobileDisplay(mobileStr) {
  const s = String(mobileStr || "").trim();
  if (!s) return { country_code: null, phone_number: null };
  const m = s.match(/^(\+\d{1,4})[\s-]*([\d\s-]+)$/);
  if (!m) return { country_code: null, phone_number: null };
  return {
    country_code: m[1],
    phone_number: m[2].replace(/[\s-]/g, ""),
  };
}
