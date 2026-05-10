// ── StudyBuddy Store ─────────────────────────────────────────
// All data lives in localStorage. No backend needed.
// ─────────────────────────────────────────────────────────────

// Ansh's schedule:
// 11pm-5am  → sleep (6h)
// 5-6am     → morning routine
// 6-8am     → self study (morning)
// 8am-1pm   → coaching classes (5h)
// 1-1:30pm  → lunch
// 1:30-3:30 → freelance video editing (2h)
// 3:30-6pm  → editing + coding (2.5h)
// 6-6:30pm  → break
// 6:30-8pm  → Physics / Chemistry (alternating)
// 8-8:30pm  → dinner
// 8:30-10pm → Maths
// 10-11pm   → Revision + PYQs
// Sunday    → mock test morning, maths afternoon

export const DEFAULT_TIMETABLE = [
  // ── Every day ──────────────────────────────────────────────
  { id:'s1',  label:'😴 Sleep',              start:'23:00', end:'05:00', type:'sleep',    color:'#E8D6FF', days:[0,1,2,3,4,5,6] },
  { id:'s2',  label:'🌅 Morning Routine',    start:'05:00', end:'06:00', type:'personal', color:'#FFF3C8', days:[0,1,2,3,4,5,6] },
  { id:'s3',  label:'🍽️ Lunch',              start:'13:00', end:'13:30', type:'meal',     color:'#FFE4C8', days:[0,1,2,3,4,5,6] },
  { id:'s4',  label:'☕ Break',               start:'18:00', end:'18:30', type:'break',    color:'#C8F0D8', days:[0,1,2,3,4,5,6] },
  { id:'s5',  label:'🍽️ Dinner',             start:'20:00', end:'20:30', type:'meal',     color:'#FFE4C8', days:[0,1,2,3,4,5,6] },
  { id:'s6',  label:'🌙 Wind Down',          start:'23:00', end:'23:59', type:'personal', color:'#E8D6FF', days:[0,1,2,3,4,5,6] },

  // ── Mon–Sat ────────────────────────────────────────────────
  { id:'s7',  label:'📖 Morning Study',      start:'06:00', end:'08:00', type:'study',    color:'#C8F0D8', days:[1,2,3,4,5,6], subject:'Revision' },
  { id:'s8',  label:'📚 Coaching Classes',   start:'08:00', end:'13:00', type:'class',    color:'#C8E8FF', days:[1,2,3,4,5,6] },
  { id:'s9',  label:'🎬 Freelance Editing',  start:'13:30', end:'15:30', type:'work',     color:'#FFD6D6', days:[1,2,3,4,5,6], subject:'Freelance' },
  { id:'s10', label:'💻 Editing + Coding',   start:'15:30', end:'18:00', type:'work',     color:'#FFDFC8', days:[1,2,3,4,5,6], subject:'Editing+Coding' },
  { id:'s11', label:'📐 Maths',              start:'20:30', end:'22:00', type:'study',    color:'#FFF3C8', days:[1,2,3,4,5],   subject:'Maths' },
  { id:'s12', label:'📖 Revision + PYQs',   start:'22:00', end:'23:00', type:'study',    color:'#E8D6FF', days:[1,2,3,4,5,6], subject:'Revision' },

  // ── Physics days (Mon, Wed, Fri) ───────────────────────────
  { id:'s13', label:'🔬 Physics',            start:'18:30', end:'20:00', type:'study',    color:'#C8E8FF', days:[1,3,5],       subject:'Physics' },

  // ── Chemistry days (Tue, Thu, Sat) ────────────────────────
  { id:'s14', label:'⚗️ Chemistry',          start:'18:30', end:'20:00', type:'study',    color:'#C8F0D8', days:[2,4,6],       subject:'Chemistry' },

  // ── Sunday ────────────────────────────────────────────────
  { id:'s15', label:'🥣 Breakfast',          start:'07:30', end:'08:00', type:'meal',     color:'#FFE4C8', days:[0] },
  { id:'s16', label:'📝 Mock Test',          start:'09:00', end:'12:00', type:'study',    color:'#FFD6D6', days:[0],           subject:'Mock Test' },
  { id:'s17', label:'📐 Maths Marathon',     start:'14:00', end:'17:00', type:'study',    color:'#FFF3C8', days:[0],           subject:'Maths' },
  { id:'s18', label:'💻 Editing + Coding',   start:'17:00', end:'19:30', type:'work',     color:'#FFDFC8', days:[0],           subject:'Editing+Coding' },
];

export const ALL_ACHIEVEMENTS = [
  { id:'a1',  emoji:'🌟', title:'First Step',        desc:'Log your first study session',          xp:50   },
  { id:'a2',  emoji:'🔥', title:'3-Day Streak',       desc:'Study 3 days in a row',                 xp:100  },
  { id:'a3',  emoji:'⚡', title:'Week Warrior',        desc:'7-day study streak',                    xp:300  },
  { id:'a4',  emoji:'💎', title:'Fortnight Fighter',  desc:'14-day streak',                         xp:700  },
  { id:'a5',  emoji:'🏆', title:'Month Master',       desc:'30-day streak!',                        xp:2000 },
  { id:'a6',  emoji:'📚', title:'Study Machine',      desc:'Log 10 hours total',                    xp:150  },
  { id:'a7',  emoji:'🎓', title:'JEE Aspirant',       desc:'Log 50 hours total',                    xp:500  },
  { id:'a8',  emoji:'🚀', title:'IITian Mindset',     desc:'Log 100 hours total',                   xp:1000 },
  { id:'a9',  emoji:'🔬', title:'Physics Freak',       desc:'Physics: 20h total',                    xp:200  },
  { id:'a10', emoji:'⚗️', title:'Chem Champion',      desc:'Chemistry: 20h total',                  xp:200  },
  { id:'a11', emoji:'📐', title:'Maths Magician',     desc:'Maths: 20h total',                      xp:200  },
  { id:'a12', emoji:'✅', title:'Tick Master',         desc:'Tick every block in a day',             xp:300  },
  { id:'a13', emoji:'📝', title:'Mock Maniac',         desc:'Complete 5 mock tests',                 xp:250  },
  { id:'a14', emoji:'💪', title:'Consistency King',   desc:'Hit daily target 10 times',             xp:400  },
  { id:'a15', emoji:'🧠', title:'Big Brain',           desc:'Score 90%+ on a mock',                  xp:500  },
  { id:'a16', emoji:'📱', title:'Telegram Linked',    desc:'Connect Telegram',                      xp:50   },
  { id:'a17', emoji:'🎬', title:'Freelance Hustle',   desc:'Log 10h of freelancing',                xp:200  },
  { id:'a18', emoji:'🎯', title:'JEE Ready',           desc:'Log 200 total hours',                   xp:5000 },
];

const DEF_STATS = {
  streak:0, longestStreak:0, totalHours:0, todayHours:0, sessions:0,
  subjectHours:{ Physics:0, Chemistry:0, Maths:0, Revision:0, 'Mock Test':0, Freelance:0, 'Editing+Coding':0 },
  mockTests:0, bestScore:0, targetDays:0, earlyBird:0,
  telegramLinked:false, xp:0, tickMasterDays:0, freelanceHours:0, lastStudyDate:null,
};
const DEF_SETTINGS = {
  telegramBotToken:'', telegramChatId:'',
  dailyTargetHours:6, notificationsEnabled:false,
  userName:'Ansh',
};

// ── Storage helpers ─────────────────────────────────────────
function g(key, fb) {
  if (typeof window === 'undefined') return fb;
  try { const r = localStorage.getItem('sb_'+key); return r ? JSON.parse(r) : fb; } catch { return fb; }
}
function s(key, val) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sb_'+key, JSON.stringify(val));
}

export const getTimetable  = ()  => g('timetable', DEFAULT_TIMETABLE);
export const saveTimetable = (t) => s('timetable', t);
export const getStats      = ()  => ({ ...DEF_STATS,    ...g('stats',    DEF_STATS) });
export const saveStats     = (v) => s('stats', v);
export const getSettings   = ()  => ({ ...DEF_SETTINGS, ...g('settings', DEF_SETTINGS) });
export const saveSettings  = (v) => s('settings', v);
export const getSessions   = ()  => g('sessions', []);
export function addSession(session) {
  const all = getSessions();
  all.push({ ...session, id: Date.now() });
  s('sessions', all.slice(-300));
}

// ── Completions  { "Mon May 05 2025": ["s1","s3",...] } ─────
export const getCompletions    = ()    => g('completions', {});
export const saveCompletions   = (c)   => s('completions', c);
export const getDayDone        = (day) => getCompletions()[day] || [];
export function toggleDone(blockId, day) {
  const all = getCompletions();
  const cur = all[day] || [];
  all[day] = cur.includes(blockId) ? cur.filter(x => x !== blockId) : [...cur, blockId];
  saveCompletions(all);
  return all[day];
}

// ── XP / Level ──────────────────────────────────────────────
export function xpForLevel(l) { return Math.floor(100 * Math.pow(1.5, l - 1)); }
export function getLevel(totalXp) {
  let xp = totalXp, lvl = 1;
  while (xp >= xpForLevel(lvl)) { xp -= xpForLevel(lvl); lvl++; }
  return { level: lvl, cur: xp, need: xpForLevel(lvl), pct: Math.round((xp / xpForLevel(lvl)) * 100) };
}

// ── Achievements ────────────────────────────────────────────
export function getAchievements() {
  const saved = g('achievements', []);
  return ALL_ACHIEVEMENTS.map(a => ({ ...a, unlocked: false, ...(saved.find(x => x.id === a.id) || {}) }));
}
export function checkAchievements(stats) {
  const list = getAchievements();
  const newOnes = [];
  list.forEach(a => {
    if (a.unlocked) return;
    const ph = stats.subjectHours?.Physics || 0;
    const ch = stats.subjectHours?.Chemistry || 0;
    const mh = stats.subjectHours?.Maths || 0;
    let ok = false;
    if (a.id==='a1'  && stats.sessions>=1)            ok=true;
    if (a.id==='a2'  && stats.streak>=3)              ok=true;
    if (a.id==='a3'  && stats.streak>=7)              ok=true;
    if (a.id==='a4'  && stats.streak>=14)             ok=true;
    if (a.id==='a5'  && stats.streak>=30)             ok=true;
    if (a.id==='a6'  && stats.totalHours>=10)         ok=true;
    if (a.id==='a7'  && stats.totalHours>=50)         ok=true;
    if (a.id==='a8'  && stats.totalHours>=100)        ok=true;
    if (a.id==='a9'  && ph>=20)                       ok=true;
    if (a.id==='a10' && ch>=20)                       ok=true;
    if (a.id==='a11' && mh>=20)                       ok=true;
    if (a.id==='a12' && stats.tickMasterDays>=1)      ok=true;
    if (a.id==='a13' && stats.mockTests>=5)           ok=true;
    if (a.id==='a14' && stats.targetDays>=10)         ok=true;
    if (a.id==='a15' && stats.bestScore>=90)          ok=true;
    if (a.id==='a16' && stats.telegramLinked)         ok=true;
    if (a.id==='a17' && stats.freelanceHours>=10)     ok=true;
    if (a.id==='a18' && stats.totalHours>=200)        ok=true;
    if (ok) { a.unlocked=true; a.unlockedAt=new Date().toISOString(); newOnes.push(a); }
  });
  s('achievements', list);
  return newOnes;
}

// ── Telegram helper ─────────────────────────────────────────
export async function sendTelegram(token, chatId, text) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ chat_id: chatId, text, parse_mode:'Markdown' }),
  });
  const d = await res.json();
  if (!d.ok) throw new Error(d.description);
  return d;
}
