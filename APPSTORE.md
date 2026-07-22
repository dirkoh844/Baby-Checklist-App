# Phone distribution options

## Recommended for a small private deployment: installed PWA

Host the release over HTTPS, then install it from Safari or Chrome. This keeps
the shipped offline behavior, Worker sync, and Web Push model intact without
store review. On iPhone, Web Push requires installation to the Home Screen.

The post-deploy checklist remains required: mobile operating systems can change
notification, storage, background, and standalone-mode behavior independently
of this codebase.

## Apple App Store / TestFlight wrapper

A native wrapper is possible with Capacitor, but it is a separate product
release rather than a packaging toggle. You need an Apple Developer membership,
macOS/Xcode or a managed build service, privacy disclosures, screenshots,
signing, and review.

Start by copying the entire static app—not a partial page list—into a web asset
directory:

```sh
npm install --save-dev @capacitor/core @capacitor/cli @capacitor/ios
npx cap init
mkdir -p www
rsync -a --exclude node_modules --exclude worker --exclude .github ./ www/
npx cap add ios
npx cap sync ios
```

Then review these native differences before distribution:

- Web Push does not provide the native notification pipeline inside an iOS
  `WKWebView`. Add a Capacitor/APNs integration and a separate device-token
  registry/sender if closed-app native notifications are required.
- Service-worker behavior inside a wrapper differs from Safari installation;
  verify every offline route and decide whether to disable the worker in native
  builds in favor of bundled assets.
- External phone/web links, print/share behavior, file import/export, safe-area
  insets, text scaling, and keyboard focus need device testing.
- Replace example identifiers, display name, icons, support URL, privacy-policy
  URL, and VAPID/Worker configuration before signing.
- Complete Apple's health/medical, privacy, data-collection, encryption/export,
  and account-deletion questionnaires according to the final native behavior.
  The current reference copy must not be marketed as diagnosis or monitoring.
- A thin web wrapper can be rejected. Native-quality integration, offline value,
  accessibility, and platform-consistent behavior should be evident.

For a limited trusted audience, TestFlight may be operationally simpler than a
public listing, but it still uses Apple signing and beta-review rules.

## Google Play

A Trusted Web Activity via Bubblewrap can preserve Chrome's PWA and Web Push
behavior:

```sh
npx @bubblewrap/cli init --manifest https://example.com/manifest.webmanifest
```

Configure Digital Asset Links, signing, store disclosures, testing tracks, and
the production origin before submission. A Capacitor Android wrapper is another
option if native notification or file integrations are needed; it carries the
same “separate product release” testing burden as iOS.

## Before any store submission

- Re-run `npm run verify` from a clean package.
- Complete `POST-DEPLOY.md` on real target devices.
- Obtain a fresh clinical/legal review of `sources.html` and all warning copy.
- Publish an accurate privacy policy describing local data, optional Worker
  sync, push endpoints, backups, retention, deletion, and support contact.
- Test upgrade/migration without losing local records.
- Verify the app remains useful when sync and notifications are disabled.
