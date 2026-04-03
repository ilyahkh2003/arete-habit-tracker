// ARETE - ἀρετή
// A habit tracker named after Aristotle's concept of excellence through practice.
// Built by a CS student who read too much Greek philosophy during finals week.
//
// "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
// -- Aristotle, as paraphrased by Will Durant

// ── Greek domains (categories) ────────────────────────────────────────────────
// Each maps to a god. Apollo for body because he's god of health & sun.
// Hephæstus for craft because he literally forges things in his workshop.
// This is not over-engineered, this is THEMED.
const DOMAINS = {
  apollo:     { god:'Apollo',     domain:'Body & Health',      symbol:'Α', color:'#e8955a', bg:'rgba(232,149,90,0.12)' },
  athena:     { god:'Athena',     domain:'Mind & Learning',    symbol:'Θ', color:'#7ba3d4', bg:'rgba(123,163,212,0.12)' },
  dionysus:   { god:'Dionysus',   domain:'Soul & Rest',        symbol:'Δ', color:'#a880d4', bg:'rgba(168,128,212,0.12)' },
  hephaestus: { god:'Hephæstus', domain:'Craft & Work',       symbol:'Η', color:'#c4952a', bg:'rgba(196,149,42,0.12)' },
  hermes:     { god:'Hermes',     domain:'Agora & Social',     symbol:'Ε', color:'#6ab89a', bg:'rgba(106,184,154,0.12)' },
};

// symbols to use as habit icons
const SYMBOLS = ['⚔','🏛','🌿','📜','⚡','🌊','🔥','🌙','⭐','🦉','🏺','🎭','🗡','🌺','🍇','🐍','🌸','⚗','🏹','🦅','🌾','🧿','🐉','🎪','🔱','🌄','🦁','🌀','🏔','🫙'];

// The Oracle speaks.
const ORACLE = [
  { text:'We are what we repeatedly do. Excellence is not an act, but a habit.', source:'Aristotle · Nicomachean Ethics' },
  { text:'Know thyself.', source:'Delphic Oracle · Temple of Apollo' },
  { text:'Excellence is never granted to man. It is earned through toil.', source:'Hesiod · Works and Days' },
  { text:'The beginning is the most important part of any work.', source:'Plato · The Republic' },
  { text:'First say to yourself what you would be; and then do what you have to do.', source:'Epictetus · Discourses' },
  { text:'Labor omnia vincit — work conquers all.', source:'Virgil · Georgics' },
  { text:'That which does not kill us makes us stronger.', source:'Nietzsche · Twilight of the Idols' },
  { text:'The secret of change is to focus all energy not on fighting the old, but on building the new.', source:'Socrates · via Millman' },
  { text:'Endure and persist; this pain will turn to good by and by.', source:'Ovid · Amores' },
  { text:'He who conquers himself is the mightiest warrior.', source:'Confucius · Analects' },
  { text:'Not all those who wander are lost.', source:'Tolkien · The Fellowship of the Ring' },
  { text:'The most difficult thing in life is to know yourself.', source:'Thales of Miletus' },
];

// toRoman — took me 20 mins to get the subtractive notation right
// but it's worth it for the aesthetic. XLII just looks better than 42.
function toRoman(n) {
  if (!n || n <= 0) return '—';
  if (n > 3999) return n.toString(); // Myriad — the Romans gave up too
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let r = '';
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { r += syms[i]; n -= vals[i]; }
  }
  return r;
}

// Only display as Roman numeral if streak >= X (10)
// Below that, Arabic numerals are cleaner. Design decision.
const fmtStreak = n => n >= 10 ? toRoman(n) : n.toString();

// ── Date helpers ──────────────────────────────────────────────────────────────
const toStr = d => {
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
};
const todayStr = () => toStr(new Date());
const daysBefore = n => { const d = new Date(); d.setDate(d.getDate()-n); return toStr(d); };
const parseD = s => new Date(s+'T12:00:00');

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function fmtFull(s) {
  const d = parseD(s);
  return `${DAYS_FULL[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// ── Analysis functions ────────────────────────────────────────────────────────
function getStreak(hid, comp) {
  const today = todayStr();
  let cur = (comp[today]||[]).includes(hid) ? parseD(today) : (() => { const d=parseD(today); d.setDate(d.getDate()-1); return d; })();
  let n = 0;
  for (let i = 0; i < 3650; i++) {
    const s = toStr(cur);
    if ((comp[s]||[]).includes(hid)) { n++; cur.setDate(cur.getDate()-1); }
    else break;
  }
  return n;
}

function getLongest(hid, comp) {
  const dates = Object.keys(comp).filter(d=>(comp[d]||[]).includes(hid)).sort();
  if (!dates.length) return 0;
  let best=1, cur=1;
  for (let i=1; i<dates.length; i++) {
    const diff = (parseD(dates[i])-parseD(dates[i-1]))/86400000;
    cur = diff===1 ? cur+1 : 1;
    if (cur>best) best=cur;
  }
  return best;
}

function getRate30(hid, comp) {
  let n=0;
  for (let i=0;i<30;i++) if((comp[daysBefore(i)]||[]).includes(hid)) n++;
  return Math.round((n/30)*100);
}

function calc30Rate(habits, comp) {
  if (!habits.length) return 0;
  let t=0,d=0;
  for (let i=0;i<30;i++) { t+=habits.length; d+=(comp[daysBefore(i)]||[]).length; }
  return t===0 ? 0 : Math.round((d/t)*100);
}

// ── Seed data — so it doesn't look empty on first open. ──────────────────────
function seed() {
  const habits = [
    {id:'h1',name:'Morning salutation',domain:'apollo',     symbol:'🌄',created:daysBefore(55)},
    {id:'h2',name:'Study the scrolls', domain:'athena',     symbol:'📜',created:daysBefore(55)},
    {id:'h3',name:'Train the body',    domain:'apollo',     symbol:'⚔', created:daysBefore(55)},
    {id:'h4',name:'Evening reflection',domain:'dionysus',   symbol:'🌙',created:daysBefore(40)},
    {id:'h5',name:'Craft one thing',   domain:'hephaestus', symbol:'⚗', created:daysBefore(30)},
  ];
  const rates = {h1:0.82,h2:0.90,h3:0.72,h4:0.76,h5:0.68};
  const comp = {};
  for (let i=55;i>=1;i--) {
    const d = daysBefore(i);
    const done = habits.filter(h => i>=(55-parseInt(h.created.slice(-2)||30)) && Math.random()<(rates[h.id]||0.7)).map(h=>h.id);
    if (done.length) comp[d] = done;
  }
  return { habits, completions:comp };
}

// ── App state ─────────────────────────────────────────────────────────────────
let S = {
  data: null,
  view: 'today',         // today | scrolls | kleos
  modal: null,           // null | 'add' | { hid: string }
  eForm: { name:'', domain:'apollo', symbol:'⚔' },
  emojiOpen: false,
  popping: null,
  ready: false,
};

// ── Persistence ───────────────────────────────────────────────────────────────
const KEY = 'arete_v2';

async function loadData() {
  try {
    const r = await window.storage.get(KEY);
    S.data = r ? JSON.parse(r.value) : seed();
  } catch {
    S.data = seed();
  }
  S.ready = true;
  render();
}

async function persist() {
  try { await window.storage.set(KEY, JSON.stringify(S.data)); } catch {}
}

// ── Actions ───────────────────────────────────────────────────────────────────
function fireConfetti() {
  const colors = ['#c4952a', '#e8dfc8', '#b5614a', '#6b8a50', '#4a7faa'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.left = '50%';
    el.style.top = '50%';
    el.style.width = Math.random() * 6 + 4 + 'px';
    el.style.height = Math.random() * 6 + 4 + 'px';
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    el.style.zIndex = '9999';
    el.style.pointerEvents = 'none';
    document.body.appendChild(el);

    const angle = Math.random() * Math.PI * 2;
    const velocity = 5 + Math.random() * 15;
    let vx = Math.cos(angle) * velocity;
    let vy = Math.sin(angle) * velocity - 10;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let opacity = 1;
    let rot = Math.random() * 360;
    let rotSpeed = (Math.random() - 0.5) * 20;

    const animate = () => {
      vy += 0.4; // gravity
      x += vx;
      y += vy;
      opacity -= 0.012;
      rot += rotSpeed;

      el.style.transform = `translate(${x - window.innerWidth / 2}px, ${y - window.innerHeight / 2}px) rotate(${rot}deg)`;
      el.style.opacity = opacity;

      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        el.remove();
      }
    };
    requestAnimationFrame(animate);
  }
}

function toggleHabit(id) {
  const today = todayStr();
  const cur = S.data.completions[today]||[];
  const adding = !cur.includes(id);
  const newCur = adding ? [...cur,id] : cur.filter(x=>x!==id);
  S.data.completions = { ...S.data.completions, [today]: newCur };
  if (adding) {
    S.popping=id;
    setTimeout(()=>{ S.popping=null; render(); },500);
    if (newCur.length === S.data.habits.length) fireConfetti();
    playChime();
  }
  persist(); render();
}

// ── Backup ────────────────────────────────────────────────────────────────────

// ── Audio ─────────────────────────────────────────────────────────────────────
let audioCtx = null;
function playChime() {
  if (!S.data || !S.data.soundEnabled) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);

  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 1.5);
}

function toggleSound() {
  if (!S.data) return;
  S.data.soundEnabled = !S.data.soundEnabled;
  persist(); render();
}
function exportData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(S.data));
  const el = document.createElement('a');
  el.setAttribute("href", dataStr);
  el.setAttribute("download", "arete_backup_" + todayStr() + ".json");
  document.body.appendChild(el);
  el.click();
  el.remove();
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e2) => {
      try {
        const parsed = JSON.parse(e2.target.result);
        if (parsed.habits && parsed.completions) {
          if (confirm('Overwrite current scrolls with this backup?')) {
            S.data = parsed;
            await persist();
            render();
          }
        } else {
          alert('Invalid backup scroll.');
        }
      } catch (err) {
        alert('Failed to decipher the scroll.');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// ── UI Helpers ────────────────────────────────────────────────────────────────
function showTooltip(e, ds, count, total) {
  const t = document.getElementById('tooltip');
  if (!t) return;
  if (!ds) {
    t.innerHTML = 'Future';
  } else {
    const pct = total ? Math.round((count/total)*100) : 0;
    t.innerHTML = `<div style="color:var(--dim2);font-family:'Cinzel',serif;font-size:9px;margin-bottom:2px">${ds}</div>
                   <div><span style="color:var(--gold)">${count}</span>/${total} LABORS (${pct}%)</div>`;
  }
  const rect = e.target.getBoundingClientRect();
  t.style.left = (rect.left + rect.width/2) + 'px';
  t.style.top = (rect.top - 5) + 'px';
  t.style.opacity = '1';
}

function hideTooltip() {
  const t = document.getElementById('tooltip');
  if (t) t.style.opacity = '0';
}

function openAdd() {
  S.modal='add'; S.eForm={name:'',domain:'apollo',symbol:'⚔'}; S.emojiOpen=false; render();
  setTimeout(()=>document.getElementById('nm')?.focus(),50);
}
function openEdit(hid) {
  const h = S.data.habits.find(x=>x.id===hid);
  if(!h) return;
  S.modal={hid}; S.eForm={name:h.name,domain:h.domain,symbol:h.symbol}; S.emojiOpen=false; render();
  setTimeout(()=>document.getElementById('nm')?.focus(),50);
}
function closeModal() { S.modal=null; S.emojiOpen=false; render(); }

function submitHabit() {
  const name = (S.eForm.name||'').trim();
  if (!name) return;
  if (S.modal==='add') {
    const h={id:'h'+Date.now(),name,domain:S.eForm.domain,symbol:S.eForm.symbol,created:todayStr()};
    S.data.habits = [...S.data.habits, h];
  } else {
    const {hid} = S.modal;
    S.data.habits = S.data.habits.map(h=>h.id===hid?{...h,name,domain:S.eForm.domain,symbol:h.symbol}:h);
  }
  persist(); closeModal();
}

function deleteHabit(id, name) {
  if (!confirm(`Remove "${name}" from your scrolls?`)) return;
  S.data.habits = S.data.habits.filter(h=>h.id!==id);
  persist(); render();
}

// ── Render ────────────────────────────────────────────────────────────────────
function render() {
  document.getElementById('root').innerHTML = buildShell();
}

function buildShell() {
  if (!S.ready||!S.data) return `<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:var(--dim);font-family:'Cinzel',serif;font-size:13px;letter-spacing:0.2em">INVOKING THE MUSES…</div>`;

  const {habits,completions} = S.data;
  const today = todayStr();
  const done = completions[today]||[];
  const rate30 = calc30Rate(habits,completions);
  const allDone = habits.length>0 && done.length===habits.length;
  const oracle = ORACLE[new Date().getDate()%ORACLE.length];

  // Days since earliest habit created
  const daysSince = habits.length ? Math.max(...habits.map(h=>{
    const diff=(new Date()-parseD(h.created))/86400000;return Math.floor(diff);
  })) : 0;

  return `
  <style>
    #root input[type=text]{
      width:100%;background:rgba(255,255,255,0.04);border:1px solid var(--border);
      border-radius:9px;padding:10px 14px;color:var(--marble);font-size:14px;
      font-family:'IBM Plex Mono',monospace;
    }
  </style>

  <!-- ── HEADER ── -->
  <div style="padding:30px 22px 0">
    <!-- Wordmark -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
      <div>
        <div style="font-family:'Cinzel',serif;font-size:32px;font-weight:700;color:var(--marble);letter-spacing:0.15em;line-height:1">ΑΡΕΤΗ</div>
        <div style="font-family:'EB Garamond',serif;font-style:italic;font-size:13px;color:var(--dim);margin-top:3px;letter-spacing:0.05em">ἀρετή · excellence through practice</div>
      </div>
      <div style="text-align:right;padding-top:4px">
        <div style="font-family:'IBM Plex Mono',monospace;font-size:24px;font-weight:500;color:var(--gold);line-height:1">${rate30}<span style="font-size:13px;opacity:0.6">%</span></div>
        <div style="font-size:10px;color:var(--dim);margin-top:4px;letter-spacing:0.1em;font-family:'Cinzel',serif">
          30-DAY KLEOS
          <span style="cursor:pointer;margin-left:8px;font-size:12px" onclick="toggleSound()" title="Toggle Sound">
            \${S.data.soundEnabled ? '🔊' : '🔇'}
          </span>
        </div>
      </div>
    </div>

    <!-- Date & journey marker -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
      <div style="font-family:'EB Garamond',serif;font-size:14px;color:var(--dim)">${fmtFull(today)}</div>
      ${daysSince>0?`<div style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--dim2);letter-spacing:0.04em">DAY ${toRoman(daysSince)}</div>`:''}
    </div>

    <!-- Oracle quote -->
    <div style="padding:14px 16px;background:var(--gold3);border:1px solid var(--border2);border-left:2px solid rgba(196,149,42,0.4);border-radius:0 10px 10px 0;margin-bottom:6px">
      <div style="font-size:10px;color:var(--dim);font-family:'Cinzel',serif;letter-spacing:0.12em;margin-bottom:8px">THE ORACLE SPEAKS</div>
      <p style="font-family:'EB Garamond',serif;font-style:italic;font-size:15px;color:var(--marble);line-height:1.55;margin-bottom:6px">"${oracle.text}"</p>
      <p style="font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--dim)">— ${oracle.source}</p>
    </div>
  </div>

  <!-- ── NAV ── -->
  <div style="position:sticky;top:0;background:rgba(11,13,17,0.95);backdrop-filter:blur(16px);z-index:50;padding:14px 22px 12px">
    <div style="display:flex;gap:6px">
      ${[['today','ἈΓΟΡΆ'],['scrolls','ἜΡΓΑ'],['kleos','ΚΛΕΟΣ']].map(([id,label])=>`
        <button class="nav-tab" onclick="S.view='${id}';render()"
          style="background:${S.view===id?'var(--gold2)':'rgba(255,255,255,0.03)'};color:${S.view===id?'var(--gold)':'var(--dim)'};border:1px solid ${S.view===id?'var(--border)':'transparent'};font-size:10px;letter-spacing:0.1em">
          ${label}
        </button>`).join('')}
    </div>
  </div>

  <!-- ── VIEWS ── -->
  <div style="padding-top:14px">
    ${S.view==='today'  ? buildToday(habits,completions,done,allDone) :
      S.view==='scrolls'? buildScrolls(habits,completions) :
                          buildKleos(habits,completions)}
  </div>

  <!-- ── MODAL ── -->
  ${S.modal ? buildModal() : ''}
  `;
}

// ── TODAY VIEW ────────────────────────────────────────────────────────────────
function buildToday(habits,comp,done,allDone) {
  const pct = habits.length ? done.length/habits.length : 0;
  const r = 32, circ = 2*Math.PI*r;
  const ringColor = pct>=1 ? '#6ab89a' : 'var(--gold)';

  let html = `<div style="padding:0 22px">`;

  // Progress summary card
  html += `
  <div class="card" style="display:flex;align-items:center;gap:18px;margin-bottom:20px">
    <div style="position:relative;flex-shrink:0">
      <svg width="74" height="74" style="transform:rotate(-90deg)">
        <circle cx="37" cy="37" r="${r}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="5"/>
        <circle cx="37" cy="37" r="${r}" fill="none" stroke="${ringColor}" stroke-width="5"
          stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${circ*(1-pct)}"
          style="transition:stroke-dashoffset 0.6s ease,stroke 0.3s"/>
      </svg>
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:15px;font-weight:500;color:var(--marble)">
        ${done.length}<span style="font-size:10px;color:var(--dim)">/${habits.length}</span>
      </div>
    </div>
    <div style="flex:1">
      <div style="font-family:'Cinzel',serif;font-size:16px;font-weight:600;color:var(--marble);margin-bottom:5px">
        ${habits.length===0 ? 'Begin your journey' :
          allDone ? 'OLYMPIAN DAY' :
          done.length===0 ? 'Awaiting your labors' :
          `${habits.length-done.length} labor${habits.length-done.length!==1?'s':''} remain`}
      </div>
      <div style="font-family:'EB Garamond',serif;font-style:italic;font-size:13px;color:var(--dim)">
        ${allDone ? 'The gods look upon you with favor ✦' :
          `${Math.round(pct*100)}% of today's tribute paid`}
      </div>
    </div>
    ${allDone ? `<div style="font-size:28px;animation:laurel 0.5s ease">🏛</div>` : ''}
  </div>`;

  // Meander divider
  html += `<div class="meander" style="margin-bottom:18px">✦ TODAY'S LABORS ✦</div>`;

  if (!habits.length) {
    html += `
    <div style="text-align:center;padding:56px 20px">
      <div style="font-size:44px;margin-bottom:16px;animation:glow 2s infinite">🏛</div>
      <p style="font-family:'EB Garamond',serif;font-style:italic;font-size:16px;color:var(--dim);margin-bottom:22px">
        The scrolls are empty. Begin your pursuit of ἀρετή.
      </p>
      <button class="btn-gold" onclick="openAdd()">+ INSCRIBE A HABIT</button>
    </div>`;
  } else {
    habits.forEach((h,i)=>{
      const isDone = done.includes(h.id);
      const streak = getStreak(h.id,comp);
      const dom = DOMAINS[h.domain]||DOMAINS.apollo;
      const isPop = S.popping===h.id;
      html += `
      <div class="habit-row fade-up" onclick="toggleHabit('${h.id}')"
        style="display:flex;align-items:center;gap:14px;padding:14px 16px;margin-bottom:10px;
        background:${isDone?'rgba(196,149,42,0.05)':'var(--s1)'};
        border:1px solid ${isDone?'rgba(196,149,42,0.25)':'var(--border2)'};
        border-radius:14px;animation-delay:${i*0.055}s">
        <div style="font-size:24px;width:36px;text-align:center;flex-shrink:0;animation:${isPop?'pop 0.4s ease':'none'}">${h.symbol}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:15px;color:${isDone?'var(--dim)':'var(--marble)'};text-decoration:${isDone?'line-through':'none'};
            font-family:'EB Garamond',serif;transition:color 0.2s;margin-bottom:5px">${h.name}</div>
          <div style="display:flex;gap:8px;align-items:center">
            <span class="pill" style="color:${dom.color};background:${dom.bg}">${dom.god}</span>
            ${streak>0?`<span style="font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--terra)">⟨${fmtStreak(streak)}⟩ streak</span>`:``}
          </div>
        </div>
        <!-- Check mark — the "seal of completion" -->
        <div style="width:28px;height:28px;border-radius:50%;flex-shrink:0;
          border:1.5px solid ${isDone?'var(--gold)':'rgba(255,255,255,0.12)'};
          background:${isDone?'var(--gold)':'transparent'};
          display:flex;align-items:center;justify-content:center;transition:all 0.22s">
          ${isDone?`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0b0d11" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`:``}
        </div>
      </div>`;
    });
  }

  html += `</div>`;
  return html;
}

// ── SCROLLS VIEW ──────────────────────────────────────────────────────────────
function buildScrolls(habits,comp) {
  let html = `<div style="padding:0 22px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <div>
        <div style="font-family:'Cinzel',serif;font-size:16px;color:var(--marble);letter-spacing:0.08em">THE SCROLLS</div>
        <div style="font-family:'EB Garamond',serif;font-style:italic;font-size:13px;color:var(--dim);margin-top:2px">Your inscribed practices</div>
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn-ghost" onclick="exportData()" style="font-size:9px;padding:9px 12px;border-color:transparent" title="Export Backup">↓</button>
        <button class="btn-ghost" onclick="importData()" style="font-size:9px;padding:9px 12px;border-color:transparent" title="Import Backup">↑</button>
        <button class="btn-gold" onclick="openAdd()" style="font-size:10px;padding:9px 16px">+ INSCRIBE</button>
      </div>
    </div>`;

  if (!habits.length) {
    html += `<div style="text-align:center;padding:56px 20px;color:var(--dim);font-family:'EB Garamond',serif;font-style:italic;font-size:16px">
      <div style="font-size:40px;margin-bottom:14px">📜</div>No habits inscribed yet.
    </div>`;
  } else {
    habits.forEach((h,i)=>{
      const streak  = getStreak(h.id,comp);
      const longest = getLongest(h.id,comp);
      const total   = Object.values(comp).filter(d=>d.includes(h.id)).length;
      const rate    = getRate30(h.id,comp);
      const dom     = DOMAINS[h.domain]||DOMAINS.apollo;
      html += `
      <div class="card fade-up" style="margin-bottom:12px;animation-delay:${i*0.06}s">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
          <div style="font-size:26px;flex-shrink:0;width:36px;text-align:center">${h.symbol}</div>
          <div style="flex:1;min-width:0">
            <div style="font-family:'EB Garamond',serif;font-size:16px;color:var(--marble);margin-bottom:4px">${h.name}</div>
            <span class="pill" style="color:${dom.color};background:${dom.bg}">${dom.god} · ${dom.domain}</span>
          </div>
          <div style="display:flex;gap:7px;flex-shrink:0">
            <button class="action-btn" onclick="openEdit('${h.id}')"
              style="background:var(--s2);border:none;border-radius:7px;padding:5px 11px;color:var(--dim);font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.08em">
              EDIT
            </button>
            <button class="action-btn" onclick="deleteHabit('${h.id}','${h.name.replace(/'/g,"\\'")}')"
              style="background:rgba(181,97,74,0.12);border:none;border-radius:7px;padding:5px 11px;color:var(--terra);font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.08em">
              EXPUNGE
            </button>
          </div>
        </div>
        <!-- 30-day rate bar -->
        <div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;margin-bottom:5px">
            <span style="font-family:'Cinzel',serif;font-size:9px;color:var(--dim);letter-spacing:0.1em">30-DAY DEVOTION</span>
            <span style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:${dom.color}">${rate}%</span>
          </div>
          <div style="height:3px;background:rgba(255,255,255,0.05);border-radius:2px;overflow:hidden">
            <div style="height:100%;width:${rate}%;background:${dom.color};border-radius:2px;transition:width 0.8s ease"></div>
          </div>
        </div>
        <!-- Stats row -->
        <div style="display:flex;border-top:1px solid var(--border2);padding-top:12px">
          ${[
            ['STREAK',  streak>0  ? `⟨${fmtStreak(streak)}⟩`  : '—'],
            ['LONGEST', longest>0 ? toRoman(longest)          : '—'],
            ['TOTAL',   total>0   ? `${toRoman(total)}×`      : '—'],
          ].map(([l,v],j)=>`
            <div style="flex:1;text-align:center;${j<2?'border-right:1px solid var(--border2)':''}">
              <div style="font-family:'IBM Plex Mono',monospace;font-size:15px;color:var(--gold);font-weight:500">${v}</div>
              <div style="font-family:'Cinzel',serif;font-size:8px;color:var(--dim2);letter-spacing:0.12em;margin-top:3px">${l}</div>
            </div>`).join('')}
        </div>
      </div>`;
    });
  }
  html += `</div>`;
  return html;
}

// ── KLEOS VIEW (Progress) ─────────────────────────────────────────────────────
function buildKleos(habits,comp) {
  const rate30    = calc30Rate(habits,comp);
  const totalC    = Object.values(comp).reduce((a,d)=>a+d.length,0);
  const activeDays= Object.keys(comp).length;

  // Heatmap — The Scroll of Kronos
  const today2    = new Date(), todayDow = today2.getDay();
  const startDate = new Date(today2); startDate.setDate(startDate.getDate()-16*7+1-todayDow);
  const allDates  = []; const dc = new Date(startDate); const ts=toStr(today2);
  while(toStr(dc)<=ts){allDates.push(toStr(dc));dc.setDate(dc.getDate()+1)}
  const weeks=[]; for(let i=0;i<allDates.length;i+=7) weeks.push(allDates.slice(i,i+7));
  const total = habits.length;

  const cellColor = ds => {
    if(!ds||!comp[ds]||!total) return 'rgba(255,255,255,0.04)';
    const r = comp[ds].length/total;
    if(r>=1)    return '#c4952a';
    if(r>=0.75) return 'rgba(196,149,42,0.62)';
    if(r>=0.5)  return 'rgba(196,149,42,0.40)';
    if(r>=0.25) return 'rgba(196,149,42,0.22)';
    return 'rgba(196,149,42,0.10)';
  };

  const mLabels=[]; let lastM=-1;
  weeks.forEach((w,wi)=>{const m=parseD(w[0]).getMonth();if(m!==lastM){mLabels.push({wi,label:MONTHS[m]});lastM=m}});

  const hmHtml = `
  <div class="heatmap-scroll">
    <div style="display:flex;gap:3px;margin-bottom:5px;min-width:max-content">
      ${weeks.map((_,wi)=>{ const ml=mLabels.find(m=>m.wi===wi); return `<div class="heatmap-month" style="width:12px;font-size:8.5px;color:var(--dim2);font-family:'IBM Plex Mono',monospace;overflow:visible;white-space:nowrap">${ml?.label||''}</div>`}).join('')}
    </div>
    <div style="display:flex;gap:3px;min-width:max-content">
      ${weeks.map(w=>`<div style="display:flex;flex-direction:column;gap:3px">
        ${w.map(ds=>`<div class="heatmap-cell"
          onmouseenter="showTooltip(event, '${ds||''}', ${ds?(comp[ds]||[]).length:0}, ${total}); this.style.transform='scale(1.5)'"
          onmouseleave="hideTooltip(); this.style.transform='scale(1)'"
          style="width:12px;height:12px;border-radius:2px;background:${cellColor(ds)};transition:transform 0.1s;cursor:default"></div>`).join('')}
      </div>`).join('')}
    </div>
  </div>
  <div style="display:flex;gap:5px;margin-top:10px;align-items:center;font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--dim2)">
    <span>LESS</span>
    ${['rgba(255,255,255,0.04)','rgba(196,149,42,0.10)','rgba(196,149,42,0.22)','rgba(196,149,42,0.40)','rgba(196,149,42,0.62)','#c4952a'].map(bg=>`<div style="width:10px;height:10px;border-radius:2px;background:${bg}"></div>`).join('')}
    <span>MORE</span>
  </div>`;

  // Weekly data (last 4 weeks)
  const wkData = Array.from({length:4},(_,wi)=>{
    let d=0,p=0;
    for(let day=0;day<7;day++){const o=wi*7+day;p+=habits.length;d+=(comp[daysBefore(o)]||[]).length;}
    return {w:wi===0?'This week':wi===1?'Last week':`${wi+1} weeks ago`,d,p,pct:p===0?0:Math.round((d/p)*100)};
  }).reverse();

  return `<div style="padding:0 22px">
    <div style="margin-bottom:20px">
      <div style="font-family:'Cinzel',serif;font-size:16px;color:var(--marble);letter-spacing:0.08em;margin-bottom:2px">ΚΛΕΟΣ</div>
      <div style="font-family:'EB Garamond',serif;font-style:italic;font-size:13px;color:var(--dim)">Your legacy, rendered</div>
    </div>

    <!-- KPI row -->
    <div style="display:flex;gap:10px;margin-bottom:18px">
      ${[['30-DAY',`${rate30}%`],['COMPLETIONS',toRoman(totalC)],['DAYS ACTIVE',toRoman(activeDays)]].map(([l,v])=>`
        <div style="flex:1;background:var(--s1);border:1px solid var(--border2);border-radius:12px;padding:14px 10px;text-align:center">
          <div style="font-family:'IBM Plex Mono',monospace;font-size:19px;font-weight:500;color:var(--gold)">${v}</div>
          <div style="font-family:'Cinzel',serif;font-size:8px;color:var(--dim2);letter-spacing:0.1em;margin-top:4px">${l}</div>
        </div>`).join('')}
    </div>

    <!-- Heatmap -->
    <div class="card" style="margin-bottom:16px">
      <div class="meander" style="margin-bottom:16px">SCROLL OF KRONOS</div>
      ${hmHtml}
    </div>

    <!-- Weekly comparison -->
    <div class="card" style="margin-bottom:16px">
      <div class="meander" style="margin-bottom:16px">WEEKLY TRIBUTE</div>
      ${wkData.map(({w,d,p,pct})=>`
        <div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="font-family:'EB Garamond',serif;font-size:14px;color:var(--dim)">${w}</span>
            <span style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:${pct>=80?'#6ab89a':pct>=50?'var(--gold)':'var(--terra)'}">${pct}% <span style="color:var(--dim2);font-size:10px">(${d}/${p})</span></span>
          </div>
          <div style="height:3px;background:rgba(255,255,255,0.05);border-radius:2px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${pct>=80?'#6ab89a':pct>=50?'var(--gold)':'var(--terra)'};border-radius:2px;transition:width 0.7s ease"></div>
          </div>
        </div>`).join('')}
    </div>

    <!-- Per-habit -->
    <div class="card" style="margin-bottom:16px">
      <div class="meander" style="margin-bottom:16px">HABIT LEDGER · 30 DAYS</div>
      ${habits.length===0
        ? `<p style="font-family:'EB Garamond',serif;font-style:italic;font-size:14px;color:var(--dim)">The ledger is empty.</p>`
        : habits.map(h=>{
          const pct=getRate30(h.id,comp), streak=getStreak(h.id,comp), dom=DOMAINS[h.domain]||DOMAINS.apollo;
          return `<div style="margin-bottom:18px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:7px">
              <div style="display:flex;align-items:center;gap:9px">
                <span style="font-size:16px">${h.symbol}</span>
                <span style="font-family:'EB Garamond',serif;font-size:15px;color:var(--marble)">${h.name}</span>
              </div>
              <div style="display:flex;gap:10px;align-items:center">
                ${streak>0?`<span style="font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--terra)">⟨${fmtStreak(streak)}⟩</span>`:``}
                <span style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:${dom.color};font-weight:500">${pct}%</span>
              </div>
            </div>
            <div style="height:3px;background:rgba(255,255,255,0.05);border-radius:2px;overflow:hidden">
              <div style="height:100%;width:${pct}%;background:${dom.color};border-radius:2px;transition:width 0.8s ease"></div>
            </div>
          </div>`;
        }).join('')}
    </div>
    <div style="height:8px"></div>
  </div>`;
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
function buildModal() {
  const isEdit = S.modal!=='add';
  const {name,domain,symbol} = S.eForm;
  const valid = (name||'').trim().length>0;

  return `
  <div onclick="if(event.target===this)closeModal()"
    style="position:absolute;inset:0;top:0;left:0;right:0;bottom:0;min-height:100%;
    background:rgba(0,0,0,0.85);display:flex;align-items:flex-start;justify-content:center;
    padding:60px 16px 40px;z-index:200">
    <div onclick="event.stopPropagation()" style="background:#13161e;border:1px solid var(--border);border-radius:18px;padding:26px 22px;width:100%;max-width:400px">
      <!-- Modal header -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px">
        <div>
          <div style="font-family:'Cinzel',serif;font-size:15px;font-weight:700;color:var(--marble);letter-spacing:0.1em">
            ${isEdit?'AMEND THE SCROLL':'INSCRIBE A HABIT'}
          </div>
          <div style="font-family:'EB Garamond',serif;font-style:italic;font-size:12px;color:var(--dim);margin-top:2px">
            ${isEdit?'Refine your practice':'Add to your pursuit of ἀρετή'}
          </div>
        </div>
        <button onclick="closeModal()" style="background:none;border:none;color:var(--dim);font-size:20px;line-height:1;padding:4px">×</button>
      </div>

      <!-- Symbol picker -->
      <div style="margin-bottom:18px">
        <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--dim2);letter-spacing:0.12em;margin-bottom:8px">SIGIL</div>
        <button onclick="S.emojiOpen=!S.emojiOpen;render()"
          style="font-size:24px;background:var(--s2);border:1px solid var(--border);border-radius:10px;padding:8px 14px">
          ${symbol}
        </button>
        ${S.emojiOpen ? `
        <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin-top:8px;background:#0f1117;border:1px solid var(--border2);border-radius:12px;padding:10px">
          ${SYMBOLS.map(s=>`<button class="emoji-opt" onclick="S.eForm.symbol='${s}';S.emojiOpen=false;render()"
            style="font-size:18px;background:${symbol===s?'var(--gold2)':'transparent'};border:none;cursor:pointer;padding:6px;border-radius:7px;transition:background 0.12s">
            ${s}</button>`).join('')}
        </div>` : ''}
      </div>

      <!-- Name -->
      <div style="margin-bottom:18px">
        <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--dim2);letter-spacing:0.12em;margin-bottom:8px">THE PRACTICE</div>
        <input type="text" id="nm" value="${name.replace(/"/g,'&quot;')}" oninput="S.eForm.name=this.value"
          onkeydown="if(event.key==='Enter')submitHabit()" placeholder="e.g. Study the ancient texts">
      </div>

      <!-- Domain -->
      <div style="margin-bottom:24px">
        <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--dim2);letter-spacing:0.12em;margin-bottom:10px">DIVINE DOMAIN</div>
        <div style="display:flex;flex-wrap:wrap;gap:7px">
          ${Object.entries(DOMAINS).map(([key,d])=>`
            <button class="domain-pill" onclick="S.eForm.domain='${key}';render()"
              style="padding:6px 12px;border-radius:20px;font-size:11px;cursor:pointer;font-family:'Cinzel',serif;letter-spacing:0.06em;
              border:1px solid ${domain===key?d.color:'rgba(255,255,255,0.08)'};
              background:${domain===key?d.bg:'transparent'};
              color:${domain===key?d.color:'var(--dim)'};transition:all 0.15s">
              ${d.god}
            </button>`).join('')}
        </div>
        ${DOMAINS[domain]?`<div style="font-family:'EB Garamond',serif;font-style:italic;font-size:12px;color:var(--dim);margin-top:8px">${DOMAINS[domain].domain}</div>`:``}
      </div>

      <!-- Actions -->
      <div style="display:flex;gap:10px">
        <button class="btn-ghost" onclick="closeModal()" style="flex:1;font-size:10px">ABANDON</button>
        <button onclick="submitHabit()" style="flex:2;padding:11px 20px;border-radius:10px;border:none;
          background:${valid?'var(--gold)':'rgba(196,149,42,0.15)'};
          color:${valid?'#0b0d11':'var(--dim)'};
          font-family:'Cinzel',serif;font-size:11px;font-weight:700;letter-spacing:0.08em;
          cursor:${valid?'pointer':'not-allowed'};transition:all 0.15s">
          ${isEdit?'SEAL THE SCROLL':'INSCRIBE'}
        </button>
      </div>
    </div>
  </div>`;
}

// ── Boot ──────────────────────────────────────────────────────────────────────
// expose globals that onclick="" handlers need
window.S           = S;
window.render      = render;
window.toggleHabit = toggleHabit;
window.openAdd     = openAdd;
window.openEdit    = openEdit;
window.closeModal  = closeModal;
window.submitHabit = submitHabit;
window.deleteHabit = deleteHabit;
window.showTooltip = showTooltip;
window.hideTooltip = hideTooltip;
window.exportData  = exportData;
window.importData  = importData;
window.toggleSound = toggleSound;

// ── Keyboard Shortcuts ────────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    if (e.key === 'Escape' && S.modal) closeModal();
    return;
  }

  if (e.key === 'Escape' && S.modal) {
    closeModal();
    return;
  }

  if (!S.modal) {
    if (e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      openAdd();
      return;
    }

    const num = parseInt(e.key);
    if (!isNaN(num) && num > 0 && num <= 9) {
      if (S.view === 'today' && S.data && S.data.habits) {
        const habit = S.data.habits[num - 1];
        if (habit) toggleHabit(habit.id);
      }
    }
  }
});

// Mock storage for local execution if not in a special environment
if (!window.storage) {
  window.storage = {
    get: async (k) => ({ value: localStorage.getItem(k) }),
    set: async (k, v) => localStorage.setItem(k, v)
  };
}

loadData();
