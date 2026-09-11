# Steady Training

An iPhone workout PWA, served directly at `training/codex/` on GitHub Pages. No installation, compilation, accounts, or backend. Open `./index.html` through an HTTP server, or use the published Pages URL. On iPhone, choose Safari → Share → Add to Home Screen.

The fixed schedule starts with A/B/A on the week of Monday January 5, 2026, and B/A/B the next week. Tuesday/Thursday are 60-minute incline walks; weekends are off. Tap a day and an exercise to begin there; the guide returns to any unfinished exercises before completing the session. Both legs (and both curl/extension movements) count as one set.

Dumbbell loads always mean **one dumbbell in pounds**. Cable loads are **stack plate numbers 1–16**. Suggested increases require all prescribed sets at the top of the range using the same load; incomplete or mixed-load sessions keep the most recent load. The latest session containing the exercise is used, even when intervening sessions omit it. Planks record actual elapsed seconds when stopped.

Settings offers 60/90/120/150-second rest, readable text + raw JSON export, and history clearing. All state is stored under `training.codex.v1`; sets are saved immediately on completion. Rest end timestamps are persisted. Hold elapsed time and rest remaining time are calculated from timestamps on every tick and visibility change. Audio is unlocked by a workout interaction. iOS may suspend sound while backgrounded and does not support vibration on every device; overdue timer feedback occurs on returning to the app.

Wait for **Ready for offline training** before disconnecting. The directory-scoped service worker requires successful caching of every local runtime asset and all three pinned CDN assets on install. Requests use network-first with cache fallback. This does not claim the parent site's service worker scope. Browser storage can still be cleared by the OS or by the user; export logs for a backup.

Runtime dependencies, deliberately pinned and loaded directly from jsDelivr:

- Framework7 **8.3.4** core bundle and CSS, for its iOS page, navbar, toolbar, list, sheet, dialog, and toast components. [Documentation](https://v8.framework7.io/docs/)
- Motion **12.36.0** vanilla browser bundle, for interpolated SVG joint geometry, spring feedback, SVG line drawing, and `animateView` shared exercise titles. [View transition documentation](https://motion.dev/docs/animate-view)

The ivory, terracotta, and ink palette uses system typography and Georgia. Reduced motion freezes figures and removes custom transitions. Every local asset URL is relative; HTTPS CDN URLs are the necessary external-library exception.

## Verification

From the repository root:

```sh
node --test codex/app.test.cjs
node --check codex/app.js
node --check codex/sw.js
python3 -m http.server 8765
```

Open `http://localhost:8765/codex/`. Unit tests use Node's standard library, with no npm dependencies. They cover progression, JSON round-trip, unit formatting/export, calendar alternation, timestamp timers, relative local paths, and service-worker install/offline fetch behavior. Browser validation should also check offline reload/logging, clearing Progress, actual hold inputs, and layout at 375px. Physical iPhone background audio and Add to Home Screen require device verification.

Verified in headless Chrome at 375 × 812: CDN loading, no horizontal overflow, three persisted bench sets and a 45 lb suggestion after reload, 27 elapsed seconds written to the hold input, 30 seconds remaining after advancing a 90-second rest by 60 seconds, service-worker offline reload and set logging, and clearing history to an empty Progress screen. Background time was advanced through an injected clock; airplane mode used Chrome's offline network emulation, not a physical iPhone.
