Refined DEV-0045 card: clarified "kanban board ppt" into an actionable content + template task

## What I learned about the project

mark-et is a zero-dependency Node.js static site generator. Markdown files in `content/` are parsed (frontmatter + body), rendered to HTML via a custom renderer (`src/markdown.js`), injected into HTML templates (`templates/`), and written to `dist/`. It supports a single `default.html` template today, with template selection via frontmatter `template` key. There is no presentation/slide template yet.

## What I changed on the card

The original card said "create a ppt on kanban board" with no acceptance criteria. PowerPoint output is out of scope for a markdown-to-HTML tool, so I reinterpreted the ask as: create a kanban board content page rendered as a presentation-style HTML page using mark-et.

I rewrote the summary to be specific and added 6 testable acceptance criteria covering the content file, template, build output, and visual requirements.

## Why

The original card was too vague to implement. "ppt" doesn't map to any capability in this project. The refined version gives the dev agent a concrete, buildable task that fits the project's architecture.
