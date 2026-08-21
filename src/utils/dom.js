export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function toast(message, type = 'info') {
  const event = new CustomEvent('app-toast', {
    detail: { message, type },
    bubbles: true,
    composed: true
  });
  document.dispatchEvent(event);
}
