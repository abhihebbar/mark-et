#!/usr/bin/env node

const path = require('path');
const { buildSite } = require('./build');
const { initWorkspace } = require('./init');

const args = process.argv.slice(2);
const command = args[0] || 'build';

function parseFlags(args) {
  const flags = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      flags[key] = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
    }
  }
  return flags;
}

const flags = parseFlags(args);

switch (command) {
  case 'build': {
    const opts = {
      contentDir: flags.content || 'content',
      templateDir: flags.templates || 'templates',
      outDir: flags.out || 'dist',
    };
    try {
      const result = buildSite(opts);
      console.log(`Built ${result.pages.length} page(s) → ${result.outDir}/`);
      for (const p of result.pages) {
        console.log(`  ${p.file} — ${p.title}`);
      }
    } catch (err) {
      console.error(`Build failed: ${err.message}`);
      process.exit(1);
    }
    break;
  }

  case 'dev': {
    const http = require('http');
    const fs = require('fs');
    const opts = {
      contentDir: flags.content || 'content',
      templateDir: flags.templates || 'templates',
      outDir: flags.out || 'dist',
    };
    buildSite(opts);
    const port = flags.port || 3000;
    const distDir = path.resolve(opts.outDir);
    const server = http.createServer((req, res) => {
      let filePath = path.join(distDir, req.url === '/' ? 'index.html' : req.url);
      if (!path.extname(filePath)) filePath += '.html';
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        const ext = path.extname(filePath);
        const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript' };
        res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(port, () => console.log(`Dev server at http://localhost:${port}`));

    // Watch for changes and rebuild
    const watchDirs = [opts.contentDir, opts.templateDir].filter(d => fs.existsSync(d));
    for (const dir of watchDirs) {
      fs.watch(dir, { recursive: true }, () => {
        try {
          buildSite(opts);
          console.log('Rebuilt.');
        } catch (e) {
          console.error(`Rebuild error: ${e.message}`);
        }
      });
    }
    break;
  }

  case 'init': {
    const target = flags.dir || '.';
    const result = initWorkspace(target);
    if (result.alreadyInitialised) {
      console.log(`Already initialised (agents.md exists in ${result.dir})`);
    } else {
      console.log(`Initialised mark-et workspace in ${result.dir}`);
      for (const f of result.created) {
        console.log(`  ${f}`);
      }
    }
    break;
  }

  case 'help':
  default:
    console.log(`mark-et — Markdown-native marketing platform

Commands:
  init    Initialise a new mark-et workspace (creates agents.md, base/, channels/, etc.)
  build   Build markdown content into static HTML pages
  dev     Start dev server with file watching
  help    Show this help message

Options:
  --content <dir>    Content directory (default: content)
  --templates <dir>  Templates directory (default: templates)
  --out <dir>        Output directory (default: dist)
  --port <number>    Dev server port (default: 3000)
  --dir <dir>        Target directory for init (default: .)
`);
}
