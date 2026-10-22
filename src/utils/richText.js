import sanitizeHtml from 'sanitize-html';

export const DESCRIPTION_LIMIT = 2000;
const allowed = {
  allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li'],
  allowedAttributes: {},
};

export function plainDescriptionHtml(value = '') {
  if (!value) return '';
  return `<p>${value.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/\r\n?/g, '\n').replace(/\n/g, '<br>')}</p>`;
}

export function descriptionHtml(value = '') {
  return sanitizeHtml(value, allowed).replace(/<br \/>/g, '<br>');
}

export function descriptionLength(html) {
  return sanitizeHtml(descriptionHtml(html).replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(p|li)>\s*(?=<)/gi, '\n'), { allowedTags: [], allowedAttributes: {} })
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").length;
}

// The marker prevents legacy text such as "<p>literal</p>" becoming markup.
export function experienceHtml(item) {
  return item.descriptionFormat === 'html'
    ? descriptionHtml(item.description) : plainDescriptionHtml(item.description);
}
