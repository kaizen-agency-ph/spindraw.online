// Small bingo card view shared by the host's card check and the verify page.
// pattern: optional list of [row, col] squares to outline (custom patterns).
export function renderMiniCard(box, card, set, pattern = null) {
  box.innerHTML = '';
  box.dataset.type = card.type;
  if (card.type === 75) for (let c = 0; c < 5; c++) { const h = document.createElement('span'); h.className = 'mc-head'; h.textContent = 'BINGO'[c]; box.append(h); }
  const inPat = new Set((pattern ?? []).map(([r, c]) => r * 5 + c));
  card.rows.flat().forEach((v, i) => {
    const s = document.createElement('span');
    const free = v === 0 && card.type === 75;
    s.className = 'mc-cell' + (v === 0 && !free ? ' blank' : '') + (free || set.has(v) ? ' on' : '') + (inPat.has(i) ? ' pat' : '');
    s.textContent = free ? '★' : v || '';
    box.append(s);
  });
}
