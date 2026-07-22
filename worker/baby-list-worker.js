/* Baby List v3 sync endpoint — Cloudflare Durable Object.
   Revisioned state writes prevent lost updates. Push subscriptions are stored
   separately so the reminder sender can never overwrite family state. */

const API_VERSION = '3';
const MAX_BODY = 512 * 1024;
const MAX_PUSH_BODY = 64 * 1024;
const MAX_PUSH_SUBSCRIPTIONS = 500;
const utf8Size = value => new TextEncoder().encode(value).byteLength;

function allowedOrigin(req, env) {
  const origin = req.headers.get('Origin');
  if (!origin) return null; // server-to-server calls do not use CORS
  const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean);
  return allowed.includes(origin) ? origin : false;
}
function responseHeaders(origin, extra) {
  const h = new Headers(extra || {});
  h.set('Content-Type', 'application/json; charset=utf-8');
  h.set('Cache-Control', 'no-store, max-age=0');
  h.set('X-BabyList-API', API_VERSION);
  h.set('Access-Control-Expose-Headers', 'ETag, X-BabyList-API');
  if (origin) {
    h.set('Access-Control-Allow-Origin', origin);
    h.set('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS');
    h.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,If-Match');
    h.set('Access-Control-Max-Age', '86400');
    h.append('Vary', 'Origin');
  }
  return h;
}
function json(value, status, headers) {
  return new Response(JSON.stringify(value), { status: status || 200, headers: responseHeaders(null, headers) });
}
function plainObject(v) { return !!v && typeof v === 'object' && !Array.isArray(v); }
function safeKey(k) { return typeof k === 'string' && k.length > 0 && k.length <= 180 && !['__proto__', 'prototype', 'constructor'].includes(k); }
function scrub(v, depth) {
  if (depth > 7 || v == null) return v == null ? v : null;
  if (typeof v === 'string') return v.slice(0, 2000);
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (typeof v === 'boolean') return v;
  if (Array.isArray(v)) return v.slice(0, 10000).map(x => scrub(x, depth + 1));
  if (!plainObject(v)) return null;
  const out = {};
  Object.keys(v).slice(0, 2000).forEach(k => { if (safeKey(k)) out[k] = scrub(v[k], depth + 1); });
  return out;
}
function validateStateDocument(body) {
  if (!plainObject(body) || body.app !== 'newborn-checklist' || !plainObject(body.state)) throw new Error('invalid_document');
  const allowed = ['checked', 'custom', 'notes', 'due', 'born', 'card', 'log', '_sync', 'savedAt'];
  const state = {};
  allowed.forEach(k => { if (k in body.state) state[k] = scrub(body.state[k], 0); });
  if (!plainObject(state.checked) || Object.keys(state.checked).length > 3000) throw new Error('invalid_checked');
  if (!plainObject(state.custom) || Object.keys(state.custom).length > 80) throw new Error('invalid_custom');
  if (!plainObject(state.notes) || Object.keys(state.notes).length > 3000) throw new Error('invalid_notes');
  if (!Array.isArray(state.log) || state.log.length > 10000) throw new Error('invalid_log');
  return {
    app: 'newborn-checklist', version: 3,
    savedAt: typeof body.savedAt === 'string' ? body.savedAt.slice(0, 40) : new Date().toISOString(),
    state
  };
}
function cleanPushEntry(v) {
  if (!plainObject(v) || !plainObject(v.sub) || typeof v.sub.endpoint !== 'string') throw new Error('invalid_subscription');
  let endpoint;
  try { endpoint = new URL(v.sub.endpoint); } catch (_) { throw new Error('invalid_endpoint'); }
  if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password) throw new Error('invalid_endpoint');
  const out = scrub(v, 0);
  out.who = String(out.who || '').slice(0, 80);
  out.tz = String(out.tz || 'UTC').slice(0, 80);
  out.reminders = Array.isArray(out.reminders) ? out.reminders.slice(0, 50) : [];
  out.last = plainObject(out.last) ? out.last : {};
  out.updatedAt = new Date().toISOString();
  return out;
}

export class FamilyList {
  constructor(ctx) {
    this.ctx = ctx;
    this.windowStarted = 0;
    this.windowCount = 0;
  }
  limited() {
    const now = Date.now();
    if (now - this.windowStarted >= 60000) { this.windowStarted = now; this.windowCount = 0; }
    this.windowCount++;
    return this.windowCount > 300;
  }
  async fetch(req) {
    if (this.limited()) return json({ error: 'Too many requests', code: 'rate_limited' }, 429, { 'Retry-After': '60' });
    const path = new URL(req.url).pathname;

    if (req.method === 'GET' && path === '/health') return json({ ok: true, api: 3, storage: 'durable-object' });

    if (req.method === 'GET' && path === '/state') {
      const stored = await this.ctx.storage.get('state');
      if (!stored) return json({ error: 'No shared state yet', code: 'not_found' }, 404, { ETag: '"0"' });
      return json(Object.assign({}, stored.doc, { revision: stored.revision }), 200, { ETag: '"' + stored.revision + '"' });
    }

    if (req.method === 'PUT' && path === '/state') {
      const text = await req.text();
      if (utf8Size(text) > MAX_BODY) return json({ error: 'Document is too large', code: 'too_large' }, 413);
      let incoming;
      try { incoming = validateStateDocument(JSON.parse(text)); }
      catch (e) { return json({ error: 'Invalid Baby List document', code: e.message || 'invalid_document' }, 400); }
      const stored = await this.ctx.storage.get('state');
      const revision = stored ? stored.revision : 0;
      const match = Number((req.headers.get('If-Match') || '').replace(/[^0-9]/g, ''));
      if (!Number.isFinite(match) || match !== revision) {
        return json({ error: 'Revision conflict', code: 'revision_conflict', revision, current: stored ? Object.assign({}, stored.doc, { revision }) : null }, 409, { ETag: '"' + revision + '"' });
      }
      const next = revision + 1;
      await this.ctx.storage.put('state', { revision: next, doc: incoming });
      return json({ ok: true, revision: next }, 200, { ETag: '"' + next + '"' });
    }

    if (req.method === 'GET' && path === '/push/registry') {
      const push = await this.ctx.storage.get('push');
      return json({ subs: (push && push.subs) || {} });
    }

    if (req.method === 'POST' && path === '/push/subscription') {
      const text = await req.text();
      if (utf8Size(text) > MAX_PUSH_BODY) return json({ error: 'Push request is too large', code: 'too_large' }, 413);
      let op;
      try { op = JSON.parse(text); } catch (_) { return json({ error: 'Invalid JSON', code: 'invalid_json' }, 400); }
      if (!plainObject(op) || !safeKey(String(op.key || ''))) return json({ error: 'Invalid subscription key', code: 'invalid_key' }, 400);
      const key = String(op.key).slice(0, 180);
      const push = (await this.ctx.storage.get('push')) || { subs: {} };
      if (op.op === 'delete') delete push.subs[key];
      else if (op.op === 'upsert') {
        if (!push.subs[key] && Object.keys(push.subs).length >= MAX_PUSH_SUBSCRIPTIONS) {
          return json({ error: 'Push registry is full', code: 'capacity_reached' }, 409);
        }
        try {
          const existing = push.subs[key];
          const cleaned = cleanPushEntry(op.entry);
          /* Client schedule edits must not erase delivery acknowledgements or
             the same due slot can be sent twice. Only the sender updates last. */
          if (existing && plainObject(existing.last)) cleaned.last = existing.last;
          push.subs[key] = cleaned;
        }
        catch (e) { return json({ error: 'Invalid push subscription', code: e.message }, 400); }
      } else return json({ error: 'Unknown operation', code: 'invalid_operation' }, 400);
      await this.ctx.storage.put('push', push);
      return json({ ok: true });
    }

    if (req.method === 'POST' && path === '/push/ack') {
      const text = await req.text();
      if (utf8Size(text) > MAX_PUSH_BODY) return json({ error: 'Push request is too large', code: 'too_large' }, 413);
      let body;
      try { body = JSON.parse(text); } catch (_) { return json({ error: 'Invalid JSON', code: 'invalid_json' }, 400); }
      const updates = Array.isArray(body && body.updates) ? body.updates.slice(0, 500) : [];
      const push = (await this.ctx.storage.get('push')) || { subs: {} };
      updates.forEach(u => {
        const key = String(u && u.key || ''); if (!safeKey(key)) return;
        if (u.remove) { delete push.subs[key]; return; }
        const entry = push.subs[key]; if (!entry || !plainObject(u.last)) return;
        entry.last = Object.assign({}, entry.last || {}, scrub(u.last, 0));
        entry.updatedAt = new Date().toISOString();
      });
      await this.ctx.storage.put('push', push);
      return json({ ok: true });
    }

    return json({ error: 'Method not allowed', code: 'method_not_allowed' }, 405);
  }
}

export default {
  async fetch(req, env) {
    const origin = allowedOrigin(req, env);
    if (origin === false) return new Response(JSON.stringify({ error: 'Origin not allowed', code: 'origin_denied' }), { status: 403, headers: responseHeaders(null) });
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: responseHeaders(origin) });

    const path = new URL(req.url).pathname;
    const senderRoute = (req.method === 'GET' && path === '/push/registry') || (req.method === 'POST' && path === '/push/ack');
    const expected = senderRoute ? env.PUSH_TOKEN : env.TOKEN;
    const supplied = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    if (!expected || supplied !== expected) return new Response(JSON.stringify({ error: 'Unauthorized', code: 'unauthorized' }), { status: 401, headers: responseHeaders(origin) });
    if (!env.FAMILY) return new Response(JSON.stringify({ error: 'Durable Object binding is missing', code: 'server_misconfigured' }), { status: 500, headers: responseHeaders(origin) });

    const id = env.FAMILY.idFromName('primary-family');
    const upstream = await env.FAMILY.get(id).fetch(req);
    const headers = responseHeaders(origin, upstream.headers);
    return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers });
  }
};
