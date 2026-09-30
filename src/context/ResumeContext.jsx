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
    [saved, setSaved] = useState(false),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    try {
      const stored = loadResume(localStorage);
      if (stored) setData(stored);
    } catch (e) {
      setError(
        e.message === INVALID_BACKUP
          ? "Saved data could not be restored. Import a valid JSON backup to replace it."
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
  const importData = (value) => {
    setData(value);
    setRevision((v) => v + 1);
    setBlocked(false);
    setError("");
  };
  return (
    <ResumeContext.Provider
      value={{ data, setData, ready, error, saved, revision, importData }}
    >
      {children}
    </ResumeContext.Provider>
  );
}
export const useResume = () => useContext(ResumeContext);
