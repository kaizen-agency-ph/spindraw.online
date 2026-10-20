// Turn pasted text / CSV into wheel entries: [{ name, weight }].

// Lines that end a comment block (action rows, relative times).
const SEP = [
  /^(like|reply|liked|replied)$/i,
  /^\d+\s?(s|m|h|d|w|y|mo|min|mins|hr|hrs|wk|wks)(\s+reply)?$/i,
  /^\d+\s+(sec|second|min|minute|hour|day|week|month|year)s?\s+ago(\s+\(edited\))?$/i,
  /^(just now|yesterday)$/i,
  /^\d{1,2}-\d{1,2}(-\d{2,4})?(\s+reply)?$/i,
];
// Facebook's "2m · Like · Reply" row always ends a block, even a sticker-only comment.
const FB_ACTIONS = /·/;
// Badges, counters and UI chrome that show up when copying comments.
const SKIP = [
  /^(author|top fan|rising fan|valued commenter|creator|pinned|pinned by .*|edited|follow|following|see more|see translation|hide|most relevant|newest|all comments|top comments|view more comments|view previous comments|write a comment.*|.*\breplied\b.*|view \d+ (more )?repl(y|ies)|\d+ repl(y|ies))$/i,
  /^[\d,.]+\s?[km]?$/i,
  /^\d{1,2}:\d{2}(:\d{2})?\s?([ap]m)?$/i,
];
const CHAT_TIME = /^\[?\d{1,2}:\d{2}(:\d{2})?\s?([ap]m)?\]?\s*/i;
const WEIGHT = /^(.*?)(?:\s*[x×*]\s*(\d+)|\s*[,\t]\s*(\d+))\s*$/i;

const isSep = l => SEP.some(r => r.test(l));
const isSkip = l => SKIP.some(r => r.test(l));

export const cleanName = s => String(s ?? '')
  .replace(/^@+/, '')
  .replace(/\s*·\s*follow$/i, '')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, 60);

const keyOf = name => name.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
const clampW = w => Math.min(1000, Math.max(1, Number.isFinite(w) ? Math.floor(w) : 1));

function parseLines(text) {
  return text.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(line => {
    const m = line.match(WEIGHT);
    return m && m[1] ? { name: m[1], weight: parseInt(m[2] ?? m[3], 10) } : { name: line, weight: 1 };
  });
}

// Copied comment sections: name, (time), comment text..., action row.
function parseComments(text) {
  const items = [];
  let cur = null;
  const close = () => { if (cur) items.push({ name: cur.name, weight: 1, text: cur.text.join(' ') }); cur = null; };
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (FB_ACTIONS.test(line)) { close(); continue; }
    if (isSep(line)) {
      // YouTube puts "2 hours ago" between the name and the text; only close once text exists.
      if (cur && cur.text.length) close();
      continue;
    }
    if (isSkip(line)) continue;
    if (!cur) cur = { name: line, text: [] };
    else cur.text.push(line);
  }
  close();
  return items;
}

// Live chat copy: "12:01 PM Juan: #join" or "Juan: #join".
function parseChat(text) {
  return text.split(/\r?\n/).map(l => l.trim().replace(CHAT_TIME, '')).filter(Boolean).map(line => {
    const i = line.indexOf(': ');
    return i > 0 ? { name: line.slice(0, i), weight: 1, text: line.slice(i + 2) } : { name: line, weight: 1, text: '' };
  });
}

export function parseText(text, format) {
  if (format === 'comments') return parseComments(text);
  if (format === 'chat') return parseChat(text);
  return parseLines(text);
}

// Keyword filter only applies to items that carry comment text.
export function buildEntries(items, { dedupe = true, keyword = '' } = {}) {
  const kws = keyword.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
  const seen = new Set();
  const entries = [];
  let filtered = 0, dupes = 0;
  for (const it of items) {
    const name = cleanName(it.name);
    if (!name) continue;
    if (kws.length && it.text !== undefined && !kws.some(k => it.text.toLowerCase().includes(k))) { filtered++; continue; }
    if (dedupe) {
      const key = keyOf(name);
      if (seen.has(key)) { dupes++; continue; }
      seen.add(key);
    }
    entries.push({ name, weight: clampW(it.weight) });
  }
  const tickets = entries.reduce((s, e) => s + e.weight, 0);
  return { entries, stats: { raw: items.length, filtered, dupes, kept: entries.length, tickets } };
}

export function parseCSV(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else q = false;
      } else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim()));
}

// Picks the name / weight / comment columns from headers (Google Forms exports work as-is).
export function csvToItems(text) {
  const rows = parseCSV(text);
  if (!rows.length) return [];
  const head = rows[0].map(h => h.trim().toLowerCase());
  const find = re => head.findIndex(h => re.test(h));
  let ni = find(/name|user|handle|account|player|participant/);
  const wi = find(/weight|entries|tickets|qty|quantity|count/);
  const ti = find(/comment|message|text|answer/);
  const hasHeader = ni >= 0 || wi >= 0 || ti >= 0;
  if (ni < 0) ni = 0;
  return rows.slice(hasHeader ? 1 : 0).map(r => ({
    name: r[ni] ?? '',
    weight: wi >= 0 ? parseInt(r[wi], 10) : 1,
    text: ti >= 0 ? (r[ti] ?? '') : undefined,
  }));
}

// Share link / published link → a CSV URL that allows cross-origin fetches.
export function sheetCsvUrl(url) {
  if (/output=csv/.test(url)) return url;
  if (/\/spreadsheets\/d\/e\//.test(url)) return url.replace(/\/pub(html)?.*$/, '/pub?output=csv');
  const id = url.match(/\/spreadsheets\/d\/([\w-]+)/)?.[1];
  if (!id) return null;
  const gid = url.match(/[#&?]gid=(\d+)/)?.[1] ?? '0';
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${gid}`;
}

export function toCSV(rows) {
  return rows.map(r => r.map(c => {
    let s = String(c ?? '');
    if (/^[=+]/.test(s)) s = `'${s}`;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(',')).join('\n');
}
