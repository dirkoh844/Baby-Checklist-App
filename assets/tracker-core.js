/* Baby List tracker calculations. Kept separate so time-window math is testable. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.BabyListTracker = api;
})(typeof globalThis !== 'undefined' ? globalThis : self, function () {
  'use strict';

  const DAY = 864e5;
  /* An "open" sleep (no end logged) is clamped to at most this long. Without a
     cap, a forgotten "sleep end" would count a full 24h toward every calendar
     day between its start and now. 14h is far beyond any real newborn stretch,
     so a genuine ongoing sleep is unaffected but a forgotten one can't run away. */
  const MAX_OPEN_SLEEP = 14 * 3600e3;

  function number(v, fallback) {
    const n = Number(v);
    return Number.isFinite(n) ? n : (fallback || 0);
  }

  function overlapMs(entry, start, end, now) {
    if (!entry || entry.t !== 'sleep') return 0;
    const a = number(entry.at);
    const current = number(now, Date.now());
    const b = entry.e == null ? Math.min(current, a + MAX_OPEN_SLEEP) : number(entry.e);
    if (!a || b <= a) return 0;
    return Math.max(0, Math.min(b, end) - Math.max(a, start));
  }

  function sleepInWindow(log, start, end, now) {
    return (Array.isArray(log) ? log : []).reduce(function (sum, entry) {
      return sum + overlapMs(entry, start, end, now);
    }, 0);
  }

  function localMidnight(ms) {
    const d = new Date(ms);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  function dayStarts(count, now) {
    const out = [];
    const today = new Date(now || Date.now());
    today.setHours(0, 0, 0, 0);
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      out.push(d.getTime());
    }
    return out;
  }

  function dailySleep(log, count, now) {
    const current = now || Date.now();
    const starts = dayStarts(count || 7, current);
    return starts.map(function (start, index) {
      const end = index + 1 < starts.length ? starts[index + 1] : new Date(start).setDate(new Date(start).getDate() + 1);
      return sleepInWindow(log, start, Math.min(end, current), current);
    });
  }

  function trackedDayCount(log, windowStart, now) {
    const current = now || Date.now();
    const entries = (Array.isArray(log) ? log : []).filter(function (e) {
      return e && number(e.at) <= current && number(e.at) >= windowStart;
    });
    if (!entries.length) return 1;
    const first = Math.max(windowStart, Math.min.apply(null, entries.map(function (e) { return number(e.at); })));
    const start = localMidnight(first);
    const finish = localMidnight(current);
    let days = 1;
    const cursor = new Date(start);
    while (cursor.getTime() < finish && days < 8) {
      cursor.setDate(cursor.getDate() + 1);
      days++;
    }
    return Math.max(1, Math.min(7, days));
  }

  return { DAY, overlapMs, sleepInWindow, dayStarts, dailySleep, trackedDayCount };
});
