"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { emptyResume } from "../data/resume";
import {
  loadResume,
  saveResume,
  STORAGE_ERROR,
  INVALID_BACKUP,
} from "../utils/resume";
const ResumeContext = createContext(null);
export function ResumeProvider({ children }) {
  const [data, setData] = useState(emptyResume),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [blocked, setBlocked] = useState(false),
    [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = loadResume(localStorage);
      if (stored) setData(stored);
    } catch (e) {
      setError(
        e.message === INVALID_BACKUP
          ? "Saved data could not be restored. Your existing saved data has been kept. You can edit here and download a PDF."
          : STORAGE_ERROR,
      );
      setBlocked(true);
    } finally {
      setReady(true);
    }
  }, []);
  useEffect(() => {
    if (!ready || blocked) return;
    setSaved(false);
    const timer = setTimeout(() => {
      try {
        saveResume(localStorage, data);
        setError("");
        setSaved(true);
      } catch {
        setError(STORAGE_ERROR);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [data, ready, blocked]);
  useEffect(() => {
    if (!ready || blocked) return;
    const flush = () => {
      try {
        saveResume(localStorage, data);
      } catch {
        setError(STORAGE_ERROR);
      }
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [data, ready, blocked]);
  return (
    <ResumeContext.Provider value={{ data, setData, ready, error, saved }}>
      {children}
    </ResumeContext.Provider>
  );
}
export const useResume = () => useContext(ResumeContext);
