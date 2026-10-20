// Render explainer.html to an MP4: seek each frame in headless Chrome, screenshot, encode with ffmpeg.
// Needs: the site served on :5173 (npm start), Chrome with --remote-debugging-port=9333, ffmpeg.
// Usage: node scripts/explainer/render.mjs <frames-dir> [fps] [from] [to]
import { writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const [dir, fpsArg = '30', fromArg, toArg] = process.argv.slice(2);
const FPS = +fpsArg;
mkdirSync(dir, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const t = await (await fetch('http://localhost:9333/json/new?about:blank', { method: 'PUT' })).json();
const ws = new WebSocket(t.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r, { once: true }));
let id = 0; const pending = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id) pending.get(m.id)?.(m); if (m.method === 'Runtime.exceptionThrown') console.error('PAGE ERROR', m.params.exceptionDetails.exception?.description); });
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async x => (await send('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true })).result.result?.value;

await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: 'http://localhost:5173/scripts/explainer/explainer.html' });
for (let i = 0; i < 60 && !(await ev('window.ready === true')); i++) await sleep(250);
const duration = await ev('window.DURATION');
const from = fromArg ? +fromArg : 0, to = toArg ? +toArg : duration;
const total = Math.round((to - from) * FPS);
const t0 = Date.now();
for (let f = 0; f < total; f++) {
  await ev(`window.seek(${(from + f / FPS).toFixed(4)})`);
  const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
  writeFileSync(`${dir}/f${String(f).padStart(5, '0')}.jpg`, Buffer.from(r.result.data, 'base64'));
  if (f % 150 === 0) console.log(`frame ${f}/${total} (${Math.round((Date.now() - t0) / 1000)}s)`);
}
ws.close();
if (!fromArg) {
  const out = new URL('../../media/spindraw-explainer.mp4', import.meta.url).pathname;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', `${dir}/f%05d.jpg`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
  console.log('wrote', out);
}
process.exit(0);
