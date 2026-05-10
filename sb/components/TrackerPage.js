'use client';
// ── TrackerPage ───────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import { getStats, saveStats, addSession, getSessions, getSettings, sendTelegram } from '../lib/store';

const SUBJECTS = ['Physics','Chemistry','Maths','Revision','Mock Test','Freelance','Editing+Coding','Other'];
const MOODS    = [{v:'focused',e:'🎯',l:'Focused'},{v:'okay',e:'😊',l:'Okay'},{v:'tired',e:'😴',l:'Tired'},{v:'distracted',e:'😵',l:'Lost'}];

function fmt(s){ const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60; return h>0?`${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`:`${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`; }
function sameDay(a,b){ return new Date(a).toDateString()===new Date(b).toDateString(); }

export default function TrackerPage({ toast, checkAndNotify }) {
  const [running,  setRunning]  = useState(false);
  const [elapsed,  setElapsed]  = useState(0);
  const [subject,  setSubject]  = useState('Maths');
  const [mood,     setMood]     = useState('focused');
  const [note,     setNote]     = useState('');
  const [sessions, setSessions] = useState([]);
  const [stats,    setLocalSt]  = useState(null);
  const startRef   = useRef(null);
  const ivRef      = useRef(null);

  useEffect(() => { setSessions(getSessions().slice(-15).reverse()); setLocalSt(getStats()); }, []);
  useEffect(() => {
    if (running) { ivRef.current = setInterval(()=>setElapsed(Math.floor((Date.now()-startRef.current)/1000)),1000); }
    else clearInterval(ivRef.current);
    return ()=>clearInterval(ivRef.current);
  }, [running]);

  const start = () => { startRef.current=Date.now(); setElapsed(0); setRunning(true); toast(`▶ Started: ${subject}`,'success'); };

  const stop = async () => {
    setRunning(false);
    if (elapsed<30){ toast('⚠️ Too short (<30s)','error'); setElapsed(0); return; }
    const hours = elapsed/3600;
    const session = { subject, mood, note, duration:elapsed, hours:parseFloat(hours.toFixed(4)), startTime:new Date(startRef.current).toISOString(), endTime:new Date().toISOString(), date:new Date().toDateString() };
    addSession(session);
    const cur = getStats();
    const today = new Date().toDateString();
    const isNew = !cur.lastStudyDate || !sameDay(cur.lastStudyDate, today);
    const isYest = cur.lastStudyDate && sameDay(new Date(cur.lastStudyDate), new Date(Date.now()-86400000));
    const todayH = isNew ? hours : (cur.todayHours||0)+hours;
    const streak = isNew ? (isYest?cur.streak+1:1) : cur.streak;
    const subH = {...cur.subjectHours};
    subH[subject] = (subH[subject]||0)+hours;
    const xpGain = Math.floor(hours*100)+(mood==='focused'?20:0);
    const freelanceH = (cur.freelanceHours||0)+(subject==='Freelance'?hours:0);
    const now=new Date();
    const updated = {
      ...cur, sessions:cur.sessions+1,
      totalHours:parseFloat((cur.totalHours+hours).toFixed(4)),
      todayHours:parseFloat(todayH.toFixed(4)),
      streak, longestStreak:Math.max(cur.longestStreak||0,streak),
      subjectHours:subH, mockTests:subject==='Mock Test'?cur.mockTests+1:cur.mockTests,
      earlyBird:now.getHours()<8?cur.earlyBird+1:cur.earlyBird,
      lastStudyDate:today, xp:(cur.xp||0)+xpGain, freelanceHours:freelanceH,
      targetDays:todayH>=(getSettings().dailyTargetHours||6)?cur.targetDays+1:cur.targetDays,
    };
    saveStats(updated); setLocalSt(updated); setSessions(getSessions().slice(-15).reverse()); setElapsed(0); setNote('');
    toast(`✅ Logged ${fmt(session.duration)} of ${subject}! +${xpGain} XP`,'success',4500);
    await checkAndNotify(updated);
  };

  const sendSummary = async () => {
    const cfg = getSettings();
    if (!cfg.telegramBotToken||!cfg.telegramChatId){ toast('⚠️ Set Telegram in Settings','error'); return; }
    try {
      const st = getStats();
      const stars='⭐'.repeat(Math.min(Math.floor(st.todayHours),5));
      await sendTelegram(cfg.telegramBotToken, cfg.telegramChatId,
        `📊 *Daily Summary*\n\nHey *${cfg.userName}*!\n\n📚 Study Today: *${st.todayHours.toFixed(1)}h* ${stars}\n🎯 Sessions: *${st.sessions}*\n🔥 Streak: *${st.streak} days*\n✨ Total XP: *${st.xp}*\n\n_Keep going! IIT is waiting! 🚀_`
      );
      toast('📱 Summary sent to Telegram!','success');
    } catch(e){ toast('❌ '+e.message,'error'); }
  };

  const SEMOJIS = {Physics:'🔬',Chemistry:'⚗️',Maths:'📐','Mock Test':'📝',Freelance:'🎬','Editing+Coding':'💻',Revision:'📖',Other:'📚'};

  return (
    <div style={{padding:16}}>
      <div style={{fontFamily:'Nunito',fontWeight:900,fontSize:22,color:'#2D2D2D',marginBottom:3}}>⏱️ Study Tracker</div>
      <div style={{fontSize:13,color:'#9D9D9D',marginBottom:14}}>Start a session → earn XP!</div>

      {/* Timer */}
      <div style={{
        background:running?'linear-gradient(135deg,#C8F0D8,#C8E8FF)':'linear-gradient(135deg,#F8F8F8,#FFF8F0)',
        borderRadius:24, padding:'22px 20px', marginBottom:14, textAlign:'center',
        boxShadow:'0 6px 28px rgba(0,0,0,0.09)', transition:'all 0.3s',
      }}>
        <div style={{fontFamily:'Nunito',fontWeight:900,fontSize:54,letterSpacing:'-2px',color:'#2D2D2D',marginBottom:3}}>{fmt(elapsed)}</div>
        <div style={{fontSize:13,color:'#7D7D7D',marginBottom:18}}>{running?`📚 Studying ${subject}...`:'Ready to start!'}</div>

        {/* Subject */}
        <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center',marginBottom:14}}>
          {SUBJECTS.map(s=>(
            <button key={s} onClick={()=>!running&&setSubject(s)} style={{
              padding:'6px 12px',borderRadius:20,border:'none',cursor:running?'not-allowed':'pointer',
              fontFamily:'Nunito',fontWeight:700,fontSize:12,transition:'all 0.2s',
              background:subject===s?'#FF7F7F':'#F0F0F0',color:subject===s?'white':'#5D5D5D',
            }}>{SEMOJIS[s]} {s}</button>
          ))}
        </div>

        {/* Mood */}
        {!running&&(
          <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:14}}>
            {MOODS.map(m=>(
              <button key={m.v} onClick={()=>setMood(m.v)} style={{
                padding:'8px 10px',borderRadius:14,border:mood===m.v?'2px solid #FF7F7F':'2px solid transparent',
                cursor:'pointer',background:mood===m.v?'#FFE4E4':'#F5F5F5',
                fontFamily:'Nunito',fontWeight:700,fontSize:11,textAlign:'center',
              }}><div style={{fontSize:20}}>{m.e}</div><div style={{marginTop:2}}>{m.l}</div></button>
            ))}
          </div>
        )}

        {!running&&(
          <input placeholder="📝 Quick note (optional)..." value={note} onChange={e=>setNote(e.target.value)}
            style={{width:'100%',padding:'10px 14px',borderRadius:12,border:'1.5px solid #E8E8E8',fontFamily:'DM Sans',fontSize:13,marginBottom:14,boxSizing:'border-box',outline:'none'}}/>
        )}

        <button onClick={running?stop:start} style={{
          padding:'14px 44px',borderRadius:999,border:'none',cursor:'pointer',
          fontFamily:'Nunito',fontWeight:900,fontSize:17,
          background:running?'#FF7F7F':'#4ECDC4',color:'white',
          boxShadow:running?'0 4px 20px rgba(255,127,127,0.4)':'0 4px 20px rgba(78,205,196,0.4)',
        }}>{running?'⏹ Stop & Log':'▶ Start Session'}</button>
      </div>

      {/* Stats row */}
      {stats&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginBottom:14}}>
          {[
            {e:'📅',v:`${(stats.todayHours||0).toFixed(1)}h`,l:"Today's Study"},
            {e:'🎯',v:stats.sessions,l:'Total Sessions'},
            {e:'🔥',v:`${stats.streak}d`,l:'Streak'},
            {e:'✨',v:stats.xp||0,l:'Total XP'},
          ].map(s=>(
            <div key={s.l} style={{background:'white',borderRadius:16,padding:14,boxShadow:'0 2px 10px rgba(0,0,0,0.06)'}}>
              <div style={{fontSize:22,marginBottom:4}}>{s.e}</div>
              <div style={{fontFamily:'Nunito',fontWeight:900,fontSize:20,color:'#2D2D2D'}}>{s.v}</div>
              <div style={{fontSize:11,color:'#9D9D9D'}}>{s.l}</div>
            </div>
          ))}
        </div>
      )}

      {/* Telegram summary */}
      <button onClick={sendSummary} style={{
        width:'100%',padding:12,borderRadius:16,border:'none',marginBottom:14,cursor:'pointer',
        background:'linear-gradient(135deg,#C8E8FF,#E8D6FF)',
        fontFamily:'Nunito',fontWeight:700,fontSize:14,color:'#3D5D9D',
        display:'flex',alignItems:'center',justifyContent:'center',gap:8,
      }}>📱 Send Daily Summary to Telegram</button>

      {/* Recent sessions */}
      <div style={{fontFamily:'Nunito',fontWeight:800,fontSize:16,color:'#2D2D2D',marginBottom:10}}>📝 Recent Sessions</div>
      {sessions.length===0
        ?<div style={{background:'white',borderRadius:16,padding:20,textAlign:'center',color:'#9D9D9D',fontSize:13}}>No sessions yet. Start one! 👆</div>
        :<div style={{display:'flex',flexDirection:'column',gap:8}}>
          {sessions.map(s=>(
            <div key={s.id} style={{background:'white',borderRadius:14,padding:'12px 14px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)',display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:24}}>{SEMOJIS[s.subject]||'📚'}</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:'Nunito',fontWeight:700,fontSize:14}}>{s.subject}</div>
                <div style={{fontSize:11,color:'#9D9D9D'}}>{fmt(s.duration)} • {new Date(s.startTime).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})} • {s.mood}</div>
                {s.note&&<div style={{fontSize:11,color:'#7D9D7D',marginTop:2}}>📝 {s.note}</div>}
              </div>
              <div style={{fontFamily:'Nunito',fontWeight:800,fontSize:15,color:'#FF7F7F'}}>{s.hours.toFixed(1)}h</div>
            </div>
          ))}
        </div>
      }
      <div style={{height:16}}/>
    </div>
  );
}
