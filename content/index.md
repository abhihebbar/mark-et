---
title: mark-et
description: Markdown-native marketing platform for the AI era
slug: index
---

# mark-et

**The marketing platform where content lives in markdown.**

Write your landing pages, product announcements, and campaigns in plain markdown. mark-et turns them into fast, beautiful static pages — no CMS, no database, no framework lock-in.

---

## Why markdown?

- **AI-native** — LLMs read and write markdown natively. Generate, review, and iterate on marketing content with any AI tool.
- **Version controlled** — Every change is a git commit. Review copy changes in PRs, not CMS dashboards.
- **Portable** — Your content is plain text. No proprietary formats, no export headaches.
- **Fast** — Static HTML output. No JavaScript runtime. Sub-second page loads.

## How it works

1. Write your pages in `content/*.md` with frontmatter metadata
2. Customize the look with HTML templates in `templates/`
3. Run `mark-et build` to generate your site
4. Deploy the `dist/` folder anywhere — Netlify, Vercel, S3, or a plain web server

## Get started

```bash
npm install mark-et
mark-et build
```

> "The best marketing platform is the one that gets out of your way." — Someone, probably.

[Get Started](#how-it-works)
