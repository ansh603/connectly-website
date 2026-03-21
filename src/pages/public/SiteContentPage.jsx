import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "../../components/ui/UI.jsx";
import { getSiteContentApi } from "../../api/global.js";
import { handleApiError } from "../../utils/handleApiError.js";

export default function SiteContentPage({
  siteKeyOverride = null,
  titleOverride = null,
  embedded = false,
}) {
  const params = useParams();
  const siteKey = siteKeyOverride ?? params?.key;

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    ;(async () => {
      setLoading(true);
      try {
        const res = await getSiteContentApi(siteKey);
        if (cancelled) return;
        setContent(res?.data?.data || null);
      } catch (e) {
        if (!cancelled) handleApiError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [siteKey]);

  const inner = loading ? (
    <p style={{ color: "var(--c-muted)" }}>Loading…</p>
  ) : (
    <Card flat style={{ padding: 28 }}>
      <h1
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: "var(--c-dark)",
          marginBottom: 16,
        }}
      >
        {titleOverride ?? content?.title ?? ""}
      </h1>
      <div
        style={{ color: "var(--c-mid)", lineHeight: 1.8 }}
        dangerouslySetInnerHTML={{ __html: content?.html ?? "" }}
      />
    </Card>
  );

  if (embedded) return inner;

  return (
    <div className="page-wrap">
      <div className="container" style={{ paddingTop: 36, paddingBottom: 48 }}>
        {inner}
      </div>
    </div>
  );
}

