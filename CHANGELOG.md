# Baby List — Changelog

## v2.4.0 — July 2026
- New **Tracker** page. Feeds (nursing timer with sides, bottle ounces, pumping),
  diapers (wet, dirty, both), and sleep. The three numbers a pediatrician always
  asks for are the first thing on screen: time since the last feed, time since
  the last wet diaper, and whether the baby is asleep. Both phones write to one
  log, unioned by entry id so simultaneous logging never overwrites.
- The tracker **warns**, which is what a logging app usually will not do. Fewer
  than 6 wet diapers in 24 hours after the first week, no wet diaper in 8 hours,
  no feed logged in 4 hours, fewer than 8 feeds a day. AAP thresholds, phrased as
  a prompt to call, never as a diagnosis.
- "Copy for the doctor" puts the 24-hour and 7-day counts on the clipboard.
- **Night mode**: dim red on near-black, oversized buttons, and a screen wake
  lock so the phone does not sleep mid-feed at 3am.
- New **Warning signs** page, one tap from the header of every screen. AWHONN's
  POST-BIRTH signs for mom (the four that mean call 911, the five that mean call
  your provider), newborn red flags including the rule that a rectal temperature
  of 100.4 under 3 months is an emergency, and an editable emergency card with
  one-tap calling. Works offline.
- **Fixed a data-loss bug**: the checklist page saved state from a whitelist, so
  any key another page owned was deleted on the next save. That already dropped
  the Birth Plan's clean-view setting and would have erased every feed log.
  Foreign keys are now carried through and the log is unioned, both locally and
  on every cloud push.
- Bottom navigation is now seven tabs.


## v2.3.0 — July 2026
- New **Birth Plan** page (`birthplan.html`), sixth tab. Reproduces the signed
  SNGH birth preferences in full, reordered into the sequence labor actually
  happens, with a clinical rationale under every preference and a verdict on how
  the hospital is likely to answer it (routine, ask, settle prenatally, expect
  pushback). Sourced from ACOG, AAP, CDC, USPSTF, and WHO guidance.
- "Hide explanations" collapses the page to preferences only, a clean view to
  hand a nurse at the desk. Print button included; the page prints without the
  app chrome.
- The page is `noindex, nofollow`. It carries a name and medical detail on a
  public site, so it stays out of search engines.
- Bottom navigation is now six tabs across every page.


## v2.2.1 — July 2026
- Removed the Labor & Delivery card from the checklist page. The page itself is
  unchanged and still one tap away in the bottom bar. No item IDs moved, so
  checkmarks and existing share links are unaffected.
- Cloud sync now sends JSONBin an **Access Key** header rather than the Master
  Key, falling back to the Master Key once if the access header is rejected and
  remembering which one worked. A Master Key in a public page is the whole
  account; an access key scoped to read + update is not.
- Added `worker/baby-list-worker.js`: a Cloudflare Worker + KV sync endpoint.
  Free, no auto-deletion, bearer-token auth, CORS handled.
- Settings: a **Test connection** button that reports the actual HTTP status,
  and setup copy that names what each provider costs you. JSONBlob quick-create
  is now labelled for what it is (public, removed after 75 idle days) and its
  failures say why instead of failing silently.


## v2.2.0 — July 2026
- Fully self-hosted: Tailwind + daisyUI precompiled to a static stylesheet,
  fonts and confetti vendored. No CDNs, no runtime compiler, no FOUC, and the
  app now works completely offline including first paint.
- Saving split in two: local writes land in ~120ms while cloud pushes batch
  on a 2-second debounce (a burst of taps becomes one request). Closing or
  backgrounding the app flushes both, with keepalive for the network push.
- Sync status dot in the header (green synced, amber unreachable) with a
  single quiet toast on failure; private-mode storage warnings surface too.
- Save-to-file is now a full backup: list, reminders, labor contacts, and the
  contraction log travel in one file and restore together.
- Install banner: native prompt on Android, guided Add-to-Home-Screen on iOS.
- Copy the contraction log from the Labor page for your provider.
- Settings: invite link that connects another phone in one tap, and a
  next-baby reset that clears checkmarks locally and in the cloud while
  keeping custom items, reminders, and the connection.
- Service worker installs file by file, so one missing or 404ing asset can no
  longer reject the whole install and silently leave the app with no offline
  cache. Failed responses are never cached.
- Every page detects a missing stylesheet and says so plainly instead of
  rendering as unstyled markup.
- Search: 150ms debounce plus nickname keywords (onesie, paci, binky,
  carseat, pram, sitz...), screen-reader announcements on checkmarks, a
  maskable Android icon, larger toasts, print button, share-link size
  heads-up, iOS silent-switch note on Calm sounds, and durable-storage
  request at boot.


## v2.1.1 — July 2026
- Bottom menu redesign: identity colors per tab and a tinted pill behind the
  active tab's icon, so the current page reads at a glance.
- Dark palette lifted and diversified: brighter, more separated category and
  zone hues on slightly lighter surfaces, stronger tints and borders, so
  sections stop washing into one navy.

## v2.1.0 — July 2026
- New Upbringing page: fourth-trimester recovery and visitor boundaries,
  first-30-days sleep and feeding-on-cues, tummy-time schedule by age,
  six-month milestones, solids readiness and variety, first-year sleep
  consolidation, and babyproofing.
- Life-phase filter on the checklist (Pregnancy & Mom Care / First Year)
  with budgets, counts, and category totals scoped to the active phase.
- Toggle-to-undo filter chips with fully saturated active colors, and a
  Clear filters button that appears whenever any filter is active.
- Five-tab navigation across every page.

## v2.0.0 — July 2026
- Restructured into a four-page app with a persistent bottom menu:
  Checklist, Labor & Delivery, Reminders, Settings.
- New Settings page: cloud sync setup/disconnect with endpoint copy,
  due date, your name, theme and text size, and this changelog.
- New Reminders page: schedule editing, notifications, and push
  enrollment, moved out of the checklist.
- Removed the Do next section; by-week chips on items still highlight
  as deadlines approach.
- Auto-create shared storage now tries JSONBlob first (no key, no
  request caps) with jsonstorage.net as fallback.

## v1.6 — July 2026
- Colorful dark mode: every category and functional zone gets its own
  deep-tinted surface, colored title, and accent rule.
- Categories collapsed by default with per-category memory of your
  explicit choices; tier filters and search auto-expand matches.
- Footer redesign: hero Share link with description, colorful action grid.
- Bottom navigation, private-mode storage warning.

## v1.5 — July 2026
- True closed-app push: Web Push subscriptions + a GitHub Actions cron
  sender with per-device timezone slots, de-dup, and dead-sub pruning.
- Two-device merge on sync: simultaneous edits union instead of
  overwriting; unchecks stick.
- Monthly keepalive workflow so GitHub never suspends the cron.
- Update-ready toast on new deploys; iPhone install guidance for push.

## v1.0 — July 2026
- 96-item pediatrician-aligned checklist across 8 categories with
  priority tiers, quantities, price ranges, and safety notes.
- Budgets, due-date timing, name-stamped checkmarks, undo, haptics,
  confetti, Calm Focus brown noise, print engine.
- Share links (bitmask URLs), JSON save/load, self-contained share
  copies, cloud sync, Labor & Delivery page with 5-1-1 timer.
