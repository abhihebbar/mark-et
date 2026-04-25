/**
 * Minimal markdown-to-HTML renderer (zero dependencies).
 * Supports: headings, paragraphs, bold, italic, code, links, images,
 * unordered/ordered lists, blockquotes, horizontal rules, and code blocks.
 */

function parseFrontmatter(src) {
  const fm = {};
  if (!src.startsWith('---')) return { meta: fm, body: src };
  const end = src.indexOf('\n---', 3);
  if (end === -1) return { meta: fm, body: src };
  const block = src.slice(4, end);
  for (const line of block.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    fm[key] = val;
  }
  return { meta: fm, body: src.slice(end + 4).trim() };
}

function renderMarkdown(md) {
  const lines = md.split('\n');
  const html = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let inList = null; // 'ul' | 'ol'

  function closeList() {
    if (inList) {
      html.push(`</${inList}>`);
      inList = null;
    }
  }

  function inlineFormat(text) {
    return text
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  }

  for (const line of lines) {
    // Fenced code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        html.push(`<pre><code>${codeBuffer.join('\n')}</code></pre>`);
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        closeList();
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      codeBuffer.push(line.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
      continue;
    }

    // Blank line
    if (line.trim() === '') {
      closeList();
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      closeList();
      const level = headingMatch[1].length;
      const id = headingMatch[2].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      html.push(`<h${level} id="${id}">${inlineFormat(headingMatch[2])}</h${level}>`);
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      closeList();
      html.push('<hr />');
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      closeList();
      html.push(`<blockquote><p>${inlineFormat(line.slice(2))}</p></blockquote>`);
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^[-*+]\s+(.+)/);
    if (ulMatch) {
      if (inList !== 'ul') {
        closeList();
        inList = 'ul';
        html.push('<ul>');
      }
      html.push(`<li>${inlineFormat(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^\d+\.\s+(.+)/);
    if (olMatch) {
      if (inList !== 'ol') {
        closeList();
        inList = 'ol';
        html.push('<ol>');
      }
      html.push(`<li>${inlineFormat(olMatch[1])}</li>`);
      continue;
    }

    // Paragraph
    closeList();
    html.push(`<p>${inlineFormat(line)}</p>`);
  }

  closeList();
  return html.join('\n');
}

module.exports = { parseFrontmatter, renderMarkdown };
