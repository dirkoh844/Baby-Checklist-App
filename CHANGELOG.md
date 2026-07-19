# Baby List — Changelog

## v2.7.0 — July 2026
- **Birth Plan joins the collapse pass.** The old "Hide explanations" toggle is
  gone. Every preference stays visible; its reasoning now lives in a
  tap-to-expand "Why, for the doctor" topic beneath it ("— plus a heads-up"
  flags the ones with a caution). The five-decisions list and badge legend
  collapse too; the nurse-summary card stays open. Printing still expands
  everything.
- **Numbered labor stages.** The five stage topics on the Labor page now carry
  1–5 chips so the sequence reads at a glance.
- **Every button is 3D now.** The soft/tinted buttons (the checklist's footer
  grid — Copy list, Save to file, Print list…, timer chips, hotline rows) and
  the remaining solid colors (Call 911) get the same glossy raised-cap
  treatment and press as the primary buttons.

## v2.6.0 — July 2026
- **Tap-to-expand everywhere.** Every purely-text block across the app is now a
  collapsed topic with a title that tells you what's inside before you open it
  ("Active labor — 3–5 min apart · hospital time", "Fever: 100.4 °F (38 °C)+
  rectal — go now"). Long pages read as scannable lists of headings; sections
  with controls, tables, or diagrams stay open. 50+ topics converted. Topics
  auto-expand for printing (CSS + a beforeprint fallback in notify.js).
- **Three new diagrams.** A 5-1-1 contraction-pattern timeline on the Labor
  page, an ABCs-of-safe-sleep crib illustration (Alone · on the Back · in an
  empty Crib) on Upbringing, and a stool color guide with swatches inside the
  Warning signs diaper topic. All inline SVG/HTML — theme-aware, offline, no
  image files.
- **Can't scroll past the bottom bar.** Overscroll rubber-banding is disabled
  and every page's content now gets the same clearance above the tab bar, so
  the last card always scrolls fully clear — previously some pages under- or
  over-padded and the page could bounce past the menu.
- **Readability.** Topic titles and body text sized up slightly with looser
  line spacing.

## v2.5.3 — July 2026
- **Postpartum mental health.** The Upbringing page now has a "How you're really
  doing" section: baby blues vs. postpartum depression/anxiety, a plain "call
  your provider if…" list, and guidance for partners and support people — plus
  the crisis numbers (988, Maternal Mental Health Hotline, PSI) one tap away.
  The Warning signs page gains a matching "Your mind counts too" entry beside
  its existing hotlines.
- **"Is this normal?" for newborns.** A calming companion to the baby red flags:
  cluster feeding and the witching hour, funny breathing and hiccups, newborn
  skin and crossed eyes, surprising diapers, loud sleep and spit-up, and early
  weight loss — each with a clear "…but call if" line. Fewer 3 a.m. spirals.
- **Tap-to-expand topics.** Long reference sections now use expandable topic
  buttons so you can scan headings and open just what you need. Keyboard- and
  screen-reader-friendly, and they open automatically when you print.

## v2.5.2 — July 2026
- **Consistent header height.** The top bar no longer jumps ~12px between pages.
  Some subpage subtitles (e.g. "When to go · timer · contacts") wrapped to two
  lines while others stayed on one; every header breadcrumb is now pinned to a
  single line, so the bar is the same height on every page. The full text still
  shows on normal phones and ellipsizes gracefully only on very narrow screens.
  (The bottom tab bar was already identical across pages.)

## v2.5.1 — July 2026
- **Satisfying checkboxes.** Packing an item now feels physical: empty boxes are
  recessed into the row, checked boxes lift out as a raised, glossy fill, and
  the tap has a spring. The core action finally has weight.
- **Category charge-up.** Each category's glowing accent spine now brightens as
  the category fills, and blazes when it's fully packed — a visible reward that
  builds as you go (alongside the existing ring pop, haptics, and confetti).
- **Hero labor timer.** The big contraction button is now an arcade-style cap;
  while a contraction is timing it breathes with a calm pulse so "recording now"
  reads at a glance. Labor and Tracker stat tiles lift as raised glass.
- **Living background.** A slow, subtle mesh gradient drifts behind the header
  for a calmer, more alive feel — frozen automatically if you prefer reduced
  motion.

## v2.5.0 — July 2026
- **Depth & texture pass.** A new tactile visual layer across every page
  (`assets/enhance.css`): a fine film-grain texture over the background,
  category and zone cards that lift off the surface with layered shadows and a
  glossy top sheen, the flat category accent bar reborn as a rounded, glowing
  3D "spine," embossed icon chips, frosted-glass header and tab bar, inputs
  recessed into the surface, a glossy progress bar, and a real press on every
  button and card. Theme-aware for both dark ("womb") and light ("dawn"),
  stripped automatically for printing, and honors reduced-motion.
- **Bigger, unified bottom bar.** The tab bar is now driven by one shared
  stylesheet (`assets/navbar.css`) so it is byte-for-byte identical on every
  page and pinned to the very bottom. Tap targets grew ~20%: pill 48×32→58×38,
  icons 21→25px, taller hit area (56px+). Labels keep their narrow-phone floor
  so "Upbringing / Reminders / Settings" never collide, and grow only where
  there's room.
- **Labor page reorder.** The contraction timer now sits above the "When to
  head in" card — the thing you reach for mid-labor is first.
- **Offline-ready.** Service worker bumped to `babylist-v13` and precaches the
  two new stylesheets, so the new look works fully offline on first load.

## v2.4.3 — July 2026
- **Notifications ask on open.** The permission prompt now fires as the app
  loads instead of waiting for you to find the Enable notifications button on
  the Schedule page. Chrome prompts immediately; Safari and Firefox refuse a
  request that has no user gesture behind it, so those retry once on your first
  tap anywhere in the app. Asked at most once per session, because a
  multi-page app would otherwise re-prompt on every tab change and Chrome
  auto-blocks an origin after repeated dismissals (`assets/notify.js`).
- **Bigger touch targets.** Bottom tab bar: icons 18→21px, pill 44×28→48×32,
  taller tap area, and labels that scale with the screen (clamp 8.5→11px —
  "Upbringing" overflows a one-seventh column at a fixed 10px on narrow
  phones). Header icon buttons: 32→36px circles with 18px glyphs.

## v2.4.2 — July 2026
- **iOS launch screens.** 15 device sizes. Opening the app from the Home Screen
  used to show a white flash before the first paint; it now shows the mark on
  the brand background and hands over cleanly to the app.
- **Fixed the notification badge.** `sw.js` was sending `badge: icon-192.png`.
  Android draws the badge from the alpha channel only, and that file is 100%
  opaque, so every push notification put a solid grey square in the status bar.
  Now ships a real white-on-transparent silhouette (`badge-96.png`, 12% coverage).
- **Home-screen shortcuts** now have four distinct tiles, each with its own
  glyph, and point where you actually need them: Log a feed, Contraction timer,
  Warning signs, Reminders. They previously reused the full app icon twice and
  pointed at Labor and Reminders.
- **Themed icon** (`purpose: monochrome`) so the icon tints with an Android 13+
  themed home screen instead of ignoring it.
- Added `favicon.ico` (16/32/48), icon sizes 96/144/256/384, and an
  `og-image.png` link preview so texting the link stops showing a bare URL.
- `gen_artwork.py` builds all of it from the same mark as `gen_icons.py`.


## v2.4.1 — July 2026
- Redrawn icon set. The old icons carried **ten different stroke weights**
  (1.4 through 3.0), which is what made them read as amateur. Everything is now
  one 24px grid, one 1.75 stroke, round caps and joins. The checkmark keeps a
  heavier 2.5 because it renders at 13px on a checkbox and has to punch.
- Redrawn: 7 nav icons, 11 checklist and utility icons, the theme toggle, the
  night-mode toggle, and the warning-signs button.
- New app icon: a gold crescent moon cradling a teal check, replacing the crude
  overlap of the old one. Maskable variant now respects Android's 80% safe
  circle, so it will not get cropped on a Pixel.
- `gen_icons.py` is the single source for every icon and rewrites all 8 pages,
  so the set cannot drift apart again.


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
