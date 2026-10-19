const INDENT = '    ';
const lineStartAt = (text, position) => position === 0 ? 0 : text.lastIndexOf('\n', position - 1) + 1;

// Ignore colons inside strings and support a block colon followed by a comment.
function opensBlock(line) {
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quote) {
      if (char === '\\') i++;
      else if (char === quote) quote = null;
    } else if (char === '"' || char === "'") quote = char;
    else if (char === '#') return line.slice(0, i).trimEnd().endsWith(':');
  }
  return !quote && line.trimEnd().endsWith(':');
}

/** Handle indentation in a textarea. Return true only for a handled key. */
export function handlePythonIndentation(event, editor) {
  if (event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return false;
  if (event.key !== 'Enter' && event.key !== 'Tab') return false;
  event.preventDefault();
  const text = editor.value;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const lineStart = lineStartAt(text, start);
  if (event.key === 'Enter') {
    const beforeCursor = text.slice(lineStart, start);
    const leading = beforeCursor.match(/^[ \t]*/)[0];
    const indentation = leading + (opensBlock(beforeCursor) ? INDENT : '');
    editor.setRangeText('\n' + indentation, start, end, 'end');
    return true;
  }
  if (!event.shiftKey && start === end) {
    editor.setRangeText(INDENT, start, end, 'end');
    return true;
  }
  // Indent/unindent every selected line. A selection ending at the next line's
  // start does not include that next line.
  const lastPosition = end > start && text[end - 1] === '\n' ? end - 1 : end;
  const nextNewline = text.indexOf('\n', lastPosition);
  const blockEnd = nextNewline === -1 ? text.length : nextNewline;
  const block = text.slice(lineStart, blockEnd);
  const lines = block.split('\n');
  const changes = lines.map(line => event.shiftKey
    ? -(line.startsWith('\t') ? 1 : Math.min(4, line.match(/^ */)[0].length))
    : 4);
  const updated = lines.map((line, i) => changes[i] < 0 ? line.slice(-changes[i]) : event.shiftKey ? line : INDENT + line).join('\n');
  editor.setRangeText(updated, lineStart, blockEnd, 'preserve');
  const firstChange = changes[0];
  const newStart = event.shiftKey
    ? Math.max(lineStart, start + firstChange)
    : start + firstChange;
  const newEnd = Math.max(newStart, end + changes.reduce((a, b) => a + b, 0));
  editor.setSelectionRange(newStart, newEnd);
  return true;
}
