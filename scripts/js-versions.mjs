// Content fingerprints for every script. Pages load code through an import map of these, so as
// soon as a file changes its URL changes, and no browser can run an old copy beside a new page.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export function jsVersions(root) {
  const out = {};
  const walk = rel => {
    for (const e of readdirSync(join(root, rel), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = `${rel}/${e.name}`;
      if (e.isDirectory()) walk(path);
      else if (e.name.endsWith('.js')) out[path] = createHash('sha256').update(readFileSync(join(root, path))).digest('hex').slice(0, 10);
    }
  };
  walk('js');
  return out;
}

export function importMapTag(versions) {
  const imports = Object.fromEntries(Object.entries(versions).map(([path, v]) => [`/${path}`, `/${path}?v=${v}`]));
  return `<script type="importmap">${JSON.stringify({ imports })}</script>`;
}

// For hand-written pages: refresh the import map and the script tags in place.
export function stampScripts(html, versions) {
  const tag = importMapTag(versions);
  let out = html.replace(/<script type="importmap">.*?<\/script>/, tag);
  if (!out.includes('type="importmap"')) out = out.replace(/(<meta charset="utf-8">\n)/, `$1  ${tag}\n`);
  return out.replace(/(<script type="module" src=")(\/?)(js\/[\w-]+\.js)(?:\?v=\w+)?(")/g, (_, a, slash, file, z) => `${a}${slash}${file}?v=${versions[file]}${z}`);
}
