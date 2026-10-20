// Light/dark toggle. The <head> snippet applies a saved choice before first paint;
// with no saved choice the page follows the system setting.
const KEY = 'spindraw:theme';
const root = document.documentElement;
const media = matchMedia('(prefers-color-scheme: dark)');
const isDark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : media.matches);

const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

function paint() {
  const dark = isDark();
  for (const b of document.querySelectorAll('[data-theme-toggle]')) {
    b.innerHTML = dark ? SUN : MOON;
    b.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    b.setAttribute('aria-label', b.title);
  }
}

document.addEventListener('click', e => {
  if (!e.target.closest('[data-theme-toggle]')) return;
  root.dataset.theme = isDark() ? 'light' : 'dark';
  try { localStorage.setItem(KEY, root.dataset.theme); } catch {}
  paint();
});
media.addEventListener('change', paint);
paint();
