'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  getStats, saveStats, getTimetable, getSettings,
  getLevel, getDayDone, toggleDone, checkAchievements,
} from '../lib/store';

function toMin(t) { if(t==='24:00')return 1440; const[h,m]=t.split(':').map(Number); return h*60+m; }

const TYPE_COLOR = {
  sleep:'#E8D6FF', class:'#C8E8FF', study:'#C8F0D8',
  work:'#FFD6D6', meal:'#FFE4C8', personal:'#FFF3C8', break:'#DCFCE7',
};
const TYPE_EMOJI = { sleep:'😴', class:'📚', study:'📖', work:'🎬', meal:'🍽️', personal:'🌅', break:'☕' };
const XP_PER_TYPE = { class:30, study:50, work:40, personal:10, break:5, meal:0, sleep:0 };

export default function Dashboard({ toast, checkAndNotify }) {
  const [stats,    setLocalStats] = useState(null);
  const [tt,       setTt]         = useState([]);
  const [cfg,      setCfg]        = useState(null);
  const [done,     setDone]       = useState([]);
  const [now,      setNow]        = useState(new Date());
  const TODAY = now.toDateString();

  const reload = useCallback(() => {
    setLocalStats(getStats());
    setTt(getTimetable());
    setCfg(getSettings());
    setDone(getDayDone(new Date().toDateString()));
  }, []);

  useEffect(() => {
    reload();
    const iv = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(iv);
  }, [reload]);

  const handleTick = useCallback((block) => {
    const newDone = toggleDone(block.id, TODAY);
    setDone(newDone);
    const justTicked = newDone.includes(block.id);
    if (!justTicked) { toast('↩️ Marked incomplete', 'info'); return; }

    const xp = XP_PER_TYPE[block.type] || 10;
    if (xp > 0) toast(`✅ ${block.label} done! +${xp} XP`, 'success');
    else toast(`✅ ${block.label} logged`, 'info');

    const cur = getStats();
    const updated = { ...cur, xp: (cur.xp||0) + xp };

    // Perfect day check
    const todayBlocks = getTimetable().filter(b =>
      b.days.includes(new Date().getDay()) && b.type !== 'sleep' && b.type !== 'meal' && b.type !== 'break'
    );
    if (todayBlocks.every(b => newDone.includes(b.id))) {
      updated.xp += 200;
      updated.tickMasterDays = (cur.tickMasterDays||0) + 1;
      toast('🌟 PERFECT DAY! All blocks done! +200 XP', 'achievement', 5000);
    }
    saveStats(updated);
    setLocalStats(updated);
    checkAndNotify(updated);
  }, [TODAY, toast, checkAndNotify]);

  if (!stats || !cfg) {
    return (
      <div style={{ padding:16 }}>
        {[140,70,220,160].map((h,i) => (
          <div key={i} className="shimmer" style={{ height:h, borderRadius:18, marginBottom:12 }} />
        ))}
      </div>
    );
  }

  const mins    = now.getHours()*60 + now.getMinutes();
  const dayIdx  = now.getDay();
  const todayAll = tt.filter(b => b.days.includes(dayIdx)).sort((a,b) => toMin(a.start)-toMin(b.start));
  const trackable = todayAll.filter(b => b.type !== 'sleep');
  const doneCnt   = trackable.filter(b => done.includes(b.id)).length;
  const donePct   = trackable.length ? Math.round((doneCnt/trackable.length)*100) : 0;
  const lvl       = getLevel(stats.xp||0);
  const currentBlock = todayAll.find(b => mins >= toMin(b.start) && mins < toMin(b.end));
  const h = now.getHours();
  const greeting = h<12 ? 'Good morning' : h<17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ padding:'16px 16px 0' }}>

      {/* Hero */}
      <div style={{
        background:'linear-gradient(135deg,#FFD6D6 0%,#E8D6FF 100%)',
        borderRadius:24, padding:'20px 22px', marginBottom:14, position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', right:-8, top:-8, fontSize:80, opacity:0.12 }}>📖</div>

        <div style={{ fontFamily:'Nunito', fontWeight:700, fontSize:12, color:'#9D6D9D', marginBottom:3 }}>
          {now.toLocaleDateString('en-IN',{weekday:'long',month:'short',day:'numeric'})}
        </div>
        <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:22, color:'#2D2D2D', marginBottom:4 }}>
          {greeting}, {cfg.userName}! 👋
        </div>
        <div style={{ fontSize:13, color:'#5D5D5D', marginBottom:14 }}>
          {stats.streak>0 ? `🔥 ${stats.streak}-day streak! Keep it up!` : '🌟 Start your streak today!'}
        </div>

        {/* Day progress */}
        <div style={{ background:'rgba(255,255,255,0.55)', borderRadius:14, padding:'10px 14px', marginBottom:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'Nunito', fontWeight:700, fontSize:12, color:'#7D5D9D', marginBottom:5 }}>
            <span>📅 Day Progress</span>
            <span>{doneCnt}/{trackable.length} blocks • {donePct}%</span>
          </div>
          <div className="progress-bar" style={{ height:10, background:'rgba(255,255,255,0.6)' }}>
            <div className="progress-fill" style={{ width:`${donePct}%`, background:'linear-gradient(90deg,#FF7F7F,#C87FFF)' }} />
          </div>
        </div>

        {/* XP bar */}
        <div style={{ background:'rgba(255,255,255,0.4)', borderRadius:12, padding:'8px 14px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'Nunito', fontWeight:700, fontSize:11, color:'#7D5D9D', marginBottom:4 }}>
            <span>⭐ Level {lvl.level}</span><span>{lvl.cur}/{lvl.need} XP</span>
          </div>
          <div className="progress-bar" style={{ height:6, background:'rgba(255,255,255,0.5)' }}>
            <div className="progress-fill" style={{ width:`${lvl.pct}%`, background:'linear-gradient(90deg,#FF7F7F,#9B59B6)' }} />
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:14 }}>
        {[
          {e:'⏱️', v:`${(stats.todayHours||0).toFixed(1)}h`, l:'Today'},
          {e:'🔥', v:`${stats.streak}d`,                     l:'Streak'},
          {e:'✅', v:`${doneCnt}`,                            l:'Ticked'},
          {e:'✨', v:`${stats.xp||0}`,                        l:'XP'},
        ].map(s => (
          <div key={s.l} style={{ background:'white', borderRadius:14, padding:'10px 4px', textAlign:'center', boxShadow:'0 2px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize:18, marginBottom:2 }}>{s.e}</div>
            <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:15, color:'#2D2D2D' }}>{s.v}</div>
            <div style={{ fontSize:10, color:'#9D9D9D' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Current block highlight */}
      {currentBlock && (
        <div style={{
          background:'white', borderRadius:18, padding:14, marginBottom:14,
          border:`2px solid ${TYPE_COLOR[currentBlock.type]||'#FFD6D6'}`,
          boxShadow:'0 4px 18px rgba(0,0,0,0.08)',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <div>
              <div style={{ fontSize:10, color:'#FF7F7F', fontFamily:'Nunito', fontWeight:700, letterSpacing:1, marginBottom:2 }}>▶ RIGHT NOW</div>
              <div style={{ fontFamily:'Nunito', fontWeight:800, fontSize:17 }}>{currentBlock.label}</div>
              <div style={{ fontSize:12, color:'#9D9D9D' }}>{currentBlock.start} – {currentBlock.end}</div>
            </div>
            {currentBlock.type !== 'sleep' && (
              <button onClick={() => handleTick(currentBlock)} style={{
                width:50, height:50, borderRadius:25, border:'none', cursor:'pointer', fontSize:24,
                background: done.includes(currentBlock.id) ? '#4ECDC4' : '#F5F5F5',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow: done.includes(currentBlock.id) ? '0 4px 14px rgba(78,205,196,0.45)' : 'none',
                transition:'all 0.2s',
              }}>
                {done.includes(currentBlock.id) ? '✅' : '⬜'}
              </button>
            )}
          </div>
          {/* live progress */}
          <div className="progress-bar" style={{ height:7 }}>
            <div className="progress-fill" style={{
              width:`${Math.min(100,Math.max(0,Math.round(((mins-toMin(currentBlock.start))/(toMin(currentBlock.end)-toMin(currentBlock.start)))*100)))}%`,
              background:'linear-gradient(90deg,#FF7F7F,#FFB07F)',
            }} />
          </div>
        </div>
      )}

      {/* Full day schedule with ticks */}
      <div style={{ fontFamily:'Nunito', fontWeight:800, fontSize:16, color:'#2D2D2D', marginBottom:10 }}>
        📋 Today's Schedule
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:16 }}>
        {todayAll.map(block => {
          const isDone    = done.includes(block.id);
          const isCurrent = block === currentBlock;
          const isPast    = toMin(block.end) < mins;
          const canTick   = block.type !== 'sleep';

          return (
            <div key={block.id} style={{
              background: isDone ? '#F0FFF8' : 'white',
              borderRadius:16, padding:'11px 14px',
              display:'flex', alignItems:'center', gap:10,
              boxShadow:'0 2px 10px rgba(0,0,0,0.05)',
              border: isCurrent ? `2px solid ${TYPE_COLOR[block.type]||'#FFD6D6'}` : isDone ? '2px solid #5BD4A4' : '2px solid transparent',
              opacity: isPast && !isDone && dayIdx === now.getDay() ? 0.55 : 1,
              transition:'all 0.2s',
            }}>
              <span style={{ fontSize:20, flexShrink:0 }}>{TYPE_EMOJI[block.type]||'📌'}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{
                  fontFamily:'Nunito', fontWeight:700, fontSize:14,
                  color: isDone ? '#3D9D6D' : '#2D2D2D',
                  textDecoration: isDone ? 'line-through' : 'none',
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                }}>{block.label}</div>
                <div style={{ fontSize:11, color:'#9D9D9D' }}>
                  {block.start}–{block.end}
                  {isCurrent && <span style={{ color:'#FF7F7F', fontWeight:700, marginLeft:6 }}>● Live</span>}
                  {isPast && !isDone && <span style={{ color:'#FFB07F', fontWeight:700, marginLeft:6 }}>⚠ Missed</span>}
                </div>
              </div>
              {canTick && (
                <button onClick={() => handleTick(block)} style={{
                  width:38, height:38, borderRadius:19, border:'none', cursor:'pointer', flexShrink:0,
                  background: isDone ? '#4ECDC4' : isPast ? '#FFE4E4' : '#F5F5F5',
                  fontSize:18, display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow: isDone ? '0 2px 8px rgba(78,205,196,0.4)' : 'none',
                  transition:'all 0.2s',
                }}>
                  {isDone ? '✅' : isPast ? '⚠️' : '⬜'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Subject breakdown */}
      {Object.entries(stats.subjectHours||{}).some(([,v])=>v>0) && (
        <div style={{ background:'white', borderRadius:18, padding:14, marginBottom:14, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontFamily:'Nunito', fontWeight:800, fontSize:14, marginBottom:10 }}>📊 Total Study Hours</div>
          {Object.entries(stats.subjectHours).filter(([,v])=>v>0).map(([sub,hrs])=>(
            <div key={sub} style={{ marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'Nunito', fontWeight:700, fontSize:12, marginBottom:3 }}>
                <span>{sub}</span><span style={{ color:'#9D9D9D' }}>{hrs.toFixed(1)}h</span>
              </div>
              <div className="progress-bar" style={{ height:6 }}>
                <div className="progress-fill" style={{ width:`${Math.min(100,(hrs/50)*100)}%`, background:'#FF7F7F' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ height:8 }} />
    </div>
  );
}
