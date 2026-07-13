# Baby List — Changelog

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
