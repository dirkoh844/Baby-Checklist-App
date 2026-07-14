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
