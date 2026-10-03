"use client";
import { useRef, useState } from "react";
import { useResume } from "../context/ResumeContext";
import { validatePersonal } from "../utils/resume";
import { exportPdf } from "../utils/pdf";
import Editor from "./Editor";
import AffiliateOffer from "./AffiliateOffer";
import ThemeControls from "./ThemeControls";
import PreviewViewport from "./PreviewViewport";
export default function Builder() {
  const { data, ready, error, saved } = useResume();
  const [tab, setTab] = useState("edit"),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [exported, setExported] = useState(false);
  const paperRef = useRef(null);
  async function pdf() {
    if (Object.keys(validatePersonal(data.personalInfo)).length) {
      setMessage(
        "Please enter a Full Name, valid Email, and correct the personal information errors before exporting PDF.",
      );
      setTab("edit");
      return;
    }
    setBusy(true);
    setExported(false);
    setMessage("");
    try {
      await exportPdf(paperRef.current);
      setExported(true);
    } catch {
      setMessage("PDF generation failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="builder-shell">
      <div className="builder-top">
        <div>
          <p className="eyebrow">YOUR NEXT CHAPTER</p>
          <h1>Make your experience count.</h1>
          <p className="muted" role="status">
            {!ready
              ? "Restoring your resume…"
              : saved
                ? "Saved on this device"
                : "Changes save automatically on this device"}
          </p>
        </div>
        <div className="export-actions">
          <button className="primary" disabled={busy || !ready} onClick={pdf}>
            {busy ? "Generating…" : "Download PDF"}{" "}
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
      {(error || message) && (
        <div className="notice" role="alert">
          {error && <p>{error}</p>}
          {message && <p>{message}</p>}
        </div>
      )}
      {exported && <AffiliateOffer />}
      <div className="mobile-tabs" role="tablist" aria-label="Builder view">
        {["edit", "preview"].map((t) => (
          <button
            key={t}
            id={`${t}-tab`}
            role="tab"
            aria-selected={tab === t}
            aria-controls={`${t}-panel`}
            tabIndex={tab === t ? 0 : -1}
            onKeyDown={(e) => {
              if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
                const next = t === "edit" ? "preview" : "edit";
                setTab(next);
                document.getElementById(`${next}-tab`).focus();
              }
            }}
            onClick={() => setTab(t)}
          >
            {t === "edit" ? "Edit resume" : "Live preview"}
          </button>
        ))}
      </div>
      <div className="builder-grid">
        <div
          id="edit-panel"
          className={`edit-panel ${tab === "edit" ? "mobile-active" : ""}`}
        >
          {ready ? (
            <Editor />
          ) : (
            <p className="loading" role="status">
              Restoring your resume…
            </p>
          )}
        </div>
        <aside
          id="preview-panel"
          className={`preview-panel ${tab === "preview" ? "mobile-active" : ""}`}
          aria-label="Resume design and preview"
        >
          <div className="preview-toolbar">
            <div>
              <p className="eyebrow">LIVE PREVIEW</p>
              <p className="help">A4 · Changes appear as you type</p>
            </div>
            <span className="local-badge">● Private & local</span>
          </div>
          {ready && (
            <>
              <ThemeControls />
              <PreviewViewport data={data} paperRef={paperRef} />
            </>
          )}
          <p className="preview-caption">
            Your resume stays in your browser. Download your PDF when you’re
            ready.
          </p>
        </aside>
      </div>
    </main>
  );
}
