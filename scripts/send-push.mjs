#!/usr/bin/env node
/* Baby List push sender. It reads only the isolated push registry and sends
   atomic acknowledgements, so reminder delivery can never rewrite app state. */
import webpush from 'web-push';

const {
  CLOUD_URL, PUSH_KEY = '', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY,
  VAPID_SUBJECT = 'mailto:babylist@example.com', DRY = ''
} = process.env;

if (!CLOUD_URL) { console.error('Missing env: CLOUD_URL'); process.exit(1); }
if (!PUSH_KEY) { console.error('Missing env: PUSH_KEY'); process.exit(1); }
if (!DRY) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.error('Missing env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY'); process.exit(1);
  }
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

let workerUrl;
try { workerUrl = new URL(CLOUD_URL); }
catch (_) { console.error('CLOUD_URL must be a valid HTTPS URL'); process.exit(1); }
if (workerUrl.protocol !== 'https:' || workerUrl.username || workerUrl.password || workerUrl.search || workerUrl.hash) {
  console.error('CLOUD_URL must be an HTTPS URL without credentials, query, or fragment');
  process.exit(1);
}
const base = workerUrl.origin + workerUrl.pathname.replace(/\/+$/, '');
const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json', Authorization: 'Bearer ' + PUSH_KEY };
const minutesOf = t => { const m = /^(\d{1,2}):(\d{2})$/.exec(t || ''); return m ? (+m[1] * 60 + +m[2]) : null; };

function zonedClock(now, timeZone) {
  let tz = timeZone || 'UTC';
  let parts;
  try {
    parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(now);
  } catch (_) {
    tz = 'UTC';
    parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(now);
  }
  const p = Object.fromEntries(parts.filter(x => x.type !== 'literal').map(x => [x.type, x.value]));
  return { day: p.year + '-' + p.month + '-' + p.day, minute: Number(p.hour) * 60 + Number(p.minute), timeZone: tz };
}

/* The window exceeds the five-minute schedule interval so a slightly late run
   catches the reminder. Server-side slots keep overlapping runs idempotent. */
export function computeDue(entry, now = new Date(), windowMin = 12) {
  const local = zonedClock(now, entry.tz);
  const due = [];
  (entry.reminders || []).forEach(r => {
    if (!r || !r.id || !r.label) return;
    if (r.type === 'daily') {
      const target = minutesOf(r.time); if (target === null) return;
      if (local.minute >= target && local.minute < target + windowMin) due.push({ r, slot: local.day + '|' + r.time });
    } else if (r.type === 'interval') {
      const start = minutesOf(r.start), end = minutesOf(r.end), every = (+r.every || 2) * 60;
      if (start === null || end === null || every <= 0 || local.minute < start || local.minute > end) return;
      const since = local.minute - start;
      if (since % every < windowMin) due.push({ r, slot: local.day + '|i' + Math.floor(since / every) });
    }
  });
  return due;
}

function bodyFor(r) {
  return r.type === 'interval' ? 'Scheduled interval reminder.' : 'Your scheduled reminder is due.';
}

async function main() {
  const res = await fetch(base + '/push/registry', { headers, cache: 'no-store' });
  if (!res.ok) { console.error('Push registry GET failed', res.status); process.exit(1); }
  const registry = await res.json();
  const subs = registry && registry.subs || {};
  const keys = Object.keys(subs);
  if (!keys.length) { console.log('No push subscriptions registered.'); return; }

  const updates = [];
  let sent = 0;
  for (const key of keys) {
    const entry = subs[key] || {};
    entry.last = entry.last || {};
    for (const { r, slot } of computeDue(entry, new Date())) {
      if (entry.last[r.id] === slot) continue;
      const payload = JSON.stringify({
        title: r.label, body: bodyFor(r), tag: 'rem-' + r.id,
        url: './reminders.html', reminderId: r.id
      });
      if (DRY) { console.log('[dry]', key.slice(0, 8), r.id + '|' + slot, payload); continue; }
      try {
        await webpush.sendNotification(entry.sub, payload);
        entry.last[r.id] = slot;
        updates.push({ key, last: { [r.id]: slot } });
        sent++;
        console.log('sent', key.slice(0, 8), r.id + '|' + slot);
      } catch (err) {
        const code = err && err.statusCode;
        if (code === 404 || code === 410) { updates.push({ key, remove: true }); console.log('pruning dead subscription', key.slice(0, 8)); break; }
        console.error('send failed', key.slice(0, 8), code || err.message);
      }
    }
  }

  if (updates.length) {
    const ack = await fetch(base + '/push/ack', { method: 'POST', headers, body: JSON.stringify({ updates }) });
    if (!ack.ok) { console.error('Push acknowledgement failed', ack.status); process.exitCode = 1; }
  }
  console.log('Done.', sent, 'notification(s) sent.');
}

if (!process.env.SKIP_MAIN) main().catch(e => { console.error(e); process.exit(1); });
