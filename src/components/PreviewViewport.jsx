"use client";
import { useEffect, useRef, useState } from "react";
import ResumePreview from "./ResumePreview";
export default function PreviewViewport({ data, paperRef }) {
  const host = useRef(null),
    [size, setSize] = useState({ scale: 1, height: 1123 });
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (!host.current || !paperRef.current) return;
      const scale = Math.min(1, host.current.clientWidth / 794);
      setSize({ scale, height: paperRef.current.offsetHeight * scale });
    });
    observer.observe(host.current);
    if (paperRef.current) observer.observe(paperRef.current);
    return () => observer.disconnect();
  }, [paperRef]);
  return (
    <div
      ref={host}
      className="preview-viewport"
      style={{ height: size.height }}
    >
      <div
        className="preview-scale"
        style={{ transform: `scale(${size.scale})` }}
      >
        <ResumePreview ref={paperRef} data={data} />
      </div>
    </div>
  );
}
