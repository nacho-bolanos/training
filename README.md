# Training

A personal workout app. Three lifting days, two incline-walk days, guided set-by-set
mode, rest timer, automatic weight suggestions, and progress charts. All data stays
in `localStorage` on your phone. No accounts, no server, no analytics.

## Put it on your iPhone

1. Create a GitHub repo (public or private — Pages works for both on a paid plan;
   public is free) and push these five files to the root:
   `index.html`, `app.js`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`
2. Repo → Settings → Pages → Source: `Deploy from a branch`, Branch: `main` / `root`.
3. Wait about a minute. You get `https://<user>.github.io/<repo>/`.
4. Open that URL in **Safari** (not Chrome — only Safari can install to the home screen).
5. Share button → **Add to Home Screen**.

It now launches fullscreen with its own icon and works with no signal.

Cloudflare Pages works the same way if you want a custom domain: connect the repo,
no build command, output directory `/`.

## How the weight suggestions work

Each exercise has a rep range. After every session the app looks at your last logged
sets for that exercise:

- Hit the top of the range on **every** set → it suggests the next weight up
  (5 lb for dumbbells, 10 lb for cable stacks) and restarts you at the bottom of the range.
- Otherwise → same weight, and it shows you the reps to beat.

This only works if you log what you actually did, including the bad sets.

**Log one dumbbell, not the pair.** Holding two 40s is `40`.

## Files

| File | What it is |
|---|---|
| `index.html` | Shell, styles, timer bar |
| `app.js` | Program data, figures, guided mode, progression logic, charts |
| `manifest.json` | Makes it installable |
| `sw.js` | Offline cache, network-first so updates still land |

## Changing the program

Everything is in the `A` and `B` objects near the top of `app.js`. Each exercise:

```js
{ f:'goblet',            // which figure to draw
  n:'Goblet squat',      // name, also the storage key — renaming resets its history
  sets:3, lo:10, hi:12,  // sets and rep range
  inc:5,                 // weight jump when you top the range
  kind:'lbs',            // 'lbs' | 'sec' | 'reps' | 'none'
  each:true,             // optional: per-leg
  c:'form cue', set:'setup', prog:'progression note' }
```

## Backups

Progress tab → **Export log**. It copies a readable log plus the raw JSON. Paste it
somewhere safe now and then; clearing Safari website data wipes `localStorage`.
