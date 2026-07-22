/* Shared navigation and accessibility shell. */
(function () {
  'use strict';
  const KEY = 'newborn-checklist-v3';
  const raf = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : (fn) => setTimeout(fn, 16);
  const icons = {
    checklist: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" stroke-width="1.8"/><path d="M8 12l2.5 2.5L16 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    labor: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.4A4 4 0 0119 10c0 5.6-7 10-7 10z" stroke="currentColor" stroke-width="1.8"/><path d="M8 12h2l1-2 1.5 4 1-2H16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    plan: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="6" y="5" width="12" height="15" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M9 5V3h6v2M9 10h6M9 14h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10.3 4L2.8 17.5a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 4a2 2 0 00-3.4 0z" stroke="currentColor" stroke-width="1.8"/><path d="M12 9v4.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="16.7" r="1.1" fill="currentColor"/></svg>',
    guide: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20v-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M12 14c0-4-2.8-6.3-7-6.3 0 4 2.8 6.3 7 6.3zM12 12c0-3.2 2.4-5.1 5.8-5.1 0 3.2-2.4 5.1-5.8 5.1z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    reminders: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.5 10.5a5.5 5.5 0 0111 0c0 4.5 2 5.5 2 5.5h-15s2-1 2-5.5z" stroke="currentColor" stroke-width="1.8"/><path d="M10 19a2.2 2.2 0 004 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    tracker: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 18V9M10 18V5M15 18v-7M20 18V7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3 19.5h18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.8"/><path d="M12 4.6v2M12 17.4v2M4.6 12h2M17.4 12h2M6.7 6.7l1.4 1.4M15.9 15.9l1.4 1.4M17.3 6.7l-1.4 1.4M8.1 15.9l-1.4 1.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    sources: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 4h9a2 2 0 012 2v13H8a2 2 0 00-2 2z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M17 17H8a2 2 0 00-2 2M9.5 8h5M9.5 11h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="6" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="18" cy="12" r="1.5" fill="currentColor"/></svg>'
  };
  // Every destination, with the label/icon/color used in the More menu.
  const ALL = {
    'index.html': ['Checklist', 'checklist', 'primary'],
    'labor.html': ['Labor', 'labor', 'error'],
    'birthplan.html': ['Birth plan', 'plan', 'secondary'],
    'tracker.html': ['Tracker', 'tracker', 'primary'],
    'emergency.html': ['Warning signs', 'warning', 'error'],
    'upbringing.html': ['Guides', 'guide', 'success'],
    'reminders.html': ['Reminders', 'reminders', 'warning'],
    'settings.html': ['Settings', 'settings', 'info'],
    'sources.html': ['Sources', 'sources', 'accent']
  };
  const prenatal = [
    ['index.html', 'Checklist', 'checklist', 'primary'],
    ['labor.html', 'Labor', 'labor', 'error'],
    ['birthplan.html', 'Birth plan', 'plan', 'secondary'],
    ['reminders.html', 'Reminders', 'reminders', 'warning']
  ];
  const postpartum = [
    ['tracker.html', 'Tracker', 'tracker', 'primary'],
    ['emergency.html', 'Warning', 'warning', 'error'],
    ['upbringing.html', 'Guides', 'guide', 'success'],
    ['reminders.html', 'Reminders', 'reminders', 'warning']
  ];

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
  function tab(href, label, icon, color, current) {
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
  function moreButton(isCurrent) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'nt';
    b.id = 'moreTab';
    b.style.setProperty('--tab-a', 'var(--color-info)');
    b.setAttribute('aria-haspopup', 'dialog');
    b.setAttribute('aria-expanded', 'false');
    b.setAttribute('aria-controls', 'moreSheet');
    b.setAttribute('aria-label', 'More pages');
    if (isCurrent) b.setAttribute('aria-current', 'page');
    const pill = document.createElement('span'); pill.className = 'np'; pill.innerHTML = icons.more;
    const text = document.createElement('span'); text.className = 'nav-label'; text.textContent = 'More';
    b.append(pill, text);
    return b;
  }

  /* One shared teardown so no path (rebuild while open, bfcache restore,
     Escape, scrim) can strand the page inert or the sheet open. */
  let sheetTeardown = null;
  function clearModalState() {
    if (sheetTeardown) { try { sheetTeardown(); } catch (_) {} sheetTeardown = null; }
    [document.querySelector('body > .w-full'), document.getElementById('tabNav'), document.querySelector('header.navbar')]
      .forEach(n => n && n.removeAttribute('inert'));
    const sheet = document.getElementById('moreSheet');
    if (sheet) { sheet.classList.remove('open'); sheet.hidden = true; }
    const btn = document.getElementById('moreTab');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
  window.addEventListener('pageshow', e => { if (e.persisted) clearModalState(); });

  function buildSheet(moreBtn, hrefs, current) {
    clearModalState();
    const old = document.getElementById('moreSheet');
    if (old) old.remove();
    const sheet = document.createElement('div');
    sheet.id = 'moreSheet'; sheet.className = 'more-sheet'; sheet.hidden = true;
    const scrim = document.createElement('div'); scrim.className = 'more-scrim';
    const panel = document.createElement('div');
    panel.className = 'more-panel';
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-label', 'More pages');
    const grip = document.createElement('div'); grip.className = 'more-grip';
    const title = document.createElement('p'); title.className = 'more-title'; title.textContent = 'More';
    const grid = document.createElement('div'); grid.className = 'more-grid';
    hrefs.forEach(h => {
      const meta = ALL[h]; if (!meta) return;
      const a = document.createElement('a');
      a.href = './' + h; a.className = 'more-link';
      a.style.setProperty('--tab-a', 'var(--color-' + meta[2] + ')');
      if (h === current) a.setAttribute('aria-current', 'page');
      const ic = document.createElement('span'); ic.className = 'more-ic'; ic.innerHTML = icons[meta[1]];
      const tx = document.createElement('span'); tx.className = 'more-tx'; tx.textContent = meta[0];
      a.append(ic, tx); grid.append(a);
    });
    panel.append(grip, title, grid);
    sheet.append(scrim, panel);
    document.body.append(sheet);

    const links = [...grid.querySelectorAll('.more-link')];
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(true); return; }
      if (e.key === 'Tab' && links.length) {              // simple focus trap
        const first = links[0], last = links[links.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    const bg = () => [document.querySelector('body > .w-full'), document.getElementById('tabNav'), document.querySelector('header.navbar')];
    function open() {
      sheet.hidden = false;
      raf(() => sheet.classList.add('open'));
      moreBtn.setAttribute('aria-expanded', 'true');
      bg().forEach(n => n && n.setAttribute('inert', ''));   // make the rest a real modal backdrop
      document.addEventListener('keydown', onKey);
      sheetTeardown = () => { bg().forEach(n => n && n.removeAttribute('inert')); document.removeEventListener('keydown', onKey); };
      if (links[0]) links[0].focus();
    }
    function close(focusBtn) {
      sheet.classList.remove('open');
      moreBtn.setAttribute('aria-expanded', 'false');
      bg().forEach(n => n && n.removeAttribute('inert'));
      document.removeEventListener('keydown', onKey);
      sheetTeardown = null;
      setTimeout(() => { if (!sheet.classList.contains('open')) sheet.hidden = true; }, 280);
      if (focusBtn) moreBtn.focus();
    }
    moreBtn.addEventListener('click', e => { e.preventDefault(); if (sheet.hidden) open(); else close(true); });
    scrim.addEventListener('click', () => close(true));
  }

  function rebuildNav() {
    const nav = document.getElementById('tabNav'); if (!nav) return;
    const s = state(), mode = stage(s), current = currentPath();
    document.body.dataset.page = current.replace(/\.html$/, '');
    const bar = mode === 'baby' ? postpartum : prenatal;
    const barHrefs = bar.map(x => x[0]);
    const onBar = barHrefs.indexOf(current) !== -1;
    const grid = document.createElement('div'); grid.className = 'app-nav-grid';
    bar.forEach(x => grid.append(tab(x[0], x[1], x[2], x[3], onBar ? current : null)));
    const moreBtn = moreButton(!onBar);
    grid.append(moreBtn);
    nav.replaceChildren(grid);
    nav.dataset.stage = mode;
    const offBar = Object.keys(ALL).filter(h => barHrefs.indexOf(h) === -1);
    buildSheet(moreBtn, offBar, current);
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
