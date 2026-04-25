const fs = require('fs');
const path = require('path');

const CHANNELS = ['linkedin', 'x', 'blog', 'shorts'];
const CHANNEL_STAGES = ['draft', 'approved', 'published'];
const BASE_FILES = ['icp', 'pitch', 'tone', 'content-pillars'];

const AGENTS_MD = `# agents.md — AI Agent Instructions

This file contains the main instructions for AI agents working in this project.

## Project Overview

This is a mark-et content workspace. Content is authored in markdown and organized by channel.

## Directory Structure

- \`base/\` — foundational brand documents (ICP, pitch, tone, content pillars)
- \`content-ideas/\` — content ideas, named by priority, date, time, and slug
- \`channels/{channel}/\` — channel-specific content in draft/approved/published stages

## Content Ideas Naming Convention

Files in \`content-ideas/\` follow this pattern:

\`\`\`
{priority}_{YYYYMMDD}_{HHMM}_{short-slug}.md
\`\`\`

- **priority**: 00 (highest) to 99 (lowest)
- **date**: YYYYMMDD format
- **time**: HHMM format (24h)
- **slug**: short descriptive slug using hyphens

Example: \`10_20260425_0900_launch-announcement.md\`

## Workflow

1. Define your brand in \`base/\` files
2. Add content ideas to \`content-ideas/\`
3. Move ideas into channel drafts when ready to develop
4. Progress content through draft → approved → published

## Agent Guidelines

- Always read \`base/\` files before generating content to understand brand voice
- Respect the tone and content pillars defined in \`base/tone.md\` and \`base/content-pillars.md\`
- Use the ICP (\`base/icp.md\`) to tailor messaging
- Keep the pitch (\`base/pitch.md\`) consistent across channels
`;

const CLAUDE_MD = `# CLAUDE.md

For AI agent instructions, see [agents.md](agents.md).
`;

const BASE_TEMPLATES = {
  icp: `---
title: Ideal Customer Profile
---

# Ideal Customer Profile (ICP)

Define your ideal customer here.

## Demographics

- Industry:
- Company size:
- Role/Title:

## Pain Points

-

## Goals

-
`,
  pitch: `---
title: Pitch
---

# Pitch

Your core pitch goes here.

## One-liner



## Elevator Pitch



## Full Pitch


`,
  tone: `---
title: Tone of Voice
---

# Tone of Voice

Define your brand's tone of voice.

## Personality Traits

-

## Do's

-

## Don'ts

-

## Examples

### Preferred

>

### Avoid

>
`,
  'content-pillars': `---
title: Content Pillars
---

# Content Pillars

Define the core themes your content revolves around.

## Pillar 1:

Description:

## Pillar 2:

Description:

## Pillar 3:

Description:
`,
};

function initWorkspace(targetDir) {
  const dir = path.resolve(targetDir || '.');
  const created = [];

  // Check if already initialised (agents.md exists)
  const agentsPath = path.join(dir, 'agents.md');
  if (fs.existsSync(agentsPath)) {
    return { alreadyInitialised: true, dir, created };
  }

  // agents.md and CLAUDE.md
  fs.writeFileSync(agentsPath, AGENTS_MD, 'utf8');
  created.push('agents.md');

  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), CLAUDE_MD, 'utf8');
  created.push('CLAUDE.md');

  // base/ directory with template files
  const baseDir = path.join(dir, 'base');
  fs.mkdirSync(baseDir, { recursive: true });
  for (const name of BASE_FILES) {
    const filePath = path.join(baseDir, `${name}.md`);
    fs.writeFileSync(filePath, BASE_TEMPLATES[name], 'utf8');
    created.push(`base/${name}.md`);
  }

  // content-ideas/ directory
  const ideasDir = path.join(dir, 'content-ideas');
  fs.mkdirSync(ideasDir, { recursive: true });
  fs.writeFileSync(
    path.join(ideasDir, '.gitkeep'),
    '',
    'utf8'
  );
  created.push('content-ideas/');

  // channels/ with sub-channels and stages
  for (const channel of CHANNELS) {
    for (const stage of CHANNEL_STAGES) {
      const stageDir = path.join(dir, 'channels', channel, stage);
      fs.mkdirSync(stageDir, { recursive: true });
      fs.writeFileSync(path.join(stageDir, '.gitkeep'), '', 'utf8');
    }
    created.push(`channels/${channel}/{${CHANNEL_STAGES.join(',')}}/`);
  }

  return { alreadyInitialised: false, dir, created };
}

module.exports = { initWorkspace, CHANNELS, CHANNEL_STAGES, BASE_FILES };
