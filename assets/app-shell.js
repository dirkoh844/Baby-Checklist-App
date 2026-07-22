/* Shared navigation and accessibility shell. */
(function () {
  'use strict';
  const KEY = 'newborn-checklist-v3';
  const icons = {
    checklist: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" stroke-width="1.8"/><path d="M8 12l2.5 2.5L16 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    labor: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.4A4 4 0 0119 10c0 5.6-7 10-7 10z" stroke="currentColor" stroke-width="1.8"/><path d="M8 12h2l1-2 1.5 4 1-2H16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    plan: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="6" y="5" width="12" height="15" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M9 5V3h6v2M9 10h6M9 14h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10.3 4L2.8 17.5a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 4a2 2 0 00-3.4 0z" stroke="currentColor" stroke-width="1.8"/><path d="M12 9v4.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="16.7" r="1.1" fill="currentColor"/></svg>',
    guide: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20v-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M12 14c0-4-2.8-6.3-7-6.3 0 4 2.8 6.3 7 6.3zM12 12c0-3.2 2.4-5.1 5.8-5.1 0 3.2-2.4 5.1-5.8 5.1z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    reminders: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.5 10.5a5.5 5.5 0 0111 0c0 4.5 2 5.5 2 5.5h-15s2-1 2-5.5z" stroke="currentColor" stroke-width="1.8"/><path d="M10 19a2.2 2.2 0 004 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    tracker: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 18V9M10 18V5M15 18v-7M20 18V7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3 19.5h18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="6" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="18" cy="12" r="1.5" fill="currentColor"/></svg>'
  };
  function state() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (_) { return {}; }
  }
  function stage(s) {
    if (s.navStage === 'pregnancy' || s.navStage === 'baby') return s.navStage;
    const born = Date.parse(s.born || '');
    return Number.isFinite(born) && born <= Date.now() ? 'baby' : 'pregnancy';
  }
  function currentPath() {
    const name = location.pathname.split('/').pop() || 'index.html';
    return name === '' ? 'index.html' : name;
  }
  function item(href, label, icon, color, current) {
    const a = document.createElement('a');
    a.href = './' + href;
    a.className = 'nt';
    a.style.setProperty('--tab-a', 'var(--color-' + color + ')');
    if (current === href) a.setAttribute('aria-current', 'page');
    const pill = document.createElement('span'); pill.className = 'np'; pill.innerHTML = icons[icon];
    const text = document.createElement('span'); text.className = 'nav-label'; text.textContent = label;
    a.append(pill, text);
    return a;
  }
  function rebuildNav() {
    const nav = document.getElementById('tabNav'); if (!nav) return;
    const s = state(), mode = stage(s), current = currentPath();
    document.body.dataset.page = current.replace(/\.html$/, '');
    const prenatal = [
      ['index.html', 'Checklist', 'checklist', 'primary'],
      ['labor.html', 'Labor', 'labor', 'error'],
      ['birthplan.html', 'Birth plan', 'plan', 'secondary'],
      ['reminders.html', 'Reminders', 'reminders', 'warning'],
      ['settings.html', 'More', 'more', 'info']
    ];
    const postpartum = [
      ['tracker.html', 'Tracker', 'tracker', 'primary'],
      ['emergency.html', 'Warning', 'warning', 'error'],
      ['upbringing.html', 'Guides', 'guide', 'success'],
      ['reminders.html', 'Reminders', 'reminders', 'warning'],
      ['settings.html', 'More', 'more', 'info']
    ];
    const links = mode === 'baby' ? postpartum : prenatal;
    const active = links.some(x => x[0] === current) ? current : 'settings.html';
    const grid = document.createElement('div'); grid.className = 'app-nav-grid';
    links.forEach(x => grid.append(item(x[0], x[1], x[2], x[3], active)));
    nav.replaceChildren(grid);
    nav.dataset.stage = mode;
  }
  function revealSafetyShortcut() {
    const b = document.getElementById('sosBtn');
    if (!b) return;
    b.classList.remove('hidden');
    b.setAttribute('aria-label', 'Open urgent warning signs');
    b.title = 'Urgent warning signs';
  }
  function applyTextSize() {
    const n = Math.max(0, Math.min(2, Number(state().sizeIdx) || 0));
    document.documentElement.dataset.textSize = String(n);
  }
  function setSyncStatus(detail) {
    const dot = document.getElementById('syncDot'); if (!dot) return;
    let label = document.getElementById('syncLabel');
    if (!label) {
      label = document.createElement('span'); label.id = 'syncLabel'; label.className = 'sync-label';
      dot.insertAdjacentElement('afterend', label);
    }
    const d = detail || {};
    dot.classList.remove('hidden', 'bg-success', 'bg-warning', 'bg-error');
    if (d.state === 'hidden') { dot.classList.add('hidden'); label.hidden = true; return; }
    label.hidden = false;
    if (d.state === 'synced') { dot.classList.add('bg-success'); label.textContent = d.label || 'Synced'; }
    else if (d.state === 'pending') { dot.classList.add('bg-warning'); label.textContent = d.label || 'Sync pending'; }
    else { dot.classList.add('bg-error'); label.textContent = d.label || 'Offline'; }
    const full = d.title || label.textContent;
    dot.title = full; dot.setAttribute('aria-label', full); label.title = full;
  }
  window.BabyListUI = { rebuildNav, setSyncStatus, stage: () => stage(state()) };
  window.addEventListener('babylist-sync-status', e => setSyncStatus(e.detail));
  rebuildNav(); revealSafetyShortcut(); applyTextSize();
})();
