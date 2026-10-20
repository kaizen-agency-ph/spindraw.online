# SpinDraw

A raffle wheel built for live streams (Facebook Live, YouTube, TikTok LIVE, Twitch, Zoom). It's a static site with no backend, so it can be hosted free on GitHub Pages and earn from AdSense.

| Page | What it is |
|---|---|
| `index.html` | Home page, **generated** by `scripts/build-pages.mjs` |
| `<guide>/index.html` | Six SEO guide pages (Facebook Live, TikTok LIVE, OBS, YouTube, random name picker, Wheel of Names alternative), also generated |
| `app.html` | Host control panel (ads go here) |
| `overlay.html` | What viewers see. Add it as an OBS Browser source. **Never put ads here.** |
| `verify.html` | Public proof page. Re-runs every draw in the viewer's browser |
| `privacy.html` | Privacy policy, required for AdSense |

## SEO pages

Edit the copy in `scripts/build-pages.mjs`, then run `node scripts/build-pages.mjs`. It rewrites `index.html`, the guide pages, `sitemap.xml` and `robots.txt`. Commit the output, because GitHub Pages has no build step. Each page gets a title, description, canonical URL, OG/Twitter tags with `og-image.png`, and JSON-LD (WebApplication + FAQPage on the home page, BreadcrumbList + FAQPage on guides).

After the domain is live, add the site in Google Search Console (a DNS TXT record at Namecheap) and submit `https://spindraw.online/sitemap.xml`.

## Theme

Light is the default, and dark follows the system. The toggle in the top bar saves the choice under `spindraw:theme`. Color tokens are in `css/style.css`. The overlay stays dark on purpose.

## Run locally

```sh
npm start          # serves on http://localhost:5173 (or: python3 -m http.server 5173)
npm test           # fairness + comment-parser tests
```

It has to be served over http(s). Opening the files with `file://` breaks module imports and BroadcastChannel.

## How a raffle runs

1. **Entries tab:** paste names, a copied comment section, or live chat lines; import a CSV or a Google Sheet. Set a keyword (e.g. `#join`) and "one entry per person".
2. **Prizes tab:** one prize per line, in draw order, plus the claim timer.
3. **Draw tab:** **Lock** shows a commitment hash on stream. Then type a **salt word** that chat picks, and press **Space** to spin. **C** = claimed, **R** = no-show → redraw.
4. **Finish & create verify link** reveals the seed. Post the link in the comments.

## Style

The **Style** tab sets slice colors (presets or 1–12 custom colors), text, rim, pointer and hub colors, plus three images:
- a **center logo**, which stays upright in the hub;
- a **wheel image**, which spins with the wheel and is blended over the slices at an adjustable strength;
- an overlay **background**, with an adjustable darkening.

Uploads are downscaled (512 / 1024 / 1920 px) to data URLs. They're stored under `spindraw:images` in localStorage and sent to the overlay as an `images` message, so OBS sources get them too.

## Overlay

Copy the URL from the **Stream** tab into OBS / Streamlabs / TikTok LIVE Studio → Browser source, 1920×1080 (or 1080×1920 for `layout=vertical`).

URL options: `room=` (required), `layout=vertical`, `bg=green|dark`, `sound=0`, `norelay`.

Sync works two ways:
- **BroadcastChannel:** for the overlay popup window ("Open overlay window", or press O) in the same browser. Instant, no network.
- **PeerJS (WebRTC):** for OBS browser sources, which run in a separate process. It uses the free public PeerJS signalling server. Data goes peer-to-peer after that. If the relay status says "Room open in another tab", close the other control-panel tab.

## Provably fair

```
commitment = SHA256("spindraw-v1|" + seed + "|" + SHA256(JSON(entries)))
pick(k)    = HMAC_SHA256(seed, "spindraw-v1|" + entriesHash + "|" + salt + "|" + k)  → weighted slot
```

The seed is secret until "Finish", and the commitment pins both the seed and the entry list, so any later edit fails verification. The salt comes from chat *after* the commitment is on screen. **Limitation:** the host types the salt, so a host who tries several chat words could choose among outcomes. The UI tells hosts to use the first word posted, and the audit log records it. A drand public randomness beacon would close this gap (see the roadmap). Winners leave the pool if "remove winners" is on, and no-shows always leave. The verify link carries the whole raffle (deflated, base64url) after the `#`, so no server stores anything. 3,000 entries ≈ 10 KB of URL, which is too long for TikTok comments (150 chars) or YouTube live chat (200). For those, the Draw tab shows the length, and hosts can share the **proof file** (`…-proof.json`), which `verify.html` opens directly. Viewers type the commitment prefix they saw on stream into the verify page to confirm the list and seed weren't swapped.

Code: `js/fair.js`. Tests: `tests/run.js`.

## Before going live

- [ ] Pick the name/domain and replace "SpinDraw" (brand text in the HTML files, the overlay watermark, the winner-card PNG in `js/app.js`).
- [ ] Check `privacy.html`: the date is set to 2026-10-20 and the contact line points to kaizenagency.online. Change it if you want a direct email.
- [ ] Apply for AdSense. Then put your `ca-pub-…` ID in `ads.txt` and in the commented script tag in `app.html`, and put `<ins class="adsbygoogle">` units inside the `.ad-slot` boxes in `app.html`, `verify.html` and `scripts/build-pages.mjs` (home), and add the class `live` to each box. They stay hidden until then.
- [ ] Set up a Google-certified CMP (AdSense → Privacy & messaging) for EEA/UK visitors.
- [ ] Test the overlay as a real OBS Browser source on your stream machine (PeerJS path).
- [ ] Deploy: new repo → GitHub Pages → custom domain.

## Roadmap

- Phase 2: commit to a future **drand** beacon round at lock time and mix its randomness into each pick, so the host can't influence the result even through the salt (check drand's HTTP API CORS first); auto-pull YouTube Live chat (Data API key) and Twitch chat (anonymous IRC over WebSocket); slot-machine / card-flip modes; SEO pages per platform ("Facebook Live raffle picker", …); Taglish UI copy.
- Phase 3 (needs a backend): short verify links, accounts, saved raffles, public draw history, a Pro tier (no watermark, brand kits) with Stripe.
