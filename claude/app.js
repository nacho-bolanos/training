/* Training (claude build) — program data, progression, guided mode, timers, progress.
   Pure logic lives at the top and is exported for Node tests; the UI boots only in a browser. */
'use strict';

var KEY = 'training.claude.v1';
var ANCHOR = Date.UTC(2026, 8, 7); // Monday 2026-09-07. Even weeks since here run A,B,A; odd weeks B,A,B.
var REST_OPTIONS = [60, 90, 120, 150];

/* ---------- Program ---------- */
var EX = {
  goblet: { id: 'goblet', name: 'Goblet squat', sets: 3, lo: 10, hi: 12, inc: 5, kind: 'lbs',
    cue: 'Elbows track inside the knees. Chest tall, heels down.',
    setup: 'One dumbbell held vertically against the chest. Feet a little wider than hips, toes out.',
    prog: 'Hit 12 on all three sets, add 5 lb and start again at 10.' },
  bench: { id: 'bench', name: 'Dumbbell bench press', sets: 3, lo: 8, hi: 12, inc: 5, kind: 'lbs',
    cue: 'Shoulder blades pinned to the bench. Lower until the elbows pass the torso.',
    setup: 'Flat bench, feet planted. Log the weight of one dumbbell, not the pair.',
    prog: 'Hit 12 on all three sets, add 5 lb and start again at 8.' },
  pulldown: { id: 'pulldown', name: 'Lat pulldown', sets: 3, lo: 8, hi: 12, inc: 1, kind: 'plate',
    cue: 'Pull the elbows to the back pockets. Chest up, no leaning back.',
    setup: 'Knees under the pad, wide overhand grip. Log the plate number on the stack.',
    prog: 'Hit 12 on all three sets, move the pin one plate down.' },
  stepup: { id: 'stepup', name: 'Dumbbell step-up', sets: 2, lo: 10, hi: 10, inc: 5, kind: 'lbs', each: true,
    cue: 'Drive through the whole foot on the box. Do not push off the back leg.',
    setup: 'Knee-height box, dumbbell in each hand. 10 per leg, log one dumbbell.',
    prog: 'All reps clean at 10, add 5 lb.' },
  facepull: { id: 'facepull', name: 'Cable face pull', sets: 3, lo: 12, hi: 15, inc: 1, kind: 'plate',
    cue: 'Pull to the forehead with the elbows high and out. Pause a beat.',
    setup: 'Rope at upper-chest height, step back until the stack floats. Log the plate number.',
    prog: 'Hit 15 on all three sets, move the pin one plate down. Keep it light.' },
  plank: { id: 'plank', name: 'Plank', sets: 3, lo: 30, hi: 40, inc: 0, kind: 'sec',
    cue: 'Squeeze glutes, tuck ribs, push the floor away. Stop when the hips sag.',
    setup: 'Forearms on the floor, elbows under shoulders, feet together.',
    prog: 'Target is 40 s. The timer beeps at 40; log what you actually held.' },
  rdl: { id: 'rdl', name: 'Dumbbell RDL', sets: 3, lo: 10, hi: 12, inc: 5, kind: 'lbs',
    cue: 'Hips back, soft knees, dumbbells sliding down the thighs. Flat back the whole way.',
    setup: 'Dumbbell in each hand, feet hip width. Log one dumbbell.',
    prog: 'Hit 12 on all three sets, add 5 lb and start again at 10.' },
  row: { id: 'row', name: 'Seated cable row', sets: 3, lo: 8, hi: 12, inc: 1, kind: 'plate',
    cue: 'Elbows to the hips, chest proud. No rocking from the lower back.',
    setup: 'Feet on the platform, knees slightly bent, neutral grip. Log the plate number.',
    prog: 'Hit 12 on all three sets, move the pin one plate down.' },
  press: { id: 'press', name: 'Seated dumbbell shoulder press', sets: 3, lo: 8, hi: 10, inc: 5, kind: 'lbs',
    cue: 'Press straight up, stop just short of lockout. Ribs down.',
    setup: 'Bench upright, dumbbells start at the shoulders. Log one dumbbell.',
    prog: 'Hit 10 on all three sets, add 5 lb and start again at 8. This one moves slowly.' },
  bss: { id: 'bss', name: 'Bulgarian split squat', sets: 3, lo: 8, hi: 10, inc: 5, kind: 'lbs', each: true,
    cue: 'Front shin near vertical, torso slightly forward. Lower under control.',
    setup: 'Back foot on the bench, dumbbell in each hand. 8 to 10 per leg, log one dumbbell. Log 0 for bodyweight.',
    prog: 'Hit 10 per leg on all three sets, add 5 lb.' },
  arms: { id: 'arms', name: 'Curl and triceps extension', sets: 2, lo: 12, hi: 12, inc: 5, kind: 'lbs',
    cue: 'Elbows pinned for the curl. Elbows forward for the overhead extension.',
    setup: 'One pair of dumbbells for both moves, back to back, no rest between. Log one dumbbell.',
    prog: '12 and 12 on both sets, add 5 lb.' },
  deadbug: { id: 'deadbug', name: 'Dead bug', sets: 3, lo: 10, hi: 12, inc: 0, kind: 'reps',
    cue: 'Low back pressed into the floor the entire time. Slow is the point.',
    setup: 'On your back, arms straight up, knees over hips. Opposite arm and leg reach out.',
    prog: 'Bodyweight only. Reach further and move slower before adding anything.' }
};
var SESSIONS = {
  A: ['goblet', 'bench', 'pulldown', 'stepup', 'facepull', 'plank'],
  B: ['rdl', 'row', 'press', 'bss', 'arms', 'deadbug']
};
var WALK = { id: 'walk', name: 'Incline walk', kind: 'none', sets: 1, lo: 60, hi: 60, inc: 0,
  cue: 'Steep enough that you would rather not talk. No hands on the rails.',
  setup: 'Treadmill at 10 to 12 % incline, 3 mph or so. 60 minutes.',
  prog: 'Raise the incline before the speed.' };

/* ---------- Calendar ---------- */
function pad(n) { return (n < 10 ? '0' : '') + n; }
function toISO(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function fromISO(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
function mondayOf(d) { var m = new Date(d.getFullYear(), d.getMonth(), d.getDate()); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); return m; }
function weekIndex(d) { var m = mondayOf(d); return Math.round((Date.UTC(m.getFullYear(), m.getMonth(), m.getDate()) - ANCHOR) / 604800000); }
/* 'A' | 'B' | 'walk' | 'off' */
function sessionKeyFor(d) {
  var dow = d.getDay();
  if (dow === 0 || dow === 6) return 'off';
  if (dow === 2 || dow === 4) return 'walk';
  var flip = ((weekIndex(d) % 2) + 2) % 2;
  var pattern = flip ? ['B', 'A', 'B'] : ['A', 'B', 'A'];
  return pattern[{ 1: 0, 3: 1, 5: 2 }[dow]];
}

/* ---------- Units ---------- */
function hasLoad(ex) { return ex.kind === 'lbs' || ex.kind === 'plate'; }
function unitLabel(ex) { return { lbs: 'lb', plate: 'plate', sec: 's', reps: 'reps', none: '' }[ex.kind]; }
function fmtLoad(ex, w) {
  if (w == null || !hasLoad(ex)) return '';
  return ex.kind === 'plate' ? 'plate ' + w : w + ' lb';
}
function fmtDelta(ex, d) {
  var sign = d > 0 ? '+' : d < 0 ? '−' : '';
  var n = Math.abs(d);
  if (ex.kind === 'lbs') return sign + n + ' lb';
  if (ex.kind === 'plate') return sign + n + (n === 1 ? ' plate' : ' plates');
  if (ex.kind === 'sec') return sign + n + ' s';
  return sign + n + (n === 1 ? ' rep' : ' reps');
}
function repsLabel(ex) { return ex.kind === 'sec' ? 'Seconds' : 'Reps'; }
function rangeLabel(ex) {
  var r = ex.lo === ex.hi ? '' + ex.lo : ex.lo + '–' + ex.hi;
  return ex.sets + ' × ' + r + (ex.kind === 'sec' ? ' s' : '') + (ex.each ? ' each leg' : '');
}
function maxLoad(sets) { return sets.reduce(function (m, s) { return s.w != null && s.w > m ? s.w : m; }, -Infinity); }
function repsOf(sets) { return sets.map(function (s) { return s.r; }); }
/* "40 lb × 12 / 11 / 9", "plate 8 × 12 / 12 / 12", "27 / 30 / 33 s", "12 / 12 / 12 reps" */
function fmtSets(ex, sets) {
  var reps = repsOf(sets).join(' / ');
  if (hasLoad(ex)) return fmtLoad(ex, maxLoad(sets)) + ' × ' + reps;
  if (ex.kind === 'sec') return reps + ' s';
  return reps + ' reps';
}

/* ---------- Progression ---------- */
/* Most recent session that actually contains this exercise; sessions without it are skipped. */
function lastEntry(sessions, id) {
  for (var i = sessions.length - 1; i >= 0; i--) {
    var s = sessions[i].ex && sessions[i].ex[id];
    if (s && s.length) return { session: sessions[i], sets: s };
  }
  return null;
}
/* { mode:'none'|'up'|'same'|'top', load, reps:[per-set prefill], last:[sets]|null } */
function suggest(ex, sessions) {
  var last = lastEntry(sessions, ex.id);
  var i, reps = [];
  if (!last) {
    for (i = 0; i < ex.sets; i++) reps.push(ex.lo);
    return { mode: 'none', load: null, reps: reps, last: null };
  }
  var sets = last.sets;
  var topped = sets.length >= ex.sets && sets.every(function (s) { return s.r >= ex.hi; });
  var load = hasLoad(ex) ? maxLoad(sets) : null;
  if (topped && hasLoad(ex)) {
    for (i = 0; i < ex.sets; i++) reps.push(ex.lo);
    return { mode: 'up', load: load + ex.inc, reps: reps, last: sets };
  }
  for (i = 0; i < ex.sets; i++) reps.push((sets[i] || sets[sets.length - 1]).r);
  return { mode: topped ? 'top' : 'same', load: load, reps: reps, last: sets };
}
function suggestText(ex, s) {
  if (s.mode === 'none') return hasLoad(ex) ? 'First time. Pick a load you can do for ' + ex.lo + '.' : 'First time. Target ' + ex.lo + (ex.kind === 'sec' ? ' s.' : ' reps.');
  var beat = repsOf(s.last).join(' / ');
  if (s.mode === 'up') return 'Topped the range last time (' + beat + '). Go up to ' + fmtLoad(ex, s.load) + ', back to ' + ex.lo + ' reps.';
  if (s.mode === 'top') return 'Last time ' + beat + (ex.kind === 'sec' ? ' s' : '') + '. Hold that, or go longer.';
  return 'Same ' + (hasLoad(ex) ? fmtLoad(ex, s.load) : 'as last time') + '. Beat ' + beat + (ex.kind === 'sec' ? ' s' : '') + '.';
}
/* Series for progress: one value per session that contains the exercise. */
function history(ex, sessions) {
  var out = [];
  sessions.forEach(function (s) {
    var sets = s.ex && s.ex[ex.id];
    if (!sets || !sets.length) return;
    out.push({ date: s.date, v: hasLoad(ex) ? maxLoad(sets) : Math.max.apply(null, repsOf(sets)) });
  });
  return out;
}

if (typeof module !== 'undefined') {
  module.exports = { EX, SESSIONS, WALK, sessionKeyFor, hasLoad, unitLabel, fmtLoad, fmtDelta, fmtSets, rangeLabel,
    lastEntry, suggest, suggestText, history, toISO };
}
if (typeof document === 'undefined') { /* Node: stop here */ } else { boot(); }

/* =====================================================================
   Browser app
   ===================================================================== */
function boot() {
  var app = new Framework7({ el: '#app', theme: 'ios', darkMode: false, colors: { primary: '#b4421a' } });
  app.views.create('.view-main', { router: false });
  var $ = document.querySelector.bind(document);
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var M = window.Motion;

  /* ---------- store ---------- */
  var DB = load();
  function load() {
    try { var raw = localStorage.getItem(KEY); if (raw) { var d = JSON.parse(raw); if (d && d.sessions) return d; } } catch (e) { /* corrupt or blocked: start clean */ }
    return { v: 1, rest: 90, sessions: [] };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { toast('Could not save. Storage full or blocked.'); } }
  function sessionFor(date, key, create) {
    for (var i = 0; i < DB.sessions.length; i++) if (DB.sessions[i].date === date && DB.sessions[i].key === key) return DB.sessions[i];
    if (!create) return null;
    var s = { date: date, key: key, ex: {} };
    DB.sessions.push(s);
    DB.sessions.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    return s;
  }
  function toast(t) { app.toast.create({ text: t, closeTimeout: 1800, position: 'top' }).open(); }
  function haptic(p) { try { navigator.vibrate && navigator.vibrate(p || 30); } catch (e) { /* unsupported */ } }

  /* ---------- audio ---------- */
  var ac = null;
  function ensureAudio() {
    try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) { ac = null; }
  }
  function beep(n) {
    ensureAudio();
    if (ac) {
      for (var i = 0; i < (n || 2); i++) {
        var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * 0.25;
        o.type = 'sine'; o.frequency.value = 880; o.connect(g); g.connect(ac.destination);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
        o.start(t); o.stop(t + 0.22);
      }
    }
    haptic([150, 80, 150]);
  }

  /* ---------- screens ---------- */
  var figureAnim = null;
  function show(name, update, pair) {
    var run = function () {
      document.querySelectorAll('#app .page').forEach(function (p) {
        var on = p.id === 'page-' + name;
        p.hidden = !on; p.classList.toggle('page-current', on);
      });
      if (update) update();
    };
    if (!M || !document.startViewTransition || reduced) return run();
    try {
      var vt = M.animateView(run, { duration: 0.32, ease: [0.32, 0.72, 0, 1] })
        .old({ opacity: [1, 0] }).new({ opacity: [0, 1] });
      if (pair && pair[0]) vt.add(pair[0], pair[1]).layout({ type: 'spring', bounce: 0.18, duration: 0.55 });
    } catch (e) { run(); }
  }

  /* ---------- week ---------- */
  var selected = toISO(new Date());
  var DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  function renderWeek() {
    var today = toISO(new Date());
    var mon = mondayOf(new Date());
    var strip = '';
    for (var i = 0; i < 7; i++) {
      var d = new Date(mon); d.setDate(mon.getDate() + i);
      var iso = toISO(d), key = sessionKeyFor(d);
      var logged = key === 'A' || key === 'B' ? sessionFor(iso, key) : null;
      strip += '<button class="day' + (iso === selected ? ' is-selected' : '') + (iso === today ? ' is-today' : '') + (logged ? ' is-logged' : '') +
        '" data-date="' + iso + '"><span class="day-dow">' + DOW[i] + '</span><span class="day-num">' + d.getDate() + '</span><span class="day-key">' +
        ({ A: 'A', B: 'B', walk: 'walk', off: '·' })[key] + '</span></button>';
    }
    $('#week-strip').innerHTML = strip;
    renderDay();
  }
  function renderDay() {
    var d = fromISO(selected), key = sessionKeyFor(d);
    var el = $('#day-view');
    var title = d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    if (key === 'off') { el.innerHTML = '<div class="block-title block-title-medium">' + title + '</div><div class="block day-note"><p class="lead">Rest day.</p><p>Walk, stretch, sleep. Nothing to log.</p></div>'; return; }
    if (key === 'walk') {
      el.innerHTML = '<div class="block-title block-title-medium">' + title + '</div><div class="card day-card"><div class="card-content card-content-padding">' +
        '<div class="fig fig-inline" data-fig="walk"></div><p class="lead">Incline walk · 60 min</p><p>' + WALK.setup + '</p><p class="muted">' + WALK.cue + '</p></div></div>';
      mountFigure(el.querySelector('.fig'), 'walk');
      return;
    }
    var ids = SESSIONS[key], sess = sessionFor(selected, key);
    var rows = ids.map(function (id) {
      var ex = EX[id], last = lastEntry(DB.sessions, id), done = sess && sess.ex[id] ? sess.ex[id].length : 0;
      var lastLine = last ? '<div class="item-text">Last time: ' + fmtSets(ex, last.sets) + '</div>' : '<div class="item-text muted">No history yet</div>';
      return '<li><a class="item-link item-content ex-row" data-id="' + id + '"><div class="item-inner"><div class="item-title-row"><div class="item-title ex-name" data-name="' + id + '">' + ex.name +
        '</div><div class="item-after"><span class="chip-unit chip-' + ex.kind + '">' + (unitLabel(ex) || 'body') + '</span></div></div>' +
        '<div class="item-subtitle">' + rangeLabel(ex) + (done ? ' · ' + done + '/' + ex.sets + ' done' : '') + '</div>' + lastLine + '</div></a></li>';
    }).join('');
    var total = ids.reduce(function (n, id) { return n + EX[id].sets; }, 0);
    var done = ids.reduce(function (n, id) { return n + (sess && sess.ex[id] ? sess.ex[id].length : 0); }, 0);
    el.innerHTML = '<div class="block-title block-title-medium">' + title + ' <span class="session-tag">Session ' + key + '</span></div>' +
      '<div class="list media-list inset ex-list"><ul>' + rows + '</ul></div>' +
      '<div class="block"><button class="button button-large button-fill" id="btn-start">' + (done >= total ? 'Session logged · review' : done ? 'Continue session' : 'Start session') + '</button></div>';
  }
  $('#week-strip').addEventListener('click', function (e) {
    var b = e.target.closest('.day'); if (!b) return;
    selected = b.dataset.date; renderWeek();
  });
  $('#day-view').addEventListener('click', function (e) {
    var row = e.target.closest('.ex-row');
    if (row) return startGuided(row.dataset.id, row.querySelector('.ex-name'));
    if (e.target.closest('#btn-start')) return startGuided(null, null);
  });

  /* ---------- guided ---------- */
  var G = null; // { key, date, ids, i, set }
  var wStep = null, rStep = null;
  function startGuided(exId, nameEl) {
    var key = sessionKeyFor(fromISO(selected)), ids = SESSIONS[key];
    var sess = sessionFor(selected, key);
    var i = exId ? ids.indexOf(exId) : 0;
    if (!exId) while (i < ids.length - 1 && sess && sess.ex[ids[i]] && sess.ex[ids[i]].length >= EX[ids[i]].sets) i++;
    var done = sess && sess.ex[ids[i]] ? sess.ex[ids[i]].length : 0;
    G = { key: key, date: selected, ids: ids, i: i, set: Math.min(done, EX[ids[i]].sets - 1) };
    if (!nameEl) nameEl = $('#day-view .ex-name[data-name="' + ids[i] + '"]');
    show('guided', renderGuided, [nameEl, '#g-name']);
  }
  function totalSets() { return G.ids.reduce(function (n, id) { return n + EX[id].sets; }, 0); }
  function doneSets() { var s = sessionFor(G.date, G.key); return G.ids.reduce(function (n, id) { return n + (s && s.ex[id] ? s.ex[id].length : 0); }, 0); }
  function renderGuided() {
    stopHold(false);
    var ex = EX[G.ids[G.i]], sess = sessionFor(G.date, G.key);
    /* look back past today's in-progress session, otherwise set 2 would be judged against set 1 */
    var s = suggest(ex, DB.sessions.filter(function (x) { return x !== sess; }));
    var logged = sess && sess.ex[ex.id] ? sess.ex[ex.id] : [];
    $('#g-title').textContent = 'Set ' + (G.set + 1) + ' of ' + ex.sets;
    $('#g-count').textContent = (G.i + 1) + ' / ' + G.ids.length;
    $('#g-name').textContent = ex.name;
    $('#g-range').textContent = rangeLabel(ex);
    $('#g-suggest').textContent = suggestText(ex, s);
    $('#g-suggest').className = 'g-suggest mode-' + s.mode;
    $('#g-cue').textContent = ex.cue; $('#g-setup').textContent = ex.setup; $('#g-prog').textContent = ex.prog;
    $('#g-logged').innerHTML = logged.length ? 'Logged today: ' + fmtSets(ex, logged) : '';
    var loadRow = $('#g-load-row');
    loadRow.hidden = !hasLoad(ex);
    $('#g-load-label').textContent = ex.kind === 'plate' ? 'Plate' : 'Dumbbell (lb)';
    $('#g-reps-label').textContent = repsLabel(ex);
    $('#g-hold').hidden = ex.kind !== 'sec';
    $('#hold-target').textContent = 'target ' + ex.hi + ' s';
    var lastLogged = logged[logged.length - 1];
    var w = lastLogged && lastLogged.w != null ? lastLogged.w : s.load;
    if (wStep) wStep.destroy(); if (rStep) rStep.destroy();
    wStep = app.stepper.create({ el: '#w-step', value: w == null ? 0 : w, step: ex.inc, min: 0, max: ex.kind === 'plate' ? 16 : 300, manualInputMode: true, decimalPoint: 0 });
    rStep = app.stepper.create({ el: '#r-step', value: s.reps[G.set] || ex.lo, step: 1, min: 0, max: 999, manualInputMode: true, decimalPoint: 0 });
    $('#w-input').placeholder = w == null ? '—' : '';
    $('#w-input').value = w == null ? '' : w;
    $('#r-input').value = s.reps[G.set] || ex.lo;
    $('#btn-done').textContent = isLastSet() ? 'Finish session' : 'Done set ' + (G.set + 1);
    mountFigure($('#g-fig'), ex.id);
    setProgress(doneSets() / totalSets(), false);
    $('#page-guided .page-content').scrollTop = 0;
  }
  function isLastSet() { return G.i === G.ids.length - 1 && G.set === EX[G.ids[G.i]].sets - 1; }
  function setProgress(f, spring) {
    var bar = $('#g-bar');
    if (!M) { bar.style.transform = 'scaleX(' + f + ')'; return; }
    if (!spring || reduced) return void M.animate(bar, { scaleX: f }, { duration: 0 });
    M.animate(bar, { scaleX: f }, { type: 'spring', stiffness: 260, damping: 14, mass: 0.9 });
    M.animate($('#g-bar-wrap'), { scaleY: [1, 1.9, 1] }, { duration: 0.45, ease: 'easeOut' });
  }
  $('#btn-done').addEventListener('click', function () {
    ensureAudio();
    var ex = EX[G.ids[G.i]];
    if (hold.timer) stopHold(true);
    var r = parseInt($('#r-step input').value, 10);
    var w = hasLoad(ex) ? parseFloat($('#w-step input').value) : null;
    if (isNaN(r)) return toast('Enter ' + repsLabel(ex).toLowerCase() + '.');
    if (hasLoad(ex) && isNaN(w)) return toast(ex.kind === 'plate' ? 'Enter the plate number.' : 'Enter the dumbbell weight.');
    var sess = sessionFor(G.date, G.key, true);
    (sess.ex[ex.id] = sess.ex[ex.id] || []).push(hasLoad(ex) ? { w: w, r: r } : { r: r });
    save();
    haptic(40);
    setProgress(doneSets() / totalSets(), true);
    var last = isLastSet();
    if (last) { G = null; return show('week', function () { renderWeek(); toast('Session ' + sess.key + ' logged'); }); }
    if (G.set + 1 < ex.sets) { G.set++; renderGuided(); startRest(DB.rest); }
    else { G.i++; G.set = 0; show('guided', renderGuided, [$('#g-name'), '#g-name']); setTimeout(function () { startRest(DB.rest); }, 380); }
  });
  $('#g-back').addEventListener('click', function () {
    stopHold(false); stopRest();
    G = null; show('week', renderWeek);
  });
  $('#g-skip').addEventListener('click', function () {
    stopHold(false);
    if (G.i >= G.ids.length - 1) { G = null; return show('week', renderWeek); }
    G.i++; G.set = 0; show('guided', renderGuided, [$('#g-name'), '#g-name']);
  });

  /* ---------- rest timer: remaining time is always derived from an end timestamp ---------- */
  var rest = { start: 0, end: 0, timer: null };
  var restSheet = app.sheet.create({ el: '#rest-sheet', backdrop: true, closeByBackdropClick: false, swipeToClose: false, closeByOutsideClick: false });
  var RING = 2 * Math.PI * 54;
  function startRest(secs) {
    rest.start = Date.now(); rest.end = rest.start + secs * 1000;
    renderRestChips();
    restSheet.open();
    clearInterval(rest.timer); rest.timer = setInterval(tickRest, 200); tickRest();
  }
  function stopRest() { clearInterval(rest.timer); rest.timer = null; if (restSheet.opened) restSheet.close(); }
  function tickRest() {
    if (!rest.timer) return;
    var now = Date.now(), ms = rest.end - now, total = rest.end - rest.start;
    var left = Math.max(0, Math.ceil(ms / 1000));
    $('#rest-left').textContent = left;
    $('#rest-ring').style.strokeDashoffset = RING * (1 - Math.max(0, ms) / total);
    if (ms <= 0) { stopRest(); beep(2); }
  }
  function renderRestChips() {
    $('#rest-chips').innerHTML = REST_OPTIONS.map(function (s) { return '<button class="button button-outline' + (s === DB.rest ? ' button-active' : '') + '" data-secs="' + s + '">' + s + 's</button>'; }).join('');
  }
  $('#rest-chips').addEventListener('click', function (e) {
    var b = e.target.closest('[data-secs]'); if (!b) return;
    DB.rest = +b.dataset.secs; save();
    rest.end = rest.start + DB.rest * 1000; renderRestChips(); tickRest();
    $('#btn-rest').textContent = 'Rest ' + DB.rest + 's';
  });
  $('#rest-skip').addEventListener('click', stopRest);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { tickRest(); tickHold(); } });

  /* ---------- hold timer: counts up from a start timestamp, beeps once at target ---------- */
  var hold = { start: 0, timer: null, beeped: false };
  function tickHold() {
    if (!hold.timer) return;
    var ex = EX[G.ids[G.i]], el = Math.floor((Date.now() - hold.start) / 1000);
    $('#hold-time').textContent = el;
    if (!hold.beeped && el >= ex.hi) { hold.beeped = true; beep(1); }
  }
  function stopHold(write) {
    if (!hold.timer) return;
    clearInterval(hold.timer); hold.timer = null;
    if (write) { var secs = Math.floor((Date.now() - hold.start) / 1000); rStep.setValue(secs); $('#hold-time').textContent = secs; }
    $('#hold-btn').textContent = 'Start hold'; $('#hold-btn').classList.remove('button-fill');
  }
  $('#hold-btn').addEventListener('click', function () {
    ensureAudio();
    if (hold.timer) return stopHold(true);
    hold.start = Date.now(); hold.beeped = false; $('#hold-time').textContent = '0';
    hold.timer = setInterval(tickHold, 100);
    $('#hold-btn').textContent = 'Stop'; $('#hold-btn').classList.add('button-fill');
  });

  /* ---------- settings / export / clear ---------- */
  var settingsSheet = app.sheet.create({ el: '#settings-sheet', swipeToClose: true });
  $('#btn-rest').textContent = 'Rest ' + DB.rest + 's';
  $('#btn-rest').addEventListener('click', function () { renderSettingsRest(); settingsSheet.open(); });
  function renderSettingsRest() {
    $('#settings-rest').innerHTML = REST_OPTIONS.map(function (s) { return '<button class="button button-outline' + (s === DB.rest ? ' button-active' : '') + '" data-secs="' + s + '">' + s + 's</button>'; }).join('');
  }
  $('#settings-rest').addEventListener('click', function (e) {
    var b = e.target.closest('[data-secs]'); if (!b) return;
    DB.rest = +b.dataset.secs; save(); renderSettingsRest();
    $('#btn-rest').textContent = 'Rest ' + DB.rest + 's';
  });
  var exportSheet = app.sheet.create({ el: '#export-sheet', swipeToClose: true });
  function exportText() {
    var lines = ['Training log — exported ' + new Date().toLocaleString(), ''];
    DB.sessions.forEach(function (s) {
      lines.push(s.date + '  Session ' + s.key);
      Object.keys(s.ex).forEach(function (id) { var ex = EX[id]; if (ex && s.ex[id].length) lines.push('  ' + ex.name + ': ' + fmtSets(ex, s.ex[id])); });
      lines.push('');
    });
    if (!DB.sessions.length) lines.push('(no sessions logged)', '');
    lines.push('--- raw JSON (' + KEY + ') ---', JSON.stringify(DB));
    return lines.join('\n');
  }
  document.querySelectorAll('.btn-export').forEach(function (b) {
    b.addEventListener('click', function () { $('#export-text').value = exportText(); settingsSheet.close(); exportSheet.open(); });
  });
  $('#btn-copy').addEventListener('click', function () {
    var ta = $('#export-text');
    var done = function () { toast('Copied'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(done, function () { ta.select(); });
    else { ta.select(); try { document.execCommand('copy'); done(); } catch (e) { /* user can select manually */ } }
  });
  $('#btn-clear').addEventListener('click', function () {
    app.dialog.confirm('Delete every logged session? Export first if you want a copy.', 'Clear history', function () {
      DB = { v: 1, rest: DB.rest, sessions: [] }; save();
      settingsSheet.close(); renderWeek(); renderProgress(); toast('History cleared');
    });
  });

  /* ---------- tabs ---------- */
  document.querySelectorAll('[data-go]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var to = a.dataset.go;
      document.querySelectorAll('[data-go]').forEach(function (x) { x.classList.toggle('tab-link-active', x.dataset.go === to); });
      show(to, to === 'progress' ? renderProgress : renderWeek);
    });
  });

  /* ---------- progress ---------- */
  function renderProgress() {
    var el = $('#progress-list');
    var ids = SESSIONS.A.concat(SESSIONS.B);
    var any = false;
    el.innerHTML = ids.map(function (id) {
      var ex = EX[id], h = history(ex, DB.sessions);
      if (!h.length) return '<li><div class="item-content"><div class="item-inner"><div class="item-title-row"><div class="item-title">' + ex.name + '</div><div class="item-after"><span class="chip-unit chip-' + ex.kind + '">' + (unitLabel(ex) || 'body') + '</span></div></div><div class="item-text muted">No history yet</div></div></div></li>';
      any = true;
      var cur = h[h.length - 1].v, first = h[0].v, gain = cur - first;
      var curTxt = hasLoad(ex) ? fmtLoad(ex, cur) : ex.kind === 'sec' ? cur + ' s' : cur + ' reps';
      return '<li><div class="item-content"><div class="item-inner"><div class="item-title-row"><div class="item-title">' + ex.name + '</div>' +
        '<div class="item-after stat-cur">' + curTxt + '</div></div>' +
        '<div class="item-subtitle">' + (gain ? fmtDelta(ex, gain) + ' since first session' : 'No change since first session') + ' · ' + h.length + (h.length === 1 ? ' session' : ' sessions') + '</div>' +
        sparkline(h) + '</div></div></li>';
    }).join('');
    $('#progress-empty').hidden = any;
    if (M && !reduced) el.querySelectorAll('.spark path').forEach(function (p, i) {
      M.animate(p, { pathLength: [0, 1] }, { duration: 0.9, delay: i * 0.05, ease: 'easeOut' });
    });
  }
  function sparkline(h) {
    var W = 320, H = 44, P = 4;
    var vs = h.map(function (p) { return p.v; }), lo = Math.min.apply(null, vs), hi = Math.max.apply(null, vs);
    var span = hi - lo || 1;
    var pts = h.map(function (p, i) {
      var x = h.length === 1 ? W / 2 : P + (W - 2 * P) * i / (h.length - 1);
      var y = hi === lo ? H / 2 : H - P - (H - 2 * P) * (p.v - lo) / span;
      return [x.toFixed(1), y.toFixed(1)];
    });
    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join(' ');
    var last = pts[pts.length - 1];
    return '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true"><path d="' + d + '" pathLength="1"/>' +
      '<circle cx="' + last[0] + '" cy="' + last[1] + '" r="3"/></svg>';
  }

  /* ---------- figures: joints morph between two poses ---------- */
  /* joints: [head, neck, hip, knee1, ankle1, knee2, ankle2, elbow, wrist]; viewBox 0 -8 120 108 */
  var FIG = {
    goblet: { load: true, a: [[60, 18], [60, 28], [60, 56], [60, 74], [60, 90], [60, 74], [60, 90], [52, 40], [60, 38]],
      b: [[66, 34], [63, 44], [50, 66], [68, 76], [62, 90], [68, 76], [62, 90], [56, 56], [65, 52]] },
    bench: { load: true, prop: '<rect x="18" y="58" width="80" height="6" rx="2"/><rect x="26" y="64" width="5" height="26"/><rect x="86" y="64" width="5" height="26"/>',
      a: [[26, 48], [36, 52], [70, 54], [84, 66], [90, 90], [84, 66], [90, 90], [42, 40], [42, 22]],
      b: [[26, 48], [36, 52], [70, 54], [84, 66], [90, 90], [84, 66], [90, 90], [48, 64], [44, 44]] },
    pulldown: { load: true, prop: '<rect x="40" y="70" width="34" height="5" rx="2"/><line x1="76" y1="-8" x2="76" y2="8" class="cable"/>',
      a: [[58, 16], [58, 26], [58, 60], [76, 62], [78, 90], [76, 62], [78, 90], [70, 12], [76, -2]],
      b: [[58, 16], [58, 26], [58, 60], [76, 62], [78, 90], [76, 62], [78, 90], [68, 42], [74, 28]] },
    stepup: { load: true, prop: '<rect x="70" y="72" width="44" height="18" rx="2"/>',
      a: [[44, 18], [44, 28], [44, 56], [44, 74], [44, 90], [62, 66], [78, 72], [50, 42], [50, 56]],
      b: [[86, 0], [86, 10], [86, 38], [86, 56], [86, 72], [88, 56], [94, 72], [92, 24], [92, 38]] },
    facepull: { load: true, prop: '<line x1="112" y1="-8" x2="112" y2="30" class="cable"/>',
      a: [[54, 20], [54, 30], [54, 58], [58, 74], [54, 90], [50, 74], [56, 90], [70, 32], [86, 30]],
      b: [[54, 20], [54, 30], [54, 58], [58, 74], [54, 90], [50, 74], [56, 90], [74, 22], [62, 26]] },
    plank: { load: false, a: [[18, 60], [30, 66], [66, 70], [88, 74], [108, 88], [88, 74], [108, 88], [30, 90], [46, 90]],
      b: [[18, 58], [30, 64], [64, 64], [88, 72], [108, 88], [88, 72], [108, 88], [30, 90], [46, 90]] },
    rdl: { load: true, a: [[60, 18], [60, 28], [60, 56], [60, 74], [60, 90], [60, 74], [60, 90], [62, 42], [62, 54]],
      b: [[32, 40], [40, 46], [68, 58], [64, 74], [60, 90], [64, 74], [60, 90], [46, 58], [48, 72]] },
    row: { load: true, prop: '<rect x="30" y="62" width="30" height="5" rx="2"/><rect x="94" y="56" width="6" height="34" rx="2"/><line x1="100" y1="44" x2="120" y2="44" class="cable"/>',
      a: [[50, 20], [50, 30], [50, 60], [74, 62], [92, 70], [74, 62], [92, 70], [66, 42], [82, 44]],
      b: [[46, 22], [48, 32], [50, 60], [74, 62], [92, 70], [74, 62], [92, 70], [42, 46], [58, 48]] },
    press: { load: true, prop: '<rect x="40" y="68" width="34" height="5" rx="2"/><rect x="38" y="30" width="5" height="40" rx="2"/>',
      a: [[60, 16], [60, 26], [60, 60], [76, 62], [78, 90], [76, 62], [78, 90], [70, 38], [70, 24]],
      b: [[60, 16], [60, 26], [60, 60], [76, 62], [78, 90], [76, 62], [78, 90], [64, 10], [64, -4]] },
    bss: { load: true, prop: '<rect x="4" y="66" width="32" height="6" rx="2"/><rect x="8" y="72" width="4" height="18"/><rect x="28" y="72" width="4" height="18"/>',
      a: [[64, 18], [64, 28], [64, 56], [66, 74], [70, 90], [46, 70], [30, 66], [66, 44], [66, 56]],
      b: [[60, 30], [60, 40], [58, 66], [74, 78], [70, 90], [46, 82], [30, 66], [62, 54], [62, 66]] },
    arms: { load: true, a: [[60, 18], [60, 28], [60, 56], [60, 74], [60, 90], [60, 74], [60, 90], [62, 44], [64, 58]],
      b: [[60, 18], [60, 28], [60, 56], [60, 74], [60, 90], [60, 74], [60, 90], [62, 44], [70, 34]] },
    deadbug: { load: false, prop: '<line x1="4" y1="90" x2="116" y2="90" class="floor"/>',
      a: [[16, 82], [28, 82], [64, 82], [70, 64], [84, 66], [70, 64], [84, 66], [34, 66], [36, 52]],
      b: [[16, 82], [28, 82], [64, 82], [82, 78], [100, 86], [70, 64], [84, 66], [22, 70], [10, 62]] },
    walk: { load: false, prop: '<line x1="0" y1="96" x2="120" y2="74" class="floor"/>',
      a: [[62, 18], [62, 28], [60, 56], [72, 70], [80, 82], [50, 72], [42, 88], [54, 42], [66, 48]],
      b: [[64, 16], [64, 26], [62, 54], [52, 70], [46, 84], [74, 70], [82, 78], [70, 40], [58, 50]] }
  };
  var SEG = [[1, 2], [2, 3], [3, 4], [2, 5], [5, 6], [1, 7], [7, 8]];
  function lerp(a, b, t) { return a.map(function (p, i) { return [p[0] + (b[i][0] - p[0]) * t, p[1] + (b[i][1] - p[1]) * t]; }); }
  function poseD(P) { return SEG.map(function (s) { return 'M' + P[s[0]][0].toFixed(1) + ' ' + P[s[0]][1].toFixed(1) + 'L' + P[s[1]][0].toFixed(1) + ' ' + P[s[1]][1].toFixed(1); }).join(''); }
  function mountFigure(el, id) {
    if (!el) return;
    if (figureAnim) { figureAnim.stop(); figureAnim = null; }
    var f = FIG[id];
    el.innerHTML = '<svg viewBox="0 -8 120 108" aria-hidden="true"><g class="prop">' + (f.prop || '') + '</g>' +
      '<path class="body" d=""/><circle class="head" r="6"/>' + (f.load ? '<circle class="load" r="4.5"/>' : '') + '</svg>';
    var body = el.querySelector('.body'), head = el.querySelector('.head'), load = el.querySelector('.load');
    var draw = function (t) {
      var P = lerp(f.a, f.b, t);
      body.setAttribute('d', poseD(P));
      head.setAttribute('cx', P[0][0]); head.setAttribute('cy', P[0][1]);
      if (load) { load.setAttribute('cx', P[8][0]); load.setAttribute('cy', P[8][1]); }
    };
    draw(0);
    if (!M || reduced) return;
    var anim = M.animate(0, 1, { duration: 1.3, repeat: Infinity, repeatType: 'reverse', repeatDelay: 0.35, ease: 'easeInOut', onUpdate: draw });
    figureAnim = { stop: function () { anim.stop(); } };
  }

  /* ---------- boot ---------- */
  renderWeek();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(function () { /* offline install is optional in dev */ });
}
