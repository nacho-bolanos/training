# Training (claude build)

A personal workout PWA for iPhone. Static files only, served from `/training/claude/` on
GitHub Pages. No build step, no bundler, no accounts, no backend. Framework7 v8 (iOS theme)
and Motion come from jsDelivr and are cached by the service worker on install so the app
opens and logs in airplane mode after the first load.

## Install on the phone

1. Open `https://<user>.github.io/training/claude/` in **Safari**.
2. Share → **Add to Home Screen**. It launches standalone with its own icon.
3. Open it once while online so the service worker caches the CDN libraries.

## The program (hardcoded)

Mon/Wed/Fri alternate Session A and B, flipping weekly (A,B,A then B,A,B, anchored on
Monday 2026-09-07). Tue/Thu are 60-minute incline walks. Sat/Sun off.

| Session A | Session B |
|---|---|
| Goblet squat 3×10–12 (lb, +5) | Dumbbell RDL 3×10–12 (lb, +5) |
| Dumbbell bench press 3×8–12 (lb, +5) | Seated cable row 3×8–12 (plate, +1) |
| Lat pulldown 3×8–12 (plate, +1) | Seated dumbbell shoulder press 3×8–10 (lb, +5) |
| Dumbbell step-up 2×10 each leg (lb, +5) | Bulgarian split squat 3×8–10 each leg (lb, +5) |
| Cable face pull 3×12–15 (plate, +1) | Curl and triceps extension 2×12 (lb, +5) |
| Plank 3×30–40 s | Dead bug 3×10–12 (bodyweight) |

## Units

- Dumbbell lifts log the weight of **one dumbbell** in lb.
- Cable lifts log the **plate number** on the stack (1–16), never pounds, and progress one plate at a time.
- Plank logs seconds. Dead bug logs reps.

Labels, suggestions, the Progress view and the export all follow the exercise's unit.

## Progression

Before each exercise the app reads the most recent session that contains it (sessions
without that exercise are skipped, and today's in-progress session is ignored):

- Every set at the top of the range → suggest current load + increment, reps back to the bottom of the range.
- Otherwise → same load, and the reps to beat.
- No history → no suggested load.

## Timers

- **Rest** starts automatically after every set except the last of the session. 60/90/120/150 s.
  Remaining time is computed from a stored end timestamp on every tick and on
  `visibilitychange`, so backgrounding the tab does not stall it. Beep via WebAudio plus
  `navigator.vibrate` where supported.
- **Hold** (plank) counts up from a start timestamp, beeps once at the target, and writes the
  actual elapsed whole seconds into the seconds field when stopped.

## Files

| File | What it is |
|---|---|
| `index.html` | Shell: week, progress and guided pages, rest/settings/export sheets |
| `app.js` | Program data, calendar, unit formatting, progression, guided mode, timers, figures, sparklines |
| `styles.css` | Palette, type scale, Framework7 variable overrides |
| `manifest.json` | Standalone install, relative `start_url` and `scope` |
| `sw.js` | Network-first with cache fallback. Caches local files and the three CDN assets on install |
| `test.js` | Unit tests for progression, unit formatting and the week pattern |
| `icon-192.png`, `icon-512.png` | Home-screen icons |

## Screens

Screen changes use the View Transitions API through Motion's `animateView`, with a
shared-element transition on the exercise name between the week list and the guided screen.
Framework7 supplies the navbar, lists, steppers, sheets, dialog, toast and accordion.
The exercise figure morphs between the two positions of the lift by interpolating joint
coordinates with Motion; `prefers-reduced-motion` freezes it on the start position and
disables the view transitions.

## Data

One localStorage key, `training.claude.v1`, holding the full JSON:

```json
{ "v": 1, "rest": 90, "sessions": [ { "date": "2026-09-07", "key": "A", "ex": { "bench": [ { "w": 40, "r": 12 } ] } } ] }
```

It is written when a set is completed, when the rest length changes, and on clear. Export
(Progress → Export, or the settings sheet) produces a readable log followed by the raw JSON.

## Tests

```
node --test claude/test.js
```
