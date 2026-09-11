/* Unit tests for progression and unit formatting. Run: node --test claude/test.js */
const test = require('node:test');
const assert = require('node:assert/strict');
const T = require('./app.js');
const { EX, suggest, suggestText, lastEntry, fmtLoad, fmtDelta, fmtSets, unitLabel, history, sessionKeyFor } = T;

const S = (date, key, ex) => ({ date, key, ex });
const sets = (w, ...reps) => reps.map((r) => (w == null ? { r } : { w, r }));

test('bench 3x12 at 40 suggests 45 lb, back to bottom of range', () => {
  const s = suggest(EX.bench, [S('2026-09-07', 'A', { bench: sets(40, 12, 12, 12) })]);
  assert.equal(s.mode, 'up');
  assert.equal(s.load, 45);
  assert.deepEqual(s.reps, [8, 8, 8]);
  assert.equal(fmtLoad(EX.bench, s.load), '45 lb');
  assert.match(suggestText(EX.bench, s), /45 lb/);
});

test('lat pulldown 3x12 at plate 8 suggests plate 9, never "9 lb"', () => {
  const s = suggest(EX.pulldown, [S('2026-09-07', 'A', { pulldown: sets(8, 12, 12, 12) })]);
  assert.equal(s.load, 9);
  assert.equal(fmtLoad(EX.pulldown, s.load), 'plate 9');
  const txt = suggestText(EX.pulldown, s);
  assert.match(txt, /plate 9/);
  assert.doesNotMatch(txt, /\blb\b/);
});

test('12/11/9 keeps the same load and shows reps to beat', () => {
  const s = suggest(EX.bench, [S('2026-09-07', 'A', { bench: sets(40, 12, 11, 9) })]);
  assert.equal(s.mode, 'same');
  assert.equal(s.load, 40);
  assert.deepEqual(s.reps, [12, 11, 9]);
  assert.match(suggestText(EX.bench, s), /Beat 12 \/ 11 \/ 9/);
});

test('fewer sets than planned does not count as topping the range', () => {
  const s = suggest(EX.bench, [S('2026-09-07', 'A', { bench: sets(40, 12, 12) })]);
  assert.equal(s.mode, 'same');
  assert.equal(s.load, 40);
});

test('sessions without the exercise are skipped when looking back', () => {
  const hist = [
    S('2026-09-02', 'A', { bench: sets(40, 12, 12, 12) }),
    S('2026-09-04', 'B', { rdl: sets(50, 12, 12, 12) }),
    S('2026-09-07', 'A', { goblet: sets(30, 10, 10, 10) }) // session A but bench was skipped
  ];
  assert.equal(lastEntry(hist, 'bench').session.date, '2026-09-02');
  const s = suggest(EX.bench, hist);
  assert.equal(s.mode, 'up');
  assert.equal(s.load, 45);
});

test('no history: no suggested load, reps prefilled at the bottom of the range', () => {
  const s = suggest(EX.bench, []);
  assert.equal(s.mode, 'none');
  assert.equal(s.load, null);
  assert.deepEqual(s.reps, [8, 8, 8]);
  assert.equal(fmtLoad(EX.bench, s.load), '');
});

test('time-based and bodyweight exercises never suggest a load', () => {
  const p = suggest(EX.plank, [S('2026-09-07', 'A', { plank: sets(null, 40, 40, 40) })]);
  assert.equal(p.mode, 'top');
  assert.equal(p.load, null);
  const d = suggest(EX.deadbug, [S('2026-09-07', 'B', { deadbug: sets(null, 12, 10, 10) })]);
  assert.equal(d.mode, 'same');
  assert.equal(d.load, null);
  assert.deepEqual(d.reps, [12, 10, 10]);
});

test('unit formatting per kind', () => {
  assert.equal(unitLabel(EX.bench), 'lb');
  assert.equal(unitLabel(EX.pulldown), 'plate');
  assert.equal(fmtSets(EX.bench, sets(40, 12, 11, 9)), '40 lb × 12 / 11 / 9');
  assert.equal(fmtSets(EX.pulldown, sets(8, 12, 12, 12)), 'plate 8 × 12 / 12 / 12');
  assert.equal(fmtSets(EX.plank, sets(null, 27, 30, 33)), '27 / 30 / 33 s');
  assert.equal(fmtSets(EX.deadbug, sets(null, 12, 12, 12)), '12 / 12 / 12 reps');
  assert.equal(fmtDelta(EX.bench, 10), '+10 lb');
  assert.equal(fmtDelta(EX.pulldown, 1), '+1 plate');
  assert.equal(fmtDelta(EX.pulldown, 2), '+2 plates');
  assert.equal(fmtDelta(EX.plank, 5), '+5 s');
  assert.equal(fmtDelta(EX.deadbug, 2), '+2 reps');
});

test('history series uses load for loaded lifts and max reps/seconds otherwise', () => {
  const hist = [S('2026-09-02', 'A', { bench: sets(40, 12, 12, 12), plank: sets(null, 27, 30, 33) }), S('2026-09-07', 'A', { bench: sets(45, 8, 8, 8) })];
  assert.deepEqual(history(EX.bench, hist).map((p) => p.v), [40, 45]);
  assert.deepEqual(history(EX.plank, hist).map((p) => p.v), [33]);
  assert.deepEqual(history(EX.bench, []), []);
});

test('week pattern flips weekly: A,B,A then B,A,B; Tue/Thu walk; Sat/Sun off', () => {
  const d = (s) => { const p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
  const week = (mon) => [0, 1, 2, 3, 4, 5, 6].map((i) => { const x = d(mon); x.setDate(x.getDate() + i); return sessionKeyFor(x); });
  const w1 = week('2026-09-07'), w2 = week('2026-09-14');
  assert.deepEqual([w1[0], w1[2], w1[4]].join(''), 'ABA');
  assert.deepEqual([w2[0], w2[2], w2[4]].join(''), 'BAB');
  assert.deepEqual([w1[1], w1[3], w1[5], w1[6]], ['walk', 'walk', 'off', 'off']);
});
