/* ---------- figure drawing ---------- */
function pl(){
  var a = [].slice.call(arguments);
  return 'M' + a.map(function(p){return p[0]+','+p[1];}).join(' L');
}
function fig(o){
  var s = '';
  if(o.fElb) s += '<path class="armFar" d="'+pl(o.sh,o.fElb,o.fWr)+'"/>';
  if(o.fKnee) s += '<path class="legFar" d="'+pl.apply(null,[o.hip,o.fKnee,o.fAnk].concat(o.fToe?[o.fToe]:[]))+'"/>';
  s += '<path class="leg" d="'+pl(o.hip,o.knee,o.ank)+'"/>';
  if(o.toe) s += '<path class="foot" d="'+pl(o.ank,o.toe)+'"/>';
  s += '<path class="torso" d="'+pl(o.sh,o.hip)+'"/>';
  s += '<path class="neck" d="'+pl(o.sh,o.head)+'"/>';
  s += '<circle class="head" cx="'+o.head[0]+'" cy="'+o.head[1]+'" r="8"/>';
  s += '<path class="arm" d="'+pl(o.sh,o.elb,o.wr)+'"/>';
  if(o.db) s += '<circle class="load" cx="'+o.db[0]+'" cy="'+o.db[1]+'" r="'+(o.dbr||7)+'"/>';
  if(o.handle) s += '<path class="bar" d="'+pl(o.handle[0],o.handle[1])+'"/>';
  if(o.cable) s += '<path class="equip" style="opacity:.75" d="'+pl(o.cable[0],o.cable[1])+'"/>';
  return s;
}
function frames(a,b,equip){
  return (equip||'') + '<g class="pa">'+fig(a)+'</g>' +
    (b ? '<g class="pb">'+fig(b)+'</g>' : '<g class="pb"></g>');
}
var GND = '<line x1="6" y1="99" x2="134" y2="99" class="equip"/>';
var F = {};

F.goblet = frames(
  {head:[62,18], sh:[62,32], hip:[62,58], knee:[62,78], ank:[62,93], toe:[74,98],
   elb:[52,46], wr:[58,44], db:[54,43], dbr:9, fKnee:[62,78], fAnk:[62,93]},
  {head:[58,34], sh:[58,48], hip:[56,74], knee:[76,80], ank:[60,93], toe:[72,98],
   elb:[48,60], wr:[54,58], db:[50,57], dbr:9}, GND);
F.bench = frames(
  {head:[34,62], sh:[50,66], hip:[84,70], knee:[102,84], ank:[104,97], toe:[114,98],
   elb:[52,50], wr:[54,36], db:[54,34], dbr:9, fElb:[50,50], fWr:[52,36]},
  {head:[34,62], sh:[50,66], hip:[84,70], knee:[102,84], ank:[104,97], toe:[114,98],
   elb:[40,74], wr:[54,58], db:[54,56], dbr:9, fElb:[38,74], fWr:[52,58]},
  '<rect x="28" y="70" width="86" height="7" rx="3" class="pad"/>'+
  '<path class="equip" d="M36,77 L36,96 M104,77 L104,96"/>'+GND);
F.pulldown = frames(
  {head:[66,34], sh:[66,46], hip:[74,74], knee:[94,78], ank:[96,96], toe:[106,98],
   elb:[68,28], wr:[70,12], handle:[[56,12],[84,12]], cable:[[70,10],[70,12]], fElb:[66,28], fWr:[68,12]},
  {head:[66,34], sh:[66,46], hip:[74,74], knee:[94,78], ank:[96,96], toe:[106,98],
   elb:[54,52], wr:[70,42], handle:[[58,42],[84,42]], cable:[[70,10],[70,42]], fElb:[52,52], fWr:[68,42]},
  '<path class="equip" d="M124,8 L124,99 M70,9 L124,9"/>'+
  '<rect x="58" y="76" width="34" height="7" rx="3" class="pad"/>'+GND);
F.stepup = frames(
  {head:[52,22], sh:[52,36], hip:[52,62], knee:[52,80], ank:[52,94], toe:[42,98],
   elb:[48,52], wr:[48,68], db:[48,70], fKnee:[72,72], fAnk:[90,80], fToe:[100,78]},
  {head:[86,16], sh:[86,30], hip:[86,56], knee:[86,72], ank:[86,84], toe:[76,88],
   elb:[82,46], wr:[82,62], db:[82,64], fKnee:[70,68], fAnk:[60,80], fToe:[50,84]},
  '<rect x="78" y="84" width="52" height="15" rx="2" class="pad"/>'+GND);
F.facepull = frames(
  {head:[48,28], sh:[48,42], hip:[48,68], knee:[48,84], ank:[48,95], toe:[58,99],
   elb:[72,42], wr:[94,40], handle:[[94,32],[94,48]], cable:[[122,38],[94,40]], fElb:[72,46], fWr:[94,44]},
  {head:[48,28], sh:[48,42], hip:[48,68], knee:[48,84], ank:[48,95], toe:[58,99],
   elb:[74,30], wr:[58,28], handle:[[58,20],[58,36]], cable:[[122,38],[58,28]], fElb:[74,34], fWr:[58,32]},
  '<path class="equip" d="M122,6 L122,99"/>'+GND);
F.plank = frames(
  {head:[36,60], sh:[50,70], elb:[52,96], wr:[32,97], fElb:[50,96], fWr:[30,97],
   hip:[86,82], knee:[104,88], ank:[120,93], toe:[126,99]}, null, GND);
F.rdl = frames(
  {head:[62,18], sh:[62,32], hip:[62,58], knee:[62,78], ank:[62,93], toe:[74,98],
   elb:[60,48], wr:[60,64], db:[60,66], fKnee:[62,78], fAnk:[62,93]},
  {head:[30,50], sh:[44,56], hip:[76,62], knee:[70,80], ank:[64,93], toe:[76,98],
   elb:[46,70], wr:[48,82], db:[48,84]}, GND);
F.cablerow = frames(
  {head:[78,40], sh:[78,52], hip:[82,76], knee:[54,78], ank:[40,88], toe:[28,90],
   elb:[58,60], wr:[40,64], handle:[[40,58],[40,70]], cable:[[18,66],[40,64]], fElb:[58,64], fWr:[40,68]},
  {head:[78,40], sh:[78,52], hip:[82,76], knee:[54,78], ank:[40,88], toe:[28,90],
   elb:[96,62], wr:[72,60], handle:[[72,54],[72,66]], cable:[[18,66],[72,60]], fElb:[96,66], fWr:[72,64]},
  '<path class="equip" d="M18,10 L18,96 M22,96 L46,96"/>'+
  '<rect x="66" y="78" width="44" height="7" rx="3" class="pad"/>'+GND);
F.press = frames(
  {head:[70,32], sh:[70,46], hip:[86,74], knee:[62,80], ank:[58,96], toe:[46,99],
   elb:[68,30], wr:[68,14], db:[68,12], dbr:8, fElb:[66,30], fWr:[66,14]},
  {head:[70,32], sh:[70,46], hip:[86,74], knee:[62,80], ank:[58,96], toe:[46,99],
   elb:[54,52], wr:[60,36], db:[60,34], dbr:8, fElb:[52,52], fWr:[58,36]},
  '<rect x="58" y="76" width="44" height="7" rx="3" class="pad"/>'+
  '<path class="equip" d="M98,78 L90,40"/>'+GND);
F.bulgarian = frames(
  {head:[56,20], sh:[56,34], hip:[56,60], knee:[50,80], ank:[48,94], toe:[38,98],
   elb:[52,50], wr:[52,66], db:[52,68], fKnee:[78,68], fAnk:[96,72], fToe:[106,74]},
  {head:[56,36], sh:[56,50], hip:[56,74], knee:[46,86], ank:[46,94], toe:[36,98],
   elb:[52,64], wr:[52,80], db:[52,82], fKnee:[84,90], fAnk:[98,76], fToe:[108,74]},
  '<rect x="90" y="74" width="44" height="7" rx="3" class="pad"/>'+GND);
F.curl = frames(
  {head:[62,18], sh:[62,32], hip:[62,58], knee:[62,78], ank:[62,93], toe:[74,98],
   elb:[62,48], wr:[62,64], db:[62,66], fKnee:[62,78], fAnk:[62,93]},
  {head:[62,18], sh:[62,32], hip:[62,58], knee:[62,78], ank:[62,93], toe:[74,98],
   elb:[62,48], wr:[52,38], db:[50,36], fKnee:[62,78], fAnk:[62,93]}, GND);
F.deadbug = frames(
  {head:[30,86], sh:[44,92], elb:[38,76], wr:[26,64], fElb:[48,76], fWr:[48,60],
   hip:[84,92], knee:[90,68], ank:[108,66], fKnee:[104,88], fAnk:[124,92]},
  {head:[30,86], sh:[44,92], elb:[48,76], wr:[48,60], fElb:[38,76], fWr:[26,64],
   hip:[84,92], knee:[104,88], ank:[124,92], fKnee:[90,68], fAnk:[108,66]}, GND);
F.walk = frames(
  {head:[62,22], sh:[62,36], elb:[54,50], wr:[48,60], fElb:[72,48], fWr:[80,40],
   hip:[62,58], knee:[76,64], ank:[86,68], toe:[95,64], fKnee:[56,72], fAnk:[50,82], fToe:[60,80]},
  {head:[62,22], sh:[62,36], elb:[72,48], wr:[80,40], fElb:[54,50], fWr:[48,60],
   hip:[62,58], knee:[58,70], ank:[52,81], toe:[62,79], fKnee:[76,64], fAnk:[86,68], fToe:[95,64]},
  '<path d="M8,100 L132,38" class="equip"/>');

/* ---------- program ---------- */
var A = {key:'A', title:'Session A', sub:'Squat, push, pull', moves:[
  {f:'goblet', n:'Goblet squat', sets:3, lo:10, hi:12, inc:5, kind:'lbs',
   c:'Hold one dumbbell against your chest. Sit down between your knees, chest tall.',
   set:'One dumbbell, held by the top bell with both hands.',
   prog:'Top of range on all sets, then up one dumbbell.'},
  {f:'bench', n:'Dumbbell bench press', sets:3, lo:8, hi:12, inc:5, kind:'lbs',
   c:'Lower until your elbows are just below the bench line. Elbows about 45 degrees from your body.',
   set:'Flat bench. Log ONE dumbbell, not the pair.',
   prog:'Climbs fast at first. Keep adding while reps hold.'},
  {f:'pulldown', n:'Lat pulldown', sets:3, lo:8, hi:12, inc:10, kind:'lbs',
   c:'Pull the bar to your collarbone, elbows driving down. Do not lean back to finish.',
   set:'Thigh pad snug so you do not lift off the seat. Wide overhand grip.',
   prog:'Your pull-up tracker. At bodyweight for 5 reps, test a real pull-up.'},
  {f:'stepup', n:'Dumbbell step-up', sets:2, lo:10, hi:10, inc:5, kind:'lbs', each:true,
   c:'Drive through the heel of the foot on the bench. Do not push off with the trailing leg.',
   set:'Dumbbell in each hand, bench at about knee height.',
   prog:'Add weight before adding height.'},
  {f:'facepull', n:'Cable face pull', sets:3, lo:12, hi:15, inc:5, kind:'lbs',
   c:'Pull toward your forehead, elbows high and wide. Light weight, this is for shoulder health.',
   set:'Cable at head height, rope or dual handles.',
   prog:'Keep it light. Add reps before weight.'},
  {f:'plank', n:'Plank', sets:3, lo:30, hi:40, inc:5, kind:'sec', hold:true,
   c:'Squeeze glutes and brace. Hips do not sag.',
   set:'Forearms on the floor, elbows under shoulders.',
   prog:'Add 10 seconds a week to a 60 second cap, then make it harder.'}
]};

var B = {key:'B', title:'Session B', sub:'Hinge, press, row', moves:[
  {f:'rdl', n:'Dumbbell Romanian deadlift', sets:3, lo:10, hi:12, inc:5, kind:'lbs',
   c:'Push your hips back, soft knees. Stop at a strong hamstring stretch, not when your back rounds.',
   set:'Dumbbell in each hand, close to your legs. Log one dumbbell.',
   prog:'Go up slowly. Form breaks before the muscles do.'},
  {f:'cablerow', n:'Seated cable row', sets:3, lo:8, hi:12, inc:10, kind:'lbs',
   c:'Pull to your stomach, elbows past your ribs. No rocking.',
   set:'Neutral grip handle, slight bend in the knees.',
   prog:'One pin when you reach the top of the range on all sets.'},
  {f:'press', n:'Seated dumbbell shoulder press', sets:3, lo:8, hi:10, inc:5, kind:'lbs',
   c:'Press straight up, stop short of lockout. Ribs down, no lower-back arch.',
   set:'Bench upright, dumbbells starting at shoulder height. Log one dumbbell.',
   prog:'Moves slower than bench press. That is normal.'},
  {f:'bulgarian', n:'Bulgarian split squat', sets:3, lo:8, hi:10, inc:5, kind:'lbs', each:true,
   c:'Back foot on the bench, front foot far enough forward that your shin stays near vertical.',
   set:'Bodyweight for the first two weeks. Log 0 until you add dumbbells.',
   prog:'Hardest thing here. Add weight only once balance is solid.'},
  {f:'curl', n:'Curl and triceps extension', sets:2, lo:12, hi:12, inc:5, kind:'lbs',
   c:'Elbows pinned on curls. Overhead extension for triceps, elbows forward.',
   set:'One dumbbell pair for both, alternating with no rest.',
   prog:'Optional. Drop it if you are short on time.'},
  {f:'deadbug', n:'Dead bug', sets:3, lo:10, hi:12, inc:0, kind:'reps',
   c:'Low back flat on the floor the whole time. Move slowly.',
   set:'On your back, arms up, knees over hips.',
   prog:'Extend further and slower before adding anything.'}
]};

var WALK = {key:'W', title:'Incline walk', sub:'60 minutes', moves:[
  {f:'walk', n:'Incline walk', sets:1, kind:'none', hold:true,
   c:'Keep it conversational. If you cannot talk in full sentences, lower the incline or the speed.',
   set:'Treadmill. Incline you feel in your legs, breathing still easy.',
   prog:'Raise the incline before the speed.'}
], note:'<b>This is not a second workout.</b> These days exist so Wednesday and Friday still feel strong.'};

var REST = {key:'R', title:'Rest', sub:'Nothing required', moves:[],
  note:'<b>Do nothing, or walk because you feel like it.</b> Rest is when the week turns into strength.'};

var DAYS = [
  {s:'Mon', t:'lift', slot:0},{s:'Tue', t:'walk'},{s:'Wed', t:'lift', slot:1},
  {s:'Thu', t:'walk'},{s:'Fri', t:'lift', slot:2},{s:'Sat', t:'rest'},{s:'Sun', t:'rest'}
];

/* ---------- storage ---------- */
var KEY = 'training.v1';
var DB = {history:[], restSec:90, weekAB:true};
function load(){
  try{
    var raw = localStorage.getItem(KEY);
    if(raw) DB = Object.assign(DB, JSON.parse(raw));
  }catch(e){}
}
function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(DB)); }catch(e){}
}
function todayISO(){ return new Date().toISOString().slice(0,10); }
function shortDate(iso){
  var p = iso.split('-'); return (+p[1])+'/'+(+p[2]);
}

/* last recorded entry for an exercise, most recent first */
function lastEntry(name){
  for(var i=DB.history.length-1;i>=0;i--){
    var e = DB.history[i].entries[name];
    if(e && e.reps && e.reps.length) return {e:e, date:DB.history[i].date};
  }
  return null;
}
function historyFor(name){
  var out = [];
  DB.history.forEach(function(s){
    var e = s.entries[name];
    if(e && e.reps && e.reps.length) out.push({date:s.date, w:+e.w||0, reps:e.reps});
  });
  return out;
}

/* ---------- progression ---------- */
function suggest(m){
  var h = lastEntry(m.n);
  if(m.kind === 'none') return {w:null, reps:null, note:''};
  if(!h){
    if(m.kind === 'lbs') return {w:'', reps:m.lo,
      note:'First time. Pick a weight you could do about '+(m.hi+3)+' reps with, then stop at '+m.hi+'.'};
    return {w:null, reps:m.lo, note:'First time. Aim for '+m.lo+' with 2 to 3 in reserve.'};
  }
  var e = h.e;
  var reps = e.reps.map(Number).filter(function(x){return !isNaN(x);});
  var allTop = reps.length >= m.sets && reps.every(function(r){return r >= m.hi;});
  if(m.kind === 'lbs'){
    if(allTop) return {w:(+e.w||0)+m.inc, reps:m.lo,
      note:'You hit '+m.hi+' on every set at '+(+e.w||0)+' lb. Go up to '+((+e.w||0)+m.inc)+' lb and restart at '+m.lo+'.'};
    return {w:(+e.w||0), reps:Math.max.apply(null,reps),
      note:'Same '+(+e.w||0)+' lb. Last time: '+reps.join(' / ')+'. Beat the lowest set.'};
  }
  if(m.kind === 'sec'){
    if(allTop) return {w:null, reps:Math.min(m.hi+10,60),
      note:'You held '+m.hi+'s on every set. Try '+Math.min(m.hi+10,60)+'s.'};
    return {w:null, reps:Math.max.apply(null,reps), note:'Last time: '+reps.join(' / ')+' sec.'};
  }
  if(allTop) return {w:null, reps:m.hi+2, note:'Top of range last time. Add a couple of reps or slow them down.'};
  return {w:null, reps:Math.max.apply(null,reps), note:'Last time: '+reps.join(' / ')+'.'};
}

/* ---------- state ---------- */
var view = 'week';
var active = 0;
var RUN = null;

function sessionFor(slot){ return (DB.weekAB ? [A,B,A] : [B,A,B])[slot]; }
function contentFor(i){
  var d = DAYS[i];
  if(d.t==='lift') return sessionFor(d.slot);
  if(d.t==='walk') return WALK;
  return REST;
}
function doseText(m){
  if(m.kind === 'none') return '60 min';
  if(m.kind === 'sec') return m.sets+' × '+m.lo+'-'+m.hi+' sec';
  if(m.lo === m.hi) return m.sets+' × '+m.lo+(m.each?' each leg':'');
  return m.sets+' × '+m.lo+'-'+m.hi+(m.each?' each leg':'');
}
function lastLine(m){
  var h = lastEntry(m.n);
  if(!h) return '';
  var reps = h.e.reps.filter(function(x){return x!=='' && x!=null;});
  var bits = [];
  if(m.kind === 'lbs' && h.e.w !== '' && h.e.w != null) bits.push(h.e.w+' lb');
  if(reps.length) bits.push(reps.join(' / ') + (m.kind==='sec'?' sec':''));
  if(!bits.length) return '';
  return shortDate(h.date)+':  '+bits.join('  ·  ');
}

/* ---------- week view ---------- */
function renderWeek(){
  var c = contentFor(active);
  var isLift = DAYS[active].t === 'lift';
  var html = '';
  html += '<div class="topbar"><h1>Training</h1><div class="tabs">'+
    '<button data-v="week" aria-selected="true">Week</button>'+
    '<button data-v="stats" aria-selected="false">Progress</button>'+
    '</div></div>';
  html += '<div class="days">'+DAYS.map(function(d,i){
    var cc = contentFor(i);
    var tag = d.t==='lift' ? cc.key : (d.t==='walk' ? 'Walk' : 'Off');
    return '<button class="day '+d.t+'" aria-pressed="'+(i===active)+'" data-i="'+i+'">'+
      '<span>'+d.s+'</span><b>'+tag+'</b></button>';
  }).join('')+'</div>';

  html += '<div class="panelhead"><h2>'+c.title+'</h2><em>'+c.sub+'</em></div>';

  if(isLift){
    html += '<button class="start" id="startrun">Start '+c.title+'</button>';
  }

  html += '<ol class="moves">'+c.moves.map(function(m,i){
    var last = lastLine(m);
    return '<li><button class="move" data-m="'+i+'">'+
      '<svg viewBox="0 0 140 110" class="'+(m.hold?'still':'')+'" aria-hidden="true">'+F[m.f]+'</svg>'+
      '<span><span class="name">'+m.n+'</span>'+
      '<span class="dose '+(m.hold?'hold':'')+'">'+doseText(m)+'</span>'+
      '<span class="cue">'+m.c+'</span>'+
      (last?'<span class="last">'+last+'</span>':'')+
      '</span></button>'+
      '<div class="scale" data-s="'+i+'">'+
      '<div class="row"><i>Setup</i><span>'+m.set+'</span></div>'+
      '<div class="row"><i>Progress</i><span>'+m.prog+'</span></div>'+
      '</div></li>';
  }).join('')+'</ol>';

  if(c.note) html += '<p class="note">'+c.note+'</p>';

  html += '<button class="start ghost" id="swapweek">This week is '+
    (DB.weekAB?'A, B, A':'B, A, B')+'  ·  tap to flip</button>';

  html += '<footer><h3>Every session</h3><ul>'+
    '<li><b>Warm up 5 minutes</b> on the treadmill or bike, then one light set of the first exercise.</li>'+
    '<li><b>Leave 2 to 3 reps in the tank.</b> If you could have done 6 more, go heavier.</li>'+
    '<li><b>Log honestly.</b> The suggested weights are only as good as what you enter.</li>'+
    '<li><b>Weekends off.</b> Don\'t add days to make up for a missed one.</li>'+
    '</ul><h3>Where this is going</h3><ul>'+
    '<li><b>Strength and muscle:</b> fastest over the next 12 to 18 months. Noticeable in 4 to 6 weeks, visible around 10 to 12.</li>'+
    '<li><b>Belly fat:</b> no exercise removes fat from a chosen area. It comes off when total body fat does, which is a food question.</li>'+
    '</ul></footer>';

  document.getElementById('app').innerHTML = html;
}

/* ---------- stats view ---------- */
function spark(pts){
  if(pts.length < 2) return '';
  var w = 300, h = 46, pad = 4;
  var vals = pts.map(function(p){return p.v;});
  var min = Math.min.apply(null,vals), max = Math.max.apply(null,vals);
  if(max === min){ max = min + 1; }
  var step = (w - pad*2) / (pts.length - 1);
  var d = pts.map(function(p,i){
    var x = pad + i*step;
    var y = h - pad - ((p.v - min)/(max - min)) * (h - pad*2);
    return (i?'L':'M')+x.toFixed(1)+','+y.toFixed(1);
  }).join(' ');
  var dots = pts.map(function(p,i){
    var x = pad + i*step;
    var y = h - pad - ((p.v - min)/(max - min)) * (h - pad*2);
    return '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="2.6" fill="#12382C"/>';
  }).join('');
  return '<svg class="spark" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none">'+
    '<path d="'+d+'" fill="none" stroke="#12382C" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>'+
    dots+'</svg>';
}

function renderStats(){
  var html = '';
  html += '<div class="topbar"><h1>Progress</h1><div class="tabs">'+
    '<button data-v="week" aria-selected="false">Week</button>'+
    '<button data-v="stats" aria-selected="true">Progress</button>'+
    '</div></div>';

  var all = A.moves.concat(B.moves).filter(function(m){return m.kind !== 'none';});
  var any = false;
  var body = '';
  all.forEach(function(m){
    var h = historyFor(m.n);
    if(!h.length) return;
    any = true;
    var latest = h[h.length-1];
    var first = h[0];
    var unit = m.kind === 'lbs' ? ' lb' : (m.kind === 'sec' ? ' sec' : ' reps');
    var val = m.kind === 'lbs' ? latest.w : Math.max.apply(null, latest.reps.map(Number));
    var base = m.kind === 'lbs' ? first.w : Math.max.apply(null, first.reps.map(Number));
    var delta = val - base;
    var pts = h.map(function(x){
      return {v: m.kind === 'lbs' ? x.w : Math.max.apply(null, x.reps.map(Number))};
    });
    body += '<div class="stat"><div class="sh"><span class="sn">'+m.n+'</span>'+
      '<span class="sv">'+val+unit+'</span></div>'+
      '<div class="sd">'+h.length+' session'+(h.length>1?'s':'')+
      (delta>0 ? '  ·  up '+delta+unit+' since '+shortDate(first.date) : '')+
      '  ·  last '+shortDate(latest.date)+'</div>'+
      spark(pts)+'</div>';
  });

  if(!any){
    html += '<div class="empty">Nothing logged yet. Run a session and your numbers show up here.</div>';
  } else {
    html += body;
  }

  html += '<h4 class="sec">Rest timer</h4><div class="tools">'+
    ['60','90','120','150'].map(function(s){
      return '<button class="'+(String(DB.restSec)===s?'':'ghost')+'" data-rest="'+s+'">'+
        (s/60===1?'1:00':(s==='90'?'1:30':(s==='120'?'2:00':'2:30')))+'</button>';
    }).join('')+'</div>';

  html += '<h4 class="sec">Your data</h4><div class="tools">'+
    '<button id="export">Export log</button>'+
    '<button id="wipe" class="ghost">Erase everything</button></div>'+
    '<textarea id="dump" readonly></textarea>';

  document.getElementById('app').innerHTML = html;
}

function render(){
  if(view === 'week') renderWeek(); else renderStats();
}

/* ---------- run mode ---------- */
function startRun(sess){
  RUN = {sess:sess, ex:0, set:0, entries:{}, started:Date.now()};
  sess.moves.forEach(function(m){ RUN.entries[m.n] = {w:'', reps:[]}; });
  document.getElementById('run').style.display = 'block';
  document.body.style.overflow = 'hidden';
  renderRun();
}
function endRun(saveIt){
  stopTimer();
  if(saveIt){
    var any = false;
    for(var k in RUN.entries){ if(RUN.entries[k].reps.length) any = true; }
    if(any){
      DB.history.push({date:todayISO(), key:RUN.sess.key, entries:RUN.entries});
      save();
    }
  }
  RUN = null;
  document.getElementById('run').style.display = 'none';
  document.getElementById('run').innerHTML = '';
  document.body.style.overflow = '';
  render();
}

function renderRun(){
  var s = RUN.sess, m = s.moves[RUN.ex];
  var totalSets = s.moves.reduce(function(a,x){return a + x.sets;},0);
  var doneSets = 0;
  for(var i=0;i<RUN.ex;i++) doneSets += s.moves[i].sets;
  doneSets += RUN.set;
  var pct = Math.round(doneSets/totalSets*100);
  var sg = suggest(m);
  var stored = RUN.entries[m.n];
  var wVal = stored.w !== '' ? stored.w : (sg.w != null ? sg.w : '');
  var rVal = sg.reps != null ? sg.reps : '';

  var html = '<div class="runwrap">';
  html += '<div class="runtop"><button id="quit">Finish</button>'+
    '<button id="jumpnext">Skip exercise</button></div>';
  html += '<div class="progress"><i style="width:'+pct+'%"></i></div>';
  html += '<div class="card">';
  html += '<h3>'+m.n+'</h3>';
  html += '<div class="setof">Set '+(RUN.set+1)+' of '+m.sets+
    (m.each?'  ·  both legs':'')+'  ·  target '+
    (m.lo===m.hi?m.lo:(m.lo+'-'+m.hi))+(m.kind==='sec'?' sec':' reps')+'</div>';
  html += '<svg viewBox="0 0 140 110" class="'+(m.hold?'still':'')+'" aria-hidden="true">'+F[m.f]+'</svg>';
  html += '<p class="cue2">'+m.c+'</p>';
  if(sg.note) html += '<div class="sugg">'+sg.note+'</div>';

  html += '<div class="inputs">';
  if(m.kind === 'lbs'){
    html += '<div class="field"><label>Weight (lbs)</label>'+
      '<input id="w" type="number" inputmode="decimal" step="2.5" min="0" value="'+wVal+'">'+
      '<div class="step"><button data-adj="-5">−5</button><button data-adj="5">+5</button></div></div>';
  }
  html += '<div class="field"><label>'+(m.kind==='sec'?'Seconds':'Reps')+'</label>'+
    '<input id="r" type="number" inputmode="numeric" min="0" value="'+rVal+'">'+
    '<div class="step"><button data-radj="-1">−1</button><button data-radj="1">+1</button></div></div>';
  html += '</div>';

  html += '<button class="done" id="doneset">Done set '+(RUN.set+1)+'</button>';
  html += '</div>';

  if(stored.reps.length){
    html += '<p class="note" style="margin-top:14px"><b>This session so far:</b> '+
      s.moves.filter(function(x){return RUN.entries[x.n].reps.length;}).map(function(x){
        var e = RUN.entries[x.n];
        return x.n+' — '+(e.w!==''?e.w+' lb  ':'')+e.reps.join(' / ');
      }).join('<br>')+'</p>';
  }
  html += '</div>';
  document.getElementById('run').innerHTML = html;
  window.scrollTo(0,0);
}

function doneSet(){
  var m = RUN.sess.moves[RUN.ex];
  var rEl = document.getElementById('r');
  var wEl = document.getElementById('w');
  var reps = rEl && rEl.value !== '' ? rEl.value : '0';
  RUN.entries[m.n].reps.push(reps);
  if(wEl) RUN.entries[m.n].w = wEl.value;
  RUN.set++;
  var last = (RUN.ex === RUN.sess.moves.length - 1) && (RUN.set >= m.sets);
  if(RUN.set >= m.sets){ RUN.ex++; RUN.set = 0; }
  if(RUN.ex >= RUN.sess.moves.length){ endRun(true); return; }
  renderRun();
  if(!last) startTimer(DB.restSec);
}

/* ---------- timer ---------- */
var TI = null, tEnd = 0, tTotal = 0, AC = null;
function beep(){
  try{
    if(!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
    if(AC.state === 'suspended') AC.resume();
    [0,0.22].forEach(function(off){
      var o = AC.createOscillator(), g = AC.createGain();
      o.connect(g); g.connect(AC.destination);
      o.frequency.value = 880; o.type = 'sine';
      g.gain.setValueAtTime(0.0001, AC.currentTime+off);
      g.gain.exponentialRampToValueAtTime(0.25, AC.currentTime+off+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime+off+0.18);
      o.start(AC.currentTime+off); o.stop(AC.currentTime+off+0.2);
    });
  }catch(e){}
  if(navigator.vibrate) navigator.vibrate([120,80,120]);
}
function fmt(s){
  var m = Math.floor(s/60), r = s%60;
  return m+':'+(r<10?'0':'')+r;
}
function paintTimer(){
  var left = Math.max(0, Math.round((tEnd - Date.now())/1000));
  document.getElementById('tnum').textContent = fmt(left);
  document.getElementById('tbar').style.width = (left/tTotal*100)+'%';
  if(left <= 0){ stopTimer(); beep(); }
}
function startTimer(sec){
  tTotal = sec; tEnd = Date.now() + sec*1000;
  document.getElementById('timer').classList.add('on');
  document.getElementById('tlab').textContent = 'Rest';
  paintTimer();
  clearInterval(TI);
  TI = setInterval(paintTimer, 250);
  try{ if(!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if(AC.state==='suspended') AC.resume(); }catch(e){}
}
function stopTimer(){
  clearInterval(TI); TI = null;
  document.getElementById('timer').classList.remove('on');
}
document.getElementById('tskip').addEventListener('click', stopTimer);
document.getElementById('tplus').addEventListener('click', function(){
  if(!TI) return;
  tEnd += 30000; tTotal += 30; paintTimer();
});
document.addEventListener('visibilitychange', function(){ if(TI) paintTimer(); });

/* ---------- events ---------- */
document.getElementById('app').addEventListener('click', function(e){
  var t = e.target;
  var tab = t.closest('[data-v]');
  if(tab){ view = tab.dataset.v; render(); return; }
  var day = t.closest('.day');
  if(day){ active = +day.dataset.i; render(); return; }
  var mv = t.closest('.move');
  if(mv){
    var box = document.querySelector('.scale[data-s="'+mv.dataset.m+'"]');
    if(box) box.classList.toggle('open');
    return;
  }
  if(t.id === 'startrun'){ startRun(contentFor(active)); return; }
  if(t.id === 'swapweek'){ DB.weekAB = !DB.weekAB; save(); render(); return; }
  var rest = t.closest('[data-rest]');
  if(rest){ DB.restSec = +rest.dataset.rest; save(); render(); return; }
  if(t.id === 'export'){
    var out = document.getElementById('dump');
    out.value = exportText(); out.style.display = 'block'; out.select();
    if(navigator.clipboard) navigator.clipboard.writeText(out.value).catch(function(){});
    return;
  }
  if(t.id === 'wipe'){
    if(confirm('Erase every logged session? This cannot be undone.')){
      DB.history = []; save(); render();
    }
    return;
  }
});

document.getElementById('run').addEventListener('click', function(e){
  var t = e.target;
  if(t.id === 'doneset'){ doneSet(); return; }
  if(t.id === 'quit'){
    if(confirm('Finish and save this session?')) endRun(true);
    return;
  }
  if(t.id === 'jumpnext'){
    RUN.ex++; RUN.set = 0;
    if(RUN.ex >= RUN.sess.moves.length){ endRun(true); return; }
    renderRun(); return;
  }
  var adj = t.closest('[data-adj]');
  if(adj){
    var w = document.getElementById('w');
    w.value = Math.max(0, (+w.value||0) + (+adj.dataset.adj));
    return;
  }
  var radj = t.closest('[data-radj]');
  if(radj){
    var r = document.getElementById('r');
    r.value = Math.max(0, (+r.value||0) + (+radj.dataset.radj));
    return;
  }
});

function exportText(){
  var lines = ['Training log — exported '+todayISO(), ''];
  DB.history.forEach(function(s){
    lines.push(s.date+'  Session '+s.key);
    Object.keys(s.entries).forEach(function(k){
      var e = s.entries[k];
      if(!e.reps.length) return;
      lines.push('  '+k+': '+(e.w!==''&&e.w!=null?e.w+' lb  ':'')+e.reps.join(' / '));
    });
    lines.push('');
  });
  lines.push('--- raw JSON ---');
  lines.push(JSON.stringify(DB));
  return lines.join('\n');
}

load();
render();
