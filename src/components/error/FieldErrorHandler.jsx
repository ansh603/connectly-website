/** Inline validation message — use with local/Zod state. Toasts are only for API responses. */
const FieldError = ({ error, className = "" }) => {
  if (!error) return null;
  return (
    <span
      role="alert"
      className={className}
      style={{ color: "red", fontSize: "14px", display: "block", marginTop: 4 }}
    >
      {error}
    </span>
  );
};

export default FieldError;
