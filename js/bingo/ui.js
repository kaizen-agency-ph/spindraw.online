// Small bingo card view shared by the host's card check and the verify page.
export function renderMiniCard(box, card, set) {
  box.innerHTML = '';
  box.dataset.type = card.type;
  if (card.type === 75) for (let c = 0; c < 5; c++) { const h = document.createElement('span'); h.className = 'mc-head'; h.textContent = 'BINGO'[c]; box.append(h); }
  card.rows.flat().forEach(v => {
    const s = document.createElement('span');
    const free = v === 0 && card.type === 75;
    s.className = 'mc-cell' + (v === 0 && !free ? ' blank' : '') + (free || set.has(v) ? ' on' : '');
    s.textContent = free ? '★' : v || '';
    box.append(s);
  });
}
