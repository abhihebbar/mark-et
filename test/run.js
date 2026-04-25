const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { parseFrontmatter, renderMarkdown } = require('../src/markdown');
const { buildSite } = require('../src/build');
const { initWorkspace, CHANNELS, CHANNEL_STAGES, BASE_FILES } = require('../src/init');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (err) {
    failed++;
    console.error(`  FAIL  ${name}`);
    console.error(`        ${err.message}`);
  }
}

console.log('mark-et tests\n');

// --- Frontmatter ---

test('parseFrontmatter: extracts key-value pairs', () => {
  const { meta, body } = parseFrontmatter('---\ntitle: Hello\nslug: hi\n---\nBody text');
  assert.strictEqual(meta.title, 'Hello');
  assert.strictEqual(meta.slug, 'hi');
  assert.strictEqual(body, 'Body text');
});

test('parseFrontmatter: returns empty meta when no frontmatter', () => {
  const { meta, body } = parseFrontmatter('Just a body');
  assert.deepStrictEqual(meta, {});
  assert.strictEqual(body, 'Just a body');
});

// --- Markdown rendering ---

test('renderMarkdown: headings', () => {
  const html = renderMarkdown('# Hello\n## World');
  assert.ok(html.includes('<h1 id="hello">Hello</h1>'));
  assert.ok(html.includes('<h2 id="world">World</h2>'));
});

test('renderMarkdown: bold and italic', () => {
  const html = renderMarkdown('**bold** and *italic*');
  assert.ok(html.includes('<strong>bold</strong>'));
  assert.ok(html.includes('<em>italic</em>'));
});

test('renderMarkdown: links', () => {
  const html = renderMarkdown('[click](https://example.com)');
  assert.ok(html.includes('<a href="https://example.com">click</a>'));
});

test('renderMarkdown: images', () => {
  const html = renderMarkdown('![alt](pic.png)');
  assert.ok(html.includes('<img src="pic.png" alt="alt" />'));
});

test('renderMarkdown: unordered list', () => {
  const html = renderMarkdown('- one\n- two');
  assert.ok(html.includes('<ul>'));
  assert.ok(html.includes('<li>one</li>'));
  assert.ok(html.includes('<li>two</li>'));
  assert.ok(html.includes('</ul>'));
});

test('renderMarkdown: ordered list', () => {
  const html = renderMarkdown('1. first\n2. second');
  assert.ok(html.includes('<ol>'));
  assert.ok(html.includes('<li>first</li>'));
  assert.ok(html.includes('</ol>'));
});

test('renderMarkdown: code block', () => {
  const html = renderMarkdown('```\nconst x = 1;\n```');
  assert.ok(html.includes('<pre><code>'));
  assert.ok(html.includes('const x = 1;'));
});

test('renderMarkdown: blockquote', () => {
  const html = renderMarkdown('> a quote');
  assert.ok(html.includes('<blockquote>'));
});

test('renderMarkdown: horizontal rule', () => {
  const html = renderMarkdown('---');
  assert.ok(html.includes('<hr />'));
});

test('renderMarkdown: inline code', () => {
  const html = renderMarkdown('use `npm install`');
  assert.ok(html.includes('<code>npm install</code>'));
});

// --- Build ---

test('buildSite: generates HTML from content dir', () => {
  const projectRoot = path.join(__dirname, '..');
  const result = buildSite({
    contentDir: path.join(projectRoot, 'content'),
    templateDir: path.join(projectRoot, 'templates'),
    outDir: path.join(projectRoot, 'dist'),
  });
  assert.ok(result.pages.length > 0);
  const indexFile = path.join(projectRoot, 'dist', 'index.html');
  assert.ok(fs.existsSync(indexFile), 'dist/index.html should exist');
  const html = fs.readFileSync(indexFile, 'utf8');
  assert.ok(html.includes('<h1'), 'index.html should contain an h1');
  assert.ok(html.includes('mark-et'), 'index.html should contain project name');
});

// --- Init ---

test('initWorkspace: creates agents.md and CLAUDE.md', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mark-et-test-'));
  try {
    const result = initWorkspace(tmp);
    assert.strictEqual(result.alreadyInitialised, false);
    assert.ok(fs.existsSync(path.join(tmp, 'agents.md')));
    assert.ok(fs.existsSync(path.join(tmp, 'CLAUDE.md')));
    const claude = fs.readFileSync(path.join(tmp, 'CLAUDE.md'), 'utf8');
    assert.ok(claude.includes('agents.md'), 'CLAUDE.md should reference agents.md');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('initWorkspace: creates base/ files', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mark-et-test-'));
  try {
    initWorkspace(tmp);
    for (const name of BASE_FILES) {
      assert.ok(fs.existsSync(path.join(tmp, 'base', `${name}.md`)), `base/${name}.md should exist`);
    }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('initWorkspace: creates content-ideas/ directory', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mark-et-test-'));
  try {
    initWorkspace(tmp);
    assert.ok(fs.existsSync(path.join(tmp, 'content-ideas')));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('initWorkspace: creates channel directories with stages', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mark-et-test-'));
  try {
    initWorkspace(tmp);
    for (const channel of CHANNELS) {
      for (const stage of CHANNEL_STAGES) {
        const dir = path.join(tmp, 'channels', channel, stage);
        assert.ok(fs.existsSync(dir), `channels/${channel}/${stage}/ should exist`);
      }
    }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('initWorkspace: skips if already initialised', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mark-et-test-'));
  try {
    initWorkspace(tmp);
    const result = initWorkspace(tmp);
    assert.strictEqual(result.alreadyInitialised, true);
    assert.strictEqual(result.created.length, 0);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

// --- Summary ---

console.log(`\n${passed} passed, ${failed} failed, ${passed + failed} total`);
process.exit(failed > 0 ? 1 : 0);
