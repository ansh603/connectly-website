import { useState } from "react";
import { z } from "zod";
import { Card, Button, Input, Textarea } from "../../components/ui/UI.jsx";
import { handleApiError } from "../../utils/handleApiError.js";
import { notifySuccess } from "../../utils/notification.js";
import { supportContactApi } from "../../api/support.js";
import SiteContentPage from "./SiteContentPage.jsx";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  message: z.string().min(5, "Message is required"),
});

export default function ContactPage() {
  // Render DB HTML via SiteContentPage, and also show the contact form.
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async () => {
    setFieldErrors({});
    setSubmitted(false);

    try {
      contactSchema.parse(form);
    } catch (err) {
      // handleApiError maps ZodError -> toast, but we want inline errors
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
      const res = await supportContactApi(form);
      notifySuccess(res?.data?.message || "Message submitted");
      setSubmitted(true);
      setForm({ name: "", email: "", message: "" });
    } catch (e) {
      handleApiError(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrap">
      <div className="container" style={{ paddingTop: 36, paddingBottom: 48 }}>
        {/* Content from DB */}
        <SiteContentPage
          siteKeyOverride="contact_us"
          titleOverride="Contact Us"
          embedded
        />

        <Card flat style={{ padding: 28, marginTop: 18 }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--c-dark)", marginBottom: 16 }}>
            Send a message
          </h2>

          <Input
            label="Name"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
          {fieldErrors.name && <span style={{ color: "red", fontSize: 14 }}>{fieldErrors.name}</span>}

          <Input
            label="Email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            type="email"
          />
          {fieldErrors.email && <span style={{ color: "red", fontSize: 14 }}>{fieldErrors.email}</span>}

          <Textarea
            label="Message"
            placeholder="How can we help?"
            value={form.message}
            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
            rows={4}
          />
          {fieldErrors.message && <span style={{ color: "red", fontSize: 14 }}>{fieldErrors.message}</span>}

          <div style={{ marginTop: 16 }}>
            <Button
              onClick={onSubmit}
              disabled={submitting}
              fullWidth
              size="lg"
              icon="check"
            >
              {submitting ? "Submitting…" : "Submit"}
            </Button>
          </div>

          {submitted && (
            <p style={{ marginTop: 12, color: "var(--c-success)", fontWeight: 700 }}>
              Thanks! We received your message.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

