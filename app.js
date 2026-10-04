/* DUNK RR — vanilla JS PWA. Data stays in localStorage; no account/backend required. */
const APP_VERSION = 3;
const STORAGE_KEY = 'dunk-rr-state-v1';
const WEEKLY_POSITIVE_CAP = 210;
const MAX_WEEKLY_RANKUPS = 3;
const MISS_PENALTY = 10;
const RANK_COUNT = 25;
const TOTAL_MAX_RATING = RANK_COUNT * 100 - 1;

const RANKS = [
  ['Iron', 1], ['Iron', 2], ['Iron', 3],
  ['Bronze', 1], ['Bronze', 2], ['Bronze', 3],
  ['Silver', 1], ['Silver', 2], ['Silver', 3],
  ['Gold', 1], ['Gold', 2], ['Gold', 3],
  ['Platinum', 1], ['Platinum', 2], ['Platinum', 3],
  ['Diamond', 1], ['Diamond', 2], ['Diamond', 3],
  ['Ascendant', 1], ['Ascendant', 2], ['Ascendant', 3],
  ['Immortal', 1], ['Immortal', 2], ['Immortal', 3],
  ['Radiant', null]
].map(([tier, div], index) => ({
  index, tier, div,
  name: div ? `${tier} ${div}` : 'Radiant',
  file: div ? `${tier.toLowerCase()}${div}.png` : 'radiant.png',
  wiki: div
    ? `https://wiki.playvalorant.com/en-us/images/thumb/${tier}_${div}_Rank.png/120px-${tier}_${div}_Rank.png`
    : 'https://wiki.playvalorant.com/en-us/images/thumb/Radiant_Rank.png/120px-Radiant_Rank.png',
  mirror: `https://xpulz.com/img/game/valorant/tiers/${div ? tier.toLowerCase() + div : 'radiant'}.png`
}));

const QUERY_SUFFIX = {
  'iron1.png':'?a0496','iron2.png':'?650b8','iron3.png':'?14c95',
  'bronze1.png':'?f51a6','bronze2.png':'?c31e6','bronze3.png':'?00125',
  'silver1.png':'?ca291','silver2.png':'?7e41e','silver3.png':'?170a9',
  'gold1.png':'?170a9','gold2.png':'?8410f','gold3.png':'?7c41d',
  'platinum1.png':'?46430','platinum2.png':'?8b8bd','platinum3.png':'?b45e2',
  'diamond1.png':'?cd057','diamond2.png':'?b23a8','diamond3.png':'?e6893',
  'ascendant1.png':'?c818e','ascendant2.png':'?8b3d6','ascendant3.png':'?bc50e',
  'immortal1.png':'?d43a7','immortal2.png':'?3db80','immortal3.png':'?db712',
  'radiant.png':'?3abd1'
};
RANKS.forEach(r => { r.wiki += QUERY_SUFFIX[r.file] || ''; });

const GROUPS = {
  morning: {
    id: 'morning', title: 'ROUTINE DU MATIN', subtitle: 'Sans bruit · mobilité / coordination', kind: 'daily', days: [0,1,2,3,4,5,6], groupBonus: 5,
    exercises: [
      ex(24,'90/90 Hip Switches',24,'reps',3,'10/side · contrôlé', 'Mobilité des hanches.', 'mobility'),
      ex(25,'Deep Squat Hold',60,'seconds',3,'60 s', 'Respiration lente · pieds stables.', 'isometric'),
      ex(26,'Side Plank Twists',20,'reps',4,'10/side', 'Garde les hanches hautes.', 'core'),
      ex(27,'Équilibre sur une jambe, yeux fermés',120,'seconds',5,'60 s / jambe', 'Près d’un mur si nécessaire.', 'balance'),
      ex(28,'Reaction Ball Drop Catch',20,'reps',4,'20 catches', 'Réactions propres, pas de rebond forcé.', 'reaction'),
      ex(29,'Figure 8 entre les jambes, position basse',20,'reps',4,'20 passages', 'Reste bas et léger.', 'handles')
    ]
  },
  friday: {
    id:'friday', title:'PLIOMÉTRIE & CORE', subtitle:'Vendredi · session lourde', kind:'heavy', days:[5], groupBonus:10,
    exercises:[
      ex(1,'Pogo Jumps',75,'reps',7,'3 × 25', 'Contacts rapides, faible amplitude.', 'plyo'),
      ex(2,'Squat Jumps explosifs',36,'reps',7,'3 × 12', 'Atterrissages silencieux et stables.', 'plyo'),
      ex(3,'Fentes sautées (Split Squat Jumps)',60,'reps',8,'3 × 10 / jambe', 'Alterne les jambes.', 'plyo'),
      ex(4,'Depth Jumps',18,'reps',10,'3 × 6', 'Qualité > hauteur. Stop si fatigue technique.', 'plyo'),
      ex(5,'Planche dynamique (Plank to Push-up)',30,'reps',6,'3 × 10', 'Hanches gainées.', 'core'),
      ex(6,'Russian Twists explosifs',60,'reps',6,'3 × 20', 'Rotation contrôlée, pas de balancement.', 'core'),
      ex(7,'Deadbugs',60,'reps',6,'3 × 10 / côté', 'Lombaires au sol.', 'core'),
      ex(8,'Hollow Body Hold',90,'seconds',8,'3 × 30 s', 'Casse la série si la forme disparaît.', 'core')
    ]
  },
  saturday: {
    id:'saturday', title:'TIR, HANDLES & VISION', subtitle:'Samedi · session lourde', kind:'heavy', days:[6], groupBonus:10,
    exercises:[
      ex(9,'Pound Dribbles (haut/bas)',90,'seconds',4,'3 × 30 s', 'Intensité constante.', 'handles'),
      ex(10,'Crossovers serrés et bas',90,'seconds',5,'3 × 30 s', 'Balle sous le genou.', 'handles'),
      ex(11,'Between the legs continu',90,'seconds',5,'3 × 30 s', 'Cadence sans perte de contrôle.', 'handles'),
      ex(12,'Behind the back continu',90,'seconds',5,'3 × 30 s', 'Épaules carrées.', 'handles'),
      ex(13,'Form shooting à une main près du cercle',25,'reps',6,'25 paniers', 'Mécanique propre.', 'shooting'),
      ex(14,'Catch & Shoot / Pull-up',30,'reps',8,'30 paniers', 'Alterne catch & shoot / pull-up.', 'shooting'),
      ex(15,'Retreat dribble (recul rapide)',40,'reps',6,'20 / côté', 'Freinage + sortie propre.', 'handles'),
      ex(16,'Passes poitrine + push pass à une main contre un mur',50,'reps',5,'50 passes', 'Cadence contrôlée.', 'passing'),
      ex(17,'Vision périphérique au basket',300,'seconds',8,'5 min', 'Tête tournée, garde la balle sous contrôle.', 'vision')
    ]
  },
  sunday: {
    id:'sunday', title:'FINITION & HANDLES EN MOUVEMENT', subtitle:'Dimanche · session lourde', kind:'heavy', days:[0], groupBonus:10,
    exercises:[
      ex(18,'Mikan Drill (variante rebond offensif)',30,'reps',6,'30 paniers', 'Finis des deux côtés.', 'finishing'),
      ex(19,'Tip-in (claquette)',25,'reps',7,'25 paniers', 'Timing + extension.', 'finishing'),
      ex(20,'In-and-out dribble',40,'reps',5,'20 / côté', 'Garde le même rythme.', 'handles'),
      ex(21,'Crossover décalé style Kyrie',30,'reps',8,'30 reps', 'Travaille l’angle, pas la vitesse brute.', 'handles'),
      ex(22,'Extension layup (double-pas étendu)',20,'reps',8,'20 paniers', 'Protège la balle avec le corps.', 'finishing'),
      ex(23,'Layup avec protection de balle',20,'reps',7,'20 paniers', 'Contact imaginaire + finition.', 'finishing')
    ]
  },
  strength: {
    id:'strength', title:'FORCE SILENCIEUSE', subtitle:'Mardi + jeudi · complément, jamais obligatoire', kind:'support', days:[2,4], groupBonus:5,
    exercises:[
      ex(30,'Isometric Wall Sits',180,'seconds',6,'3 × 60 s', '90° confortable · 3 séries.', 'strength'),
      ex(31,'Slow-Eccentric Bulgarian Split Squats',48,'reps',8,'3 × 8 / jambe · 4 s descente', 'Utilise un appui stable.', 'strength'),
      ex(32,'Silent Calf Raise Holds',30,'reps',6,'15 / jambe · 2 s en haut', 'Montée haute, descente lente.', 'strength'),
      ex(33,'Glute Bridges',45,'reps',6,'3 × 15 · 2 s en haut', 'Serre les fessiers au sommet.', 'strength')
    ]
  }
};

function ex(id,name,target,unit,rr,hint,why,tags){
  return {id,name,target,unit,baseRR:rr,hint,why,tags};
}

const PRIMARY_FOR_DAY = { 0:'sunday', 1:'morning', 2:'morning', 3:'morning', 4:'morning', 5:'friday', 6:'saturday' };
const SUPPORT_FOR_DAY = { 2:'strength', 4:'strength' };

const $ = sel => document.querySelector(sel);
const screen = $('#screen');
const toast = $('#toast');
let route = 'home';
let deferredInstallPrompt = null;
let activeCounter = null;
let timerHandle = null;

function defaultState(){
  return {
    version: APP_VERSION,
    playerName: 'PLAYER',
    rating: 0,
    streak: 0,
    bestStreak: 0,
    lastOpenDate: null,
    weekly: { id: weekId(new Date()), positive: 0, rankUps: 0, heavyDays: [], weeklyBonus: false },
    daily: {},
    history: [],
    settings: { vibration: true },
    totalSessions: 0
  };
}

function loadState(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const s = {...defaultState(), ...parsed};
    s.weekly = {...defaultState().weekly, ...(parsed.weekly || {})};
    s.settings = {...defaultState().settings, ...(parsed.settings || {})};
    return s;
  } catch (_) { return defaultState(); }
}
let state = loadState();

function save(){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
}

function localDateKey(d=new Date()){
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function parseLocalKey(key){ const [y,m,d]=key.split('-').map(Number); return new Date(y,m-1,d); }
function dateDiff(a,b){ return Math.round((parseLocalKey(a)-parseLocalKey(b))/86400000); }
function weekId(date){
  const d = new Date(date.getFullYear(),date.getMonth(),date.getDate());
  const day = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - day);
  const yearStart = new Date(d.getFullYear(),0,1);
  const week = Math.ceil((((d-yearStart)/86400000)+1)/7);
  return `${d.getFullYear()}-W${String(week).padStart(2,'0')}`;
}
function today(){ return localDateKey(); }
function dayIndex(date=new Date()){ return date.getDay(); }

function syncCalendar(){
  const nowKey = today();
  if(state.weekly.id !== weekId(new Date())) state.weekly = {id:weekId(new Date()),positive:0,rankUps:0,heavyDays:[],weeklyBonus:false};

  // Protect against obvious backward-clock exploitation.
  if(state.lastOpenDate && nowKey < state.lastOpenDate) return;

  if(state.lastOpenDate && nowKey > state.lastOpenDate){
    const cursor = parseLocalKey(state.lastOpenDate);
    const now = parseLocalKey(nowKey);
    cursor.setDate(cursor.getDate()+1);
    while(cursor < now){
      settleMissedDay(localDateKey(cursor));
      cursor.setDate(cursor.getDate()+1);
    }
    // The previous open date itself is also settled once its day has ended.
    settleMissedDay(state.lastOpenDate);
  }
  state.lastOpenDate = nowKey;
  save();
}

function ensureDay(dateKey=today()){
  if(!state.daily[dateKey]) state.daily[dateKey] = {groups:{}, dailyDone:false, penaltySettled:false};
  return state.daily[dateKey];
}
function groupRecord(dateKey, groupId){
  const day = ensureDay(dateKey);
  if(!day.groups[groupId]){
    day.groups[groupId] = {counts:{}, completed:{}, awarded:{}, groupBonus:false, startedAt:null};
  }
  return day.groups[groupId];
}
function exRecord(dateKey, groupId, id){
  const g=groupRecord(dateKey,groupId);
  const key=String(id);
  if(g.counts[key] == null) g.counts[key]=0;
  if(g.completed[key] == null) g.completed[key]=false;
  if(g.awarded[key] == null) g.awarded[key]=false;
  return g;
}

function logEvent(dateKey, type, delta, reason){
  state.history.unshift({at:new Date().toISOString(),date:dateKey,type,delta,reason,rating:state.rating,rank:rankForRating(state.rating).name});
  if(state.history.length>160) state.history.length=160;
}

function rankForRating(r){
  const clamped=Math.max(0,Math.min(TOTAL_MAX_RATING,r));
  const idx=Math.min(RANK_COUNT-1,Math.floor(clamped/100));
  return RANKS[idx];
}
function rrInRank(r){ return Math.max(0, Math.min(99, r % 100)); }
function tierMultiplier(idx){
  if(idx >= 22) return .80; // Immortal
  if(idx >= 19) return .85; // Ascendant
  if(idx >= 16) return .90; // Diamond
  if(idx >= 13) return .95; // Platinum
  return 1;
}
function applyRR(amount, reason, dateKey=today(), options={}){
  const positive=amount>0;
  const before=state.rating;
  let applied=amount;

  if(positive){
    const mult = tierMultiplier(rankForRating(state.rating).index);
    applied = Math.max(1, Math.floor(amount * mult));
    applied = Math.min(applied, WEEKLY_POSITIVE_CAP - state.weekly.positive);
    const remainingUps = MAX_WEEKLY_RANKUPS - state.weekly.rankUps;
    const curIdx=rankForRating(state.rating).index;
    const maxIdx=Math.min(RANK_COUNT-1, curIdx + Math.max(0,remainingUps));
    const maxRating=Math.min(TOTAL_MAX_RATING,(maxIdx+1)*100-1);
    applied = Math.min(applied, Math.max(0,maxRating-state.rating));
    if(applied<=0) applied=0;
  }

  state.rating=Math.max(0,Math.min(TOTAL_MAX_RATING,state.rating+applied));
  if(positive) state.weekly.positive += applied;

  const beforeRank=Math.floor(before/100), afterRank=Math.floor(state.rating/100);
  if(afterRank>beforeRank) state.weekly.rankUps += (afterRank-beforeRank);
  if(applied!==0 || options.logZero) logEvent(dateKey, positive?'gain':'loss', applied, reason);

  save();
  return {applied,before,after:state.rating,promoted:afterRank>beforeRank};
}

function settleMissedDay(dateKey){
  const day=ensureDay(dateKey);
  if(day.penaltySettled) return;
  const required=PRIMARY_FOR_DAY[parseLocalKey(dateKey).getDay()];
  const done=isPrimaryDone(dateKey,required);
  if(!done){
    applyRR(-MISS_PENALTY, 'Daily miss', dateKey);
    day.penaltySettled=true;
    day.dailyDone=false;
    state.streak=0;
    save();
  } else {
    day.penaltySettled=true;
  }
}

function isPrimaryDone(dateKey, groupId){
  if(!groupId) return true;
  const rec=state.daily?.[dateKey]?.groups?.[groupId];
  if(!rec) return false;
  const group=GROUPS[groupId];
  return group.exercises.every(e=>rec.completed[String(e.id)]);
}
function isGroupDone(dateKey, groupId){ return isPrimaryDone(dateKey,groupId); }

function heavyCompletedThisWeek(){
  return state.weekly.heavyDays.length;
}
function canLogGroup(groupId,dateKey=today()){
  const group=GROUPS[groupId];
  const d=parseLocalKey(dateKey).getDay();
  if(group.kind!=='daily' && !group.days.includes(d)) return false;
  if(group.kind==='heavy' && !state.weekly.heavyDays.includes(dateKey) && heavyCompletedThisWeek()>=3) return false;
  return true;
}
function shouldBePrimary(groupId,date=new Date()) { return PRIMARY_FOR_DAY[date.getDay()]===groupId; }

function groupRRValue(exercise){ return exercise.baseRR; }
function rewardExercise(dateKey,groupId,exercise){
  const rec=exRecord(dateKey,groupId,exercise.id);
  if(rec.awarded[String(exercise.id)]) return 0;
  rec.awarded[String(exercise.id)]=true;
  rec.completed[String(exercise.id)]=true;
  const result=applyRR(groupRRValue(exercise), `${GROUPS[groupId].title} · ${exercise.name}`, dateKey);
  maybeGroupBonus(dateKey,groupId);
  return result.applied;
}

function maybeGroupBonus(dateKey,groupId){
  const group=GROUPS[groupId], rec=groupRecord(dateKey,groupId);
  if(rec.groupBonus || !isGroupDone(dateKey,groupId)) return 0;
  rec.groupBonus=true;
  const r=applyRR(group.groupBonus, `${group.title} · full group`, dateKey);
  state.totalSessions += group.kind==='heavy' ? 1 : 0;

  if(group.kind==='heavy' && !state.weekly.heavyDays.includes(dateKey)){
    state.weekly.heavyDays.push(dateKey);
    if(state.weekly.heavyDays.length>=3 && !state.weekly.weeklyBonus){
      state.weekly.weeklyBonus=true;
      applyRR(25,'Weekly limit hit · 3 heavy sessions',dateKey);
      addToast('WEEKLY LIMIT HIT · +25 RR');
    }
  }
  updateStreak(dateKey,groupId);
  save();
  return r.applied;
}

function updateStreak(dateKey,groupId){
  if(!shouldBePrimary(groupId,parseLocalKey(dateKey))) return;
  const wasDone=isPrimaryDone(dateKey,groupId);
  if(!wasDone) return;
  const day=ensureDay(dateKey);
  if(day.dailyDone) return;
  day.dailyDone=true;

  const prev = new Date(parseLocalKey(dateKey)); prev.setDate(prev.getDate()-1);
  const prevKey=localDateKey(prev);
  const prevDone = state.daily?.[prevKey]?.dailyDone;
  state.streak = prevDone ? state.streak+1 : 1;
  state.bestStreak = Math.max(state.bestStreak,state.streak);
  const milestone = ({3:5,7:10,14:15,30:25,60:40,100:60})[state.streak] || 0;
  if(milestone) applyRR(milestone,`Streak milestone · ${state.streak} days`,dateKey);
  logEvent(dateKey,'streak',0,`Streak ${state.streak} day${state.streak===1?'':'s'}`);
}

function adjustCount(dateKey,groupId,exercise,delta){
  const group=GROUPS[groupId];
  if(!canLogGroup(groupId,dateKey)) { addToast('HEAVY WEEKLY LIMIT REACHED · RECOVER'); return; }
  const rec=exRecord(dateKey,groupId,exercise.id);
  if(rec.completed[String(exercise.id)]) return;
  const old=rec.counts[String(exercise.id)] || 0;
  const next=Math.max(0,Math.min(exercise.target,old+delta));
  rec.counts[String(exercise.id)]=next;
  if(!rec.startedAt) rec.startedAt=new Date().toISOString();
  if(next>=exercise.target){
    const got=rewardExercise(dateKey,groupId,exercise);
    if(got>0) addToast(`+${got} RR · ${exercise.name}`);
    vibrate(12);
  }
  save(); render();
}

function setCountToTarget(dateKey,groupId,exercise){
  if(!canLogGroup(groupId,dateKey)) { addToast('HEAVY WEEKLY LIMIT REACHED · RECOVER'); return; }
  const rec=exRecord(dateKey,groupId,exercise.id);
  if(rec.completed[String(exercise.id)]) return;
  rec.counts[String(exercise.id)]=exercise.target;
  rewardExercise(dateKey,groupId,exercise);
}

function completeGroup(dateKey,groupId){
  if(!canLogGroup(groupId,dateKey)){ addToast('3/3 HEAVY SESSIONS DONE. RECOVER.'); return; }
  const group=GROUPS[groupId];
  let total=0;
  group.exercises.forEach(e=>{
    const rec=exRecord(dateKey,groupId,e.id);
    if(!rec.completed[String(e.id)]){ rec.counts[String(e.id)]=e.target; total += rewardExercise(dateKey,groupId,e); }
  });
  maybeGroupBonus(dateKey,groupId);
  save(); render();
  addToast(total ? `GROUP COMPLETE · +${total} RR` : 'GROUP ALREADY COMPLETE');
  vibrate(18);
}

function undoExercise(dateKey,groupId,id){
  const rec=exRecord(dateKey,groupId,id);
  // Undo is intentionally disabled once RR has been awarded; this closes the easiest double-reward exploit.
  if(rec.awarded[String(id)]){ addToast('LOCKED · RR already awarded for today'); return; }
  rec.counts[String(id)]=0; save(); render();
}

function addToast(msg){
  toast.textContent=msg; toast.classList.add('show'); clearTimeout(addToast.t);
  addToast.t=setTimeout(()=>toast.classList.remove('show'),2400);
}
function vibrate(ms){ if(state.settings.vibration && navigator.vibrate) navigator.vibrate(ms); }
function formatUnit(n,unit){
  if(unit==='seconds') return `${n}s`;
  return `${n}`;
}
function counterButtons(exercise){
  if(exercise.unit==='seconds') return `<button data-delta="-5">−5s</button><button data-delta="5">+5s</button><button data-delta="10">+10s</button><button data-delta="30">+30s</button>`;
  return `<button data-delta="-1">−1</button><button data-delta="1">+1</button><button data-delta="5">+5</button><button data-delta="10">+10</button>`;
}

function rankImg(rank, className='rank-img'){
  const local=`assets/ranks/${rank.file}`;
  const escapedLocal=local.replace(/'/g,'\\\'');
  const escapedWiki=rank.wiki.replace(/'/g,'\\\'');
  const escapedMirror=rank.mirror.replace(/'/g,'\\\'');
  return `<img class="${className}" src="${escapedLocal}" alt="${rank.name}" loading="eager" data-stage="local" data-local="${escapedLocal}" data-wiki="${escapedWiki}" data-mirror="${escapedMirror}" onerror="rankFallback(this)">`;
}
function rankFallback(img){
  const stage=img.dataset.stage || 'local';
  if(stage==='local'){
    img.dataset.stage='wiki';
    img.src=img.dataset.wiki;
    return;
  }
  if(stage==='wiki'){
    img.dataset.stage='mirror';
    img.src=img.dataset.mirror;
    return;
  }
  img.onerror=null;
  img.src='assets/icon.svg';
  img.classList.add('rank-fallback');
}
window.rankFallback=rankFallback;

function render(){
  syncCalendar();
  document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.route===route));
  if(route==='home') renderHome();
  else if(route==='workout') renderWorkout();
  else if(route==='history') renderHistory();
  else renderSettings();
}

function renderHome(){
  const dateKey=today(), day=dayIndex();
  const r=rankForRating(state.rating);
  const rr=rrInRank(state.rating);
  const primary=PRIMARY_FOR_DAY[day];
  const support=SUPPORT_FOR_DAY[day];
  const primaryDone=isPrimaryDone(dateKey,primary);
  const heavy=heavyCompletedThisWeek();
  const weekLeft=Math.max(0,WEEKLY_POSITIVE_CAP-state.weekly.positive);
  const rankUpsLeft=Math.max(0,MAX_WEEKLY_RANKUPS-state.weekly.rankUps);
  const next=r.index<RANK_COUNT-1 ? RANKS[r.index+1].name : 'MAX RANK';

  screen.innerHTML=`
    <section class="hero-card">
      <div class="rank-hero">
        <div class="rank-art">${rankImg(r)}</div>
        <div class="rank-copy">
          <div class="tiny-label">CURRENT RANK</div>
          <h2>${r.name}</h2>
          <div class="rr-line"><strong>${rr} RR</strong><span>/ 100</span></div>
          <div class="rr-bar"><i style="width:${rr}%"></i></div>
          <div class="muted">Next: ${next}</div>
        </div>
      </div>
      <div class="stat-row">
        <div><b>${state.streak}</b><span>STREAK</span></div>
        <div><b>${heavy}/3</b><span>HEAVY / WEEK</span></div>
        <div><b>${rankUpsLeft}</b><span>RANK UPS LEFT</span></div>
      </div>
    </section>

    <section class="section-head"><div><div class="eyebrow">TODAY</div><h3>${formatDay(new Date())}</h3></div><span class="badge ${primaryDone?'good':''}">${primaryDone?'COMPLETED':'REQUIRED'}</span></section>
    ${renderTodayCard(primary,dateKey,primaryDone)}
    ${support ? renderTodayCard(support,dateKey,isGroupDone(dateKey,support),true) : ''}

    <section class="grid-2">
      <div class="mini-card"><span>RR EARNED THIS WEEK</span><b>+${state.weekly.positive}</b><em>${weekLeft} available</em></div>
      <div class="mini-card"><span>BEST STREAK</span><b>${state.bestStreak} days</b><em>Keep it alive.</em></div>
    </section>

    <section class="rule-card">
      <div class="rule-title">THE CLIMB IS SUPPOSED TO HURT</div>
      <p>10 RR loss for a missed daily primary. +RR only when targets are actually reached. Heavy sessions cap at 3/week. A maximum of 3 rank-ups is allowed per week.</p>
    </section>
  `;
}

function renderTodayCard(groupId,dateKey,done,support=false){
  const group=GROUPS[groupId];
  const rec=state.daily?.[dateKey]?.groups?.[groupId];
  const completed=group.exercises.filter(e=>rec?.completed?.[String(e.id)]).length;
  const locked=group.kind==='heavy' && !canLogGroup(groupId,dateKey) && !state.weekly.heavyDays.includes(dateKey);
  return `<article class="today-card ${done?'done':''} ${locked?'locked':''}">
    <div class="today-card-head"><div><div class="eyebrow">${support?'BONUS':'PRIMARY'} · ${group.subtitle}</div><h4>${group.title}</h4></div><button class="small-btn" data-open-group="${groupId}">Open</button></div>
    <div class="progress-meta"><span>${completed}/${group.exercises.length} exercises</span><span>+${group.exercises.reduce((a,e)=>a+e.baseRR,0)+group.groupBonus} max base RR</span></div>
    <div class="progress-bar"><i style="width:${Math.round(completed/group.exercises.length*100)}%"></i></div>
    ${locked?'<div class="lock-note">3/3 heavy sessions already completed this week. Recovery lock is active.</div>':''}
  </article>`;
}

function renderWorkout(){
  const dateKey=today();
  const day=dayIndex();
  const primary=PRIMARY_FOR_DAY[day];
  const tabs=['morning','friday','saturday','sunday','strength'];
  const primaryId=primary;
  const selected=window.selectedGroup && GROUPS[window.selectedGroup] ? window.selectedGroup : primaryId;
  const group=GROUPS[selected];
  const rec=groupRecord(dateKey,selected);
  const completed=group.exercises.filter(e=>rec.completed[String(e.id)]).length;
  const locked=group.kind==='heavy' && !state.weekly.heavyDays.includes(dateKey) && heavyCompletedThisWeek()>=3;

  screen.innerHTML=`
    <section class="section-head"><div><div class="eyebrow">WORKOUT QUEUE</div><h3>Today + library</h3></div><span class="badge">${heavyCompletedThisWeek()}/3 HEAVY</span></section>
    <div class="day-tabs">${tabs.map(id=>`<button class="day-tab ${id===selected?'active':''}" data-select-group="${id}">${shortGroup(GROUPS[id])}</button>`).join('')}</div>
    <section class="workout-head-card ${locked?'locked':''}">
      <div><div class="eyebrow">${group.subtitle}</div><h2>${group.title}</h2><p>${locked?'Recovery lock: no more heavy sessions this week.':group.kind==='daily'?'This is the daily minimum that protects your streak.':group.kind==='heavy'?'Main session. Quality before volume.':'Support work. It never replaces recovery.'}</p></div>
      <button class="full-btn" data-complete-group="${selected}" ${locked?'disabled':''}>✓ COMPLETE ALL</button>
    </section>
    <section class="exercise-list">
      ${group.exercises.map(e=>renderExerciseCard(dateKey,selected,e)).join('')}
    </section>
  `;
}

function shortGroup(g){
  const x={morning:'MORNING',friday:'FRI',saturday:'SAT',sunday:'SUN',strength:'SILENT STRENGTH'}; return x[g.id];
}
function renderExerciseCard(dateKey,groupId,e){
  const rec=exRecord(dateKey,groupId,e.id), count=rec.counts[String(e.id)]||0, done=!!rec.completed[String(e.id)], pct=Math.min(100,Math.round(count/e.target*100));
  return `<button class="exercise-card ${done?'complete':''}" data-open-counter="${groupId}|${e.id}">
    <div class="exercise-index">${e.id}</div><div class="exercise-main"><div class="exercise-title">${e.name}</div><div class="exercise-sub">${e.hint}</div><div class="exercise-progress"><i style="width:${pct}%"></i></div></div><div class="exercise-right"><b>${formatUnit(count,e.unit)}</b><span>/ ${formatUnit(e.target,e.unit)}</span><em>+${e.baseRR} RR</em></div><div class="check">${done?'✓':'›'}</div>
  </button>`;
}

function renderHistory(){
  const dates=[]; const now=new Date();
  for(let i=27;i>=0;i--){ const d=new Date(now); d.setDate(d.getDate()-i); dates.push(localDateKey(d)); }
  const recent=state.history.slice(0,24);
  const weekPos=state.weekly.positive;
  screen.innerHTML=`
    <section class="section-head"><div><div class="eyebrow">TRACK RECORD</div><h3>History</h3></div><span class="badge">${weekPos}/${WEEKLY_POSITIVE_CAP} RR</span></section>
    <section class="history-card">
      <div class="heatmap">${dates.map(k=>renderDaySquare(k)).join('')}</div>
      <div class="legend"><span><i class="sq good"></i>primary done</span><span><i class="sq partial"></i>activity</span><span><i class="sq bad"></i>miss</span></div>
    </section>
    <section class="grid-2">
      <div class="mini-card"><span>TOTAL HEAVY SESSIONS</span><b>${state.totalSessions}</b><em>All-time</em></div>
      <div class="mini-card"><span>BEST STREAK</span><b>${state.bestStreak}</b><em>days</em></div>
    </section>
    <section class="section-head compact"><div><div class="eyebrow">RR FEED</div><h3>Latest changes</h3></div></section>
    <section class="event-list">${recent.length?recent.map(renderEvent).join(''):'<div class="empty">No events yet. Start today.</div>'}</section>
  `;
}
function renderDaySquare(k){
  const p=PRIMARY_FOR_DAY[parseLocalKey(k).getDay()]; const d=state.daily?.[k];
  const done=isPrimaryDone(k,p);
  const hadActivity=!!d && Object.keys(d.groups||{}).length>0;
  const cls=done?'good':hadActivity?'partial':(k<today()?'bad':'');
  return `<div class="heat-cell ${cls}" title="${k}"><span>${parseLocalKey(k).getDate()}</span></div>`;
}
function renderEvent(e){
  const sign=e.delta>0?'+':e.delta<0?'':'';
  return `<div class="event"><div><b>${e.reason}</b><span>${e.date}</span></div><strong class="${e.delta<0?'negative':''}">${sign}${e.delta}</strong></div>`;
}

function renderSettings(){
  const r=rankForRating(state.rating);
  screen.innerHTML=`
    <section class="section-head"><div><div class="eyebrow">CONTROL PANEL</div><h3>Settings</h3></div><span class="badge">${r.name}</span></section>
    <section class="settings-card">
      <label>Player name<input id="playerName" maxlength="18" value="${escapeHtml(state.playerName)}"></label>
      <label class="toggle-row"><span>Haptic feedback</span><input type="checkbox" id="vibration" ${state.settings.vibration?'checked':''}></label>
    </section>
    <section class="settings-card">
      <div class="setting-title">RANK RULES</div>
      <div class="rule-grid"><div><b>100</b><span>RR / rank</span></div><div><b>210</b><span>positive RR / week</span></div><div><b>3</b><span>max rank-ups / week</span></div><div><b>3</b><span>heavy sessions / week</span></div></div>
      <p class="muted small">High-rank gains are reduced: Platinum 95%, Diamond 90%, Ascendant 85%, Immortal/Radiant 80%. Misses are always −10 RR.</p>
    </section>
    <section class="settings-card">
      <div class="setting-title">DATA</div>
      <div class="button-row"><button class="secondary" id="exportBtn">Export backup</button><button class="secondary" id="importBtn">Import backup</button><input type="file" id="importFile" accept="application/json" hidden></div>
      <button class="danger full-width" id="resetBtn">Reset all progress</button>
    </section>
    <section class="settings-card install-card">
      <div class="setting-title">IPHONE INSTALL</div>
      <p>Open the deployed URL in Safari → Share → Add to Home Screen → turn on <b>Open as Web App</b> → Add.</p>
      <button class="full-btn" id="installHelp">Show install steps</button>
    </section>
    <footer class="footer">DUNK RR v${APP_VERSION} · Local-first PWA · Rank art sources configured from your provided URLs.</footer>
  `;
}

function escapeHtml(x){ return String(x).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c])); }
function formatDay(d){ return d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'}).toUpperCase(); }

function openCounter(groupId,id){
  const dateKey=today(), group=GROUPS[groupId], e=group.exercises.find(x=>x.id===Number(id));
  if(!e) return;
  const rec=exRecord(dateKey,groupId,e.id);
  activeCounter={dateKey,groupId,e};
  const modal=document.createElement('div');
  modal.className='modal-backdrop'; modal.id='counterModal';
  modal.innerHTML=`<div class="modal" role="dialog" aria-modal="true">
    <div class="modal-top"><button class="modal-close" id="closeModal">×</button><div><div class="eyebrow">${group.title}</div><h2>${e.name}</h2></div></div>
    <p class="muted">${e.hint}</p><div class="why">${e.why}</div>
    <div class="counter-display"><b id="counterValue">${formatUnit(rec.counts[String(e.id)]||0,e.unit)}</b><span> / ${formatUnit(e.target,e.unit)}</span></div>
    <div class="counter-bar"><i id="counterBar" style="width:${Math.round((rec.counts[String(e.id)]||0)/e.target*100)}%"></i></div>
    ${e.unit==='seconds'?'<div class="timer-row"><button id="timerToggle">▶ Timer</button><button id="timerReset">Reset timer</button></div>':''}
    <div class="counter-grid">${counterButtons(e).replace(/data-delta="([^"]+)"/g,(m,d)=>`data-counter-delta="${d}"`).replace(/<button /g,'<button class="counter-btn" ')}</div>
    <div class="modal-actions"><button class="secondary" id="counterReset">Reset count</button><button class="full-btn" id="closeDone">Done</button></div>
    <p class="micro-note">RR is awarded once when the target is reached. After award, today's count is locked.</p>
  </div>`;
  $('#modalRoot').appendChild(modal);
  $('#closeModal').onclick=closeModal; $('#closeDone').onclick=closeModal;
  $('#counterReset').onclick=()=>{undoExercise(dateKey,groupId,e.id); updateCounterModal();};
  modal.addEventListener('click',ev=>{ if(ev.target===modal) closeModal(); });
  modal.querySelectorAll('[data-counter-delta]').forEach(btn=>btn.onclick=()=>adjustCount(dateKey,groupId,e,Number(btn.dataset.counterDelta)));
  if(e.unit==='seconds'){
    $('#timerToggle').onclick=toggleTimer;
    $('#timerReset').onclick=()=>{stopTimer(); updateCounterModal();};
  }
  document.body.classList.add('modal-open');
}
function updateCounterModal(){
  if(!activeCounter) return;
  const {dateKey,groupId,e}=activeCounter; const rec=exRecord(dateKey,groupId,e.id); const count=rec.counts[String(e.id)]||0;
  const cv=$('#counterValue'), cb=$('#counterBar'); if(cv) cv.textContent=formatUnit(count,e.unit); if(cb) cb.style.width=`${Math.min(100,Math.round(count/e.target*100))}%`;
  if(rec.completed[String(e.id)]) $('#counterValue')?.classList.add('win');
}
function closeModal(){ stopTimer(); $('#counterModal')?.remove(); activeCounter=null; document.body.classList.remove('modal-open'); render(); }
function toggleTimer(){
  if(timerHandle){ stopTimer(); $('#timerToggle').textContent='▶ Timer'; return; }
  $('#timerToggle').textContent='❚❚ Pause';
  timerHandle=setInterval(()=>{ if(activeCounter) adjustCount(activeCounter.dateKey,activeCounter.groupId,activeCounter.e,1); updateCounterModal(); if(!$('#counterModal')) stopTimer(); },1000);
}
function stopTimer(){ if(timerHandle) clearInterval(timerHandle); timerHandle=null; }

function showInstallHelp(){
  addToast('Safari → Share → Add to Home Screen → Open as Web App');
}
function exportBackup(){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob), a=document.createElement('a'); a.href=url; a.download=`dunk-rr-backup-${today()}.json`; a.click(); URL.revokeObjectURL(url); addToast('BACKUP EXPORTED');
}
function importBackup(file){
  const reader=new FileReader(); reader.onload=()=>{ try{ const incoming=JSON.parse(reader.result); if(!incoming || typeof incoming.rating!=='number' || !incoming.daily) throw new Error('Invalid'); state={...defaultState(),...incoming}; state.weekly={...defaultState().weekly,...incoming.weekly}; state.settings={...defaultState().settings,...incoming.settings}; save(); render(); addToast('BACKUP IMPORTED'); }catch(_){ addToast('INVALID BACKUP FILE'); }}; reader.readAsText(file);
}

function bindGlobalEvents(){
  document.body.addEventListener('click',ev=>{
    const tab=ev.target.closest('.tab'); if(tab){ route=tab.dataset.route; render(); window.scrollTo(0,0); return; }
    const openGroup=ev.target.closest('[data-open-group]'); if(openGroup){ window.selectedGroup=openGroup.dataset.openGroup; route='workout'; render(); return; }
    const selGroup=ev.target.closest('[data-select-group]'); if(selGroup){ window.selectedGroup=selGroup.dataset.selectGroup; render(); return; }
    const complete=ev.target.closest('[data-complete-group]'); if(complete){ completeGroup(today(),complete.dataset.completeGroup); return; }
    const counter=ev.target.closest('[data-open-counter]'); if(counter){ const [gid,id]=counter.dataset.openCounter.split('|'); openCounter(gid,id); return; }
    if(ev.target.id==='quickInstall') showInstallHelp();
    if(ev.target.id==='installHelp') showInstallHelp();
    if(ev.target.id==='exportBtn') exportBackup();
    if(ev.target.id==='importBtn') $('#importFile')?.click();
    if(ev.target.id==='resetBtn'){
      if(confirm('Reset all DUNK RR progress? This cannot be undone.')){ localStorage.removeItem(STORAGE_KEY); state=defaultState(); render(); addToast('PROGRESS RESET'); }
    }
  });
  document.body.addEventListener('input',ev=>{
    if(ev.target.id==='playerName'){ state.playerName=ev.target.value||'PLAYER'; save(); }
  });
  document.body.addEventListener('change',ev=>{
    if(ev.target.id==='vibration'){ state.settings.vibration=ev.target.checked; save(); }
    if(ev.target.id==='importFile' && ev.target.files?.[0]) importBackup(ev.target.files[0]);
  });
}

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault(); deferredInstallPrompt=e; $('#quickInstall').textContent='⇩';});
$('#quickInstall').addEventListener('click',async()=>{ if(deferredInstallPrompt){ deferredInstallPrompt.prompt(); await deferredInstallPrompt.userChoice; deferredInstallPrompt=null; } else showInstallHelp(); });

syncCalendar(); bindGlobalEvents();
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
