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
| `CHANGELOG.md` | Version history. |
| `assets/` | Precompiled stylesheet, confetti, and fonts — no CDN, works fully offline. |
| `manifest.webmanifest` | PWA install metadata (+ Labor shortcut). |
| `sw.js` | Service worker: network-first pages, cached assets, notification clicks focus the app. |
| `icon-192.png` / `icon-512.png` / `apple-touch-icon.png` | App icons. |

## Deploy to GitHub Pages

1. Push all files to the root of `main`.
2. Settings → Pages → Deploy from a branch → `main` / `/ (root)`.
3. Open `https://<username>.github.io/<repo>/`.

## Cross-device sync (one shared list)

GitHub Pages is static and cannot store data itself, so the app syncs through a
tiny JSON store on the web:

1. In **Settings**, tap **Create shared storage** (tries JSONBlob first, then
   jsonstorage.net — both free, no account). Or paste any JSON endpoint that
   accepts GET/PUT — JSONBin.io, Pantry, ExtendsClass, or your own. Keys go in
   the second field; the app shapes the right auth header per provider.
2. Tap **Share link** and send it (or copy the Settings **invite link**). Any
   device that opens it joins the same live list — checkmarks, custom items,
   and the due date sync about once a minute and whenever the app is opened.

Privacy: the endpoint address acts as the password. Anyone with the share link
can read and edit the shared list.

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

## Rebuilding the stylesheet

The CSS is precompiled (Tailwind 4 + daisyUI 5, fonts vendored). If you edit
any HTML classes, rebuild once before deploying:

```
npm install
npm run css
```

That regenerates `assets/app.css`. Nothing else needs a build step.
