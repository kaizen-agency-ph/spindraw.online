// A small, closable "Suggest an idea" widget in the lower-left corner. It opens the visitor's
// email app with a message to the maker already started. Never shown on the stream overlay.
// The address is assembled here rather than written in the page, to slow down spam scrapers.
const HIDE_KEY = 'spindraw:feedback-hidden';
const HIDE_DAYS = 30;
const address = () => ['benlot.vincentcarl', 'gmail.com'].join('@');

function hiddenForNow() {
  try { const t = Number(localStorage.getItem(HIDE_KEY)); return t && Date.now() - t < HIDE_DAYS * 864e5; } catch { return false; }
}

function mailto() {
  const subject = 'SpinDraw suggestion';
  const body = [
    'Hi Vince,', '',
    'My suggestion for SpinDraw:', '', '',
    'Which game or page it’s about (wheel, Ball Race, Horse Race, Pixel Battle, other):', '', '',
    `(Sent from ${location.pathname})`,
  ].join('\n');
  return `mailto:${address()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function mountFeedback() {
  if (hiddenForNow() || document.querySelector('.fb')) return;
  const el = document.createElement('aside');
  el.className = 'fb';
  el.setAttribute('aria-label', 'Send a suggestion');
  el.innerHTML = `
    <button class="fb-pill" type="button" aria-expanded="false" aria-controls="fbCard">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span>Got an idea?</span>
    </button>
    <div class="fb-card" id="fbCard" hidden>
      <p class="fb-title">Got an idea for a game?</p>
      <p class="fb-text">Suggestions, bugs, new game ideas: email me and I’ll read every one. — Vince</p>
      <div class="fb-actions">
        <a class="btn primary fb-mail" href="#">Email a suggestion</a>
        <button class="btn fb-copy" type="button">Copy address</button>
      </div>
    </div>
    <button class="fb-close" type="button" aria-label="Hide this for 30 days" title="Hide">×</button>`;
  document.body.append(el);
  const pill = el.querySelector('.fb-pill'), card = el.querySelector('.fb-card');
  const open = on => { card.hidden = !on; pill.setAttribute('aria-expanded', String(on)); el.classList.toggle('open', on); };
  pill.addEventListener('click', () => open(card.hidden));
  el.querySelector('.fb-mail').addEventListener('click', e => {
    e.preventDefault();
    if (typeof window.gtag === 'function') window.gtag('event', 'suggestion_click');
    location.href = mailto();
  });
  el.querySelector('.fb-copy').addEventListener('click', async e => {
    try { await navigator.clipboard.writeText(address()); e.target.textContent = 'Copied!'; } catch { e.target.textContent = address(); }
  });
  el.querySelector('.fb-close').addEventListener('click', () => {
    try { localStorage.setItem(HIDE_KEY, String(Date.now())); } catch {}
    el.remove();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !card.hidden) open(false); });
  document.addEventListener('click', e => { if (!card.hidden && !el.contains(e.target)) open(false); });
}
