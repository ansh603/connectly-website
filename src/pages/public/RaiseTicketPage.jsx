import { useState } from "react";
import { z } from "zod";
import { Card, Button, Input, Textarea, Select } from "../../components/ui/UI.jsx";
import { handleApiError } from "../../utils/handleApiError.js";
import { notifySuccess } from "../../utils/notification.js";
import { raiseTicketApi } from "../../api/support.js";

const ticketSchema = z.object({
  reason: z.string().min(2, "Reason is required"),
  message: z.string().min(5, "Message is required"),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
});

const REASONS = [
  { value: "billing", label: "Billing / Payments" },
  { value: "technical", label: "Technical issue" },
  { value: "account", label: "Account / Profile" },
  { value: "other", label: "Other" },
];

export default function RaiseTicketPage() {
  const [form, setForm] = useState({ reason: "", message: "", name: "", email: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async () => {
    setFieldErrors({});
    setSubmitted(false);

    try {
      ticketSchema.parse(form);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const formatted = {};
        err.issues.forEach((issue) => {
          const key = issue.path?.[0] ? String(issue.path[0]) : "_form";
          if (!formatted[key]) formatted[key] = issue.message;
        });
        setFieldErrors(formatted);
        return;
      }
      throw err;
    }

    setSubmitting(true);
    try {
      const res = await raiseTicketApi(form);
      notifySuccess(res?.data?.message || "Ticket submitted");
      setSubmitted(true);
      setForm({ reason: "", message: "", name: "", email: "" });
    } catch (e) {
      handleApiError(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrap">
      <div className="container" style={{ paddingTop: 36, paddingBottom: 48 }}>
        <Card flat style={{ padding: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--c-dark)", marginBottom: 16 }}>
            Raise a Ticket
          </h1>

          <Select
            label="Reason"
            value={form.reason}
            onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
            options={REASONS}
            required
          />
          {fieldErrors.reason && <span style={{ color: "red", fontSize: 14 }}>{fieldErrors.reason}</span>}

          <Textarea
            label="Message"
            placeholder="Describe the issue…"
            value={form.message}
            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
            rows={5}
            required
          />
          {fieldErrors.message && <span style={{ color: "red", fontSize: 14 }}>{fieldErrors.message}</span>}

          <Input
            label="Your Name"
            placeholder="Enter your name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
          {fieldErrors.name && <span style={{ color: "red", fontSize: 14 }}>{fieldErrors.name}</span>}

          <Input
            label="Your Email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            type="email"
          />
          {fieldErrors.email && <span style={{ color: "red", fontSize: 14 }}>{fieldErrors.email}</span>}

          <div style={{ marginTop: 16 }}>
            <Button onClick={onSubmit} disabled={submitting} fullWidth size="lg" icon="check">
              {submitting ? "Submitting…" : "Submit Ticket"}
            </Button>
          </div>

          {submitted && (
            <p style={{ marginTop: 12, color: "var(--c-success)", fontWeight: 700 }}>
              Thanks! Your ticket has been submitted.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

