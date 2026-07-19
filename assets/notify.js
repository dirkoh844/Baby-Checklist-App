/* Ask for notification permission the moment the app opens, instead of waiting
   for the user to find the "Enable notifications" button on the Schedule page.

   Chrome/Edge honour a request made without a user gesture. Safari throws and
   Firefox resolves 'default' immediately, so those browsers get one retry on
   the first tap/keypress anywhere in the app — still no button hunt.

   Asked at most once per session: this is a multi-page app, so an unguarded
   request would re-fire on every tab change, and repeated dismissals make
   Chrome auto-block the origin. */
(function () {
  if (!('Notification' in window)) return;          /* iOS Safari outside an installed PWA */
  if (Notification.permission !== 'default') return; /* already granted or denied */

  var KEY = 'notif-asked';
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}

  var EVENTS = ['pointerdown', 'keydown', 'touchend'];
  var armed = false;

  function mark() { try { sessionStorage.setItem(KEY, '1'); } catch (e) {} }
  function announce(p) {
    try { document.dispatchEvent(new CustomEvent('notif-permission', { detail: p })); } catch (e) {}
  }
  function onGesture() { disarm(); ask(); }
  function arm() {
    if (armed || Notification.permission !== 'default') return;
    armed = true;  /* one retry only — never loop the prompt */
    EVENTS.forEach(function (t) { document.addEventListener(t, onGesture, { once: true, capture: true }); });
  }
  function disarm() {
    EVENTS.forEach(function (t) { document.removeEventListener(t, onGesture, { capture: true }); });
  }

  function ask() {
    var t0 = Date.now(), req;
    try { req = Notification.requestPermission(); }
    catch (e) { arm(); return; }                       /* Safari: gesture required */
    if (!req || typeof req.then !== 'function') { announce(Notification.permission); return; }
    req.then(function (p) {
      announce(p);
      if (p !== 'default') { mark(); return; }         /* answered */
      if (Date.now() - t0 < 150) { arm(); return; }    /* too fast for a human: the call was ignored */
      mark();                                          /* prompt was shown and dismissed — leave them alone */
    }).catch(function () { arm(); });
  }

  ask();
})();

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

/* App-wide text size: apply the size chosen on the checklist (Aa button) to
   every page. Same storage key, same zoom levels. */
(function () {
  try {
    var st = JSON.parse(localStorage.getItem('newborn-checklist-v3') || '{}');
    var z = [1, 1.12, 1.25][st.sizeIdx || 0] || 1;
    if (z > 1) document.body.style.zoom = z;
  } catch (e) {}
})();

/* Expand-all / collapse-all: injected on pages with many collapsible topics. */
(function () {
  var topics = document.querySelectorAll('details.topic');
  if (topics.length < 6) return;
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
