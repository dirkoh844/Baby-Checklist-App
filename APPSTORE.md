# Getting Baby List onto phones — two routes

## Route A (working today, free): installed PWA + real push
Already built. On iPhone: Safari → your Pages URL → Share → Add to Home Screen.
Then in the app: Enable notifications → Enable push. With the GitHub Actions
sender configured (see README), reminders arrive with the app fully closed on
iOS 16.4+ and Android. No Apple account, no review, no cost. For a two-person
family app, this is the route I recommend actually living on.

## Route B: a real App Store listing
What Apple requires and I cannot do for you: an Apple Developer account
($99/year), a Mac with Xcode (or a cloud Mac), and passing App Review.
The codebase is ready for the standard wrapper path, Capacitor:

1. `npm install -D @capacitor/core @capacitor/cli @capacitor/ios @capacitor/push-notifications`
2. `mkdir www && cp index.html labor.html sw.js manifest.webmanifest *.png www/`
3. Edit `capacitor.config.json` → set your own `appId` (reverse-DNS).
4. `npx cap add ios && npx cap sync`
5. Open `ios/App/App.xcworkspace` in Xcode → Signing & Capabilities → add your
   team, plus the **Push Notifications** capability and **Background Modes →
   Remote notifications**.
6. Icons/splash: `npx @capacitor/assets generate --iconBackgroundColor '#0B0E15'`
   (it picks up icon-512.png).
7. Archive → App Store Connect → TestFlight → submit.

Two honest caveats for Route B:
- **Push inside the native wrapper is different plumbing.** Web Push does not
  run inside the iOS WKWebView; the store build uses `@capacitor/push-notifications`
  (APNs device tokens), and the sender must speak APNs or FCM instead of Web
  Push. Same registry pattern, different transport — a contained follow-up task,
  not a rewrite.
- **Guideline 4.2:** Apple rejects thin website wrappers. Native push, offline
  support, and the installed app shell usually clear the bar for a utility app,
  and **TestFlight-only distribution** (you and Elizabeth) skips the storefront
  entirely while still installing "like a real app."

## Google Play (much easier, if Android ever matters)
$25 one-time. `npx @bubblewrap/cli init --manifest <pages-url>/manifest.webmanifest`
builds a Trusted Web Activity. Because a TWA runs real Chrome, today's Web Push
keeps working unchanged.
