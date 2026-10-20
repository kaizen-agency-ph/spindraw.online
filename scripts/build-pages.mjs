// Builds the marketing pages: home (index.html), one guide per search intent,
// sitemap.xml and robots.txt. Run: node scripts/build-pages.mjs
// GitHub Pages has no build step, so the generated files are committed.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://spindraw.online';
const TODAY = new Date().toISOString().slice(0, 10);

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ld = obj => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;

const ICONS = {
  broadcast: '<path d="M4.9 19.1a10 10 0 0 1 0-14.2M7.8 16.2a6 6 0 0 1 0-8.4M16.2 7.8a6 6 0 0 1 0 8.4M19.1 4.9a10 10 0 0 1 0 14.2"/><circle cx="12" cy="12" r="2"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  paste: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6M9 16h4"/>',
  trophy: '<path d="M6 9H4a2 2 0 0 1 0-4h2M18 9h2a2 2 0 0 0 0-4h-2M6 4h12v6a6 6 0 0 1-12 0V4zM9 21h6M12 16v5"/>',
  palette: '<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.3A5.6 5.6 0 0 0 22 10c0-4.4-4.5-8-10-8z"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M10 2h4"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
};
const icon = name => `<span class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg></span>`;

// Guides: one page per search intent we can realistically rank for.
const GUIDES = [
  {
    slug: 'facebook-live-raffle',
    nav: 'Facebook Live raffle',
    title: 'Facebook Live Raffle & Comment Picker (Free) | SpinDraw',
    description: 'Run a Facebook Live raffle from your comments: paste them in, filter by keyword, remove duplicates and spin a free raffle wheel on stream. No Facebook login.',
    h1: 'Facebook Live raffle picker that works from your comments',
    lede: 'Copy the comments from your live or post, paste them into SpinDraw and spin. Likes, timestamps and “Reply” are stripped out, duplicates are removed, and only people who typed your keyword get a slice.',
    body: `
<h2>How to run a raffle on Facebook Live</h2>
<ol>
  <li><strong>Announce the keyword.</strong> Ask viewers to comment something like <em>#JOIN</em> or <em>mine</em> to enter.</li>
  <li><strong>Copy the comments.</strong> Expand the comments on the post (choose “All comments” rather than “Most relevant”), select them and copy.</li>
  <li><strong>Paste into SpinDraw.</strong> Choose <em>Copied comments</em>, type the keyword, and keep “One entry per person” on so spam comments don’t add extra chances.</li>
  <li><strong>Lock and spin.</strong> Locking puts a commitment code on screen. Ask chat for a word, type it as the salt, then spin.</li>
  <li><strong>Give the winner time to claim.</strong> The claim timer counts down on the overlay. If nobody answers, press R to log a no-show and redraw.</li>
  <li><strong>Post the proof.</strong> Finish the raffle and paste the verify link as a comment so anyone can re-run the draw.</li>
</ol>
<h2>Why not just use a comment picker app?</h2>
<p>Most Facebook comment pickers connect to your Page through a Facebook login and only support business Pages. SpinDraw doesn't ask for any Facebook access. You paste text you already have, so it works for Pages, profiles, groups and shared posts alike, and your entry list never leaves your browser.</p>
<h2>Selling live? Give buyers extra entries</h2>
<p>Live sellers often reward orders with extra chances. In the one-name-per-line format, write <em>Maria Santos x3</em> to give Maria three entries. The wheel shows her slice three times bigger, and the odds follow.</p>`,
    faq: [
      ['Do I need to connect my Facebook account?', 'No. SpinDraw never asks for a Facebook login. You copy the comments yourself and paste them in.'],
      ['Can I only count comments with a hashtag?', 'Yes. In the “Copied comments” format, type one or more keywords (comma-separated) and comments without them are skipped. The page tells you how many were skipped.'],
      ['How do I show the wheel on my Facebook Live?', 'Add the overlay URL from the Stream tab as a Browser source in OBS or Streamlabs, then stream to Facebook from there. Without streaming software, open the overlay window and share that screen.'],
      ['What if the winner doesn’t reply?', 'Set a claim timer in the Prizes tab. When it runs out, press R. The no-show is logged and removed, and the wheel spins again.'],
    ],
  },
  {
    slug: 'tiktok-live-giveaway-wheel',
    nav: 'TikTok LIVE giveaway',
    title: 'TikTok LIVE Giveaway Wheel with Vertical Overlay | SpinDraw',
    description: 'A free giveaway wheel made for TikTok LIVE: vertical 9:16 overlay, comment and Google Form entries, claim timer and a proof link your viewers can check.',
    h1: 'The giveaway wheel built for TikTok LIVE',
    lede: 'A 9:16 overlay that fills a vertical stream, keeps clear of TikTok’s comment area, and shows a big winner card your viewers can read on a phone.',
    body: `
<h2>Set it up in TikTok LIVE Studio or OBS</h2>
<ol>
  <li>Open the <a href="/app.html">control panel</a>, go to the <strong>Stream</strong> tab and choose <strong>9:16 (TikTok, Reels, Shorts)</strong>.</li>
  <li>Copy the overlay URL.</li>
  <li>In <strong>TikTok LIVE Studio</strong>, add a <em>Link</em> source and paste the URL at 1080×1920. In <strong>OBS</strong>, add a <em>Browser</em> source with the same size.</li>
  <li>Keep the control panel open in your browser. The overlay follows every spin automatically.</li>
</ol>
<p>If a link source shows up blank or tiny in TikTok LIVE Studio, run the overlay in OBS instead and send OBS to TikTok with the OBS Virtual Camera.</p>
<h2>Collecting TikTok entries</h2>
<p>TikTok comments scroll away fast. Two reliable options:</p>
<ul>
  <li><strong>Paste comments:</strong> for a giveaway on a video post, copy the comments from TikTok on the web and use the <em>Copied comments</em> format with your keyword.</li>
  <li><strong>Google Form:</strong> put a form link in your bio, then import the responses as CSV or straight from Google Sheets. Name and ticket columns are detected automatically.</li>
</ul>
<h2>Proof that fits TikTok</h2>
<p>TikTok comments are limited to 150 characters, so a full verify link usually won’t fit. Download the <strong>proof file</strong> instead and share it from your bio link or a story. Anyone can open it on the SpinDraw verify page.</p>`,
    faq: [
      ['Does the overlay work in TikTok LIVE Studio?', 'Yes, as a Link source at 1080×1920. If your version renders link sources badly, use OBS with the Virtual Camera instead.'],
      ['Can viewers see that the draw wasn’t scripted?', 'The commitment code shown before the spin locks the entry list and the secret seed. After the raffle, the verify page re-runs every draw and anyone can compare the code with what they saw live.'],
      ['Is there a limit on entries?', 'No fixed limit. Thousands of names spin smoothly. Very small slices hide their labels, and the ticker under the wheel shows whose slice the pointer is on.'],
    ],
  },
  {
    slug: 'obs-spin-wheel',
    nav: 'OBS spin wheel overlay',
    title: 'Spin the Wheel Overlay for OBS & Streamlabs | SpinDraw',
    description: 'Add a free spin-the-wheel overlay to OBS or Streamlabs as a browser source. Transparent background, 16:9 or 9:16, synced to a control panel. No sign-up.',
    h1: 'A spin-the-wheel overlay for OBS and Streamlabs',
    lede: 'One browser source, transparent background, no account. You run the raffle from a control panel in your normal browser and the wheel, prize, countdown and winner card appear over your stream.',
    body: `
<h2>Add the wheel to OBS in a minute</h2>
<ol>
  <li>Open the <a href="/app.html">control panel</a> and go to the <strong>Stream</strong> tab.</li>
  <li>Pick a layout (16:9 or 9:16) and a background: transparent for OBS/Streamlabs, green for chroma key, dark for screen sharing.</li>
  <li>In OBS: <em>Sources → + → Browser</em>, paste the URL, set 1920×1080 (or 1080×1920). In Streamlabs: <em>Add Source → Browser Source</em>.</li>
  <li>The pill at the top of the control panel turns green when the overlay is connected.</li>
</ol>
<h2>What shows on stream</h2>
<ul>
  <li>The wheel, with your colors, logo in the middle and an optional image on the wheel face</li>
  <li>The prize being drawn and an entries countdown (“Entries close in 2:00”)</li>
  <li>A large winner card with confetti, sound and the claim timer</li>
  <li>The commitment code, so viewers can screenshot it before the spin</li>
</ul>
<h2>How the overlay stays in sync</h2>
<p>OBS runs browser sources in their own process, separate from your browser. SpinDraw connects the two peer to peer over WebRTC, so the overlay mirrors the control panel without a server storing your raffle. If you refresh the control panel mid-stream, the overlay reconnects by itself.</p>
<h2>Keyboard-driven</h2>
<p>Space spins, C marks the winner as claimed, R logs a no-show and redraws, O opens a preview window. You never need to look away from your stream to run it.</p>`,
    faq: [
      ['Is the overlay background transparent?', 'Yes, by default. You can also choose a green screen, a dark background or upload your own background image.'],
      ['Do ads show on the overlay?', 'No. The overlay page never shows ads. Ads only appear on the control panel and the website.'],
      ['Does it work with Twitch, YouTube and Kick?', 'Yes. The overlay is just a browser source, so it works with any platform you stream to from OBS or Streamlabs.'],
      ['Can I play sounds through OBS?', 'Yes. The overlay plays the tick and win sounds, so they’re captured with the browser source. You can turn them off in the Stream tab.'],
    ],
  },
  {
    slug: 'youtube-live-giveaway',
    nav: 'YouTube Live giveaway',
    title: 'YouTube Live Chat Giveaway Picker & Raffle Wheel | SpinDraw',
    description: 'Pick a random winner from YouTube Live chat or comments. Paste chat lines, count one entry per viewer, give members extra entries and spin on stream.',
    h1: 'Pick a YouTube Live giveaway winner from chat',
    lede: 'Paste your live chat (“Name: message”) or a comment section, keep only people who typed the keyword, and spin a wheel your audience can watch and verify.',
    body: `
<h2>From live chat to winner</h2>
<ol>
  <li>Tell chat the entry word, for example <em>!join</em>.</li>
  <li>Copy the chat messages and paste them using the <em>Live chat lines</em> format. Timestamps are removed automatically.</li>
  <li>Type <em>!join</em> as the keyword and keep “One entry per person” on, so spamming the word doesn’t add chances.</li>
  <li>Lock, take a salt word from chat, and press Space.</li>
</ol>
<h2>Members and super chats</h2>
<p>To reward channel members, add them on separate lines with a multiplier, such as <em>@gamerjoe x3</em>. Their slice grows and so do their odds. The verify page lists every entry with its weight, so it stays transparent.</p>
<h2>Sharing the result</h2>
<p>YouTube live chat messages are capped at 200 characters, which is too short for most verify links. Post the link in the video description or a pinned comment instead. Regular YouTube comments allow much longer text.</p>`,
    faq: [
      ['Can it pull YouTube chat automatically?', 'Not yet. For now you paste the chat. Automatic YouTube and Twitch chat import is on the roadmap.'],
      ['Will duplicate names count twice?', 'Not with “One entry per person” on. Names are compared ignoring capital letters and extra spaces.'],
      ['Can I do several prizes in one stream?', 'Yes. List prizes in draw order in the Prizes tab. Winners are removed from the wheel after each draw unless you turn that off.'],
    ],
  },
  {
    slug: 'random-name-picker',
    nav: 'Random name picker',
    title: 'Random Name Picker Wheel – Spin to Pick a Name | SpinDraw',
    description: 'Free random name picker wheel. Paste names, spin the wheel and pick a winner for classrooms, teams, lucky draws and raffles. Weighted entries, no sign-up.',
    h1: 'Random name picker wheel',
    lede: 'Paste a list, spin the wheel, get a name. It’s built for live giveaways, but works just as well for picking a student, a team order or a lucky-draw winner at a party.',
    body: `
<h2>How to pick a random name</h2>
<ol>
  <li>Open the <a href="/app.html">wheel</a> and paste one name per line.</li>
  <li>Want someone to have better odds? Write <em>Name x2</em>.</li>
  <li>Press <strong>Spin</strong> (or Space). The pointer lands on the winner.</li>
  <li>Keep spinning to draw more names. Winners drop off the wheel so nobody is picked twice.</li>
</ol>
<h2>Good uses</h2>
<ul>
  <li><strong>Classroom:</strong> pick who answers next, or set a presentation order by drawing until the wheel is empty.</li>
  <li><strong>Teams and meetings:</strong> pick who goes first at stand-up or who takes the next ticket.</li>
  <li><strong>Lucky draws and events:</strong> project the wheel on a screen with your logo in the middle and a background image.</li>
  <li><strong>Giveaways:</strong> paste comments from social posts and filter by keyword.</li>
</ul>
<h2>Is it really random?</h2>
<p>Each pick comes from a cryptographic HMAC-SHA256 of a 256-bit random seed, never from <code>Math.random()</code>. You can also lock the list first and share a verify page afterwards, so anyone can check that the result followed from the locked list.</p>`,
    faq: [
      ['Is the random name picker free?', 'Yes. It’s free and needs no account. The site is supported by ads, which never appear on the stream overlay.'],
      ['Are my names uploaded anywhere?', 'No. Names are stored only in your browser. They’re shared only if you choose to share a verify link or proof file.'],
      ['Can I change the wheel colors?', 'Yes. In the Style tab you can choose a preset or your own colors, add a logo to the center and an image to the wheel.'],
    ],
  },
  {
    slug: 'wheel-of-names-alternative',
    nav: 'Wheel of Names alternative',
    title: 'Wheel of Names Alternative for Live Raffles | SpinDraw',
    description: 'A Wheel of Names alternative for live streams: verifiable draws, comment pasting with keyword filters, claim timers and a vertical overlay. Free.',
    h1: 'A Wheel of Names alternative made for live raffles',
    lede: 'Wheel of Names is a great general-purpose spinner. SpinDraw focuses on one job: running giveaways on a live stream in a way your audience can trust.',
    body: `
<h2>How they compare</h2>
<div class="table-scroll"><table class="compare">
  <thead><tr><th></th><th>Wheel of Names</th><th>SpinDraw</th></tr></thead>
  <tbody>
    <tr><td>Price</td><td>Free, ad-supported</td><td>Free, ad-supported</td></tr>
    <tr><td>Random source</td><td>Browser cryptographic RNG</td><td>HMAC-SHA256 of a committed 256-bit seed</td></tr>
    <tr><td>Proof viewers can check</td><td>Statistical test (“Run 10,000 spins”)</td><td>Commitment shown before the draw + verify link that replays every pick</td></tr>
    <tr><td>Streaming</td><td>Dedicated streaming page</td><td>Transparent OBS overlay, 16:9 and 9:16, synced to a control panel</td></tr>
    <tr><td>Paste raw comments</td><td>Paste a list of names</td><td>Parses copied Facebook, TikTok and YouTube comments; keyword filter; de-duplication</td></tr>
    <tr><td>Weighted entries</td><td>Yes (advanced mode)</td><td>Yes (“Name x3”)</td></tr>
    <tr><td>Google Sheets</td><td>Import after logging in; live-updates</td><td>Import a shared sheet without logging in</td></tr>
    <tr><td>Prize queue &amp; claim timer</td><td>Not mentioned in their FAQ</td><td>Yes, with one-key no-show redraw</td></tr>
    <tr><td>Accounts &amp; cloud saving</td><td>Yes</td><td>No accounts; saved in your browser</td></tr>
  </tbody>
</table></div>
<p class="small">Based on Wheel of Names’ public FAQ in October 2026. Features change, so check both sites.</p>
<h2>When to stay with Wheel of Names</h2>
<p>For classroom spinning, saving many wheels to an account, or sharing wheels with others, Wheel of Names is excellent and more mature.</p>
<h2>When SpinDraw fits better</h2>
<p>When you’re giving something away in front of an audience. Viewers often suspect live draws are scripted. SpinDraw shows a commitment code before the spin, mixes in a word from chat, and lets anyone replay the draw afterwards. It also handles the messy parts of live raffles: pasting raw comments, filtering by keyword, several prizes in a row and winners who never reply.</p>`,
    faq: [
      ['Is SpinDraw affiliated with Wheel of Names?', 'No. SpinDraw is an independent tool. Wheel of Names is a trademark of its owner.'],
      ['Can I import my list from Wheel of Names?', 'Yes. Copy the names from your wheel and paste them into SpinDraw, one per line.'],
      ['Does SpinDraw have accounts?', 'No. Everything is saved in your browser, so there’s nothing to sign up for.'],
    ],
  },
];

function head({ title, description, path, extra = '', noindex = false }) {
  const url = SITE + path;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>try{var t=localStorage.getItem('spindraw:theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}</script>
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${url}">
  ${noindex ? '<meta name="robots" content="noindex">' : ''}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="SpinDraw">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#ffd23f">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/css/site.css">
  ${extra}
</head>`;
}

const header = `
  <header class="topbar">
    <a class="brand" href="/"><span class="brand-mark"></span>SpinDraw</a>
    <nav class="site-nav" aria-label="Main">
      <a class="link" href="/#features">Features</a>
      <a class="link" href="/#how">How it works</a>
      <a class="link" href="/obs-spin-wheel/">OBS overlay</a>
      <a class="link" href="/#faq">FAQ</a>
      <details class="mnav">
        <summary aria-label="Menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></summary>
        <div class="mnav-panel">
          <a href="/#features">Features</a>
          <a href="/#how">How it works</a>
          <a href="/obs-spin-wheel/">OBS overlay</a>
          <a href="/#faq">FAQ</a>
        </div>
      </details>
      <button class="btn ghost theme-toggle" type="button" data-theme-toggle aria-label="Toggle theme"></button>
      <a class="btn primary" href="/app.html">Open the wheel</a>
    </nav>
  </header>`;

const footer = `
  <footer class="site page">
    <div>
      <a class="brand" href="/"><span class="brand-mark"></span>SpinDraw</a>
      <p>The free raffle wheel for live streams. Fair draws your viewers can check.</p>
    </div>
    <div>
      <h4>Guides</h4>
      <ul>${GUIDES.map(g => `<li><a href="/${g.slug}/">${esc(g.nav)}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h4>Product</h4>
      <ul>
        <li><a href="/app.html">Raffle wheel</a></li>
        <li><a href="/verify.html">Verify a draw</a></li>
        <li><a href="/privacy.html">Privacy</a></li>
      </ul>
    </div>
  </footer>
  <script type="module" src="/js/theme.js"></script>`;

const faqLd = faq => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});
const faqHtml = faq => `<div class="faq">${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`;

// ---------- home ----------
const HOME_FAQ = [
  ['Is SpinDraw free?', 'Yes. SpinDraw is free with no sign-up. Ads on the website pay for it, and they never appear on the overlay your viewers see.'],
  ['Can I use the wheel in OBS or Streamlabs?', 'Yes. Copy the overlay URL from the Stream tab and add it as a Browser source. It has a transparent background and comes in 16:9 and vertical 9:16.'],
  ['Is the wheel really random?', 'Every pick is computed with HMAC-SHA256 from a secret 256-bit random seed. The seed is committed on screen before the draw and revealed afterwards, so anyone can replay the result.'],
  ['How can viewers know the draw wasn’t rigged?', 'Before spinning, SpinDraw shows a commitment code that locks the entry list and the seed. After the raffle, the verify page recomputes every winner and viewers compare the code with what they saw live.'],
  ['Is SpinDraw a Wheel of Names alternative?', 'Yes, one focused on live raffles: it adds a fairness proof, comment pasting with keyword filters, a prize queue with claim timers and a vertical overlay for TikTok.'],
  ['Where are my entries stored?', 'Only in your browser. Nothing is uploaded unless you share a verify link or proof file.'],
];

const homeBody = `
  <main class="page">
    <section class="hero">
      <div>
        <span class="eyebrow"><b>Free</b> Raffle wheel for live streams</span>
        <h1>Spin the wheel. <span class="mark">Prove</span> it was fair.</h1>
        <p class="lede">SpinDraw is a free raffle wheel and random name picker for Facebook Live, TikTok LIVE, YouTube and Twitch. Paste the comments, show the wheel in OBS, and give viewers a link that replays the draw.</p>
        <div class="cta">
          <a class="btn primary big" href="/app.html">Start a raffle, free</a>
          <a class="btn big" href="#how">See how it works</a>
        </div>
        <p class="fine">No sign-up · Entries never leave your browser · No ads on the overlay</p>
      </div>
      <div class="product" aria-hidden="true">
        <div class="product-bar"><i></i><i></i><i></i></div>
        <div class="demo"><canvas id="demo"></canvas><span class="demo-name" id="demoName">Maria Santos</span></div>
      </div>
    </section>

    <section class="section" id="features">
      <div class="section-head">
        <div class="kicker">Features</div>
        <h2>Everything a live giveaway needs</h2>
        <p>Wheel of Names-style spinning, plus the parts that matter when an audience is watching.</p>
      </div>
      <div class="grid">
        <div class="card">${icon('broadcast')}<h3>OBS & Streamlabs overlay</h3><p>A transparent browser source with the wheel, prize, countdown and winner card. 16:9, or vertical 9:16 for TikTok.</p></div>
        <div class="card">${icon('shield')}<h3>Provably fair draws</h3><p>A commitment code before the spin, a salt word from chat, and a verify link that replays every pick.</p></div>
        <div class="card">${icon('paste')}<h3>Paste comments as-is</h3><p>Copy a Facebook, TikTok or YouTube comment section. Likes and timestamps are stripped, duplicates removed, keywords filtered.</p></div>
        <div class="card">${icon('trophy')}<h3>Prize queue & claim timer</h3><p>Draw 3rd → 1st in one go. Winners get a countdown to claim, and one key redraws a no-show.</p></div>
        <div class="card">${icon('palette')}<h3>Your brand on the wheel</h3><p>Custom slice colors, your logo in the center, an image on the wheel and a background for the overlay.</p></div>
        <div class="card">${icon('lock')}<h3>Private by default</h3><p>No account, no upload. Lists, prizes and settings stay in your browser.</p></div>
      </div>
    </section>

    <section class="section" id="how">
      <div class="section-head">
        <div class="kicker">How it works</div>
        <h2>From comments to a verified winner in four steps</h2>
      </div>
      <ol class="steps-row">
        <li><h3>Paste entries</h3><p>Names, copied comments, live chat, a CSV or a Google Sheet.</p></li>
        <li><h3>Lock the list</h3><p>A commitment code appears on stream. Viewers can screenshot it.</p></li>
        <li><h3>Spin on stream</h3><p>Space to spin. The overlay in OBS spins in sync.</p></li>
        <li><h3>Share the proof</h3><p>Post the verify link so anyone can replay the draw.</p></li>
      </ol>
    </section>

    <section class="section">
      <div class="section-head">
        <div class="kicker">Guides</div>
        <h2>Run a raffle on any platform</h2>
      </div>
      <div class="grid">
        ${GUIDES.map(g => `<a class="card" href="/${g.slug}/"><h3>${esc(g.nav)}</h3><p>${esc(g.description)}</p><span class="go">Read the guide →</span></a>`).join('\n        ')}
      </div>
    </section>

    <div class="ad-slot ad-wide" aria-label="Advertisement">Ad space</div>

    <section class="section" id="faq">
      <div class="section-head"><div class="kicker">FAQ</div><h2>Questions</h2></div>
      ${faqHtml(HOME_FAQ)}
    </section>

    <div class="cta-band">
      <div><h2>Ready for your next giveaway?</h2><p>Free, no sign-up, works in your browser.</p></div>
      <a class="btn primary big" href="/app.html">Open the wheel</a>
    </div>
  </main>`;

const homeDemo = `
  <script type="module">
    import { Wheel } from '/js/wheel.js';
    const names = ['Maria Santos', 'Juan Dela Cruz', 'Alex Reyes', 'Priya Patel', 'Sam Lee', 'Chris Tan', 'Jordan Kim', 'Aisha Bello', 'Leo Cruz', 'Bea Ramos', 'Noah Garcia', 'Mika Lim'];
    const w = new Wheel(document.getElementById('demo'));
    w.setEntries(names.map(name => ({ name, weight: 1 })));
    const tag = document.getElementById('demoName');
    async function loop() {
      const i = Math.floor(Math.random() * names.length);
      const { from, to } = w.planSpin(i, 5);
      tag.style.opacity = 0;
      await w.animate(from, to, 5000);
      tag.textContent = names[i];
      tag.style.opacity = 1;
      setTimeout(loop, 2600);
    }
    document.fonts?.ready.then(() => { w.cache = null; w.draw(); });
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setTimeout(loop, 800);
  </script>`;

const homeLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'SpinDraw',
    url: SITE + '/',
    description: 'Free raffle wheel and random name picker for live streams, with an OBS overlay and provably fair draws.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: ['Spin the wheel', 'Random name picker', 'OBS and Streamlabs overlay', 'Comment picker with keyword filter', 'Weighted entries', 'Verifiable draws'],
  },
  { '@context': 'https://schema.org', '@type': 'WebSite', name: 'SpinDraw', url: SITE + '/' },
  faqLd(HOME_FAQ),
];

function write(rel, html) {
  const file = join(ROOT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

write('index.html', `${head({
  title: 'SpinDraw: Free Raffle Wheel for Live Stream Giveaways',
  description: 'Spin a free raffle wheel on Facebook Live, TikTok, YouTube or Twitch. Paste comments, add the wheel to OBS, and give viewers proof the winner was picked fairly.',
  path: '/',
  extra: homeLd.map(ld).join('\n  '),
})}
<body>${header}${homeBody}${footer}${homeDemo}
</body>
</html>
`);

for (const g of GUIDES) {
  const path = `/${g.slug}/`;
  const others = GUIDES.filter(o => o !== g);
  const crumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'SpinDraw', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: g.nav, item: SITE + path },
    ],
  };
  write(`${g.slug}/index.html`, `${head({ title: g.title, description: g.description, path, extra: [ld(crumbs), ld(faqLd(g.faq))].join('\n  ') })}
<body>${header}
  <main class="page">
    <section class="page-hero">
      <div class="crumbs"><a href="/">SpinDraw</a> / ${esc(g.nav)}</div>
      <h1>${esc(g.h1)}</h1>
      <p>${esc(g.lede)}</p>
      <div class="cta"><a class="btn primary big" href="/app.html">Open the raffle wheel</a><a class="btn big" href="/#how">How SpinDraw works</a></div>
    </section>
    <article class="prose">${g.body}
      <h2>Questions</h2>
      ${faqHtml(g.faq)}
    </article>
    <section class="section" style="margin-top:48px">
      <div class="section-head"><h2>More guides</h2></div>
      <div class="grid">${others.slice(0, 3).map(o => `<a class="card" href="/${o.slug}/"><h3>${esc(o.nav)}</h3><p>${esc(o.description)}</p><span class="go">Read →</span></a>`).join('')}</div>
    </section>
    <div class="cta-band">
      <div><h2>Run your raffle now</h2><p>Free, no sign-up, nothing to install.</p></div>
      <a class="btn primary big" href="/app.html">Open the wheel</a>
    </div>
  </main>${footer}
</body>
</html>
`);
}

write('404.html', `${head({ title: 'Page not found | SpinDraw', description: 'This page doesn’t exist. Open the raffle wheel or read a guide.', path: '/404.html', noindex: true })}
<body>${header}
  <main class="page">
    <section class="page-hero">
      <div class="kicker">404</div>
      <h1>That page isn’t on the wheel</h1>
      <p>The link may be mistyped, or the page has moved. Here are the places people usually look for:</p>
      <div class="cta"><a class="btn primary big" href="/app.html">Open the raffle wheel</a><a class="btn big" href="/">Go to the home page</a></div>
    </section>
    <section class="section">
      <div class="grid">${GUIDES.map(g => `<a class="card" href="/${g.slug}/"><h3>${esc(g.nav)}</h3><p>${esc(g.description)}</p><span class="go">Read →</span></a>`).join('')}</div>
    </section>
  </main>${footer}
</body>
</html>
`);

const urls = [
  ['/', '1.0'],
  ['/app.html', '0.9'],
  ...GUIDES.map(g => [`/${g.slug}/`, '0.8']),
  ['/verify.html', '0.4'],
  ['/privacy.html', '0.2'],
];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, p]) => `  <url><loc>${SITE}${u}</loc><lastmod>${TODAY}</lastmod><priority>${p}</priority></url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *
Allow: /
Disallow: /overlay.html

Sitemap: ${SITE}/sitemap.xml
`);
console.log(`built index + ${GUIDES.length} guides + sitemap (${urls.length} urls)`);
