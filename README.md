# Newborn Essentials — Baby List

A pediatrician-aligned newborn checklist. 96 priced, priority-tiered items across
8 categories, due-date timing with a "Do next" queue, name-stamped checkmarks,
undo, haptics, confetti, a womb-noise Calm Focus mode, a hardened print layout,
and four ways to share.

## Files

| File | Purpose |
|---|---|
| `index.html` | The entire app (markup + logic). Tailwind, DaisyUI, and canvas-confetti load from CDNs. |
| `manifest.webmanifest` | PWA install metadata. |
| `sw.js` | Service worker: caches the shell and CDN assets, so the app works offline after the first visit. |
| `icon-192.png` / `icon-512.png` / `apple-touch-icon.png` | App icons. |

## Deploy to GitHub Pages

1. Create a repository (e.g. `baby-list`) and push all files to the root of `main`.
2. Repo → Settings → Pages → Source: **Deploy from a branch** → `main` / `/ (root)` → Save.
3. Open `https://<username>.github.io/baby-list/` after the build finishes (about a minute).

HTTPS is automatic, which enables the service worker, Web Share, and install prompts.

## Sharing model

- **Share link** — encodes every checkmark (one bit per item, 32-bit chunks), your
  custom items, and the due date into a Base64URL hash. Opening the link restores
  the exact list; corrupted links fail silently back to saved state.
- **Save / Load file** — full-state `.json` backup.
- **Share copy** — downloads the page with state embedded for offline hand-off.
- **Family sync** — appears only when running as a shared Claude artifact.

Progress otherwise saves to the device via localStorage.

## Notes

- Item order in `DATA` defines share-link bit positions. Append new items at the
  end of a category to keep old links valid.
- Calm Focus synthesizes brown noise (`x[n] = (x[n-1] + 0.02w)/1.02`) through a
  low-pass filter with a slow pulse. It only starts on tap, never automatically.
- Print (Ctrl/Cmd+P) outputs a black-on-white serif checklist with pagination
  guards; controls, badges' color, and dark backgrounds are stripped.
