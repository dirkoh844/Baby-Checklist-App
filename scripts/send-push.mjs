#!/usr/bin/env node
/* Baby List push sender — runs on GitHub Actions cron.
   Reads the shared cloud bin, computes which reminders are due for each
   subscribed device (in that device's own timezone), sends Web Push, and
   writes de-dup slots back so nothing fires twice. */
import webpush from 'web-push';

const {
  CLOUD_URL, CLOUD_KEY = '',
  VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY,
  VAPID_SUBJECT = 'mailto:babylist@example.com',
  DRY = ''
} = process.env;

if (!CLOUD_URL) {
  console.error('Missing env: CLOUD_URL');
  process.exit(1);
}
if (!DRY) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.error('Missing env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY');
    process.exit(1);
  }
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

function headersFor(url, key, method) {
  const hd = { 'Content-Type': 'application/json' };
  if (!key) return hd;
  const host = (url.match(/^https?:\/\/([^/]+)/) || [])[1] || '';
  if (host.includes('jsonbin.io')) hd[process.env.CLOUD_KEY_TYPE === 'master' ? 'X-Master-Key' : 'X-Access-Key'] = key;
  else if (host.includes('extendsclass.com')) hd['Security-key'] = key;
  else hd['Authorization'] = 'Bearer ' + key;
  return hd;
}
function urlFor(url, key) {
  const host = (url.match(/^https?:\/\/([^/]+)/) || [])[1] || '';
  if (host.includes('jsonstorage.net') && key && url.indexOf('apiKey=') < 0)
    return url + (url.includes('?') ? '&' : '?') + 'apiKey=' + encodeURIComponent(key);
  return url;
}
const minutesOf = t => { const m = /^(\d{1,2}):(\d{2})$/.exec(t || ''); return m ? (+m[1] * 60 + +m[2]) : null; };

/* Which reminders are due for one device entry at `now`?  WINDOW must exceed
   the cron gap so a late runner still catches the slot; de-dup handles overlap. */
export function computeDue(entry, now = new Date(), windowMin = 20) {
  const local = new Date(now.getTime() - (entry.tzo || 0) * 60000);
  const day = local.toISOString().slice(0, 10);
  const cur = local.getUTCHours() * 60 + local.getUTCMinutes();
  const due = [];
  (entry.reminders || []).forEach(r => {
    if (r.type === 'daily') {
      const t = minutesOf(r.time); if (t === null) return;
      if (cur >= t && cur < t + windowMin) due.push({ r, slot: day + '|' + r.time });
    } else if (r.type === 'interval') {
      const s = minutesOf(r.start), e = minutesOf(r.end), ev = (+r.every || 2) * 60;
      if (s === null || e === null || ev <= 0 || cur < s || cur > e) return;
      const since = cur - s;
      if (since % ev < windowMin) due.push({ r, slot: day + '|i' + Math.floor(since / ev) });
    }
  });
  return due;
}

function bodyFor(r) {
  if (r.type === 'interval') return 'Every ' + (r.every || 2) + 'h — small sips add up.';
  return "Time for this — you've got it, mama.";
}

async function main() {
  const url = urlFor(CLOUD_URL, CLOUD_KEY);
  const res = await fetch(url, { headers: headersFor(CLOUD_URL, CLOUD_KEY, 'GET'), cache: 'no-store' });
  if (!res.ok) { console.error('Cloud GET failed', res.status); process.exit(1); }
  const body = await res.json();
  const doc = (body && body.record && body.record.app === 'newborn-checklist') ? body.record : body;
  if (!doc || doc.app !== 'newborn-checklist') { console.log('No app document yet — nothing to do.'); return; }
  const subs = (doc.push && doc.push.subs) || {};
  const keys = Object.keys(subs);
  if (!keys.length) { console.log('No push subscriptions registered.'); return; }

  let changed = false, sent = 0;
  for (const key of keys) {
    const entry = subs[key];
    entry.last = entry.last || {};
    const due = computeDue(entry, new Date());
    for (const { r, slot } of due) {
      const dedup = r.id + '|' + slot;
      if (entry.last[r.id] === slot) continue;
      const payload = JSON.stringify({ title: r.label, body: bodyFor(r), tag: 'rem-' + r.id });
      if (DRY) { console.log('[dry]', key.slice(0, 8), dedup, payload); }
      else {
        try { await webpush.sendNotification(entry.sub, payload); sent++; console.log('sent', key.slice(0, 8), dedup); }
        catch (err) {
          const code = err && err.statusCode;
          if (code === 404 || code === 410) { console.log('pruning dead subscription', key.slice(0, 8)); delete subs[key]; changed = true; break; }
          console.error('send failed', key.slice(0, 8), code || err.message);
          continue;
        }
      }
      entry.last[r.id] = slot; changed = true;
    }
  }

  if (changed) {
    doc.push = { subs };
    const put = await fetch(url, { method: 'PUT', headers: headersFor(CLOUD_URL, CLOUD_KEY, 'PUT'), body: JSON.stringify(body.record ? { ...doc } : doc) });
    if (!put.ok) console.error('Cloud PUT failed', put.status);
  }
  console.log('Done.', sent, 'notification(s) sent.');
}

if (!process.env.SKIP_MAIN) main().catch(e => { console.error(e); process.exit(1); });
