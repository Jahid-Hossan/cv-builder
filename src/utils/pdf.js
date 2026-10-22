// Measure the unscaled preview and draw native PDF text, never a screenshot.
// Resume data remains in the browser; fonts are bundled, self-hosted assets.
const fontFiles = {
  Inter: [
    new URL('../../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff', import.meta.url).href,
    new URL('../../node_modules/@fontsource/inter/files/inter-latin-700-normal.woff', import.meta.url).href,
    new URL('../../node_modules/@fontsource/inter/files/inter-latin-400-italic.woff', import.meta.url).href,
    new URL('../../node_modules/@fontsource/inter/files/inter-latin-700-italic.woff', import.meta.url).href,
  ],
  Merriweather: [
    new URL('../../node_modules/@fontsource/merriweather/files/merriweather-latin-400-normal.woff', import.meta.url).href,
    new URL('../../node_modules/@fontsource/merriweather/files/merriweather-latin-700-normal.woff', import.meta.url).href,
    new URL('../../node_modules/@fontsource/merriweather/files/merriweather-latin-400-italic.woff', import.meta.url).href,
    new URL('../../node_modules/@fontsource/merriweather/files/merriweather-latin-700-italic.woff', import.meta.url).href,
  ],
};
const SCALE = 595.28 / 794;
const PAGE_HEIGHT = 841.89 / SCALE;

export function paginateText(runs, height) {
  const pages = [];
  let start = 0;
  do {
    const inset = start ? 32 : 0;
    let end = Math.min(start + PAGE_HEIGHT - inset - 32, height);
    let crossing;
    while ((crossing = runs.filter(r => r.y < end && r.y + r.height > end)).length) {
      const next = Math.min(...crossing.map(r => r.y));
      if (next <= start) break;
      end = next;
    }
    pages.push({ start, end, inset });
    start = end;
  } while (start < height);
  return pages;
}

export function measureResume(element) {
  if (!element) throw new Error('Resume preview is unavailable.');
  const clone = element.cloneNode(true);
  Object.assign(clone.style, { position: 'fixed', left: '-10000px', top: '0',
    width: '794px', transform: 'none', visibility: 'visible', minHeight: '0', height: 'auto' });
  clone.setAttribute('aria-hidden', 'true');
  document.body.appendChild(clone);
  try {
    const origin = clone.getBoundingClientRect();
    const runs = [], boxes = [], marked = new Set();
    const styleFor = el => {
      const css = getComputedStyle(el);
      return {
        fontFamily: css.fontFamily.includes('Merriweather') ? 'Merriweather' : 'Inter',
        fontSize: parseFloat(css.fontSize), fontWeight: Number(css.fontWeight) >= 600 ? 700 : 400,
        fontStyle: css.fontStyle === 'italic' ? 'italic' : 'normal', color: css.color,
        textDecoration: el.closest('u, a') ? 'underline' : 'none',
        letterSpacing: parseFloat(css.letterSpacing) || 0, textTransform: css.textTransform,
      };
    };
    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.textContent.trim()) continue;
      const parent = node.parentElement, css = getComputedStyle(parent);
      if (css.display === 'none' || css.visibility === 'hidden') continue;
      const range = document.createRange();
      let current;
      // Browser line boundaries preserve all template layouts and inline marks.
      for (let i = 0; i < node.length;) {
        const char = String.fromCodePoint(node.textContent.codePointAt(i));
        range.setStart(node, i); range.setEnd(node, i + char.length);
        i += char.length;
        const rect = range.getBoundingClientRect();
        if (!rect.height || !rect.width) continue;
        const y = rect.top - origin.top;
        const li = parent.closest('li');
        if (li && !marked.has(li)) {
          marked.add(li);
          const list = li.parentElement;
          const left = (li.querySelector('p') || li).getBoundingClientRect().left - origin.left;
          runs.push({ text: list.tagName === 'OL' ? `${Array.from(list.children).indexOf(li) + 1}.` : '•',
            x: left - 16, y, height: rect.height, width: 14, style: styleFor(li) });
        }
        if (!current || Math.abs(current.y - y) > 1) {
          current = { text: '', x: rect.left - origin.left, y, height: rect.height,
            width: 0, style: styleFor(parent) };
          runs.push(current);
        }
        current.text += char;
        current.width = rect.right - origin.left - current.x;
      }
    }
    for (const el of [clone, ...clone.querySelectorAll('*')]) {
      const css = getComputedStyle(el), rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      boxes.push({ x: rect.left - origin.left, y: rect.top - origin.top,
        width: rect.width, height: rect.height, color: css.backgroundColor,
        borders: ['Top', 'Right', 'Bottom', 'Left'].map(side => ({
          width: parseFloat(css[`border${side}Width`]), color: css[`border${side}Color`],
        })) });
      if (el.matches('.template-modern .resume-body')) {
        boxes.push({ x: rect.left - origin.left, y: rect.top - origin.top,
          width: 250, height: rect.height, color: css.getPropertyValue('--sidebar-color').trim(), borders: [] });
      }
    }
    return { runs, boxes, height: origin.height };
  } finally { clone.remove(); }
}

export async function renderMeasuredResume(layout, fonts = fontFiles) {
  const [{ createElement: h }, { pdf, Document, Page, Text, View, Font }] = await Promise.all([
    import('react'), import('@react-pdf/renderer'),
  ]);
  for (const [family, sources] of Object.entries(fonts)) Font.register({ family,
    fonts: sources.map((src, i) => ({ src, fontWeight: i % 2 ? 700 : 400,
      fontStyle: i > 1 ? 'italic' : 'normal' })),
  });
  Font.registerHyphenationCallback(word => [word]);
  const pages = paginateText(layout.runs, layout.height);
  const doc = h(Document, { title: 'Resume' }, pages.map(({ start, end, inset }, page) => {
    const children = [];
    for (const box of layout.boxes) {
      if (box.y >= end || box.y + box.height <= start) continue;
      const y = Math.max(box.y, start), bottom = Math.min(box.y + box.height, end);
      const style = { position: 'absolute', left: box.x * SCALE,
        top: (y - start + inset) * SCALE, width: box.width * SCALE,
        height: (bottom - y) * SCALE, backgroundColor: box.color };
      box.borders.forEach((border, i) => {
        const side = ['Top', 'Right', 'Bottom', 'Left'][i];
        if (border.width && !(i === 0 && box.y < start) && !(i === 2 && box.y + box.height > end)) {
          style[`border${side}Width`] = border.width * SCALE;
          style[`border${side}Color`] = border.color;
        }
      });
      children.push(h(View, { key: `box-${children.length}`, style }));
    }
    for (const run of layout.runs) {
      if (run.y < start || run.y >= end) continue;
      const { textTransform, ...textStyle } = run.style;
      const text = textTransform === 'uppercase' ? run.text.toUpperCase() : run.text;
      children.push(h(Text, { key: `text-${children.length}`, wrap: false, style: {
        ...textStyle, fontSize: textStyle.fontSize * SCALE,
        letterSpacing: textStyle.letterSpacing * SCALE, position: 'absolute',
        left: run.x * SCALE, top: (run.y - start + inset) * SCALE,
        width: (run.width + 20) * SCALE, lineHeight: 1,
      } }, text));
    }
    return h(Page, { key: page, size: 'A4', style: { width: 595.28, height: 841.89 } }, children);
  }));
  return pdf(doc).toBlob();
}

export async function createResumePdf(element) {
  await document.fonts.ready;
  return renderMeasuredResume(measureResume(element));
}

export async function exportPdf(element) {
  const blob = await createResumePdf(element);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = 'resume.pdf'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
