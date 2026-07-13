# Post-deploy verification (5 minutes)

Run through this once after pushing the package.

## 1. The site
- Open `https://<username>.github.io/<repo>/` — dark theme, 8 categories, Do next card.
- Tap Labor & Delivery card → labor page opens; back arrow returns.
- DevTools optional: Application → Service Workers shows `babylist-v3` activated.

## 2. Cloud sync
- Tap **Cloud sync** → **Create shared storage**. The app tries JSONBlob first
  (no account, no request caps; the push cron's 15-minute touches keep the blob
  alive indefinitely), then jsonstorage.net. Reopen the panel and copy the
  endpoint URL for the `CLOUD_URL` secret.
- If auto-create fails: make a free bin at jsonbin.io (signup) → paste
  `https://api.jsonbin.io/v3/b/<BIN_ID>` as the URL and your X-Master-Key in the
  key field → Connect. Pantry and ExtendsClass work the same way. Avoid
  jsonstorage.net's free tier as a manual choice — its 1,000 requests/month is
  too small for sync plus the push cron.
- Check an item on phone A; open the share link on phone B → same checkmark,
  and B toggles it within ~20 seconds of A's next change.

## 3. Push
- Secrets set (`CLOUD_URL`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
  `VAPID_SUBJECT`, optional `CLOUD_KEY`).
- On each phone: installed to Home Screen (mandatory on iPhone) → Enable
  notifications → Enable push ("Push on").
- Actions → **Send push reminders** → Run workflow. Log should read
  `No push subscriptions registered.` before phones enroll, or `sent …` /
  `Done. N notification(s) sent.` after. Set a reminder a few minutes ahead and
  run again to see a real delivery.
- The cron runs every 15 minutes; GitHub can add a few minutes of drift.
  The monthly **keepalive** workflow stops GitHub from suspending the schedule
  after 60 idle days — leave it enabled.

## Known limits, stated plainly
- Two phones editing the same item within the same sync window: newest
  timestamp wins. Simultaneous different items now merge instead of overwriting.
- Unchecking wins over an older check, but a custom item deleted on one phone
  can reappear if the other phone still had it; delete has Undo either way.
- Timezone for push is captured when a phone enables push; re-enable after a
  timezone move or DST if exact times matter.
- Reminders arrive with the app closed on Android and installed-iPhone (16.4+).
  In a plain iPhone Safari tab, Apple does not allow web push at all.
