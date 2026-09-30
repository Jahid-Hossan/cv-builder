// Raster export is intentionally local. No resume data is sent to a server.
export async function exportPdf(element) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);
  await document.fonts.ready;
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: false,
    logging: false,
    windowWidth: 1200,
    onclone: (_doc, clone) => {
      let parent = clone.parentElement;
      while (parent) {
        parent.style.transform = "none";
        parent.style.visibility = "visible";
        parent = parent.parentElement;
      }
      clone.style.width = "794px";
      clone.style.visibility = "visible";
    },
  });
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const width = 190,
    height = 277,
    pxPerMm = canvas.width / width,
    maxSlice = Math.floor(height * pxPerMm);
  // Select low-ink rows near page edges to reduce splits through lines of text.
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  let offset = 0,
    page = 0;
  while (offset < canvas.height) {
    let end = Math.min(offset + maxSlice, canvas.height);
    if (end < canvas.height) {
      const start = Math.max(offset + Math.floor(maxSlice * 0.8), end - 160);
      const rows = ctx.getImageData(0, start, canvas.width, end - start).data;
      let best = end,
        bestInk = Infinity;
      for (let y = end - start - 1; y >= 0; y--) {
        let ink = 0;
        for (let x = 0; x < canvas.width; x += 4) {
          const i = (y * canvas.width + x) * 4;
          if (rows[i] < 220 || rows[i + 1] < 220 || rows[i + 2] < 220) ink++;
        }
        if (ink < bestInk) {
          bestInk = ink;
          best = start + y + 1;
        }
        if (ink === 0) break;
      }
      end = best;
    }
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = end - offset;
    slice
      .getContext("2d")
      .drawImage(
        canvas,
        0,
        offset,
        canvas.width,
        slice.height,
        0,
        0,
        canvas.width,
        slice.height,
      );
    if (page++) pdf.addPage();
    pdf.addImage(
      slice.toDataURL("image/png"),
      "PNG",
      10,
      10,
      width,
      slice.height / pxPerMm,
      undefined,
      "FAST",
    );
    offset = end;
  }
  pdf.save("resume.pdf");
}
