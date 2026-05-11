// ── StudyBuddy Store ─────────────────────────────────────────

// ── YOUR EXACT SCHEDULE (Mon–Sat) ────────────────────────────
// 08:00–13:00  Classes
// 13:00–15:30  Rest & Lunch
// 15:30–18:00  Study
// 18:30–20:00  Coding
// 20:00–21:15  Dinner / Free
// 21:15–00:15  Night Study
// 00:30–01:30  Night Coding
// 01:30–06:50  Sleep
// ─────────────────────────────────────────────────────────────

export const DEFAULT_TIMETABLE = [

  // ══ MON–SAT ══════════════════════════════════════════════
  { id:'ms1', label:'📚 Coaching Classes',   start:'08:00', end:'13:00', type:'class',    color:'#C8E8FF', days:[1,2,3,4,5,6], notify:true  },
  { id:'ms2', label:'😴 Rest & Lunch',        start:'13:00', end:'15:30', type:'break',    color:'#FFE4C8', days:[1,2,3,4,5,6], notify:false },
  { id:'ms3', label:'📖 Self Study',          start:'15:30', end:'18:00', type:'study',    color:'#C8F0D8', days:[1,2,3,4,5,6], notify:true,  subject:'Study'   },
  { id:'ms4', label:'💻 Coding',              start:'18:30', end:'20:00', type:'work',     color:'#E8D6FF', days:[1,2,3,4,5,6], notify:true,  subject:'Coding'  },
  { id:'ms5', label:'🍽️ Dinner + Free Time',  start:'20:00', end:'21:15', type:'meal',     color:'#FFE4C8', days:[1,2,3,4,5,6], notify:false },
  { id:'ms6', label:'📖 Night Study',         start:'21:15', end:'00:15', type:'study',    color:'#C8F0D8', days:[1,2,3,4,5,6], notify:true,  subject:'Study'   },
  { id:'ms7', label:'💻 Night Coding',        start:'00:30', end:'01:30', type:'work',     color:'#E8D6FF', days:[1,2,3,4,5,6], notify:true,  subject:'Coding'  },
  { id:'ms8', label:'😴 Sleep',               start:'01:30', end:'06:50', type:'sleep',    color:'#D6EEFF', days:[1,2,3,4,5,6], notify:false },

  // ══ SUNDAY ═══════════════════════════════════════════════
  { id:'su1', label:'😴 Sleep In',            start:'00:00', end:'08:00', type:'sleep',    color:'#D6EEFF', days:[0], notify:false },
  { id:'su2', label:'🌅 Morning Routine',      start:'08:00', end:'09:00', type:'personal', color:'#FFF3C8', days:[0], notify:false },
  { id:'su3', label:'📝 Weekly Mock Test',     start:'09:00', end:'12:00', type:'study',    color:'#FFD6D6', days:[0], notify:true,  subject:'Mock Test' },
  { id:'su4', label:'🍽️ Lunch + Chill',        start:'12:00', end:'14:00', type:'meal',     color:'#FFE4C8', days:[0], notify:false },
  { id:'su5', label:'📐 Maths Deep Dive',      start:'14:00', end:'16:30', type:'study',    color:'#FFF3C8', days:[0], notify:true,  subject:'Maths'    },
  { id:'su6', label:'💻 Project / Portfolio',  start:'16:30', end:'18:30', type:'work',     color:'#E8D6FF', days:[0], notify:true,  subject:'Coding'   },
  { id:'su7', label:'☕ Break',                start:'18:30', end:'19:00', type:'break',    color:'#C8F0D8', days:[0], notify:false },
  { id:'su8', label:'📖 Weak Topics Revision', start:'19:00', end:'21:00', type:'study',    color:'#C8F0D8', days:[0], notify:true,  subject:'Revision' },
  { id:'su9', label:'🎬 Video Editing',        start:'21:00', end:'23:00', type:'work',     color:'#FFD6D6', days:[0], notify:true,  subject:'Freelance'},
  { id:'su10',label:'🌙 Wind Down',            start:'23:00', end:'23:59', type:'personal', color:'#E8D6FF', days:[0], notify:false },
];

// ── Funny/Relatable missed-block notification lines ───────────
export const MISSED_LINES = {
  study: [
    "Bhai padhai chod di? JEE khud solve ho jayegi kya? 📚",
    "Your future IIT seat just got a little further away. 🤦",
    "Toppers don't skip. Just saying. 🙃",
    "That study block missed you. It's been 0 days since last disappointment.",
    "Rank improve nahi hogi Netflix dekhne se bhai 💀",
    "Your competition studied while you didn't. Sleep tight. 🌙",
    "Study session skipped. Skill issue. 🫵",
    "Kal zaroor padunga = aaj nahi padunga. Classic Ansh move. 😮‍💨",
    "The grind doesn't grind itself bhai 😭",
    "Error 404: Study session not found 📵",
  ],
  work: [
    "Coding skipped? The bugs in your future project are celebrating 🐛🎉",
    "Your GitHub is more green... wait no it's not. 📉",
    "No code = no portfolio = no job. Full circle. 💀",
    "Error 404: Productivity not found 😐",
    "Freelance clients will wait... okay they won't. 🙃",
    "VS Code opened itself, cried, and closed again. 😢",
    "Bhai coding nahi karoge toh sikhoge kab? Sochna. 🤔",
  ],
  class: [
    "Bhai classes miss kiye? Teacher ne sab clear kar diya hoga aaj. 💀",
    "Attendance % declined. HR interview pe poochenge. 📉",
    "The one concept you needed was taught today. Probably. 😭",
    "Log notes le rahe the, tum so rahe the. Cute. 🛌",
  ],
  default: [
    "Aye, you missed a block! Future you is already disappointed. 😤",
    "Block incomplete. Are we really doing this today? 🫠",
    "Task missed. Okay I'll pretend I didn't see that. 👀",
    "Consistency check failed. Please restart human. 🔄",
    "Your streak is looking at you with sad eyes. 🥺",
    "Not me sending you a notification at this hour 💀",
    "Bhai so gaye kya? Block abhi baaki hai. ⏰",
  ],
};

export function getMissedLine(type) {
  const arr = MISSED_LINES[type] || MISSED_LINES.default;
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Achievements ──────────────────────────────────────────────
export const ALL_ACHIEVEMENTS = [
  { id:'a1',  emoji:'🌟', title:'First Step',       desc:'Log your first study session',   xp:50   },
  { id:'a2',  emoji:'🔥', title:'3-Day Streak',      desc:'Study 3 days in a row',          xp:100  },
  { id:'a3',  emoji:'⚡', title:'Week Warrior',       desc:'7-day study streak',             xp:300  },
  { id:'a4',  emoji:'💎', title:'Fortnight Fighter', desc:'14-day streak',                  xp:700  },
  { id:'a5',  emoji:'🏆', title:'Month Master',      desc:'30-day streak!',                 xp:2000 },
  { id:'a6',  emoji:'📚', title:'Study Machine',     desc:'Log 10 hours total',             xp:150  },
  { id:'a7',  emoji:'🎓', title:'Scholar Mode',      desc:'Log 50 hours total',             xp:500  },
  { id:'a8',  emoji:'🚀', title:'Grind God',         desc:'Log 100 hours total',            xp:1000 },
  { id:'a9',  emoji:'📐', title:'Maths Magician',    desc:'Maths: 20h total',               xp:200  },
  { id:'a10', emoji:'✅', title:'Tick Master',        desc:'Tick every block in a day',      xp:300  },
  { id:'a11', emoji:'📝', title:'Mock Maniac',        desc:'Complete 5 mock tests',          xp:250  },
  { id:'a12', emoji:'💪', title:'Consistency King',  desc:'Hit daily target 10 times',      xp:400  },
  { id:'a13', emoji:'💻', title:'Code Warrior',       desc:'Log 20h of coding',              xp:200  },
  { id:'a14', emoji:'📱', title:'Telegram Linked',   desc:'Connect Telegram',               xp:50   },
  { id:'a15', emoji:'🎯', title:'200h Club',          desc:'Log 200 total hours',            xp:5000 },
];

const DEF_STATS = {
  streak:0, longestStreak:0, totalHours:0, todayHours:0, sessions:0,
  subjectHours:{ Study:0, Maths:0, 'Mock Test':0, Revision:0, Coding:0, Freelance:0 },
  mockTests:0, bestScore:0, targetDays:0,
  telegramLinked:false, xp:0, tickMasterDays:0, lastStudyDate:null,
};
const DEF_SETTINGS = {
  telegramBotToken:'', telegramChatId:'',
  dailyTargetHours:6, notificationsEnabled:false,
  userName:'Ansh',
};

// ── Storage helpers ───────────────────────────────────────────
function g(key, fb) {
  if (typeof window === 'undefined') return fb;
  try { const r = localStorage.getItem('sb_'+key); return r ? JSON.parse(r) : fb; }
  catch { return fb; }
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

// ── Completions ───────────────────────────────────────────────
export const getCompletions  = ()    => g('completions', {});
export const saveCompletions = (c)   => s('completions', c);
export const getDayDone      = (day) => getCompletions()[day] || [];
export function toggleDone(blockId, day) {
  const all = getCompletions();
  const cur = all[day] || [];
  all[day] = cur.includes(blockId) ? cur.filter(x => x !== blockId) : [...cur, blockId];
  saveCompletions(all);
  return all[day];
}

// ── XP / Level ────────────────────────────────────────────────
export function xpForLevel(l) { return Math.floor(100 * Math.pow(1.5, l - 1)); }
export function getLevel(totalXp) {
  let xp = totalXp, lvl = 1;
  while (xp >= xpForLevel(lvl)) { xp -= xpForLevel(lvl); lvl++; }
  return { level: lvl, cur: xp, need: xpForLevel(lvl), pct: Math.round((xp / xpForLevel(lvl)) * 100) };
}

// ── Achievements ──────────────────────────────────────────────
export function getAchievements() {
  const saved = g('achievements', []);
  return ALL_ACHIEVEMENTS.map(a => ({ ...a, unlocked: false, ...(saved.find(x => x.id === a.id) || {}) }));
}
export function checkAchievements(stats) {
  const list = getAchievements();
  const newOnes = [];
  list.forEach(a => {
    if (a.unlocked) return;
    let ok = false;
    const mh = stats.subjectHours?.Maths   || 0;
    const ch = stats.subjectHours?.Coding  || 0;
    if (a.id==='a1'  && stats.sessions>=1)        ok=true;
    if (a.id==='a2'  && stats.streak>=3)          ok=true;
    if (a.id==='a3'  && stats.streak>=7)          ok=true;
    if (a.id==='a4'  && stats.streak>=14)         ok=true;
    if (a.id==='a5'  && stats.streak>=30)         ok=true;
    if (a.id==='a6'  && stats.totalHours>=10)     ok=true;
    if (a.id==='a7'  && stats.totalHours>=50)     ok=true;
    if (a.id==='a8'  && stats.totalHours>=100)    ok=true;
    if (a.id==='a9'  && mh>=20)                   ok=true;
    if (a.id==='a10' && stats.tickMasterDays>=1)  ok=true;
    if (a.id==='a11' && stats.mockTests>=5)       ok=true;
    if (a.id==='a12' && stats.targetDays>=10)     ok=true;
    if (a.id==='a13' && ch>=20)                   ok=true;
    if (a.id==='a14' && stats.telegramLinked)     ok=true;
    if (a.id==='a15' && stats.totalHours>=200)    ok=true;
    if (ok) { a.unlocked=true; a.unlockedAt=new Date().toISOString(); newOnes.push(a); }
  });
  s('achievements', list);
  return newOnes;
}

// ── Telegram helper ───────────────────────────────────────────
export async function sendTelegram(token, chatId, text) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ chat_id: chatId, text, parse_mode:'Markdown' }),
  });
  const d = await res.json();
  if (!d.ok) throw new Error(d.description);
  return d;
}
