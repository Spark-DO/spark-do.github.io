// Escapes text from the data files and turns **bold** into <strong>.
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

export function rich(text) {
  return text
    .replace(/[&<>"]/g, (c) => ESC[c])
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

export function plain(text) {
  return text.replace(/\*\*(.+?)\*\*/g, '$1');
}
