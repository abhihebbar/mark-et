const fs = require('fs');
const path = require('path');
const { parseFrontmatter, renderMarkdown } = require('./markdown');

const DEFAULTS = {
  contentDir: 'content',
  templateDir: 'templates',
  outDir: 'dist',
};

function loadTemplate(templateDir, name) {
  const file = path.join(templateDir, `${name}.html`);
  if (!fs.existsSync(file)) {
    const fallback = path.join(templateDir, 'default.html');
    if (!fs.existsSync(fallback)) {
      throw new Error(`Template "${name}" not found and no default.html in ${templateDir}`);
    }
    return fs.readFileSync(fallback, 'utf8');
  }
  return fs.readFileSync(file, 'utf8');
}

function applyTemplate(template, meta, bodyHtml) {
  let out = template;
  out = out.replace(/\{\{body\}\}/g, bodyHtml);
  out = out.replace(/\{\{title\}\}/g, meta.title || 'Untitled');
  out = out.replace(/\{\{description\}\}/g, meta.description || '');
  out = out.replace(/\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g, (_, key) => meta[key] || '');
  return out;
}

function buildSite(opts = {}) {
  const contentDir = path.resolve(opts.contentDir || DEFAULTS.contentDir);
  const templateDir = path.resolve(opts.templateDir || DEFAULTS.templateDir);
  const outDir = path.resolve(opts.outDir || DEFAULTS.outDir);

  if (!fs.existsSync(contentDir)) {
    throw new Error(`Content directory not found: ${contentDir}`);
  }

  fs.mkdirSync(outDir, { recursive: true });

  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
  const pages = [];

  for (const file of files) {
    const src = fs.readFileSync(path.join(contentDir, file), 'utf8');
    const { meta, body } = parseFrontmatter(src);
    const bodyHtml = renderMarkdown(body);
    const templateName = meta.template || 'default';
    const template = loadTemplate(templateDir, templateName);
    const html = applyTemplate(template, meta, bodyHtml);
    const slug = meta.slug || file.replace(/\.md$/, '');
    const outFile = slug === 'index' ? 'index.html' : `${slug}.html`;
    fs.writeFileSync(path.join(outDir, outFile), html, 'utf8');
    pages.push({ slug, title: meta.title || slug, file: outFile, meta });
  }

  // Copy static assets if they exist
  const staticDir = path.join(templateDir, 'static');
  if (fs.existsSync(staticDir)) {
    copyDir(staticDir, path.join(outDir, 'static'));
  }

  return { pages, outDir };
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

module.exports = { buildSite, applyTemplate, loadTemplate };
