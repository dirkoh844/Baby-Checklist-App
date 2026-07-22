/* Baby List sync client — revisioned writes against the v3 Durable Object API. */
(function (root, factory) {
  const api = factory(root.BabyListState);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.BabyListSync = api;
})(typeof globalThis !== 'undefined' ? globalThis : self, function (State) {
  'use strict';

  class SyncError extends Error {
    constructor(message, status, code) { super(message); this.name = 'SyncError'; this.status = status || 0; this.code = code || 'sync_error'; }
  }
  function assertCore() { if (!State) throw new SyncError('State core is not loaded', 0, 'missing_state_core'); }
  function baseUrl(cfg) {
    const raw = cfg && typeof cfg.u === 'string' ? cfg.u.trim() : '';
    if (!/^https:\/\//i.test(raw)) throw new SyncError('Sync endpoint must use HTTPS', 0, 'invalid_endpoint');
    if (raw.length > 500) throw new SyncError('Sync endpoint is too long', 0, 'invalid_endpoint');
    let parsed;
    try { parsed = new URL(raw); } catch (_) { throw new SyncError('Sync endpoint is invalid', 0, 'invalid_endpoint'); }
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash)
      throw new SyncError('Sync endpoint must be a plain HTTPS URL without credentials or query data', 0, 'invalid_endpoint');
    return (parsed.origin + parsed.pathname).replace(/\/+$/, '');
  }
  function url(cfg, path) { return baseUrl(cfg) + (path || ''); }
  function headers(cfg, extra) {
    const out = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
    if (cfg && cfg.k) out.Authorization = 'Bearer ' + cfg.k;
    return Object.assign(out, extra || {});
  }
  async function bodyJson(res) {
    const text = await res.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch (_) { throw new SyncError('Sync server returned invalid JSON', res.status, 'invalid_response'); }
  }
  function assertApi(res) {
    const version = res.headers.get('X-BabyList-API');
    if (version !== '3') throw new SyncError('Endpoint is not the Baby List v3 sync worker', res.status, 'unsupported_endpoint');
  }
  async function read(cfg) {
    assertCore();
    let res;
    try { res = await fetch(url(cfg, '/state'), { method: 'GET', headers: headers(cfg), cache: 'no-store', credentials: 'omit' }); }
    catch (_) { throw new SyncError('Sync endpoint is unreachable', 0, 'unreachable'); }
    assertApi(res);
    if (res.status === 404 || res.status === 204) return { doc: null, revision: 0 };
    if (!res.ok) {
      const err = await bodyJson(res).catch(() => null);
      throw new SyncError((err && err.error) || 'Sync read failed', res.status, (err && err.code) || 'read_failed');
    }
    const raw = await bodyJson(res);
    if (!raw) return { doc: null, revision: 0 };
    const doc = State.validateDocument(raw);
    const etag = (res.headers.get('ETag') || '').replace(/[^0-9]/g, '');
    return { doc, revision: Number(etag || doc.revision || 0) };
  }
  async function write(cfg, state, revision) {
    assertCore();
    const doc = {
      app: 'newborn-checklist', version: 3,
      savedAt: state.savedAt || new Date().toISOString(),
      state: State.toRemote(state)
    };
    let res;
    try {
      res = await fetch(url(cfg, '/state'), {
        method: 'PUT', headers: headers(cfg, { 'If-Match': '"' + Math.max(0, Number(revision) || 0) + '"' }),
        body: JSON.stringify(doc), cache: 'no-store', credentials: 'omit'
      });
    } catch (_) { throw new SyncError('Sync endpoint is unreachable', 0, 'unreachable'); }
    assertApi(res);
    if (res.status === 409) {
      const conflict = await bodyJson(res);
      return { ok: false, conflict: conflict && conflict.current ? State.validateDocument(conflict.current) : null, revision: Number(conflict && conflict.revision) || 0 };
    }
    if (!res.ok) {
      const err = await bodyJson(res).catch(() => null);
      throw new SyncError((err && err.error) || 'Sync write failed', res.status, (err && err.code) || 'write_failed');
    }
    const result = await bodyJson(res);
    return { ok: true, revision: Number(result && result.revision) || revision + 1 };
  }
  async function syncState(cfg, localRaw) {
    assertCore();
    let local = State.sanitizeState(localRaw || {});
    for (let attempt = 0; attempt < 4; attempt++) {
      const current = await read(cfg);
      if (current.doc) local = State.mergeStates(local, current.doc.state);
      const result = await write(cfg, local, current.revision);
      if (result.ok) return { state: local, revision: result.revision, savedAt: local.savedAt };
      if (result.conflict) local = State.mergeStates(local, result.conflict.state);
    }
    throw new SyncError('The shared list changed repeatedly; your local copy is safe and will retry', 409, 'conflict_retry_exhausted');
  }
  async function pullState(cfg, localRaw) {
    const current = await read(cfg);
    const local = State.sanitizeState(localRaw || {});
    return { state: current.doc ? State.mergeStates(local, current.doc.state) : local, revision: current.revision, changed: !!current.doc };
  }
  async function pushMutation(cfg, operation) {
    let res;
    try {
      res = await fetch(url(cfg, '/push/subscription'), {
        method: 'POST', headers: headers(cfg), body: JSON.stringify(operation),
        cache: 'no-store', credentials: 'omit'
      });
    } catch (_) { throw new SyncError('Sync endpoint is unreachable', 0, 'unreachable'); }
    assertApi(res);
    if (!res.ok) {
      const err = await bodyJson(res).catch(() => null);
      throw new SyncError((err && err.error) || 'Push subscription update failed', res.status, (err && err.code) || 'push_update_failed');
    }
    return bodyJson(res);
  }
  function clearPrivateCaches() {
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_PRIVATE_DATA' });
      if (typeof caches !== 'undefined') caches.keys().then(keys => Promise.all(keys.filter(k => /private|api|cloud/i.test(k)).map(k => caches.delete(k))));
    } catch (_) {}
  }

  return { SyncError, read, write, syncState, pullState, pushMutation, clearPrivateCaches, baseUrl };
});
