Added `init` command that scaffolds the mark-et workspace directory structure

## What changed

Implemented the `mark-et init` CLI command. When run in a directory, it creates:

- `agents.md` — main AI agent instructions (references directory structure, naming conventions, workflow)
- `CLAUDE.md` — points to agents.md
- `base/icp.md`, `base/pitch.md`, `base/tone.md`, `base/content-pillars.md` — foundational brand documents
- `content-ideas/` — directory for content ideas (naming: `{priority}_{YYYYMMDD}_{HHMM}_{slug}.md`)
- `channels/{linkedin,x,blog,shorts}/{draft,approved,published}/` — channel content directories with stage folders

If already initialised (agents.md exists), the command is a no-op.

### Files created/modified

- `src/init.js` (new) — init logic, template content, exports `initWorkspace()`
- `src/cli.js` — added `init` command case
- `src/index.js` — re-exported `initWorkspace`
- `test/run.js` — added 5 tests for init (agents.md/CLAUDE.md creation, base files, content-ideas dir, channel dirs with stages, idempotency)
- `content/index.md` (restored) — was missing from working tree

### Test output

```
18 passed, 0 failed, 18 total
```

### Build output

```
Built 1 page(s) → dist/
  index.html — mark-et
```
