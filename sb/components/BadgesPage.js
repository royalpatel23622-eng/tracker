'use client';
import { useState, useEffect } from 'react';
import { getAchievements, getStats, getLevel } from '../lib/store';

export default function BadgesPage() {
  const [ach,   setAch]   = useState([]);
  const [stats, setStats] = useState(null);
  const [filter,setFilter]= useState('all');

  useEffect(() => { setAch(getAchievements()); setStats(getStats()); }, []);
  if (!stats) return null;

  const lvl      = getLevel(stats.xp||0);
  const unlocked = ach.filter(a=>a.unlocked);
  const locked   = ach.filter(a=>!a.unlocked);
  const list     = filter==='unlocked'?unlocked:filter==='locked'?locked:ach;

  const RARITY = xp => xp>=1000?['#FFD6A0','Legendary']:xp>=500?['#E8D6FF','Epic']:xp>=200?['#C8E8FF','Rare']:['#C8F0D8','Common'];

  return (
    <div style={{padding:16}}>
      {/* Level card */}
      <div style={{background:'linear-gradient(135deg,#E8D6FF,#C8E8FF)',borderRadius:24,padding:20,marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <div style={{width:60,height:60,borderRadius:30,background:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,boxShadow:'0 4px 14px rgba(0,0,0,0.1)'}}>
            {lvl.level<=5?'🌱':lvl.level<=10?'🌿':lvl.level<=20?'🌳':lvl.level<=30?'⚡':'🏆'}
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:'Nunito',fontWeight:900,fontSize:22,color:'#2D2D2D'}}>Level {lvl.level}</div>
            <div style={{fontSize:13,color:'#5D5D9D',marginBottom:5}}>{lvl.cur}/{lvl.need} XP to next</div>
            <div className="progress-bar" style={{background:'rgba(255,255,255,0.5)'}}>
              <div className="progress-fill" style={{width:`${lvl.pct}%`,background:'linear-gradient(90deg,#9B59B6,#3498DB)'}}/>
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:10,marginTop:14}}>
          {[{l:'Unlocked',v:unlocked.length,e:'🏆'},{l:'Total XP',v:stats.xp||0,e:'✨'},{l:'Locked',v:locked.length,e:'🔒'}].map(s=>(
            <div key={s.l} style={{flex:1,background:'rgba(255,255,255,0.55)',borderRadius:14,padding:'10px 6px',textAlign:'center'}}>
              <div style={{fontSize:18}}>{s.e}</div>
              <div style={{fontFamily:'Nunito',fontWeight:900,fontSize:18,color:'#2D2D2D'}}>{s.v}</div>
              <div style={{fontSize:10,color:'#7D7D7D'}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div style={{display:'flex',gap:8,marginBottom:14}}>
        {['all','unlocked','locked'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{
            flex:1,padding:'9px',borderRadius:12,border:'none',cursor:'pointer',
            fontFamily:'Nunito',fontWeight:700,fontSize:12,textTransform:'capitalize',
            background:filter===f?'#FF7F7F':'white',color:filter===f?'white':'#7D7D7D',
            boxShadow:'0 2px 8px rgba(0,0,0,0.06)',
          }}>{f} ({f==='all'?ach.length:f==='unlocked'?unlocked.length:locked.length})</button>
        ))}
      </div>

      {/* Grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
        {list.map(a=>{
          const [rareBg,rareLabel]=RARITY(a.xp);
          return(
            <div key={a.id} style={{
              background:a.unlocked?'white':'#F8F8F8',
              borderRadius:18,padding:14,
              boxShadow:'0 2px 12px rgba(0,0,0,0.06)',
              border:a.unlocked?`2px solid ${rareBg}`:'2px solid transparent',
              opacity:a.unlocked?1:0.6,position:'relative',overflow:'hidden',
            }}>
              {a.unlocked&&(
                <div style={{position:'absolute',top:0,right:0,background:rareBg,padding:'3px 8px',borderRadius:'0 16px 0 10px',fontSize:9,fontFamily:'Nunito',fontWeight:800}}>{rareLabel}</div>
              )}
              <div style={{fontSize:32,marginBottom:6}}>{a.unlocked?a.emoji:'🔒'}</div>
              <div style={{fontFamily:'Nunito',fontWeight:800,fontSize:13,color:'#2D2D2D',marginBottom:4,lineHeight:1.2}}>{a.title}</div>
              <div style={{fontSize:11,color:'#9D9D9D',lineHeight:1.4,marginBottom:6}}>{a.desc}</div>
              <div style={{display:'inline-flex',alignItems:'center',gap:3,background:a.unlocked?rareBg:'#F0F0F0',borderRadius:8,padding:'3px 8px',fontFamily:'Nunito',fontWeight:700,fontSize:11}}>
                ✨ {a.xp} XP
              </div>
              {a.unlocked&&a.unlockedAt&&(
                <div style={{fontSize:10,color:'#9D9D9D',marginTop:4}}>🗓 {new Date(a.unlockedAt).toLocaleDateString()}</div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{height:16}}/>
    </div>
  );
}
