/* Baby List state core — schema validation, conflict-safe merge, and tombstones.
   Kept dependency-free so every static page and the test suite can use it. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.BabyListState = api;
})(typeof globalThis !== 'undefined' ? globalThis : self, function () {
  'use strict';

  const SCHEMA = 4;
  const MAX_DOC_BYTES = 512 * 1024;
  const MAX_STRING = 2000;
  const MAX_TOMBSTONE_AGE = 365 * 864e5;
  const SHARED_SCALARS = ['due', 'born', 'card'];
  const LOCAL_ONLY = new Set([
    'cloud', 'sync', 'who', 'dark', 'themeV', 'sizeIdx', 'collapsed',
    'hidePacked', 'hideNotes', 'sort', 'tier', 'phase', 'importedShare',
    'navStage', 'loggingComplete'
  ]);

  function isObject(v) { return !!v && typeof v === 'object' && !Array.isArray(v); }
  function iso(ms) { return new Date(ms || Date.now()).toISOString(); }
  function time(v, fallback) {
    const n = typeof v === 'number' ? v : Date.parse(v || '');
    return Number.isFinite(n) && n > 0 ? n : (fallback || 0);
  }
  function copy(v) {
    if (v == null) return v;
    return JSON.parse(JSON.stringify(v));
  }
  function safeKey(k) {
    return typeof k === 'string' && k.length > 0 && k.length <= 180 &&
      k !== '__proto__' && k !== 'prototype' && k !== 'constructor';
  }
  function scrub(value, depth) {
    if (depth > 7 || value == null) return value == null ? value : null;
    if (typeof value === 'string') return value.slice(0, MAX_STRING);
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    if (typeof value === 'boolean') return value;
    if (Array.isArray(value)) return value.slice(0, 10000).map(v => scrub(v, depth + 1));
    if (!isObject(value)) return null;
    const out = {};
    Object.keys(value).slice(0, 2000).forEach(k => {
      if (safeKey(k)) out[k] = scrub(value[k], depth + 1);
    });
    return out;
  }
  function limitedMap(v, max, valueFn) {
    const out = {};
    if (!isObject(v)) return out;
    Object.keys(v).slice(0, max).forEach(k => {
      if (!safeKey(k)) return;
      const next = valueFn(v[k], k);
      if (next !== undefined) out[k] = next;
    });
    return out;
  }
  function normalizeMeta(v) {
    const m = isObject(v) ? scrub(v, 0) : {};
    m.schema = SCHEMA;
    m.fields = limitedMap(m.fields, 100, x => time(x));
    m.entities = isObject(m.entities) ? m.entities : {};
    m.deleted = isObject(m.deleted) ? m.deleted : {};
    ['checked', 'notes', 'custom', 'log'].forEach(kind => {
      m.entities[kind] = limitedMap(m.entities[kind], 12000, x => time(x));
      m.deleted[kind] = limitedMap(m.deleted[kind], 12000, x => time(x));
    });
    return m;
  }
  function normalizeLogEntry(e) {
    if (!isObject(e) || !safeKey(String(e.i || ''))) return undefined;
    const out = scrub(e, 0);
    out.i = String(out.i).slice(0, 180);
    out.t = String(out.t || '').slice(0, 24);
    out.at = time(out.at);
    out.u = time(out.u, out.at);
    if (!out.at || !['feed', 'pump', 'diaper', 'sleep'].includes(out.t)) return undefined;
    if (typeof out.by === 'string') out.by = out.by.slice(0, 80);
    return out;
  }
  function normalizeCustomItem(item, cat) {
    if (!isObject(item)) return undefined;
    const out = scrub(item, 0);
    if (!safeKey(String(out._id || ''))) return undefined;
    out._id = String(out._id).slice(0, 180);
    out.n = String(out.n || '').trim().slice(0, 140);
    if (!out.n) return undefined;
    out.q = String(out.q || '1').slice(0, 24);
    out.note = String(out.note || '').slice(0, 500);
    out.lo = Math.max(0, Number(out.lo) || 0);
    out.hi = Math.max(out.lo, Number(out.hi) || 0);
    out._custom = true;
    out._cat = String(cat || '').slice(0, 80);
    out.u = time(out.u);
    return out;
  }
  function sanitizeState(raw) {
    if (!isObject(raw)) return {};
    let encoded;
    try { encoded = JSON.stringify(raw); } catch (_) { throw new Error('State is not serializable'); }
    if (encoded.length > MAX_DOC_BYTES) throw new Error('State exceeds 512 KiB');
    const s = scrub(raw, 0);
    s.checked = limitedMap(s.checked, 3000, v => {
      if (v === true) return { at: 0, by: '' };
      if (!isObject(v)) return undefined;
      return { at: time(v.at), by: String(v.by || '').slice(0, 80) };
    });
    s.notes = limitedMap(s.notes, 3000, v => typeof v === 'string' ? v.slice(0, 500) : undefined);
    const custom = {};
    if (isObject(s.custom)) Object.keys(s.custom).slice(0, 80).forEach(cat => {
      if (!safeKey(cat) || !Array.isArray(s.custom[cat])) return;
      custom[cat] = s.custom[cat].slice(0, 600).map(x => normalizeCustomItem(x, cat)).filter(Boolean);
    });
    s.custom = custom;
    s.log = Array.isArray(s.log) ? s.log.slice(-10000).map(normalizeLogEntry).filter(Boolean) : [];
    if (typeof s.due !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s.due)) s.due = null;
    if (typeof s.born !== 'string' || !Number.isFinite(Date.parse(s.born))) s.born = null;
    s.card = limitedMap(s.card, 30, v => typeof v === 'string' ? v.slice(0, 300) : undefined);
    s._sync = normalizeMeta(s._sync);
    s.savedAt = Number.isFinite(Date.parse(s.savedAt || '')) ? s.savedAt : iso();
    return s;
  }

  function flattenCustom(custom) {
    const out = {};
    Object.keys(custom || {}).forEach(cat => (custom[cat] || []).forEach(item => {
      if (item && item._id) out[item._id] = Object.assign({}, item, { _cat: cat });
    }));
    return out;
  }
  function flattenLog(log) {
    const out = {};
    (log || []).forEach(e => { if (e && e.i) out[e.i] = e; });
    return out;
  }
  function same(a, b) {
    try { return JSON.stringify(a) === JSON.stringify(b); } catch (_) { return false; }
  }
  function stampMap(nextMap, prevMap, meta, kind, now) {
    const n = nextMap || {}, p = prevMap || {};
    const keys = new Set(Object.keys(n).concat(Object.keys(p)));
    keys.forEach(k => {
      if (!(k in n)) {
        meta.deleted[kind][k] = now;
        delete meta.entities[kind][k];
      } else if (!(k in p) || !same(n[k], p[k])) {
        meta.entities[kind][k] = now;
        delete meta.deleted[kind][k];
      }
    });
  }
  function stamp(nextRaw, prevRaw, at) {
    const now = at || Date.now();
    const next = sanitizeState(nextRaw || {});
    const prev = sanitizeState(prevRaw || {});
    const inherited = normalizeMeta(next._sync || prev._sync);
    next._sync = inherited;
    SHARED_SCALARS.forEach(k => {
      if (!same(next[k], prev[k])) inherited.fields[k] = now;
    });
    stampMap(next.checked, prev.checked, inherited, 'checked', now);
    stampMap(next.notes, prev.notes, inherited, 'notes', now);
    stampMap(flattenCustom(next.custom), flattenCustom(prev.custom), inherited, 'custom', now);
    stampMap(flattenLog(next.log), flattenLog(prev.log), inherited, 'log', now);
    Object.keys(inherited.deleted).forEach(kind => {
      Object.keys(inherited.deleted[kind]).forEach(k => {
        if (now - inherited.deleted[kind][k] > MAX_TOMBSTONE_AGE) delete inherited.deleted[kind][k];
      });
    });
    next.savedAt = iso(now);
    return next;
  }

  function mergeMeta(a, b) {
    const out = normalizeMeta(a);
    const right = normalizeMeta(b);
    Object.keys(right.fields).forEach(k => { out.fields[k] = Math.max(out.fields[k] || 0, right.fields[k] || 0); });
    ['checked', 'notes', 'custom', 'log'].forEach(kind => {
      Object.keys(right.entities[kind]).forEach(k => { out.entities[kind][k] = Math.max(out.entities[kind][k] || 0, right.entities[kind][k] || 0); });
      Object.keys(right.deleted[kind]).forEach(k => { out.deleted[kind][k] = Math.max(out.deleted[kind][k] || 0, right.deleted[kind][k] || 0); });
    });
    return out;
  }
  function mergeMap(localMap, remoteMap, lm, rm, kind, localFallback, remoteFallback) {
    const out = {};
    const keys = new Set(Object.keys(localMap || {}).concat(Object.keys(remoteMap || {}), Object.keys(lm.deleted[kind]), Object.keys(rm.deleted[kind])));
    keys.forEach(k => {
      const valueTime = (map, meta, fallback) => {
        if (!(k in (map || {}))) return 0;
        const v = map[k];
        const own = Math.max(meta.entities[kind][k] || 0,
          kind === 'checked' ? time(v && v.at) : 0,
          kind === 'custom' || kind === 'log' ? time(v && v.u, time(v && v.at)) : 0);
        return own || fallback;
      };
      const lLive = valueTime(localMap, lm, localFallback);
      const rLive = valueTime(remoteMap, rm, remoteFallback);
      const deleted = Math.max(lm.deleted[kind][k] || 0, rm.deleted[kind][k] || 0);
      const live = Math.max(lLive, rLive);
      if (deleted >= live && deleted > 0) return;
      if (rLive > lLive) out[k] = copy(remoteMap[k]);
      else if (k in (localMap || {})) out[k] = copy(localMap[k]);
      else if (k in (remoteMap || {})) out[k] = copy(remoteMap[k]);
    });
    return out;
  }
  function mergeStates(localRaw, remoteRaw) {
    const local = sanitizeState(localRaw || {});
    const remote = sanitizeState(remoteRaw || {});
    const out = copy(local);
    const lm = normalizeMeta(local._sync), rm = normalizeMeta(remote._sync);
    const lf = time(local.savedAt), rf = time(remote.savedAt);
    SHARED_SCALARS.forEach(k => {
      const lt = lm.fields[k] || lf, rt = rm.fields[k] || rf;
      if (rt > lt) out[k] = copy(remote[k]);
    });
    out.checked = mergeMap(local.checked, remote.checked, lm, rm, 'checked', lf, rf);
    out.notes = mergeMap(local.notes, remote.notes, lm, rm, 'notes', lf, rf);
    const customFlat = mergeMap(flattenCustom(local.custom), flattenCustom(remote.custom), lm, rm, 'custom', lf, rf);
    out.custom = {};
    Object.keys(customFlat).forEach(id => {
      const item = customFlat[id], cat = item._cat || 'other';
      delete item._cat;
      (out.custom[cat] || (out.custom[cat] = [])).push(item);
    });
    Object.keys(out.custom).forEach(cat => out.custom[cat].sort((a, b) => String(a._id).localeCompare(String(b._id))));
    const logs = mergeMap(flattenLog(local.log), flattenLog(remote.log), lm, rm, 'log', lf, rf);
    out.log = Object.keys(logs).map(k => logs[k]).sort((a, b) => (a.at || 0) - (b.at || 0));
    out._sync = mergeMeta(lm, rm);
    out.savedAt = iso(Math.max(lf, rf, Date.now()));
    LOCAL_ONLY.forEach(k => { if (k in local) out[k] = copy(local[k]); });
    return sanitizeState(out);
  }

  function toRemote(raw) {
    const s = sanitizeState(raw || {});
    return {
      checked: copy(s.checked), custom: copy(s.custom), notes: copy(s.notes),
      due: s.due, born: s.born, card: copy(s.card), log: copy(s.log),
      _sync: copy(s._sync), savedAt: s.savedAt
    };
  }
  function forBackup(raw) {
    const s = sanitizeState(raw || {});
    delete s.cloud;
    delete s.sync;
    delete s.importedShare;
    return s;
  }
  function validateDocument(doc) {
    if (!isObject(doc) || doc.app !== 'newborn-checklist' || !isObject(doc.state)) throw new Error('Not a Baby List document');
    const text = JSON.stringify(doc);
    if (text.length > MAX_DOC_BYTES) throw new Error('Document exceeds 512 KiB');
    return {
      app: 'newborn-checklist', version: Number(doc.version) || 3,
      revision: Math.max(0, Number(doc.revision) || 0),
      savedAt: Number.isFinite(Date.parse(doc.savedAt || '')) ? doc.savedAt : iso(),
      state: sanitizeState(doc.state)
    };
  }

  return {
    SCHEMA, MAX_DOC_BYTES, sanitizeState, validateDocument, stamp,
    mergeStates, toRemote, forBackup, copy, time
  };
});
