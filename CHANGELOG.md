# Baby List — Changelog

## v3.2.0 — July 22, 2026

- **Living motion.** The sticky header carries a slow, two-tone aurora drift
  (alpha ≤9%, so text contrast is untouched), and the More menu's page tiles
  rise in with a gentle 20–180 ms stagger. Both are fully disabled under
  `prefers-reduced-motion` and stripped for print.
- **Tracker charts, rebuilt as premium tiles.** The 7-day feeds / wet / sleep
  sparklines became raised glass tiles with a colored identity dot beside each
  label, top-rounded bars anchored to a recessive baseline, per-bar native
  tooltips ("Mon · 7"), and ink-token text. Chart colors were validated for
  mark contrast: light mode's amber was darkened for the Sleep bars (2.2:1 →
  6.6:1); series identity never rides on color alone.
- **Sync correctness (audited).** Two fixes from an adversarial review of the
  new merge logic: a fresh device joining the family can no longer wipe an
  upgraded document's unstamped `due` / `born` / emergency card (empty values
  no longer win timestamp ties), and an edit made while a sync request was in
  flight — a checkmark during the 2 s debounce push, a feed logged during the
  60 s poll — is now re-merged and kept instead of silently reverted, on the
  checklist, tracker, and emergency-card pages alike.
- **First-visit fix.** Saving an item note in a brand-new profile no longer
  throws (the initial state was missing its `notes` map); "Since fed / Since
  wet" clamp to `0m` if an entry arrives future-stamped from a skewed clock.
- **Modal hygiene.** Returning to a page via Back (bfcache) can no longer
  restore a stuck-open More menu with the page inert; a nav rebuild while the
  menu is open tears it down cleanly; and the sheet's teardown is centralized
  so no path can strand `inert`.
- **Filter polish.** The active-filter count badge now reflects restored
  filters after a reload, "Hide notes" alone now surfaces the Clear-filters
  button, and a dead hidden reset button was removed from the header.
- **Test suite: 33 checks.** New regressions cover the fresh-device scalar
  wipe, and the mock sync server now mirrors the worker's strict If-Match
  (missing header → 428) so a client regression can't slip through.

## v3.1.0 — July 22, 2026

- **Flagship visual pass.** A cohesive depth system across every page: premium
  card elevation with an edge-light, springier button/press feedback, a living
  gradient hairline under the sticky header, refined display typography, richer
  active-tab and segmented-control states, a progress-bar sheen, and a themed
  scrollbar. One unified, theme-aware focus ring that meets WCAG 2.4.11 (≥3:1)
  in both light and dark — including an inset variant so the collapsible filter
  can't clip it. All new motion is disabled under `prefers-reduced-motion` and
  stripped for print.
- **"More" is now an overflow menu.** Tapping **More** in the bottom bar opens a
  floating, frosted sheet of the pages that aren't on the current stage's bar
  (pregnancy → Tracker, Warning signs, Guides, Settings, Sources; baby →
  Checklist, Labor, Birth plan, Settings, Sources) instead of jumping straight
  to Settings. It's a real modal: focus-trapped, `Escape`/scrim to close, focus
  returns to the button, and the rest of the screen is `inert` while it's open.
- **Collapsible checklist filters.** Phase, Sort, Show, the Hide toggles, and the
  legend now live behind a single **Filters & sort** button, collapsed by
  default (the controls are `inert` when closed) and expanding on tap, with a
  badge showing how many filters are active. **Clear filters** now resets every
  filter the badge counts. Search and the category jump-chips stay visible.
- **Light-theme contrast corrections.** The active nav label, segmented-control
  selection, filter count badge, and More-menu icons were darkened in the
  "dawn" theme to meet AA.
- **Sync correctness.** Data carried across the v2→v3 upgrade (which has no
  per-field timestamp) is now treated as oldest, so a remotely-deleted item can
  no longer resurrect and a stale local value can't overwrite a newer remote
  edit; a deterministic tiebreak makes two such devices converge instead of
  ping-ponging. The generic key cap no longer silently overrides the larger
  tombstone/entity limits, and the document-size guard is measured in UTF-8
  bytes.
- **Reminder delivery is at-least-once.** A slot is marked sent only after the
  push is delivered, so a crashed or failed run retries next time rather than
  silently dropping a reminder; a rare duplicate is preferred to a miss for a
  best-effort schedule.
- **Worker hardening.** State writes require an explicit revision precondition,
  token checks are constant-time, and push endpoints must be public hosts
  (internal/loopback/metadata/rebinding targets are rejected).
- **Safer restore.** Imported backup extras (reminders, contraction log,
  contacts, tracker archive) are validated for type and size before being
  stored, and contact phone numbers render defensively.
- **Offline resilience.** The service worker again installs resiliently, so one
  missing file in a partial deploy can't wipe the whole offline cache, and the
  monthly keep-alive workflow that prevents the reminder cron from being
  auto-disabled after 60 idle days was restored.

## v3.0.0 — July 21, 2026

- **Private, conflict-safe family sync.** Anonymous JSON stores were removed.
  The bundled Cloudflare Durable Object now uses independent app/sender tokens,
  exact origin allowlisting, revisions, ETags, conditional writes, input limits,
  per-field timestamps, and deletion tombstones.
- **Stage-aware five-item navigation.** Pregnancy and Baby each get a focused
  bottom bar with Settings and secondary tools collected under More. Auto mode
  follows the recorded birth date; a manual override is available.
- **Safer sharing and backups.** Ordinary links and backups exclude sync
  credentials. Live invites require an explicit disclosure. Backups now cover
  reminders, contacts, labor history, and tracker archives with validated import.
- **Tracker math corrected.** Rolling sleep includes ongoing and cross-midnight
  intervals, calendar-day totals split intervals correctly, and averages use
  tracked days instead of the baby's age. Count-based prompts pause when logging
  is marked incomplete.
- **Medical/legal content reviewed.** Fever escalation, dehydration signs,
  monitor/safe-sleep language, bottle sanitation, tummy-time progression,
  Virginia eye-prophylaxis wording, and July 2026 hepatitis-B context were
  corrected. Newborn count prompts now stop after day 28 and distinguish
  breastfeeding guidance from individualized feeding plans. A primary-source
  registry and review date were added.
- **Notification privacy and reliability.** Permission is requested only after a
  user action. Push subscriptions live in an isolated registry, timezone handling
  is DST-aware, delivery is de-duplicated, and dead subscriptions are pruned.
  The UI now states clearly that hosted schedules are best-effort.
- **Offline and injection hardening.** The service worker caches only static
  same-origin resources; authenticated/API responses are network-only. Stored
  user text is sanitized and rendered as text, and import sizes are capped.
- **Verification suite.** Release checks cover HTML/local references, inline
  syntax, state merging, sync conflicts, tracker math, Worker auth/revisions, and
  timezone-aware push selection.

## v2.12.6 — July 2026
- **Upbringing, mental health re-homed.** "How you're really doing" (baby
  blues vs. PPD, when to call your provider, for partners & support people)
  moved from its own standalone card into a nested sub-section inside
  "Recovery & the fourth trimester," alongside visitors and physical healing.
  Same three topics, same content, now grouped with the rest of the
  fourth-trimester recovery material instead of sitting apart from it.

## v2.12.5 — July 2026
- **Upbringing, fully collapsible.** "The first 30 days," "1–6 months: tummy
  time & milestones," and "6–12 months: solids & babyproofing" are now
  tap-to-expand sections, same as "Recovery & the fourth trimester." All four
  phase cards on the page collapse to just their title and badge by default,
  with diagrams, tables, and topics nested inside.

## v2.12.4 — July 2026
- **Upbringing, one more collapsible.** "Recovery & the fourth trimester"
  was the one section on the page that was always expanded. It's now a
  tap-to-expand accordion like every other section, collapsed by default,
  with its two topics (visitors, what mom's body is healing from) nested
  inside.

## v2.12.3 — July 2026
- **Birth Plan headers, restyled.** Each numbered stage title now splits at
  its dash: the part before it is bold and a size larger, the part after
  drops to a smaller muted line underneath. The two headers that had a
  second dash ("Immediately after birth — baby — 6 preferences" and
  "Newborn procedures — pending decision — 1 preference") now render that
  second part as a comma on the smaller line instead of a second dash.

## v2.12.2 — July 2026
- **Birth Plan, unwrapped.** The six numbered sections (0 through 5) were
  each a `<details>` dropdown nested inside its own outer card. Removed that
  outer card on all six so the numbered dropdowns sit directly on the page —
  same accent-bordered accordion look, one less layer of container.

## v2.12.1 — July 2026
- **Warning signs, trimmed.** Removed the crisis-line callout paragraph and
  the standalone "Who to call" hotline card from the mind-health section on
  the Mom pane. The "Baby blues vs. postpartum depression" topic stays in
  place, and 911 is still one tap away in the POST card at the top of the
  page.

## v2.12.0 — July 2026
- **Seven new diagrams.** Stomach size by day (cherry → walnut → egg), the
  four swaddle folds, three burping holds, and a first-year milestone strip on
  Upbringing; a thermometer with the 100.4 °F emergency line, the wet-diaper
  ladder (1/day → 6+/day), and the normal weight dip-and-recover curve on
  Warning signs. All inline SVG — theme-aware, offline, screen-reader
  labeled. The app now carries 12 diagrams.

## v2.11.8 — July 2026
- **Spacing.** More room between each checklist item's price and its note
  pencil.

## v2.11.7 — July 2026
- **Removed the reading-progress bar** that ran under the header on long
  reference pages.

## v2.11.6 — July 2026
- **Solid stage circles.** The path-of-labor diagram's numbered circles are now
  solid fills with high-contrast numbers instead of semi-transparent rings.

## v2.11.5 — July 2026
- **Fixed the stray tick next to prices.** The note-pencil button on each
  checklist row was rendering collapsed (its icon sizing classes weren't in
  the precompiled stylesheet), leaving only a 2px border sliver — the "awkward
  line" beside every price. It now renders as a proper 36px pencil button, so
  the notes feature is actually visible for the first time. Audited every
  script-injected element for the same failure; also fixed the jump-chip icon
  sizing and the celebration card's heading sizes.

## v2.11.4 — July 2026
- **Three new diagrams.** A labor-path diagram on the Labor page (five numbered
  stops from Early labor at home to the golden hour, with cm markers), a
  hunger-cues sequence inside Upbringing's feeding topic (rooting → hands to
  mouth → crying = late), and a tummy-time build-up chart (20 → 30 → 60
  minutes) above the age table. All inline SVG — theme-aware and offline.
- **Removed** the crisis-outreach callout and support-lines note from the
  Upbringing mental-health section. The hotline buttons remain on the Warning
  signs page.

## v2.11.3 — July 2026
- **Beveled menu buttons.** Every tab pill in the bottom menu has a visible
  bevel at rest — ring, catch-light, and faint fill — not just the active one.
- **Edge-to-edge chrome.** The menu's background extends to the physical
  bottom of the screen (through the home-indicator area) and the header's
  extends to the physical top, so bounce-scrolling never shows page content
  above the header or below the menu.

## v2.11.2 — July 2026
- **Fresh styles arrive with fresh pages.** After a deploy, the app could show
  the new version number with the previous release's styling for one launch —
  pages update network-first while stylesheets served cache-first. Asset links
  are now versioned (`?v=`), so new HTML always pulls matching CSS/JS on the
  very first load. If your app ever looked "not updated," this was why.

## v2.11.1 — July 2026
- **Transitions on every browser.** Browsers without cross-document view
  transitions (Firefox, older iOS Safari) previously navigated with no
  animation at all. They now get a lightweight fallback — a quick fade-out on
  tap and a rise-in on arrival — while modern browsers keep the full native
  transition with the gliding tab pill. Reduced-motion still disables both.

## v2.11.0 — July 2026
- **Birth Plan slimmed to the essentials.** The hospital/patient identity card
  (Sentara header, names, date-of-birth lines) and the Signatures card are
  gone — the page is now the preferences and their reasoning, nothing else.
- **Each step is collapsible.** The six numbered steps (0 Before labor → 5 If
  a repeat cesarean becomes necessary) now present exactly like the Labor
  page's stages: a numbered chip, the step name, and a preference count in the
  collapsed title. Open a step to see its preferences; each still carries its
  tap-to-expand "Why, for the doctor". Printing expands everything.
- **Text pass.** Redundant "— the reasoning" dropped from the Why titles, the
  cryptic "Three yeses, one fight" badge now reads "3 easy yeses · 1 fight",
  and a stale reference to the "signed plan" was reworded.

## v2.10.0 — July 2026
- **Menu reshuffle.** Warning signs now lives in the bottom menu (it replaced
  Tracker); the Baby tracker moved to Settings with its own card. The menu is
  slightly smaller, and the emergency icon left every page header.
- **Header decluttered.** Text size, theme, calm sounds, and reset moved off
  the checklist header into Settings, which is reorganized: Appearance (theme ·
  text · calm sounds), Due date, Your name, Baby tracker, Cloud sync, Reset
  (checkmarks-only or full), What's new.
- **Checklist rows read like a table.** Alternating semi-transparent rows with
  hairline separators; the priority/qty pills moved to their own line under
  each item name; a packed item tucks its pills and description away.
- **Jump chips glow their target.** Tapping a mini category pill scrolls to the
  category and pulses its glow for two seconds.
- **Buttons are better defined at rest** — quiet button styles get a visible
  border and fill before they're touched.

## v2.9.0 — July 2026
- **The screen stays awake during labor.** Timing a contraction (or turning on
  the new Focus mode) holds a screen wake lock, so the phone can't sleep
  mid-contraction. Re-acquired automatically when you switch back to the app.
- **Labor Focus mode.** One tap on "Focus" hides everything but a giant
  contraction button and the three stats — a one-handed 3 a.m. layout. Same
  button exits.
- **Jump to any category.** A scrollable row of colored category chips above
  the checklist, plus a floating back-to-top button.
- **Text size applies everywhere.** The checklist's Aa setting now carries to
  every page, including Warning signs.
- **A real finish line.** Packing the final item now triggers a triple confetti
  volley and a "You're ready." card with the full count.
- **Notes on any item.** The little pencil on each row saves a note ("borrowed
  from Sarah", "the blue one") that syncs and shares with the list.
- **Countdown in the header.** "T−42 days" before the due date, "Day 6 with
  baby" after the birth date is set.
- **Tracker trends.** Three 7-day mini-charts — feeds, wet diapers, sleep
  hours — so a slow day stands out at a glance.
- **Expand / collapse all.** Pages with many topics (Warning signs, Birth Plan,
  Upbringing, Labor) get one-tap controls for all topics at once.
- **App icon badge.** The installed app's icon shows how many "by this week"
  items are still unpacked (Badging API, where supported).
- **Reading progress.** A thin accent line under the header tracks how far
  through the long reference pages you are.
- **Fixed: sticky headers.** A texture-layer rule had been silently overriding
  `position:sticky` since v2.5 — headers scrolled away with the page instead of
  pinning. They stick again on every page.

## v2.8.1 — July 2026
- **Header icons can no longer fall off the screen.** Pages with long
  subtitles (Birth Plan especially) pushed the warning/theme buttons past the
  right edge; titles now truncate instead, and the checklist keeps its full
  two-line subtitle. Audited every page at narrow and normal widths — no
  element sits off-screen anywhere.
- **Search field double-✕ fixed.** The browser's built-in search-clear ✕ was
  drawn on top of the "N items" match counter; it's hidden now — the app's own
  clear button does that job.
- **Clear filters no longer collides with the chips.** The Show row scrolls
  sideways instead of squishing "Nice to have" into the Clear filters button.
- **Nav pills fit narrow phones.** The enlarged tab pills capped to their
  column so the first and last can't poke past the screen edge at 360px.

## v2.8.0 — July 2026
- **Animated topics.** Collapsible topic cards now ease open and closed (pure
  CSS via `::details-content` + `interpolate-size`; browsers without support
  open instantly as before), and the body content fades in as it expands.
- **More readable topic cards.** The chevron now sits in a visible round chip
  tinted with the topic's accent so it reads as a control; an accent divider
  separates title from content when open; titles wrap balanced; keyboard focus
  gets a clear ring; opening a topic near the sticky header no longer hides it.
- **Page transitions.** Moving between pages now runs a cross-document view
  transition: the old page fades, the new content rises in, and the header and
  bottom bar stay perfectly still — while the active tab's colored pill glides
  from the old tab to the one you picked. Tab icons also get a small press
  bounce. Pure CSS (`@view-transition`); unsupported browsers navigate
  instantly, and reduced-motion turns it all off.

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
