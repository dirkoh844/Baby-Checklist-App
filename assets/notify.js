/* Notification permission is requested only from the explicit controls on the
   Reminders page. Browsers increasingly require a user gesture, and an
   unexplained launch-time prompt harms both trust and grant rates. */

/* Print support for <details class="topic"> accordions: open all collapsed
   topics before printing so nothing is hidden on paper, then restore. */
(function () {
  var opened = [];
  window.addEventListener('beforeprint', function () {
    opened = [];
    document.querySelectorAll('details.topic:not([open])').forEach(function (d) {
      d.setAttribute('open', ''); opened.push(d);
    });
  });
  window.addEventListener('afterprint', function () {
    opened.forEach(function (d) { d.removeAttribute('open'); });
    opened = [];
  });
})();

/* App-wide text size marker. Shared CSS can enlarge readable text without
   scaling fixed navigation or creating horizontal overflow. */
(function () {
  try {
    var st = JSON.parse(localStorage.getItem('newborn-checklist-v3') || '{}');
    document.documentElement.dataset.textSize = String(Math.max(0, Math.min(2, st.sizeIdx || 0)));
  } catch (e) {}
})();

/* Expand-all / collapse-all: injected on pages with many collapsible topics. */
(function () {
  var topics = document.querySelectorAll('details.topic');
  if (topics.length < 6 || document.body.dataset.page === 'emergency') return;
  var wrap = document.querySelector('body > .w-full');
  if (!wrap) return;
  var bar = document.createElement('div');
  bar.id = 'topicTools';
  bar.className = 'flex justify-end gap-1.5 mt-3 -mb-1';
  bar.innerHTML =
    '<button type="button" data-x="open" class="btn btn-xs btn-ghost rounded-full font-bold ink-soft border border-base-300">Expand all</button>' +
    '<button type="button" data-x="close" class="btn btn-xs btn-ghost rounded-full font-bold ink-soft border border-base-300">Collapse all</button>';
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var open = b.dataset.x === 'open';
    document.querySelectorAll('details.topic').forEach(function (d) { d.open = open; });
  });
  wrap.insertBefore(bar, wrap.firstElementChild);
})();


/* Page-transition fallback: browsers without cross-document view transitions
   (Firefox, older Safari) get a quick fade-out on tap and a fade-in on
   arrival, so page changes are animated everywhere. Native VT browsers and
   reduced-motion users are untouched. */
(function () {
  if (typeof CSSViewTransitionRule !== 'undefined') return; /* native support */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.body.classList.add('novt');
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href]');
    if (!a || a.target || a.hasAttribute('download')) return;
    var url; try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return; /* same-page anchor */
    e.preventDefault();
    document.body.classList.add('novt-out');
    setTimeout(function () { location.href = a.href; }, 130);
  }, true);
  /* restore when coming back via the back/forward cache */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) document.body.classList.remove('novt-out');
  });
})();
