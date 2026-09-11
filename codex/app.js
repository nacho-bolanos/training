(function () {
'use strict';
const KEY = 'training.codex.v1';
const make = (id,name,sets,min,max,increment,kind,cue,setup,progression,pose,each=false) => ({id,name,sets,min,max,repRange:[min,max],increment,kind,cue,setup,progression,pose,each});
const A = [
make('squat','Goblet squat',3,10,12,5,'lbs','Sit between your hips; keep your whole foot planted.','Hold one dumbbell at your chest.','Reach 12 on all sets, then add 5 lb.','squat'),
make('bench','Dumbbell bench press',3,8,12,5,'lbs','Keep shoulder blades together and wrists above elbows.','Lie on a flat bench; log the weight of ONE dumbbell.','Reach 12 on all sets, then add 5 lb per dumbbell.','bench'),
make('lat','Lat pulldown',3,8,12,1,'plate','Pull elbows toward your ribs without leaning back.','Adjust thigh pad; record stack plate number 1–16.','Reach 12 on all sets, then move up one plate.','pull'),
make('step','Dumbbell step-up',2,10,10,5,'lbs','Drive through the foot on the step; lower slowly.','Use a stable low step; log ONE dumbbell. Do both legs per set.','Reach 10 per leg on both sets, then add 5 lb.','lunge',true),
make('face','Cable face pull',3,12,15,1,'plate','Pull the rope toward your eyes, elbows wide.','Set pulley at eye level; record plate number 1–16.','Reach 15 on all sets, then move up one plate.','row'),
make('plank','Plank',3,30,40,0,'sec','Squeeze glutes and keep ribs tucked.','Elbows below shoulders; start the hold timer when ready.','Build every hold to 40 seconds with steady form.','plank')
];
const B = [
make('rdl','Dumbbell RDL',3,10,12,5,'lbs','Push hips back; keep weights close and your back long.','Soft knees; log the weight of ONE dumbbell.','Reach 12 on all sets, then add 5 lb per dumbbell.','hinge'),
make('row','Seated cable row',3,8,12,1,'plate','Pull elbows back without rocking your torso.','Feet braced; record stack plate number 1–16.','Reach 12 on all sets, then move up one plate.','row'),
make('press','Seated dumbbell shoulder press',3,8,10,5,'lbs','Keep ribs down as you press overhead.','Sit against an upright bench; log ONE dumbbell.','Reach 10 on all sets, then add 5 lb per dumbbell.','press'),
make('split','Bulgarian split squat',3,8,10,5,'lbs','Lower straight down; keep the front knee tracking toes.','Rear foot on a low bench; log ONE dumbbell. Do both legs.','Reach 10 per leg on all sets, then add 5 lb.','lunge',true),
make('curl','Curl and triceps extension',2,12,12,5,'lbs','Keep upper arms still; control both movements.','Complete 12 curls and 12 extensions per set; log ONE dumbbell.','Reach 12 on both movements in both sets, then add 5 lb.','curl'),
make('bug','Dead bug',3,10,12,0,'none','Keep your lower back down as opposite limbs extend.','Lie on your back, knees and arms up; alternate sides.','Build to 12 controlled reps on every set.','bug')
];
const EXERCISES = [...A,...B];
const loaded = e => e.kind === 'lbs' || e.kind === 'plate';
function formatUnit(e,value) {
  if (value == null) return '—';
  if (e.kind === 'plate') return `plate ${value}`;
  if (e.kind === 'lbs') return `${value} lb`;
  if (e.kind === 'sec') return `${value} sec`;
  if (e.kind === 'none') return 'bodyweight';
  return `${value} reps`;
}
function lastExercise(sessions,id) {
  for (let i=sessions.length-1;i>=0;i--) {
    const sets = sessions[i].exercises[id];
    if (sets && sets.length) return sets;
  }
  return null;
}
function suggest(e,sessions) {
  const sets = lastExercise(sessions,e.id);
  if (!sets) return {load:null,reps:e.min,previous:null,increase:false};
  const current = sets[sets.length-1].load;
  const hit = sets.length === e.sets && sets.every(s=>s.reps>=e.max && s.load===current);
  const next = loaded(e) && hit ? Math.min(e.kind==='plate'?16:Infinity,current+e.increment) : current;
  const increase = loaded(e) && hit && next>current;
  return {load:loaded(e)?next:null,reps:increase?e.min:Math.min(e.max,Math.max(e.min,sets[0].reps)),previous:sets,increase};
}
const remaining = (end,now=Date.now()) => Math.max(0,Math.ceil((end-now)/1000));
const elapsed = (start,now=Date.now()) => Math.max(0,Math.floor((now-start)/1000));
function dayProgram(date) {
  const day = date.getDay();
  if (day===0 || day===6) return 'Off';
  if (day===2 || day===4) return 'Walk';
  const days = Math.round((Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())-Date.UTC(2026,0,5))/86400000);
  return ((Math.floor(days/7)*3 + (day-1)/2)%2+2)%2===0 ? 'A':'B';
}
function exportLog(state) {
  return 'STEADY — WORKOUT LOG\nDumbbell loads are per ONE dumbbell. Cable loads are stack plate numbers.\n\n' + state.sessions.map(s=>`${s.date} · Session ${s.type}\n`+Object.entries(s.exercises).map(([id,sets])=>{
    const e=EXERCISES.find(e=>e.id===id);
    return `${e.name}: `+sets.map((v,i)=>`set ${i+1}: ${loaded(e)?formatUnit(e,v.load)+' × ':''}${v.reps}${e.kind==='sec'?' sec':' reps'}${e.each?' each leg':''}${e.kind==='none'?' (bodyweight)':''}`).join('; ');
  }).join('\n')).join('\n\n')+'\n\nRAW JSON\n'+JSON.stringify(state,null,2);
}
const core={KEY,A,B,EXERCISES,formatUnit,lastExercise,suggest,remaining,elapsed,dayProgram,exportLog};
if (typeof module!=='undefined') module.exports=core;
if (typeof document==='undefined') return;
const {animate,animateView,spring}=Motion;
const app = new Framework7({el:'#app',theme:'ios',name:'Steady',id:'training.codex',view:{iosDynamicNavbar:false}});
app.views.create('.view-main');
let state=JSON.parse(localStorage.getItem(KEY)||'null')||{version:1,restSeconds:90,sessions:[],active:null};
let selected=new Date(),tab='week',restSheet=null,holdStart=null,holdBeep=false,audio=null;
let animations=[];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const screen=document.querySelector('#screen');
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
const sessionExercises=()=>state.active.type==='A'?A:B;
const currentExercise=()=>sessionExercises()[state.active.exercise];
function beep(){
  navigator.vibrate?.(100);
  if (!audio) return;
  const osc=audio.createOscillator(),gain=audio.createGain();
  osc.connect(gain);gain.connect(audio.destination);osc.frequency.value=740;
  gain.gain.setValueAtTime(.12,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.25);
  osc.start();osc.stop(audio.currentTime+.26);
}
function unlock(){const Audio=window.AudioContext||window.webkitAudioContext;if(Audio){audio ||= new Audio();audio.resume();}}
// Every pose shares one path topology. Motion interpolates the actual joint coordinates.
const poses={
 squat:[[60,24,60,55,45,77,39,105,75,77,82,105,43,42,58,37,77,42,62,37],[60,44,60,70,38,78,39,105,82,78,82,105,43,62,58,57,77,62,62,57]],
 bench:[[38,66,74,66,87,85,88,106,62,89,59,106,48,39,48,20,68,39,68,20],[38,66,74,66,87,85,88,106,62,89,59,106,34,60,45,43,79,60,68,43]],
 pull:[[60,25,60,64,43,82,40,104,77,82,81,104,40,20,34,5,80,20,86,5],[60,25,60,64,43,82,40,104,77,82,81,104,34,48,43,37,86,48,77,37]],
 lunge:[[60,23,60,60,46,80,35,108,76,83,94,86,47,51,43,72,73,51,77,72],[60,42,60,75,37,77,35,108,79,102,94,86,47,67,43,86,73,67,77,86]],
 row:[[60,27,64,65,43,78,25,101,80,83,95,102,42,46,21,45,43,48,21,48],[60,27,64,65,43,78,25,101,80,83,95,102,79,49,54,56,80,52,54,59]],
 plank:[[28,61,68,69,88,77,107,90,87,76,106,89,25,88,9,88,29,88,14,88],[28,58,68,65,88,75,107,90,87,74,106,89,25,88,9,88,29,88,14,88]],
 hinge:[[59,24,60,60,48,83,45,109,72,83,77,109,47,49,43,72,74,49,77,72],[31,55,66,69,50,88,45,109,75,88,77,109,34,77,32,96,43,77,40,96]],
 press:[[60,29,60,68,43,83,39,108,77,83,81,108,35,42,35,23,85,42,85,23],[60,29,60,68,43,83,39,108,77,83,81,108,46,16,48,3,74,16,72,3]],
 curl:[[60,24,60,62,48,85,45,109,72,85,77,109,43,49,42,74,77,49,78,74],[60,24,60,62,48,85,45,109,72,85,77,109,43,49,51,29,77,49,69,29]],
 bug:[[30,83,67,83,70,56,93,55,72,57,94,58,40,59,41,38,48,60,49,39],[30,83,67,83,88,87,110,90,72,57,94,58,17,80,3,74,48,60,49,39]]
};
function body(p){const [x,y,hx,hy,kx,ky,fx,fy,k2x,k2y,f2x,f2y,ex,ey,wx,wy,e2x,e2y,w2x,w2y]=p;return `M ${x} ${y} L ${hx} ${hy} M ${hx} ${hy} L ${kx} ${ky} L ${fx} ${fy} M ${hx} ${hy} L ${k2x} ${k2y} L ${f2x} ${f2y} M ${x} ${y+6} L ${ex} ${ey} L ${wx} ${wy} M ${x} ${y+6} L ${e2x} ${e2y} L ${w2x} ${w2y}`;}
function figure(e,hero=false){const p=poses[e.pose][0];return `<svg class="${hero?'hero-figure':'figure'}" viewBox="0 0 120 120" role="img" aria-label="${e.name} movement illustration" data-pose="${e.pose}"><path class="equipment" d="M 9 113 L 111 113${e.pose==='bench'?' M 26 73 L 82 73 M 32 73 L 32 106':e.pose==='row'?' M 13 29 L 13 71':e.pose==='pull'?' M 26 5 L 94 5':''}"/><circle cx="${p[0]}" cy="${p[1]-11}" r="7" fill="#a64c32"/><path class="body" d="${body(p)}"/></svg>`;}
function startAnimations(){
  animations.forEach(a=>a.stop());animations=[];
  if(reduced.matches)return;
  screen.querySelectorAll('[data-pose]').forEach(svg=>{
    const pair=poses[svg.dataset.pose];
    animations.push(animate(0,1,{duration:1.8,repeat:Infinity,repeatType:'reverse',ease:'easeInOut',onUpdate:t=>{
      const p=pair[0].map((v,i)=>v+(pair[1][i]-v)*t);
      svg.querySelector('.body').setAttribute('d',body(p));svg.querySelector('circle').setAttribute('cx',p[0]);svg.querySelector('circle').setAttribute('cy',p[1]-11);
    }}));
  });
  screen.querySelectorAll('.spark path').forEach(path=>animations.push(animate(path,{pathLength:[0,1]},{duration:.8})));
}
reduced.addEventListener('change',()=>{render();});
function change(update,selector){
  if(reduced.matches){update();return;}
  screen.querySelectorAll('[style*="view-transition-name"]').forEach(el=>el.style.viewTransitionName='');
  if(selector){const before=screen.querySelector(selector);if(before)before.style.viewTransitionName='exercise-title';}
  animateView(()=>{update();if(selector){const after=screen.querySelector(selector);if(after)after.style.viewTransitionName='exercise-title';}},{duration:.3}).new({opacity:[0,1]});
}
const dateKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
function prescription(e){return `${e.sets} × ${e.min}${e.max!==e.min?'–'+e.max:''} ${e.kind==='sec'?'sec':'reps'}${e.each?' / leg':''}`;}
function lastLine(e){const s=lastExercise(state.sessions,e.id);return s?`Last time · ${loaded(e)?formatUnit(e,s.at(-1).load)+' · ':''}${s.map(v=>v.reps).join(' / ')} ${e.kind==='sec'?'sec':'reps'}`:'No previous sets';}
function renderWeek(){
 const monday=new Date(selected);monday.setDate(monday.getDate()-((monday.getDay()+6)%7));
 const type=dayProgram(selected);
 screen.innerHTML=`<div class="eyebrow">A little stronger, every week</div><h1>Make time.<br>Find your steady.</h1><div class="week">${Array.from({length:7},(_,i)=>{const d=new Date(monday);d.setDate(d.getDate()+i);return `<button class="day ${dateKey(d)===dateKey(selected)?'selected':''}" data-date="${dateKey(d)}" aria-label="${d.toDateString()}, ${dayProgram(d)}" aria-pressed="${dateKey(d)===dateKey(selected)}">${['M','T','W','T','F','S','S'][i]}<strong>${d.getDate()}</strong><small>${dayProgram(d)}</small></button>`;}).join('')}</div><p class="muted">${selected.toLocaleDateString('en',{weekday:'long',month:'long',day:'numeric'})}</p><h2>${type==='Off'?'Room to recover':type==='Walk'?'An hour on the incline':'Session '+type}</h2>${type==='Off'?'<p class="empty">Take the day off. Your next session will be here.</p>':type==='Walk'?'<div class="card-pad"><div class="eyebrow">60 minutes</div><h2>Incline walk</h2><p>Set a comfortable pace and settle into your walk.</p></div>':`<p class="muted">${(type==='A'?A:B).reduce((n,e)=>n+e.sets,0)} sets · Dumbbells: lb per hand · Cables: plate number</p><div class="list media-list"><ul>${(type==='A'?A:B).map(e=>`<li><a href="#" class="item-link item-content" data-start="${e.id}"><div class="item-media">${figure(e)}</div><div class="item-inner"><div class="item-title"><span class="exercise-name" data-name="${e.id}">${e.name}</span><span class="last">${prescription(e)}<br>${lastLine(e)}</span></div></div></a></li>`).join('')}</ul></div><button class="button button-fill" data-start="${(type==='A'?A:B)[0].id}">${state.active?'Resume session '+state.active.type:'Begin session '+type}</button>`}<p class="offline-status" id="offline-status"></p>`;
 updateOffline();
}
function renderGuided(){
 const a=state.active,e=currentExercise(),history=state.sessions.filter(s=>s.id!==a.id),s=suggest(e,history),record=state.sessions.find(s=>s.id===a.id),sets=record.exercises[e.id]||[],previous=sets.at(-1),total=sessionExercises().reduce((n,e)=>n+e.sets,0),done=Object.values(record.exercises).reduce((n,s)=>n+s.length,0);
 screen.innerHTML=`<button class="button button-outline nav-back" data-action="week">Back to week</button><div class="eyebrow">Session ${a.type} · Exercise ${a.exercise+1} of 6</div><h1 class="exercise-name" data-name="${e.id}">${e.name}</h1><div class="session-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}"><span style="width:${done/total*100}%"></span></div><p class="muted">${done} / ${total} sets complete · Set ${sets.length+1} of ${e.sets}</p>${figure(e,true)}<p class="cue">${e.cue}</p><p class="muted">${e.setup}</p><div class="card-pad"><p class="muted">${s.previous?(s.increase?'Ready to progress · '+formatUnit(e,s.load)+' · reset to '+e.min+' reps':'Stay with '+(loaded(e)?formatUnit(e,s.load):e.kind==='sec'?'your hold target':'bodyweight')+' · '+s.previous.map(v=>v.reps).join(' / ')+' '+(e.kind==='sec'?'seconds':'reps')+' to beat'):'First time · '+(loaded(e)?'choose a comfortable starting load':'start at the bottom of the range')}</p><div class="fields ${loaded(e)?'':'single'}">${loaded(e)?field('load',e.kind==='plate'?'Stack plate (1–16)':'ONE dumbbell · lb',previous?.load??s.load??'',e.increment,e.kind==='plate'?1:0,e.kind==='plate'?16:999):''}${field('reps',e.kind==='sec'?'Actual seconds':e.each?'Reps per leg':'Reps',previous?.reps??s.reps,1,1,999)}</div>${e.kind==='sec'?'<button class="button button-outline" data-action="hold">Start hold · target '+e.max+'s</button><div class="hold-number" id="hold-time" aria-live="off">0s</div>':''}<p id="input-error" role="alert"></p><button class="button button-fill" data-action="complete">Complete set ${sets.length+1}</button></div><p class="muted">${e.progression}</p>`;
}
function field(id,label,value,step,min,max){return `<label>${label}<div class="step-control"><button data-field="${id}" data-step="-${step}" aria-label="Decrease ${label}">−</button><input id="${id}" type="number" inputmode="numeric" min="${min}" max="${max}" step="${step}" value="${value}" aria-label="${label}"><button data-field="${id}" data-step="${step}" aria-label="Increase ${label}">+</button></div></label>`;}
function renderProgress(){
 const entries=EXERCISES.map(e=>({e,history:state.sessions.filter(s=>s.exercises[e.id]?.length).map(s=>s.exercises[e.id].at(-1))})).filter(v=>v.history.length);
 screen.innerHTML='<div class="eyebrow">Your work, over time</div><h1>Small steps.<br>Real progress.</h1>'+(!entries.length?'<p class="empty">No sets logged yet. Complete your first set to begin.</p>':entries.map(({e,history})=>{
 const values=history.map(s=>loaded(e)?s.load:s.reps),first=values[0],current=values.at(-1),gain=current-first,min=Math.min(...values),range=Math.max(...values)-min||1;
 const unit=loaded(e)?e:{kind:e.kind==='sec'?'sec':'reps'};
 const path=values.map((v,i)=>`${i?'L':'M'} ${values.length===1?150:4+i/(values.length-1)*292} ${56-(v-min)/range*46}`).join(' ')+(values.length===1?' l .1 0':'');
 return `<div class="card-pad"><h3>${e.name}</h3><p class="muted">${e.kind==='lbs'?'Weight of ONE dumbbell':e.kind==='plate'?'Stack plate number':e.kind==='sec'?'Hold duration':'Bodyweight · repetitions'}</p><div class="stats"><div><strong>${formatUnit(unit,current)}</strong><div class="muted">Current ${loaded(e)?'load':'performance'}</div></div><div><strong>${gain>=0?'+':''}${e.kind==='plate'?gain+' plates':formatUnit(unit,gain)}</strong><div class="muted">Since first session</div></div></div><svg class="spark" viewBox="0 0 300 64" role="img" aria-label="${e.name} history: ${values.map(v=>formatUnit(unit,v)).join(', ')}"><path d="${path}" stroke-linecap="round"/></svg></div>`;
 }).join(''));
}
function render(){if(tab==='guided'&&state.active)renderGuided();else if(tab==='progress')renderProgress();else renderWeek();startAnimations();}
function begin(id){unlock();if(!state.active){const type=dayProgram(selected);if(!['A','B'].includes(type))return;const list=type==='A'?A:B;const sid=String(Date.now());state.sessions.push({id:sid,date:dateKey(selected),type,exercises:{}});state.active={id:sid,type,exercise:Math.max(0,list.findIndex(e=>e.id===id)),restEnd:null};}tab='guided';change(render,`[data-name="${currentExercise().id}"]`);if(state.active.restEnd)openRest();}
async function complete(){
 if(holdStart!==null){document.querySelector('#input-error').textContent='Stop the hold first to record its actual duration.';return;}
 const e=currentExercise(),a=state.active,reps=Number(document.querySelector('#reps').value),input=document.querySelector('#load'),load=input?Number(input.value):null;
 if(!Number.isInteger(reps)||reps<1||reps>999||(input&&(input.value===''||!Number.isFinite(load)||load<(e.kind==='plate'?1:0)||load>(e.kind==='plate'?16:999)||(e.kind==='plate'&&!Number.isInteger(load))))){document.querySelector('#input-error').textContent='Enter valid reps and a load'+(e.kind==='plate'?' from plate 1 to 16.':'.');return;}
 unlock();navigator.vibrate?.(35);
 const record=state.sessions.find(s=>s.id===a.id);(record.exercises[e.id] ||= []).push({load,reps});
 const list=sessionExercises();let next=a.exercise;
 if(record.exercises[e.id].length>=e.sets){next=list.findIndex(ex=>(record.exercises[ex.id]?.length||0)<ex.sets);}
 if(next===-1){record.completed=true;state.active=null;save();document.querySelector('[data-action="complete"]').disabled=true;const bar=document.querySelector('.session-progress span');bar.style.width='100%';if(!reduced.matches)await animate(bar,{scaleX:[.85,1]},{type:spring,bounce:.45,duration:.65});tab='progress';change(render);app.toast.create({text:'Session complete. Good work.',closeTimeout:2500}).open();return;}
 a.exercise=next;a.restEnd=Date.now()+state.restSeconds*1000;a.restDuration=state.restSeconds;save();render();
 if(!reduced.matches)animations.push(animate('.session-progress span',{scaleX:[.85,1]},{type:spring,bounce:.45,duration:.65}));
 openRest();
}
function openRest(){
 if(restSheet){restSheet.open();return;}
 restSheet=app.sheet.create({content:`<div class="sheet-modal"><div class="sheet-modal-inner"><div class="eyebrow">Breathe. Reset.</div><h2>Rest between sets</h2><div class="timer-wrap"><svg class="ring" viewBox="0 0 200 200"><circle cx="100" cy="100" r="86"/><circle class="drain" cx="100" cy="100" r="86" stroke-dasharray="540.354"/></svg><div class="timer-label"><span id="rest-time"></span><small>SECONDS REMAINING</small></div></div><button class="button button-fill" id="skip-rest">Skip rest</button></div></div>`,backdrop:true,closeByBackdropClick:false,swipeToClose:false});restSheet.open();document.querySelector('#skip-rest').onclick=finishRest;tick();
}
function finishRest(){if(state.active){state.active.restEnd=null;save();}if(restSheet){restSheet.close();restSheet=null;}}
function tick(){
 const a=state.active;
 if(a?.restEnd){const left=remaining(a.restEnd);const label=document.querySelector('#rest-time');if(label)label.textContent=left;const ring=document.querySelector('.drain');if(ring)ring.style.strokeDashoffset=540.354*(1-Math.min(1,left/a.restDuration));if(left===0){beep();finishRest();}}
 if(holdStart!==null){const seconds=elapsed(holdStart),label=document.querySelector('#hold-time');if(label)label.textContent=seconds+'s';if(!holdBeep&&seconds>=currentExercise().max){holdBeep=true;beep();}}
}
function stopHold(){if(holdStart===null)return;const seconds=elapsed(holdStart);holdStart=null;document.querySelector('#reps').value=seconds;document.querySelector('[data-action="hold"]').textContent='Start hold again';}
function settings(){
 const sheet=app.sheet.create({content:`<div class="sheet-modal"><div class="sheet-modal-inner"><h2>Make it yours</h2><label for="rest-setting">Rest between sets</label><select id="rest-setting">${[60,90,120,150].map(n=>`<option value="${n}" ${state.restSeconds===n?'selected':''}>${n} seconds</option>`).join('')}</select><button class="button button-outline" id="export">Export readable log + JSON</button><button class="button button-outline" id="clear">Clear history</button><button class="button button-fill sheet-close">Done</button></div></div>`,backdrop:true});sheet.open();
 document.querySelector('#rest-setting').onchange=event=>{state.restSeconds=Number(event.target.value);save();};
 document.querySelector('#export').onclick=()=>{const url=URL.createObjectURL(new Blob([exportLog(state)],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='steady-workout-log.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 document.querySelector('#clear').onclick=()=>app.dialog.confirm('Delete all saved sets and the current session?','Clear history',()=>{holdStart=null;finishRest();state.sessions=[];state.active=null;save();sheet.close();tab='progress';change(render);});
}
screen.addEventListener('click',event=>{
 const target=event.target.closest('button,a');if(!target)return;event.preventDefault();
 if(target.dataset.date){selected=new Date(target.dataset.date+'T12:00:00');change(render);}
 if(target.dataset.start)begin(target.dataset.start);
 if(target.dataset.field){const input=document.getElementById(target.dataset.field);input.value=Math.max(Number(input.min),Math.min(Number(input.max),Number(input.value)+Number(target.dataset.step)));}
 if(target.dataset.action==='complete')complete();
 if(target.dataset.action==='week'){stopHold();tab='week';change(render);}
 if(target.dataset.action==='hold'){unlock();if(holdStart!==null)stopHold();else{holdStart=Date.now();holdBeep=false;target.textContent='Stop hold & use actual seconds';tick();}}
});
document.querySelectorAll('[data-tab]').forEach(link=>link.onclick=event=>{event.preventDefault();stopHold();tab=link.dataset.tab;change(render);});
document.querySelector('#settings').onclick=event=>{event.preventDefault();settings();};
setInterval(tick,200);document.addEventListener('visibilitychange',tick);window.addEventListener('pageshow',tick);
let offlineReady=false;
function updateOffline(){const el=document.querySelector('#offline-status');if(el)el.textContent=offlineReady?'Ready for offline training':'Preparing offline access…';}
render();
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(()=>navigator.serviceWorker.ready).then(()=>{offlineReady=true;updateOffline();}).catch(()=>{const el=document.querySelector('#offline-status');if(el)el.textContent='Offline setup incomplete. Reload while connected.';});}
})();
