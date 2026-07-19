# Baby List — Architecture

A zero-build, offline-first PWA: eight static HTML pages sharing three
stylesheets and one helper script, a service worker for offline + push, and an
owner-hosted JSON endpoint for cross-device sync. GitHub renders the diagrams
below natively.

## 1 · Pages & navigation

```mermaid
flowchart LR
  subgraph menu[Bottom menu — 7 tabs]
    C[Checklist\nindex.html]
    L[Labor\nlabor.html]
    B[Birth Plan\nbirthplan.html]
    W[Warning signs\nemergency.html]
    U[Upbringing\nupbringing.html]
    R[Reminders\nreminders.html]
    S[Settings\nsettings.html]
  end
  T[Tracker\ntracker.html]
  S -- "Open the tracker" --> T
  C -. "Warning signs links" .-> W
  U -. crisis & red-flag links .-> W
  T -. thresholds link .-> W
```

## 2 · Assets & load order

```mermaid
flowchart TD
  H[Any page .html] --> A["app.css\n(precompiled Tailwind + DaisyUI\n+ per-page theme tokens)"]
  A --> N["navbar.css\n(shared bar · header rules\nscroll containment · overflow fixes)"]
  N --> E["enhance.css\n(texture · 3D depth · topics\ntransitions · diagrams · focus mode)"]
  H --> J["notify.js\n(push enrol · print-expand\ntext-size · expand-all · VT fallback)"]
  H --> F[fonts/ woff2 ×4]
  H --> K[confetti.min.js]
  style E fill:#7DD3BC22,stroke:#7DD3BC
  style N fill:#AEB9FF22,stroke:#AEB9FF
```

Asset links carry a `?v=` version so fresh HTML always pulls matching CSS/JS
on the first load after a deploy.

## 3 · Data flow & sync

```mermaid
flowchart LR
  subgraph phoneA[Phone A]
    LSa[(localStorage\nnewborn-checklist-v3)]
    UIa[Checklist / Tracker UI]
    UIa <--> LSa
  end
  subgraph phoneB[Phone B]
    LSb[(localStorage)]
    UIb[UI]
    UIb <--> LSb
  end
  EP["Owner-hosted JSON endpoint\nCloudflare Worker (token) or JSONBin\nGET current · PUT merged"]
  LSa <-- "poll ~60 s + on open\nmerge, last-write per field" --> EP
  LSb <-- same --> EP
  SHARE[Share link\nstate baked into URL] --> LSb
  LSa --> SHARE
```

## 4 · Service worker strategy

```mermaid
flowchart TD
  REQ[Request] -->|navigation| NF{network first}
  NF -->|ok| FRESH[serve + refresh cache]
  NF -->|offline| CACHED[serve cached page]
  REQ -->|asset| SWR{stale-while-revalidate}
  SWR --> HIT[serve cache instantly]
  HIT --> BG[refresh in background]
  INST[install: precache CORE\nskipWaiting] --> ACT[activate: drop old caches\nclients.claim]
```

## 5 · Push reminders (closed-app)

```mermaid
sequenceDiagram
  participant GH as GitHub Actions (cron ~15 min)
  participant EP as Sync endpoint
  participant PS as Web Push service
  participant PH as Installed app
  GH->>EP: read reminder schedule + subscriptions
  GH->>PS: send due notifications (VAPID)
  PS->>PH: push event → sw.js showNotification
  PH->>PH: notification click focuses app
  Note over GH: keepalive.yml prevents the 60-day\nscheduled-workflow shutoff
```
