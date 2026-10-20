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
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M12 14.5c-1.2-1.3-3-.4-3 1 0 1.6 3 3 3 3s3-1.4 3-3c0-1.4-1.8-2.3-3-1z"/>',
  school: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
  party: '<path d="M4 20 9 8l7 7z"/><path d="M14 4v2M19 9h2M17 6l1.5-1.5M12 2.5l.5 1.5M20 13l1 .5"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-3.5 3.2-5.5 6.5-5.5s6 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c2 .7 3.2 2.5 3.5 5.2"/>',
};
const icon = name => `<span class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg></span>`;

// Guides: one page per search intent we can realistically rank for.
const GUIDES = [
  {
    slug: 'office-raffle',
    nav: 'Office raffle',
    title: 'Office Raffle Wheel for Parties & Team Draws | SpinDraw',
    description: 'Run your holiday party raffle, door prizes or team giveaway on the big screen or in a video call. Free, no sign-up, with proof the draw was fair.',
    h1: 'An office raffle wheel for parties and team draws',
    lede: 'Run the year-end party raffle, door prizes or a team giveaway on the big screen or in a video call, and give everyone proof the winners were picked fairly.',
    body: `
<h2>How to run an office raffle</h2>
<ol>
  <li><strong>Collect the names.</strong> Paste them from a spreadsheet or an HR export, one per line, or import sign-up responses from a Google Sheet or any form export saved as CSV.</li>
  <li><strong>Add the prizes</strong> in the order you’ll draw them, for example third prize first and the grand prize last.</li>
  <li><strong>Lock the list.</strong> A code appears on screen. Anyone can screenshot it. From this point nobody can be added or removed without the check failing.</li>
  <li><strong>Ask the room for a word.</strong> Let a colleague, not the organiser, pick any word and type it in. That makes the result hard for anyone to steer.</li>
  <li><strong>Present and spin.</strong> Click <strong>Present</strong> to open a clean view for the projector, or share your screen in Zoom, Google Meet or Microsoft Teams. Press Space to spin.</li>
  <li><strong>Share the proof.</strong> When you’re done, post the verify link in the team chat or the follow-up email so anyone can re-run the draw.</li>
</ol>
<h2>Ideas for workplace draws</h2>
<ul>
  <li>Holiday party, year-end party or end-of-year function prizes</li>
  <li>Door prizes at company events, conferences and town halls</li>
  <li>Rewards for a wellness challenge, a sales contest or survey responses</li>
  <li>Picking who presents, hosts the next meeting or takes the next on-call shift</li>
  <li>Choosing which charity gets the team’s donation</li>
</ul>
<h2>Remote and hybrid teams</h2>
<p>Everyone sees the same wheel when you share your screen, wherever they are. Turn on the <strong>claim timer</strong> so a winner who has stepped away gets a minute to reply, and press R to redraw if they don’t. People in other time zones who missed it can open the verify link later and check the result themselves.</p>
<h2>Make it look like your company</h2>
<p>In the Style tab, use your brand colours, put your logo in the middle of the wheel and add a background image. Your employee list is never uploaded: it stays in your browser.</p>
<h2>A note on the rules</h2>
<p>Free raffles for employees are usually simple. If people buy tickets, for example for a charity raffle, many countries and states require a licence or permit. Check the rules where you are. This guide isn’t legal advice.</p>`,
    faq: [
      ['Do employees need to sign up?', 'No. Only the organiser opens SpinDraw. Everyone else just watches the shared screen or the projector.'],
      ['Is our employee list uploaded anywhere?', 'No. Names are stored only in the organiser’s browser. They are shared only if you choose to send a verify link or proof file.'],
      ['Can some people get extra entries?', 'Yes. Write “Name x3” to give someone three entries, for example for completing a challenge. The verify page lists every weight, so it stays transparent.'],
      ['Can we draw several prizes in a row?', 'Yes. List the prizes in the Prizes tab. Winners are removed after each draw, so nobody wins twice unless you turn that off.'],
    ],
  },
  {
    slug: 'secret-santa-name-picker',
    nav: 'Secret Santa & gift exchange',
    title: 'Secret Santa & Gift Exchange Name Picker | SpinDraw',
    description: 'Draw names for Secret Santa, Kris Kringle, Wichteln or Amigo Secreto. A random gift chain where nobody gets themselves. Free and fair, no sign-up.',
    h1: 'A name picker for Secret Santa and gift exchanges',
    lede: 'Draw names for Secret Santa, Kris Kringle, Wichteln, Amigo Secreto or a white elephant swap, for family, friends or the office, in a way nobody can call unfair.',
    body: `
<h2>The easiest fair method: a random gift chain</h2>
<p>Instead of pulling names from a hat (and starting over when someone draws themselves), let the wheel put everyone in a random order. Then each person gives a gift to the next person in the order, and the last person gives to the first.</p>
<ol>
  <li>Open the <a href="/app.html">wheel</a> and add everyone’s name, one per line.</li>
  <li>Leave the Prizes tab empty and keep <strong>Remove winners</strong> on.</li>
  <li>Spin until the wheel is empty. Press C after each name to move on.</li>
  <li>Download the <strong>Results CSV</strong>. The draw order is your chain: #1 gives to #2, #2 gives to #3, and the last person gives to #1.</li>
</ol>
<p>Because it’s one big loop, nobody can end up with their own name, and there are never leftover pairs.</p>
<h3>Keeping it secret</h3>
<p>If the pairs should stay secret, the organiser runs the draw alone and then messages each person privately with the name they’re buying for. Click <strong>Finish &amp; create verify link</strong> and keep the link: if anyone questions the draw later, it shows the order came from the locked list and wasn’t arranged.</p>
<h2>White elephant and Yankee swap</h2>
<p>For a white elephant, Yankee swap or “steal” game, the only thing you need is a fair turn order. Spin through everyone on a shared screen or video call, and the draw order is the order people pick gifts.</p>
<h2>What it’s called around the world</h2>
<ul>
  <li><strong>Secret Santa:</strong> the US, the UK, Canada, Australia and beyond</li>
  <li><strong>Kris Kringle:</strong> Ireland and Australia</li>
  <li><strong>Wichteln:</strong> Germany and Austria</li>
  <li><strong>Amigo Secreto / Amigo Invisible:</strong> Brazil, Portugal, Spain and Latin America</li>
  <li><strong>Monito-Monita:</strong> the Philippines</li>
</ul>
<p>Whatever you call it, the method above works the same way.</p>
<h2>What SpinDraw doesn’t do</h2>
<p>There are no exclusion rules, such as keeping partners apart, and no automatic private emails to each person. If you need those, use a dedicated Secret Santa app. For a quick, fair draw that anyone can check, the gift chain is the simplest option.</p>`,
    faq: [
      ['Can someone end up with their own name?', 'Not with the gift chain method. Everyone gives to the next person in a random order, and the last gives to the first, so nobody can get themselves.'],
      ['Can I keep the pairs secret?', 'Yes. Run the draw on your own, then message each person their match privately. The names stay in your browser and aren’t uploaded.'],
      ['Can I keep couples apart?', 'There are no exclusion rules. If a pair you’d rather avoid ends up next to each other, start a new raffle and draw again before you share any results.'],
      ['Does it work for a remote team or a family spread across countries?', 'Yes. Share your screen on a video call so everyone can watch, or run it privately and send the results.'],
    ],
  },
  {
    slug: 'classroom-name-picker',
    nav: 'Classroom name picker',
    title: 'Classroom Random Name Picker for Teachers | SpinDraw',
    description: 'A free random name picker for teachers: spin on the projector or in an online class, give every student a turn, and keep class lists on your computer.',
    h1: 'A random name picker for the classroom',
    lede: 'Pick students fairly on the projector, smartboard or in an online class. No accounts, nothing to install, and your class list stays on your computer.',
    body: `
<h2>How to use it in class</h2>
<ol>
  <li>Open the <a href="/app.html">wheel</a> and paste your class list, one name per line.</li>
  <li>Click <strong>Present</strong> for a clean view of the wheel on the projector or smartboard, or share your screen in your online class.</li>
  <li>Press Space to spin, then C to move on. With <strong>Remove winners</strong> on, each student is picked once. When everyone has had a turn, click <strong>New raffle</strong> in the Draw tab to start again.</li>
  <li>For quick picks, set the spin length to 3 seconds in the Style tab.</li>
</ol>
<p>The list is saved in your browser, so it’s still there next lesson.</p>
<h2>Ideas for teachers</h2>
<ul>
  <li>Pick who answers next, so it isn’t always the same hands in the air</li>
  <li>Set the order for presentations or reading aloud</li>
  <li>Choose team captains or the next classroom helper</li>
  <li>Draw a winner for a reward or a class prize</li>
  <li>Pick a review question or topic: add questions instead of names</li>
</ul>
<h2>Fair, and seen to be fair</h2>
<p>Students quickly suspect favourites. Lock the list before you spin and a code appears on screen; afterwards the verify link shows the result came from the list, not from you. It’s a small lesson in fairness, too.</p>
<h2>Privacy for students</h2>
<p>There are no student accounts and no sign-up. Class lists stay in your own browser and are never uploaded. On a shared classroom computer, use <strong>Clear</strong> in the Entries tab when you’re done.</p>`,
    faq: [
      ['Do students need accounts?', 'No. Only the teacher opens SpinDraw. Students just watch the projector or the shared screen.'],
      ['Are student names uploaded?', 'No. Names stay in your browser. They’re only shared if you choose to send a verify link or proof file.'],
      ['Can I save several classes?', 'SpinDraw keeps one list at a time. Keep each class list in a document and paste the one you need, which only takes a second.'],
      ['Does it work on Chromebooks, iPads and smartboards?', 'It runs in any modern browser, with nothing to install.'],
    ],
  },
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
<h2>Giving some people extra entries</h2>
<p>To reward loyal followers, for example people who shared the post, write <em>Maria Santos x3</em> in the one-name-per-line format. Maria gets three entries: her slice is three times bigger, and so are her odds. The verify page lists every weight, so it stays transparent.</p>
<h2>Check the rules before tying entries to purchases</h2>
<p>A free giveaway is usually simple. A raffle where buying something earns entries is a <strong>sales promotion</strong> in many countries, and selling raffle “slots” can be treated as gambling. In the Philippines, sales promotions generally need a DTI permit, applied for before the promo starts, and paid raffles without a license can break gambling laws. Rules differ by country and change over time, so check with the DTI or a lawyer before you run a purchase-linked raffle. This guide isn’t legal advice.</p>`,
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
    title: 'Wheel of Names Alternative for Fair Raffles | SpinDraw',
    description: 'A Wheel of Names alternative for raffles people trust: verifiable draws, paste names or comments, several prizes, claim timers and a stream overlay. Free.',
    h1: 'A Wheel of Names alternative made for fair raffles',
    lede: 'Wheel of Names is a great general-purpose spinner. SpinDraw focuses on one job: running raffles and giveaways people can trust, from office parties and family draws to live streams.',
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
<p>When you’re giving something away and people need to trust the result: a company raffle, a family draw, a community giveaway or a live stream. People often suspect draws are rigged. SpinDraw shows a commitment code before the spin, mixes in a word someone else picks, and lets anyone replay the draw afterwards. It also handles the messy parts of real raffles: pasting raw comments, filtering by keyword, several prizes in a row and winners who never reply.</p>`,
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
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-Z58QLX9W8M"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-Z58QLX9W8M');
  </script>
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
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="SpinDraw raffle wheel: spin the wheel, prove it was fair">
  <meta property="og:locale" content="en_US">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#ffd23f">
  <link rel="icon" href="/favicon.ico?v=2" sizes="32x32">
  <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2">
  <link rel="manifest" href="/site.webmanifest?v=2">
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
      <a class="link" href="/#use-cases">Use cases</a>
      <a class="link" href="/#faq">FAQ</a>
      <details class="mnav">
        <summary aria-label="Menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></summary>
        <div class="mnav-panel">
          <a href="/#features">Features</a>
          <a href="/#how">How it works</a>
          <a href="/#use-cases">Use cases</a>
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
      <p>The free raffle wheel for every draw: office raffles, family picks, events and live streams. Fair results anyone can check.</p>
      <p style="margin-top:16px">SpinDraw is free. Tips keep it running.</p>
      <div style="margin-top:10px"><a class="kofi-btn" href="https://ko-fi.com/M5P629543M" target="_blank" rel="noopener" data-kofi="footer"><img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="" width="20" height="13">Buy me a coffee</a></div>
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
  ['Is SpinDraw free?', 'Yes. SpinDraw is free with no sign-up. Ads on the website pay for it, and they never appear on the wheel people watch.'],
  ['Can I use it for an office raffle or a family draw?', 'Yes. Paste the names, put the wheel on a big screen or share your screen in a video call, and spin. Afterwards, send the verify link so anyone can check the result, even people who weren’t there.'],
  ['Can I use the wheel in OBS or Streamlabs?', 'Yes. Copy the overlay URL from the Stream tab and add it as a Browser source. It has a transparent background and comes in 16:9 and vertical 9:16.'],
  ['Is the wheel really random?', 'Every pick is computed with HMAC-SHA256 from a secret 256-bit random seed. The seed is committed on screen before the draw and revealed afterwards, so anyone can replay the result.'],
  ['How can people know the draw wasn’t rigged?', 'Before spinning, SpinDraw shows a code that locks the entry list and a secret seed. After the draw, the verify page recomputes every winner, and anyone can compare the code with the one they saw.'],
  ['Is SpinDraw a Wheel of Names alternative?', 'Yes. It spins like Wheel of Names and adds a fairness proof, pasting names straight from comments or spreadsheets, several prizes with claim timers, and an overlay for live streams.'],
  ['Where are my entries stored?', 'Only in your browser. Nothing is uploaded unless you share a verify link or proof file.'],
  ['Do I need a permit to run a raffle?', 'It depends on where you are and how people enter. Free giveaways are usually simple, but raffles tied to purchases are often regulated as sales promotions (in the Philippines, by the DTI), and selling raffle slots can count as gambling. Check your local rules. SpinDraw picks the winner fairly; it doesn’t make a promotion legal.'],
];

const homeBody = `
  <main class="page">
    <section class="hero">
      <div>
        <span class="eyebrow"><b>Free</b> Raffle wheel &amp; name picker</span>
        <h1>The raffle wheel that <span class="mark">proves</span> it was fair.</h1>
        <p class="lede">Pick a winner for your office raffle, family gift exchange, classroom, event or live stream. Paste the names, spin the wheel, and share a link that proves nobody rigged it.</p>
        <div class="cta">
          <a class="btn primary big" href="/app.html">Start a raffle, free</a>
          <a class="btn big" href="#how">See how it works</a>
        </div>
        <p class="fine">No sign-up · Names never leave your browser · Works on any screen</p>
      </div>
      <div class="product" aria-hidden="true">
        <div class="product-bar"><i></i><i></i><i></i></div>
        <div class="demo"><canvas id="demo"></canvas><span class="demo-name" id="demoName">Maria Santos</span></div>
      </div>
    </section>

    <section class="section" id="video">
      <div class="section-head">
        <div class="kicker">Watch</div>
        <h2>SpinDraw in 46 seconds</h2>
        <p>Paste, lock, spin, prove: the whole draw, start to finish.</p>
      </div>
      <div class="video-frame">
        <video id="explainer" src="/media/spindraw-explainer.mp4" poster="/media/spindraw-explainer-poster.jpg" muted loop playsinline preload="none" controls width="1920" height="1080" aria-label="SpinDraw explainer: paste the names, lock the list, spin the wheel on any screen, and prove the draw was fair"></video>
      </div>
    </section>

    <section class="section" id="use-cases">
      <div class="section-head">
        <div class="kicker">Use cases</div>
        <h2>For any draw, big or small</h2>
        <p>Whenever a group needs a winner, a name or an order, and everyone wants it to be fair.</p>
      </div>
      <div class="grid">
        <a class="card" href="/office-raffle/">${icon('briefcase')}<h3>Office &amp; company raffles</h3><p>Year-end party prizes, door prizes and team giveaways. Put the wheel on the big screen or share it in a video call.</p><span class="go">Office raffle guide →</span></a>
        <a class="card" href="/secret-santa-name-picker/">${icon('home')}<h3>Friends &amp; family</h3><p>Secret Santa and gift exchanges, who hosts next, who pays for dinner. Settle it in one spin.</p><span class="go">Gift exchange guide →</span></a>
        <a class="card" href="/classroom-name-picker/">${icon('school')}<h3>Classrooms &amp; teams</h3><p>Pick who answers next, set a presentation order or choose the next task owner, with no arguments.</p><span class="go">Classroom guide →</span></a>
        <div class="card">${icon('party')}<h3>Events &amp; parties</h3><p>Weddings, birthdays, fundraisers and lucky draws, with your logo in the middle of the wheel.</p></div>
        <div class="card">${icon('users')}<h3>Online communities</h3><p>Facebook groups, Discord servers and newsletters. Paste comments or Google Form entries and filter by keyword.</p></div>
        <a class="card" href="/obs-spin-wheel/">${icon('broadcast')}<h3>Live streams</h3><p>Facebook Live, TikTok LIVE, YouTube and Twitch, with a transparent overlay for OBS and Streamlabs.</p><span class="go">Streaming guide →</span></a>
      </div>
    </section>

    <section class="section" id="features">
      <div class="section-head">
        <div class="kicker">Features</div>
        <h2>Everything a fair draw needs</h2>
        <p>Wheel of Names-style spinning, plus the parts that matter when people are counting on a fair result.</p>
      </div>
      <div class="grid">
        <div class="card">${icon('shield')}<h3>Provably fair draws</h3><p>A code is shown before the spin, and a verify link afterwards lets anyone replay every pick.</p></div>
        <div class="card">${icon('paste')}<h3>Paste names any way</h3><p>One per line, a spreadsheet, a Google Form, or a copied Facebook, TikTok or YouTube comment section. Duplicates are removed.</p></div>
        <div class="card">${icon('trophy')}<h3>Several prizes in a row</h3><p>Draw 3rd → 1st in one go. Give winners time to claim, and redraw a no-show with one key.</p></div>
        <div class="card">${icon('broadcast')}<h3>Big screen or live stream</h3><p>Present the wheel on a projector or in a video call, or add the transparent overlay to OBS and Streamlabs.</p></div>
        <div class="card">${icon('palette')}<h3>Your brand on the wheel</h3><p>Custom colors, your logo in the center, an image on the wheel and a background of your own.</p></div>
        <div class="card">${icon('lock')}<h3>Private by default</h3><p>No account, no upload. Names, prizes and settings stay in your browser.</p></div>
      </div>
    </section>

    <section class="section" id="how">
      <div class="section-head">
        <div class="kicker">How it works</div>
        <h2>From a list of names to a verified winner in four steps</h2>
      </div>
      <ol class="steps-row">
        <li><h3>Paste the names</h3><p>Type them, paste a list or comments, or import a CSV or Google Sheet.</p></li>
        <li><h3>Lock the list</h3><p>A code appears on screen. Everyone can take a screenshot.</p></li>
        <li><h3>Spin</h3><p>Press Space. Show it on a big screen, a video call or your stream.</p></li>
        <li><h3>Share the proof</h3><p>Send the verify link so anyone can replay the draw.</p></li>
      </ol>
    </section>

    <section class="section">
      <div class="section-head">
        <div class="kicker">Guides</div>
        <h2>Step-by-step guides</h2>
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
      <div><h2>Ready for your next draw?</h2><p>Free, no sign-up, works in your browser.</p></div>
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
    // Explainer: play muted while on screen, pause when scrolled away (never autoplay with reduced motion).
    const v = document.getElementById('explainer');
    if (v && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
      }, { threshold: 0.5 }).observe(v);
    }
  </script>`;

const homeLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'SpinDraw',
    url: SITE + '/',
    description: 'Free raffle wheel and random name picker for office raffles, family draws, classrooms, events and live streams, with provably fair results.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: ['Spin the wheel', 'Random name picker', 'Verifiable draws', 'Several prizes with claim timers', 'Comment picker with keyword filter', 'Weighted entries', 'Big-screen and OBS overlay'],
  },
  { '@context': 'https://schema.org', '@type': 'WebSite', name: 'SpinDraw', url: SITE + '/' },
  { '@context': 'https://schema.org', '@type': 'Organization', name: 'SpinDraw', url: SITE + '/', logo: SITE + '/icon-512.png' },
  faqLd(HOME_FAQ),
  {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'SpinDraw in 46 seconds',
    description: 'How to run a fair raffle with SpinDraw: paste the names, lock the list, spin the wheel on any screen, and prove the draw was fair.',
    thumbnailUrl: [SITE + '/media/spindraw-explainer-poster.jpg'],
    uploadDate: '2026-10-20',
    duration: 'PT46S',
    contentUrl: SITE + '/media/spindraw-explainer.mp4',
  },
];

function write(rel, html) {
  const file = join(ROOT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

write('index.html', `${head({
  title: 'SpinDraw: Free Raffle Wheel & Random Name Picker',
  description: 'Free raffle wheel and name picker for office raffles, family draws, events and live streams. Paste names, spin, and share proof the winner was fair.',
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
  ['/privacy.html', '0.2'],
];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, p]) => `  <url><loc>${SITE}${u}</loc><lastmod>${TODAY}</lastmod><priority>${p}</priority></url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`);
console.log(`built index + ${GUIDES.length} guides + sitemap (${urls.length} urls)`);
