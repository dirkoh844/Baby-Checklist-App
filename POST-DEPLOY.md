# Post-deploy verification

Run this checklist after every production release and on at least one iPhone and
one Android device when those platforms matter.

## 1. Static app and update behavior

- Open the deployed root over HTTPS. Confirm the checklist is styled and the
  footer shows version 3.0.0.
- In a private window, open every destination from the bottom bar and More.
  There should be five large navigation targets with no clipped labels.
- In Settings, switch Navigation stage among Auto, Pregnancy, and Baby. Confirm
  the destinations change and Auto follows the recorded birth date.
- Install the PWA, launch once online, then use airplane mode. Open the checklist,
  tracker, warning signs, guides, labor, birth plan, reminders, and Settings.
- Return online and reload twice. Confirm the new release remains active and no
  prior-release styling appears.

## 2. Local state and accessibility

- Check and uncheck an item; add, edit, and delete a note and a custom item.
  Reload after each operation and verify the intended state remains.
- Test undo after deletion. Test keyboard focus and activation on a desktop.
- In Settings, change text size and theme. Confirm long text wraps at 200% zoom,
  landscape view remains usable, and reduced-motion mode has no essential
  animation.
- Download a backup, inspect that it contains no endpoint/token, then import it
  on a test profile. Verify reminders, contacts, labor history, and tracker
  archive restore only after confirmation.
- Create an ordinary share link and confirm it contains no sync credentials.
  Create a live invite only for this test, verify the disclosure appears, then
  revoke/rotate `TOKEN` if the link left your control.

## 3. Private family sync

- Confirm Worker secrets `TOKEN`, `PUSH_TOKEN`, and `ALLOWED_ORIGINS` are set.
  A request from an unlisted origin should fail.
- Connect phone A through Settings. Connect a separate profile/phone B and wait
  until both show Synced.
- Make different offline edits on A and B, reconnect both, and confirm both edits
  survive.
- Delete a custom item or tracker event on A while B is offline. Reconnect B and
  confirm the older copy does not resurrect it.
- Edit the same field on both devices and confirm the later timestamp wins.
- Disconnect one device and confirm its local data remains while credentials are
  removed.

## 4. Tracker and warning prompts

- Log a feed, diaper, and sleep interval. Start a sleep entry, leave it running,
  and verify rolling sleep includes the ongoing interval.
- Create an interval spanning midnight and verify each calendar day receives the
  correct portion.
- Mark logging incomplete and confirm count-based prompts are paused. Mark it
  complete and confirm the app labels prompts as informational and links to
  warning signs.
- Verify stored names/notes render as plain text rather than markup.

## 5. Labor, birth preferences, and emergency reference

- Time several synthetic contractions. Confirm the call prompt requires a
  sustained pattern and never tells the user to drive based on the app.
- Print the birth-preferences page and check every preference is expanded, text
  is black on white, and no bottom navigation appears.
- Open Warning signs offline. Test phone links on a real device. Verify the
  private emergency card persists and is not visible in an ordinary share link.
- Review `sources.html` and confirm its review date is still current for the
  release. Clinical/legal copy should be re-reviewed before shipping it in a
  new jurisdiction or after a material guideline change.

## 6. Notifications and push

- Before tapping Enable, confirm the browser has not requested notification
  permission.
- Enable local notifications and schedule a near-term test. Deny permission in a
  second browser and confirm the app explains how to recover without looping.
- Add Actions secrets: `CLOUD_URL`, `PUSH_KEY`, `VAPID_PUBLIC_KEY`,
  `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT`.
- Enroll each installed device, manually run “Send push reminders,” and confirm a
  notification deep-links back into Reminders.
- Change the test device timezone, re-enroll it, and verify the stored timezone.
- Confirm the sender prunes a deliberately expired test subscription.

GitHub scheduled workflows can run late, be dropped under load, and be disabled
after 60 days without activity in a public repository. Treat push as best-effort
and never as medication, feeding, or safety-critical scheduling.

## 7. Release gate

From a clean extraction:

```sh
npm ci
npm run verify
```

Do not publish if tests fail, local references are missing, the production
origin is absent from `ALLOWED_ORIGINS`, or the VAPID public key embedded in the
app does not match the private key stored in Actions.
