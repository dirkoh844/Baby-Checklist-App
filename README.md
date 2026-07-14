# Newborn Essentials — Baby List

A pediatrician-aligned newborn checklist. 96 priced, priority-tiered items across
8 categories, due-date timing with a "Do next" queue, name-stamped checkmarks,
cross-device cloud sync, mom-care reminders with notifications, a Labor & Delivery
page with a 5-1-1 contraction timer, undo, haptics, confetti, a womb-noise Calm
Focus mode, a hardened print layout, and four ways to share.

## Files

| File | Purpose |
|---|---|
| `index.html` | The checklist. |
| `labor.html` | Labor & Delivery: when-to-go guidance, contraction timer, stages, key contacts. |
| `reminders.html` | Mom-care reminders and push enrollment. |
| `settings.html` | Cloud sync setup, due date, name, appearance, what's new. |
| `upbringing.html` | Recovery through the first year: sleep, feeding, tummy time, solids, babyproofing. |
| `tracker.html` | Feeds, diapers, sleep. Warns on AAP thresholds. Syncs to both phones. `noindex`. |
| `emergency.html` | POST-BIRTH warning signs, newborn red flags, emergency card. Offline. `noindex`. |
| `birthplan.html` | Birth preferences in labor order, with the reasoning and the likely hospital answer for each. `noindex`. |
| `CHANGELOG.md` | Version history. |
| `assets/` | Precompiled stylesheet, confetti, and fonts — no CDN, works fully offline. |
| `worker/` | Cloudflare Worker sync endpoint (recommended cloud store) + wrangler config. |
| `manifest.webmanifest` | PWA install metadata (+ Labor shortcut). |
| `sw.js` | Service worker: network-first pages, cached assets, notification clicks focus the app. |
| `icon-192.png` / `icon-512.png` / `apple-touch-icon.png` | App icons. |

## Deploy to GitHub Pages

1. Push all files to the root of `main`.
2. Settings → Pages → Deploy from a branch → `main` / `/ (root)`.
3. Open `https://<username>.github.io/<repo>/`.

## Cross-device sync (one shared list)

GitHub Pages is static and cannot store data, so the app syncs through a JSON
endpoint you own. It must answer `GET` with the stored document and accept
`PUT` of a new one, with CORS open to the site. The endpoint plus its key is
the password: anyone holding both can read and edit the list.

**Cloudflare Worker + KV (recommended).** Free, nothing expires, and the list
is unreadable without your token. Deploy `worker/baby-list-worker.js`:

1. Cloudflare dashboard, Workers & Pages, Create, Worker. Paste the file, deploy.
2. Storage & Databases, KV, create a namespace. Bind it to the Worker as `LIST`.
3. Worker, Settings, Variables: add a **secret** named `TOKEN`, value from
   `openssl rand -hex 24`.
4. In the app: Settings, endpoint `https://<worker>.workers.dev`, key `TOKEN`.
   Tap **Test connection**.

Or `cd worker && npx wrangler kv namespace create LIST && npx wrangler secret put TOKEN && npx wrangler deploy`.

**JSONBin.io.** No deploy. Free account, private bins, no auto-deletion. Create
a bin, then an **Access Key** with read + update permission (not the Master Key,
which is your whole account). Endpoint `https://api.jsonbin.io/v3/b/YOUR_BIN_ID`,
key = the access key. The free allowance is 10,000 requests in total rather than
per month, so it suits light use.

**JSONBlob quick-create.** Public blobs, deleted after 75 idle days, and blob
creation depends on their CORS policy exposing the `Location` header. It stays in
the app as a throwaway option, not a home for the real list.

Put the same endpoint and key in the repository secrets `CLOUD_URL` and
`CLOUD_KEY` so the reminder workflow can read the list. If you use a JSONBin
Master Key there, also set `CLOUD_KEY_TYPE` to `master`.

Checkmarks, custom items, and the due date sync about once a minute and whenever
the app is opened. Send the **Share link** from the checklist, or the **invite
link** from Settings, to join another phone.

## Reminders

The Mom care card schedules a prenatal-vitamin reminder, water every N hours, and
custom reminders, delivered as system notifications after you tap Enable. On a
static site there is no push server, so reminders fire while the app is open or
installed and running; missed daily reminders catch up within 3 hours of opening.


## True push (closed-app delivery) — one-time setup, ~10 minutes

1. In the app, set up **Cloud sync** (Create shared storage). Reopen the sync
   panel and copy the endpoint URL shown in the field.
2. Repo → Settings → Secrets and variables → Actions → add:
   `CLOUD_URL` (that endpoint), `CLOUD_KEY` (only if your endpoint needs one),
   and the three VAPID values from `SECRET-vapid-private-key.txt`
   (never commit that file; it is gitignored).
3. Commit `package.json`, `scripts/`, and `.github/workflows/push-reminders.yml`.
4. On each phone: add the app to the Home Screen (required on iPhone), then in
   the Mom care card tap **Enable notifications**, then **Enable push**.
5. Actions tab → "Send push reminders" → Run workflow once to verify.

The cron checks every 15 minutes, sends whatever is due in each device's own
timezone, de-duplicates via slots stored in the bin, and prunes dead
subscriptions. While push is on, in-app timers stand down so nothing doubles.
The monthly `keepalive.yml` workflow makes an empty commit so GitHub never
suspends the cron after 60 idle days. After deploying, walk through
POST-DEPLOY.md once. See APPSTORE.md for the App Store and Play Store routes.

## Notes

- Item order in `DATA` defines share-link bit positions; append new items at the
  end of a category to keep old links valid.
- The contraction timer flags the 5-1-1 pattern (about 5 min apart, about 1 min
  long, sustained an hour) and keeps its log on-device.
- Print (Ctrl/Cmd+P) outputs a black-on-white serif checklist with pagination guards.

## Deploying

The whole repo is the site. Every file in the zip must land in the repo, and
that includes the folders:

```
index.html labor.html upbringing.html reminders.html settings.html
sw.js manifest.webmanifest package.json
icon-192.png icon-512.png icon-maskable-512.png apple-touch-icon.png
assets/          <- app.css, confetti.min.js, fonts/ (4 woff2)   REQUIRED
.github/         <- workflows for push reminders + keepalive
scripts/         <- send-push.mjs, generate-vapid.mjs
.nojekyll
```

Extract the zip over your clone, then:

```
git add -A
git commit -m "Baby List update"
git push
```

If you upload through the GitHub web page instead, drag the extracted **folder**
onto the drop zone. The "choose your files" picker cannot select folders, so
`assets/` gets left behind and the site renders with no styling at all.

## Rebuilding the stylesheet

The CSS is precompiled (Tailwind 4 + daisyUI 5, fonts vendored). If you edit
any HTML classes, rebuild once before deploying:

```
npm install
npm run css
```

That regenerates `assets/app.css`. Nothing else needs a build step.
