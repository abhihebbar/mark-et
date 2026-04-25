Scaffolded mark-et Node.js project — markdown-native marketing platform

## What changed

Created the full project from scratch (empty folder). Zero-dependency Node.js project that converts markdown files with frontmatter into static HTML marketing pages.

### Files created

- `package.json` — project manifest with build/test/dev scripts
- `src/markdown.js` — zero-dependency markdown parser with frontmatter support (headings, lists, code blocks, links, images, blockquotes, inline formatting)
- `src/build.js` — site builder: reads `content/*.md`, applies HTML templates, writes to `dist/`
- `src/cli.js` — CLI entry point with `build`, `dev` (watch + serve), and `help` commands
- `src/index.js` — public API re-export
- `templates/default.html` — responsive default HTML template with CSS
- `content/index.md` — example landing page showcasing platform features
- `test/run.js` — 13 tests covering frontmatter parsing, markdown rendering, and full build
- `.gitignore` — ignores node_modules and dist

### Test output

```
13 passed, 0 failed, 13 total
```

### Build output

```
Built 1 page(s) → dist/
  index.html — mark-et
```
