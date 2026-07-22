# Newborn Essentials — Baby List 3.0

A private, local-first pregnancy and newborn PWA. It combines a 95-item
checklist with labor tools, a birth-preferences draft, reminders, feeding /
diaper / sleep tracking, warning-sign references, and first-year guides.

The app works offline without an account. Optional family sync uses a small
Cloudflare Durable Object that you deploy and protect with your own secret.

## What is included

| File | Purpose |
|---|---|
| `index.html` | Checklist, packing progress, notes, custom items, backup, and sharing. |
| `labor.html` | Contraction timer and labor reference. |
| `birthplan.html` | Editable birth-preferences draft with print support. |
| `reminders.html` | Local notifications and optional closed-app Web Push. |
| `tracker.html` | Feed, diaper, and sleep log with rolling summaries. |
| `emergency.html` | Maternal and infant warning-sign reference plus private emergency card. |
| `upbringing.html` | Recovery, feeding, sleep, tummy time, solids, and safety guides. |
| `settings.html` | Sync, dates, navigation stage, appearance, backup, and reset. |
| `sources.html` | Primary medical, legal, and technical sources and review date. |
| `assets/` | Local styles, fonts, and shared state/sync/navigation/tracker modules. |
| `worker/` | Private revisioned sync and push-registry API for Cloudflare Workers. |
| `sw.js` | Offline shell and notification handling. Private API responses are never cached. |

The bottom navigation automatically changes when the baby is marked born. A
manual Pregnancy/Baby override is available in Settings.

## Run and verify locally

The shipped CSS is already compiled, so no build is required to deploy:

```sh
npm ci
npm run verify
npm run serve
```

Open the URL printed by `npm run serve`. If HTML utility classes change, rebuild
the stylesheet with `npm run css` and rerun `npm run verify`.

## Deploy the PWA

GitHub Pages is sufficient for the app itself:

1. Extract the complete release into the root of a repository.
2. Push every file and folder, including `assets/`, `worker/`, `scripts/`, and
   `.github/`.
3. In GitHub: Settings → Pages → Deploy from a branch → `main` / `/ (root)`.
4. Open `https://<username>.github.io/<repo>/` and complete
   `POST-DEPLOY.md`.

HTTPS is required for service workers and notifications. On iPhone, install
from Safari using Share → Add to Home Screen.

## Optional private family sync

Version 3 intentionally supports only the bundled private Worker. Anonymous
JSON storage endpoints are no longer accepted because the URL itself could
expose family and health information.

### 1. Deploy the Worker

Install Wrangler, authenticate, then run:

```sh
cd worker
npx wrangler deploy
npx wrangler secret put TOKEN
npx wrangler secret put PUSH_TOKEN
npx wrangler secret put ALLOWED_ORIGINS
```

Use independently generated secrets for `TOKEN` and `PUSH_TOKEN`, for example:

```sh
openssl rand -hex 32
```

- `TOKEN` lets the app read and update family state.
- `PUSH_TOKEN` lets the scheduled sender access only the push registry and
  delivery acknowledgements. It cannot read family state.
- `ALLOWED_ORIGINS` is a comma-separated allowlist of exact origins, such as
  `https://example.github.io,http://localhost:4173`. An origin has no path.

Do not commit these values. The Worker uses a Durable Object, revisions,
conditional updates, per-field timestamps, and deletion tombstones so concurrent
changes merge instead of blindly overwriting one another.

### 2. Connect each phone

In Settings → Private family sync, enter the Worker URL and `TOKEN`, then tap
Test & connect. To add a second phone, either configure it manually or create a
live invite after accepting the on-screen warning that the link contains the
family secret. Share that invite only through a trusted private channel.

Ordinary checklist share links and downloaded backups never contain sync
credentials. Backups can include the full tracker archive, reminders, contacts,
and labor history; treat them as sensitive files.

### Migrating from 2.x

The old KV/anonymous endpoint is not migrated automatically:

1. In the old app, download a backup from the checklist.
2. Deploy and connect the 3.0 Worker.
3. Import the backup on one device, review it, and allow sync to finish.
4. Connect other devices only after the first device shows “Synced.”

## Optional closed-app push

Local reminders work while the installed app is active. Closed-app delivery
uses Web Push plus the included scheduled GitHub Action.

1. Generate VAPID keys with `npm run vapid`. Put the displayed public key in
   `VAPID_PUBLIC` in `reminders.html` before deploying; never commit the private
   key.
2. Add these repository Actions secrets:
   - `CLOUD_URL`: Worker URL
   - `PUSH_KEY`: the Worker's `PUSH_TOKEN` value
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`, such as `mailto:you@example.com`
3. Install the PWA and use Reminders → Enable notifications → Enable push on
   each device.
4. Run the “Send push reminders” workflow manually once to test.

The workflow checks every five minutes, but GitHub schedules are best-effort and
can be delayed or dropped. Public-repository scheduled workflows can also be
disabled after 60 days without repository activity. Re-enable the workflow
manually or use a dedicated scheduler if reliability matters. Do not use these
reminders for medication, feeding, or safety-critical timing.

## Privacy and safety boundaries

- All ordinary use is local to the device; sync and push are opt-in.
- Sync credentials remain local and are excluded from caches, backups, and
  ordinary share links.
- The service worker caches only same-origin static files.
- Tracker prompts are informational and only appear when logging is marked
  complete. They are not diagnosis or monitoring.
- Medical and legal content is a compact reference, not individualized advice.
  Review the linked primary sources in `sources.html` and follow the family's
  clinician, hospital, and local emergency guidance.
- The contraction pattern is a call prompt, never an instruction to drive.

## Release discipline

`npm run verify` checks local references and inline script syntax, then runs the
state merge, sync-conflict, tracker-math, Worker-auth, and push-timezone tests.
Keep checklist item ordering stable because compact legacy share links encode
items by position; append new items rather than inserting them.
