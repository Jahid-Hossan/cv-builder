"use client";
import { useRef, useState } from "react";
import { useResume } from "../context/ResumeContext";
import {
  downloadBackup,
  parseBackup,
  INVALID_BACKUP,
  validatePersonal,
} from "../utils/resume";
import { exportPdf } from "../utils/pdf";
import Editor from "./Editor";
import ThemeControls from "./ThemeControls";
import PreviewViewport from "./PreviewViewport";
export default function Builder() {
  const { data, ready, error, saved, importData } = useResume();
  const [tab, setTab] = useState("edit"),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const paperRef = useRef(null),
    fileRef = useRef(null);
  async function importFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      importData(parseBackup(await file.text()));
      setMessage("Backup imported successfully.");
    } catch {
      setMessage(INVALID_BACKUP);
    }
  }
  async function pdf() {
    if (Object.keys(validatePersonal(data.personalInfo)).length) {
      setMessage(
        "Please enter a Full Name, valid Email, and correct the personal information errors before exporting PDF.",
      );
      setTab("edit");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await exportPdf(paperRef.current);
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
          <button disabled={!ready} onClick={() => fileRef.current.click()}>
            Import JSON
          </button>
          <input
            ref={fileRef}
            className="sr-only"
            type="file"
            accept="application/json,.json"
            aria-label="Import JSON backup"
            onChange={importFile}
          />
          <button
            disabled={!ready}
            onClick={() => {
              try {
                downloadBackup(data);
                setMessage("JSON backup downloaded.");
              } catch {
                setMessage(INVALID_BACKUP);
              }
            }}
          >
            Export JSON
          </button>
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
            Your resume stays in your browser. Download a backup to keep a copy.
          </p>
        </aside>
      </div>
    </main>
  );
}
